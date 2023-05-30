"use client";

import { useState } from "react";

export default function ClientSection() {
  const [loading, setLoading] = useState(false);
  const [quote, setQuote] = useState(localStorage.getItem("quote") || "");
  const [customSystemPrompt, setCustomSystemPrompt] = useState(
    localStorage.getItem("customSystemPrompt") || ""
  );
  const [response, setResponse] = useState<String>("");

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
      "Is this a fair quote? Anything else I should consider? Please skip all precations, warnings, and caviats. Pretend you are an expert in home repair, construction, hvac, insulation, and plumbing.";
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
      "List 5 questions an expert with an eye for detail may have for the contractor about this quote? Consider this expert an advocate for this homeowner. Newline after each.";
    await generateResponse(getQuotePromptInput(prompt));
  };

  return (
    <div className="w-full max-w-xl">
      {/* <div>Paste your quote here</div> */}
      <textarea
        value={quote}
        onChange={(e) => {
          setQuote(e.target.value);
          localStorage.setItem("quote", e.target.value);
        }}
        rows={4}
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
      {response && (
        <div className="mt-8 rounded-xl border bg-white p-4 shadow-md transition hover:bg-gray-100">
          {response}
        </div>
      )}
    </div>
  );
}
