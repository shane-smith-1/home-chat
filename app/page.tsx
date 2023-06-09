// import toast, { Toaster } from "react-hot-toast";
import InvoiceUploader from "../src/components/InvoiceUploader";

export default function InvoiceScanner() {
  return (
    <div className="flex min-h-screen flex-col items-center gap-4 pb-5 pt-10 text-center">
      <div className="mx-3 flex w-full flex-col items-center justify-center">
        <h1 className="my-4 mb-8 text-center text-5xl font-bold">
          Scan your Invoice
        </h1>
        <InvoiceUploader />
      </div>
    </div>
  );
}
