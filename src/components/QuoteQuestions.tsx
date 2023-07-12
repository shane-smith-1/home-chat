"use client";

import { ChangeEvent, useCallback, useEffect, useMemo, useState } from "react";
import { form5695, instructionsForm5695 } from "../utils/form5695";
import classNames from "classnames";
import { thingsEligibleForTaxCredit } from "../../app/CreditEligible";
import {
  twoFourtyVolt,
  oneTwentyVolt,
} from "@/utils/eligible_items/electric_hot_water";
import {
  gasStorage,
  gasTankless,
  gasResiCommercial,
} from "@/utils/eligible_items/gas_hot_water";
import useLocalStorage from "use-local-storage";
import { CopyAll, Info, StopCircle } from "@mui/icons-material";
import { toast } from "react-hot-toast";

interface Props {
  quoteText: string;
  hideQuoteInput?: boolean;
}
const federalCreditLink = "https://www.irs.gov/pub/irs-pdf/f5695.pdf";

export default function QuoteQuestions({ quoteText, hideQuoteInput }: Props) {
  const [loading, setLoading] = useState(false);
  const [quote, setQuote] = useState(quoteText);
  const [customSystemPrompt, setCustomSystemPrompt] = useState("");
  const [response, setResponse] = useState<String>(
    "Response will be here. Ask a question."
  );
  const [imageData, setImageData] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [abortController, setAbortController] = useState(new AbortController());

  useEffect(() => {
    // Check if localStorage is available, if so, set quote and customSystemPrompt
    if (typeof Storage !== "undefined" && !quote) {
      const quote = localStorage.getItem("quote");
      if (quote) {
        setQuote(quote);
      }

      const customSystemPrompt = localStorage.getItem("customSystemPrompt");
      if (customSystemPrompt) {
        setCustomSystemPrompt(customSystemPrompt);
      }
    }
    if (quote && quoteText) {
      console.log("Quote text size: ", quoteText.length);

      explainQuote();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const generateResponse = async (prompt: string, temperature?: number) => {
    setResponse("");
    setLoading(true);

    const response = await fetch("/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt,
        temperature,
      }),
      signal: abortController.signal,
    });

    if (!response.ok) {
      throw new Error(response.statusText);
    }

    // This data is a ReadableStream
    const data = response.body;
    if (!data) {
      return;
    }

    const reader = data.getReader();
    const decoder = new TextDecoder();
    let done = false;

    let res = "";
    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      const chunkValue = decoder.decode(value);
      setResponse((prev) => prev + chunkValue);
      res += chunkValue;
    }
    setLoading(false);
    return res;
  };

  const askQuestion = async (question: string, temperature?: number) => {
    // if (e) {
    //   e.preventDefault();
    // }
    setResponse("");
    setLoading(true);
    return await generateResponse(question, temperature);
  };

  const getQuotePromptInput = (prompt: string) => {
    return `<start home repair quote> ${quote} <end home repair quote> prompt: ${prompt} Skip all precations and warnings that you can.`;
  };

  const explainQuote = async () => {
    const prompt =
      "Explain the home repair quote above in simple terms to the owner of the home.";
    askQuestion(getQuotePromptInput(prompt));
  };

  const judgeQuote = async () => {
    const prompt =
      "Is this a fair quote? Anything else I should consider? Add a newline after each question.";
    askQuestion(getQuotePromptInput(prompt));
  };

  const evalEfficiency = async () => {
    const prompt =
      "How energy and monthly bill efficient is the appliance(s) quoted going to be, compared to other options? The quote might not talk about efficiency, but use the context of what is going to installed to determine. Suggest more green and/or energy efficient alternatives if possible. Be specific. For example, talk about how a heat pump solution is probably going to cost less long-term.";
    askQuestion(getQuotePromptInput(prompt));
  };

  const customPromptWithQuote = async () => {
    // e.preventDefault();
    setResponse("");
    setLoading(true);
    askQuestion(getQuotePromptInput(customSystemPrompt));
  };

  const listQuestions = async () => {
    const prompt =
      "List 5 questions an expert with an eye for detail would ask the contractor about this quote? Be as pointed as possible. Newline after each question. If 5 can't be made that make sense specific to the quote, don't force it. Its okay to return fewer or even none, with a note explaining why. Don't make anything up that isn't in the quote.\n";
    askQuestion(getQuotePromptInput(prompt));
  };

  const infoNeededFor5695 = async () => {
    const prompt =
      "Here is a tax form to fill out: " +
      form5695 +
      "Here are the instructions:" +
      instructionsForm5695 +
      "\n.end of instructions." +
      "Fillout this form given the info found in the following quote. Output a simple yes and no where possible. Assume no prior work to the home this tax year. Output in JSON with the key being the line number in the form.\n";
    askQuestion(getQuotePromptInput(prompt));
  };

  const translateToSpanish = async () => {
    const prompt = "Translate the following quote into Spanish. \n";
    askQuestion(getQuotePromptInput(prompt));
  };

  const listAllThings = async () => {
    const prompt = `You are going to return a valid JSON object, starting with a { and ending with a }. It will contain an items array. For the included quote, find and return all work items that possibly fit into one of these categories: <categories>${thingsEligibleForTaxCredit
      .join(" - ")
      .trim()}<end categories>.
      
    Ignore things that are not relevant, like credit cards, addresses, small parts and accesories, labor, fees, taxes, disconts, financing stuff, paint, drywall work.
    
    For each item found, include in items an object with the following format. For any field that is not available, leave it blank, don't guess. If quantity is not available, assume 1.
    
    Format:
    {
      make: string (sometimes called brand or manufacture),
      make_full: string (if make is an abbreviation, attempt to find the full brand name),
      model: string,
      price: number,
      quantity: number,
      category: string, (the category of item matched in <categories> list)
      category_confidence: number, (how confident are you that this item is in the category above, between 0.00-1.00)
    }
    `;
    const listOfItems = await askQuestion(getQuotePromptInput(prompt), 0);
    if (!listOfItems) return;
    const parsed = JSON.parse("{" + listOfItems);
    // For each items in the list, search the following arrays for a match of model.
    const toSearch = [
      twoFourtyVolt,
      oneTwentyVolt,
      gasStorage,
      gasTankless,
      gasResiCommercial,
    ];

    const matched = parsed.items.map((item: { model: string }) => {
      const model = item.model;
      const found = toSearch.find((arr) => arr.find((i) => i.Model === model));
      return {
        ...item,
        eligible: found ? "Yes" : "No",
      };
    });

    setResponse(JSON.stringify(matched, null, 2));
  };

  const responseTrimmed = response.replace(/&#013; &#010;$/, "");

  const handleQuoteUpload = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    // Handle file upload, process text out of image with Tesseract, store to quote variable and localStorage.
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const imageDataUri = reader.result as string;
      console.log({ imageDataUri });
      // Save text to quote
      if (!imageDataUri) return;
      // convertImageToText();

      setImageData(imageDataUri);
    };
    reader.readAsDataURL(file);
  }, []);

  const onCopyResponse = useCallback(() => {
    navigator.clipboard.writeText(responseTrimmed);
    toast.success("Copied to clipboard");
  }, [responseTrimmed]);

  return (
    <div className="mx-8 flex w-full flex-row flex-wrap justify-center gap-8">
      <div className="mx-3 w-full max-w-lg xs:min-w-md">
        {!hideQuoteInput && (
          <div>
            <input
              type="file"
              className="cursor-pointer font-bold"
              id="quote-upload"
              name=""
              onChange={handleQuoteUpload}
            />

            <button
              onClick={() => {
                const inputEl = document.getElementById("quote-upload");
                if (inputEl) {
                  (inputEl as HTMLInputElement).value = "";
                }
              }}
            >
              remove
            </button>

            {progress < 100 && progress > 0 && (
              <div>
                <div className="progress-label">Progress ({progress}%)</div>
                <div className="progress-bar">
                  <div
                    className="progress"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* <img id="selected-image" src="" /> */}
            <div className="my-2 text-center font-bold">or</div>
            <div className="mb-2 font-bold">Paste your quote here</div>
            <textarea
              value={quote}
              onChange={(e) => {
                setQuote(e.target.value);
                localStorage.setItem("quote", e.target.value);
              }}
              rows={10}
              // maxLength={200}
              className="focus:ring-neu w-full rounded-md border border-neutral-400
         p-4 text-neutral-900 shadow-sm placeholder:text-neutral-400 focus:border-neutral-900"
              placeholder={"No formatting needed"}
            />
          </div>
        )}

        <div className="flex flex-row flex-wrap">
          <button
            disabled={loading || !quote}
            className="m-2 rounded-xl bg-neutral-900 px-4 py-2 font-medium text-white hover:bg-black/80"
            onClick={() => explainQuote()}
          >
            Explain it to me &rarr;
          </button>
          <button
            disabled={loading || !quote}
            className="m-2 rounded-xl bg-neutral-900 px-4 py-2 font-medium text-white hover:bg-black/80"
            onClick={() => judgeQuote()}
          >
            Is this a fair quote? &rarr;
          </button>
          <button
            disabled={loading || !quote}
            className="m-2 rounded-xl bg-neutral-900 px-4 py-2 font-medium text-white hover:bg-black/80"
            onClick={() => listQuestions()}
          >
            List 5 expert questions &rarr;
          </button>
          {/* <button
          disabled={loading || !quote}
          className="m-2 rounded-xl bg-neutral-900 px-4 py-2 font-medium text-white hover:bg-black/80"
          onClick={() => evalEfficiency()}
        >
          How energy efficient is the appliance? &rarr;
        </button> */}
          <div className="flex w-fit items-center">
            <button
              disabled={loading || !quote}
              className="m-2 rounded-xl bg-neutral-900 px-4 py-2 font-medium text-white hover:bg-black/80 whitespace-nowrap"
              onClick={() => infoNeededFor5695()}
            >
              Get tax credit &rarr;
            </button>
            <a href={federalCreditLink} target="_blank">
              <Info />
            </a>
          </div>
          <button
            disabled={loading || !quote}
            className="m-2 rounded-xl bg-neutral-900 px-4 py-2 font-medium text-white hover:bg-black/80"
            onClick={() => listAllThings()}
          >
            List all products &rarr;
          </button>
          <button
            disabled={loading || !quote}
            className="m-2 rounded-xl bg-neutral-900 px-4 py-2 font-medium text-white hover:bg-black/80"
            onClick={() => translateToSpanish()}
          >
            Traducir al español &rarr;
          </button>
        </div>
        <div className="mt-2 mb-3">-or-</div>
        <textarea
          value={customSystemPrompt}
          onChange={(e) => {
            setCustomSystemPrompt(e.target.value);
            localStorage.setItem("customSystemPrompt", e.target.value);
          }}
          rows={6}
          className="focus:ring-neu w-full rounded-md border border-neutral-400
         p-4 text-neutral-900 shadow-sm placeholder:text-neutral-400 focus:border-neutral-900"
          placeholder={
            "What would you like to ask? (e.g. what is the SEER rating, or, what is a heat pump?)"
          }
        />
        <button
          disabled={loading || !customSystemPrompt}
          className="m-2 w-full rounded-xl bg-neutral-900 px-4 py-2 font-medium text-white hover:bg-black/80"
          onClick={() => customPromptWithQuote()}
        >
          Ask anything &rarr;
        </button>
      </div>
      <div className="mx-3 w-full max-w-lg xs:min-w-md">
        <div className="flex gap-2 items-center mb-2">
          <h2 className="font-bold">Response</h2>
          {!loading && responseTrimmed && (
            <button onClick={onCopyResponse}>
              <CopyAll />
            </button>
          )}
          {loading && (
            <button
              onClick={() => {
                abortController.abort();
                setLoading(false);
                setAbortController(new AbortController());
              }}
            >
              <StopCircle />
            </button>
          )}
        </div>
        {responseTrimmed ? (
          <pre
            className={classNames(
              "sm:max-h-[450px] sm:overflow-auto",
              !responseTrimmed.includes("{") && "whitespace-break-spaces"
            )}
          >
            <div className="rounded-xl border bg-white p-4 text-black shadow-md transition hover:bg-gray-100">
              {responseTrimmed}
            </div>
          </pre>
        ) : (
          <div className="rounded-xl border bg-white p-4 text-black shadow-md transition hover:bg-gray-100">
            Response will appear here
          </div>
        )}
      </div>
    </div>
  );
}
