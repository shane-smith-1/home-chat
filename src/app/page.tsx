import ClientSection from "./ClientSection";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 text-center">
      <h1 className="my-4 text-5xl font-bold">Home Repair Quote Tool</h1>
      <div className="flex w-full flex-col items-center gap-2 font-mono md:flex-row">
        <ClientSection />
      </div>
    </main>
  );
}
