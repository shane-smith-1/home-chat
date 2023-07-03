import QuoteQuestions from "../pages/QuoteQuestions";
import ClientSection from "../pages/QuoteQuestions";

export default function Home() {
  return (
    <main className="mb-5 flex min-h-screen flex-col items-center justify-center gap-4 text-center">
      <div className="mx-3">
        <h1 className="my-4 text-center text-5xl font-bold">
          Quote Questions AI
        </h1>
        <p className="my-8 max-w-xl">
          Paste in your quote, no formatting needed, and ask any of our preset
          questions about your quote. Or ask your own using the Custom section.
        </p>
      </div>
      <div className="flex w-full flex-col items-center gap-2 font-mono md:flex-row">
        <QuoteQuestions />
      </div>
    </main>
  );
}
