import ClientSection from "./ClientSection";

export default function Home() {
  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center gap-4 text-center">
      <h1 className="my-4 text-6xl font-bold">Home Repair Quote Tool</h1>
      <div className="flex flex-col items-center gap-2 font-mono md:flex-row">
        <p className="my-2 font-bold">
          <span className="my-2">Paste your quote here</span>
          {/* <span className="text-neutral-400">(Max. 200 characters)</span> */}
          <ClientSection />
        </p>
      </div>
    </main>
  );
}
