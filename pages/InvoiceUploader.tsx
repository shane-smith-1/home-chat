"use client";

// import toast, { Toaster } from "react-hot-toast";
import { useEffect, useState } from "react";
import FileUpload from "./Uploader";
import { syntaxHighlight } from "@/utils/syntaxHighlighter";
import useLocalStorage from "use-local-storage";
import toast, { Toaster } from "react-hot-toast";
// import { PDFViewer } from "./PDFViewer";
import DocAIView from "./DocAIView/DocAIView";

interface Props {}

export default function InvoiceUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [docAILS, setDocAILS] = useLocalStorage("docAI", "");
  const [docAI, setDocAI] = useState<object | null>(null);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // PDF stuff
  const [numPages, setNumPages] = useState<null | number>(null);
  const [pageNumber, setPageNumber] = useState(1);

  useEffect(() => {
    try {
      setDocAI(JSON.parse(docAILS));
    } catch (error) {
      console.log(error);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
    const pretty = JSON.stringify(data?.items, null, 4); // spacing level = 2
    setDocAILS(pretty);
    setDocAI(data);
    // toast.success("Uploaded and processed, check it out");
  };

  const handleUpload = (file: File) => {
    console.log(file);
    setFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const onClear = () => {
    setFile(null);
    setPreviewUrl(null);
  };

  // Hello world
  return (
    <div className="w-full">
      <Toaster position="bottom-center" />
      <div className="flex max-w-xl justify-center gap-3">
        <FileUpload
          onUpload={handleUpload}
          onClear={onClear}
          fileUploaded={!!file}
        />
        {file && (
          <button disabled={!file} onClick={() => file && uploadToCloud(file)}>
            Submit
          </button>
        )}
      </div>
      {file?.type.includes("image") && previewUrl && (
        <img
          className="max-w-4xl p-8"
          src={previewUrl}
          alt="Uploaded content"
        />
      )}
      {/* {file?.type.includes("pdf") && (
        <div className="max-w-md p-8">
          <PDFViewer
            file={file}
            numPages={numPages}
            setNumPages={setNumPages}
            pageNumber={pageNumber}
            setPageNumber={setPageNumber}
          />
        </div>
      )} */}
      {docAI && (
        <div className="max-h-4xl max-w-6xl p-8">
          <h2 className="mb-8 text-2xl font-bold">Response</h2>
          {/* <pre>{docAI}</pre> */}
          <DocAIView data={docAI} />
        </div>
      )}
    </div>
  );
}
