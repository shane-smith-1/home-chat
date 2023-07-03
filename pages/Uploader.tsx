import { ChangeEvent } from "react";

// onChange returns a file object
interface Props {
  onUpload: (file: File) => void;
  onClear?: () => void;
  fileUploaded?: boolean;
}

const FileUpload = ({ onUpload, onClear, fileUploaded }: Props) => {
  const handleUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target?.files?.[0];
    if (!file) return;
    onUpload(file);
  };

  return (
    <div>
      <input
        type="file"
        className="cursor-pointer font-bold"
        id="quote-upload"
        name=""
        onChange={handleUpload}
      />
      {fileUploaded && <button onClick={onClear}>Clear</button>}
    </div>
  );
};

export default FileUpload;
