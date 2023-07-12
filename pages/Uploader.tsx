"use client";

import classNames from "classnames";
import { ChangeEvent, useRef, useState } from "react";

// onChange returns a file object
interface Props {
  onUpload: (file: File) => void;
  fileUploaded?: boolean;
}

const FileUpload = ({ onUpload, fileUploaded }: Props) => {
  const [file, setFile] = useState<File | null>(null);
  const uploadBtnRef = useRef<HTMLInputElement>(null);

  const onClear = () => {
    setFile(null);
    if (uploadBtnRef.current) {
      uploadBtnRef.current.value = "";
    }
    // setPreviewUrl(URL.createObjectURL(file));
    // setPreviewUrl(null);
  };

  const handleSetFile = (e: ChangeEvent<HTMLInputElement>) => {
    const newFile = e.target?.files?.[0];
    if (!newFile) return;
    setFile(newFile);
  };

  return (
    <div className="flex w-full max-w-xl items-center flex-wrap mx-4 justify-evenly">
      <div className="max-w-xl min-w-[340px]">
        <label className="flex justify-center w-full h-12 px-4 transition bg-white border-2 border-gray-300 border-dashed rounded-md appearance-none cursor-pointer hover:border-gray-400 focus:outline-none">
          <span className="flex items-center space-x-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-6 h-6 text-gray-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <span className="font-medium text-gray-600">
              {file ? file?.name : `Drop a file or image here, or `}
              {!file && <span className="text-blue-600 underline">browse</span>}
            </span>
          </span>
          <input
            type="file"
            name="file_upload"
            className="hidden"
            onChange={handleSetFile}
          />
        </label>
      </div>

      <div className="ml-2 flex">
        {file && (
          <button
            className="m-2 rounded-xl bg-neutral-900 px-4 py-2 font-medium text-white hover:bg-black/80 whitespace-nowrap"
            onClick={onClear}
          >
            Clear
          </button>
        )}
        <button
          disabled={!file}
          onClick={() => file && onUpload(file)}
          className={classNames(
            !file ? "opacity-50 cursor-not-allowed" : "",
            "m-2 rounded-xl bg-neutral-900 px-4 py-2 font-medium text-white hover:bg-black/80 whitespace-nowrap"
          )}
        >
          Upload
        </button>
      </div>
    </div>
  );
};

export default FileUpload;
