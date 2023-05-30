import ClientSection from "./ClientSection";

export default function Home() {
  return (
    <main className="mb-5 flex min-h-screen flex-col items-center justify-center gap-4 text-center">
      <div className="mx-3">
        <h1 className="my-4 text-center text-5xl font-bold">
          Home Repair Quote AI
        </h1>
        <p className="my-8 max-w-xl">
          1. Paste in your quote. No formatting needed.
          <br />
          2. Ask any of our preset questions about your quote, or ask your own.
          <br />
          3. Sign-up for notifications about regional, state, and federal tax
          incentives you may qualify for.
          <br />
          4. Use this site to submit questions to your contractor
        </p>
      </div>
      <div className="flex w-full flex-col items-center gap-2 font-mono md:flex-row">
        <ClientSection />
      </div>
    </main>
  );
}
