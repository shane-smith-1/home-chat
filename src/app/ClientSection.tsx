"use client";

import { useEffect, useState } from "react";

export default function ClientSection() {
  const [loading, setLoading] = useState(false);
  const [quote, setQuote] = useState("");
  const [customSystemPrompt, setCustomSystemPrompt] = useState("");
  const [response, setResponse] = useState<String>("Response will be here");

  useEffect(() => {
    // Check if localStorage is available, if so, set quote and customSystemPrompt
    if (typeof Storage !== "undefined") {
      const quote = localStorage.getItem("quote");
      if (quote) {
        setQuote(quote);
      }

      const customSystemPrompt = localStorage.getItem("customSystemPrompt");
      if (customSystemPrompt) {
        setCustomSystemPrompt(customSystemPrompt);
      }
    }
  }, []);

  const generateResponse = async (prompt: string) => {
    setResponse("");
    setLoading(true);

    const response = await fetch("/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt,
      }),
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

    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      const chunkValue = decoder.decode(value);
      setResponse((prev) => prev + chunkValue);
    }
    setLoading(false);
  };

  const getQuotePromptInput = (prompt: string) => {
    return `<start home repair quote> ${quote} <end home repair quote> prompt: ${prompt} Max 500 chars. Assume normal home water and hvac usage. Skip all precations and warnings possible.`;
  };

  const explainQuote = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setResponse("");
    setLoading(true);
    const prompt =
      "Explain the home repair quote above in simple terms to the owner of the home.";
    await generateResponse(getQuotePromptInput(prompt));
  };

  const judgeQuote = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setResponse("");
    setLoading(true);
    const prompt =
      "Is this a fair quote? Anything else I should consider? Please skip all precations, warnings, and caviats. Pretend you are an expert in home repair, construction, hvac, insulation, and plumbing. Skip anything that is broadly relevant to any homeowner going through this process. As, skip the 'should check with local codes' bla bla bla. Add a newline after each question.";
    await generateResponse(getQuotePromptInput(prompt));
  };

  const evalEfficiency = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setResponse("");
    setLoading(true);
    const prompt =
      "How energy and monthly bill efficient is the appliance(s) quoted going to be, compared to other options? The quote might not talk about efficiency, but use the context of what is going to installed to determine. Suggest more green and/or energy efficient alternatives if possible. Be specific. For example, talk about how a heat pump solution is probably going to cost less long-term.";
    await generateResponse(getQuotePromptInput(prompt));
  };

  const customPromptWithQuote = async (
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    e.preventDefault();
    setResponse("");
    setLoading(true);
    await generateResponse(getQuotePromptInput(customSystemPrompt));
  };

  const listQuestions = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setResponse("");
    setLoading(true);
    const prompt =
      "List 5 questions an expert with an eye for detail may have for the contractor about this quote? Consider this expert an advocate for this homeowner. Newline after each question using &#013; &#010;.";
    await generateResponse(getQuotePromptInput(prompt));
  };

  // Remove &#013; &#010 from the end of the response if present.
  const responseTrimmed = response.replace(/&#013; &#010;$/, "");

  return (
    <div className="mx-8 flex w-full flex-row flex-wrap justify-center gap-8">
      <div className="mx-3 w-full max-w-xl">
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

        <button
          disabled={loading || !quote}
          className="my-2 w-full rounded-xl bg-neutral-900 px-4 py-2 font-medium text-white hover:bg-black/80"
          onClick={(e) => explainQuote(e)}
        >
          Explain it to me &rarr;
        </button>
        <button
          disabled={loading || !quote}
          className="my-2 w-full rounded-xl bg-neutral-900 px-4 py-2 font-medium text-white hover:bg-black/80"
          onClick={(e) => judgeQuote(e)}
        >
          Is this a fair quote? &rarr;
        </button>
        <button
          disabled={loading || !quote}
          className="my-2 w-full rounded-xl bg-neutral-900 px-4 py-2 font-medium text-white hover:bg-black/80"
          onClick={(e) => listQuestions(e)}
        >
          List 5 expert questions &rarr;
        </button>
        <button
          disabled={loading || !quote}
          className="my-2 w-full rounded-xl bg-neutral-900 px-4 py-2 font-medium text-white hover:bg-black/80"
          onClick={(e) => evalEfficiency(e)}
        >
          How energy efficient is the appliance? &rarr;
        </button>
        <button
          disabled={loading || !customSystemPrompt}
          className="my-2 w-full rounded-xl bg-neutral-900 px-4 py-2 font-medium text-white hover:bg-black/80"
          onClick={(e) => customPromptWithQuote(e)}
        >
          Custom &rarr;
        </button>
        <textarea
          value={customSystemPrompt}
          onChange={(e) => {
            setCustomSystemPrompt(e.target.value);
            localStorage.setItem("customSystemPrompt", e.target.value);
          }}
          rows={4}
          maxLength={400}
          className="focus:ring-neu w-full rounded-md border border-neutral-400
         p-4 text-neutral-900 shadow-sm placeholder:text-neutral-400 focus:border-neutral-900"
          placeholder={
            "This is the behind-the-scenes prompt that the AI will use to generate a response."
          }
        />
      </div>
      <div className="mx-3 w-full max-w-xl">
        <div className="mb-2 font-bold">
          Response {loading ? "loading..." : ""}
        </div>
        {responseTrimmed && (
          <div className="rounded-xl border bg-white p-4 text-black shadow-md transition hover:bg-gray-100">
            {responseTrimmed}
          </div>
        )}
      </div>
    </div>
  );
}
