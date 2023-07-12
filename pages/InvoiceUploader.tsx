"use client";

// import toast, { Toaster } from "react-hot-toast";
import { useCallback, useEffect, useState } from "react";
import FileUpload from "./Uploader";
import { syntaxHighlight } from "@/utils/syntaxHighlighter";
import useLocalStorage from "use-local-storage";
import toast, { Toaster } from "react-hot-toast";
// import { PDFViewer } from "./PDFViewer";
import DocAIView from "./DocAIView/DocAIView";
import ruderman_mini_splits from "../data/invoices/ruderman_mini_splits.json";
import QuoteQuestions from "./QuoteQuestions";

interface Props {}

export default function InvoiceUploader() {
  const [docAILS, setDocAILS] = useLocalStorage("docAI", "");
  const [docAI, setDocAI] = useState<Record<string, unknown> | null>();
  // ruderman_mini_splits as any
  const [uploading, setUploading] = useState(false);
  // const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // PDF stuff
  const [numPages, setNumPages] = useState<null | number>(null);
  const [pageNumber, setPageNumber] = useState(1);

  // useEffect(() => {
  //   try {
  //     setDocAI(JSON.parse(docAILS));
  //   } catch (error) {
  //     console.log(error);
  //   }
  // }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const uploadToCloud = async (file: File) => {
    setDocAI(null);
    setUploading(true);
    toast.success("Uploading");

    let formData = new FormData();
    formData.append("file", file!);

    const response = await fetch("/api/upload/invoice", {
      method: "POST",
      body: formData,
    });

    setUploading(false);

    if (!response.ok) {
      //   toast.error("Something went wrong uploading the file");
      return;
    }

    const data = await (response.json() as unknown as {
      entities: any;
      items: any;
    });
    const pretty = JSON.stringify(data, null, 4);
    setDocAILS(pretty);
    setDocAI(data);
    // console.log(data);
    // toast.success("Uploaded and processed, check it out");
  };

  // Iterate through all of the keys of docAI recursively, and only keep keys with string values. Execption is keep keys of 'confidence' despite them being numbers. Then, join all of the values together into a new object, keeping the nesting.
  const reducer = (acc: any, key: string) => {
    if (!docAI || !docAI[key]) return acc;
    if (typeof docAI[key] === "string") {
      acc[key] = docAI[key];
    } else if (typeof docAI[key] === "number" && key === "confidence") {
      acc[key] = docAI[key];
    } else if (typeof docAI[key] === "object") {
      acc[key] = Object.keys(docAI[key] as Record<string, any>).reduce(
        reducer,
        {}
      );
    }
    return acc;
  };

  const docAIJustText = Object.keys(docAI || {}).reduce(reducer, {});

  // console.log("docAIJustText size: " docAIJustText.length);

  // Iterate through all nested objects of docAIJustText and extract all objects that contain a key of "type" that equals "line_item/product_code"
  // const itemsReducer = (acc: any, key: string) => {
  //   if (!docAIJustText || !docAIJustText[key]) return acc;
  //   if (
  //     typeof docAIJustText[key] === "object" &&
  //     docAIJustText[key].type === "line_item/product_code"
  //   ) {
  //     acc.push(docAIJustText[key]);
  //   } else if (typeof docAIJustText[key] === "object") {
  //     acc.push(...Object.keys(docAIJustText[key]).reduce(itemsReducer, []));
  //   }
  //   return acc;
  // };

  // const items = Object.keys(docAIJustText || {}).reduce(itemsReducer, []);

  // Hello world

  const handleUpload = useCallback(
    (file: File) => file && uploadToCloud(file),
    [uploadToCloud]
  );

  return (
    <div className="w-full flex items-center flex-col mb-4 mx-2">
      <Toaster position="bottom-center" />
      <div className="flex max-w-xl justify-center gap-3 mb-9 mx-3 w-full">
        <FileUpload onUpload={handleUpload} />
      </div>
      {uploading && (
        <div className="flex items-center justify-center mt-16">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
        </div>
      )}
      {/* {file?.type.includes("image") && previewUrl && (
        <img
          className="max-w-4xl p-8"
          src={previewUrl}
          alt="Uploaded content"
        />
      )} */}
      {docAI && (
        <div className="max-h-4xl max-w-6xl flex-grow w-full hidden md:block">
          <DocAIView data={docAI} />
        </div>
      )}
      {docAI && (
        <div className="mt-12 w-full">
          <QuoteQuestions quoteText={docAI.text as string} hideQuoteInput />
        </div>
      )}
    </div>
  );
}

// {items && // Display all items in a table
//   items.length > 0 && (
//     <div className="max-h-4xl max-w-6xl p-8 flex-grow w-full">
//       <h2 className="mb-8 text-2xl font-bold">Items</h2>
//       <table className="table-auto">
//         <thead>
//           <tr>
//             <th className="px-4 py-2">Product Code</th>
//             {/* <th className="px-4 py-2">Quantity</th>
//             <th className="px-4 py-2">Unit Price</th>
//             <th className="px-4 py-2">Total Price</th> */}
//             </tr>
//             </thead>
//             <tbody>
//               {items.map((item: any) => (
//                 <tr key={item.name}>
//                   <td className="border px-4 py-2">{item.mentionText}</td>
//                   {/* <td className="border px-4 py-2">{item.quantity}</td>
//                   <td className="border px-4 py-2">{item.unit_price}</td>
//                   <td className="border px-4 py-2">{item.total_price}</td> */}
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       )}
