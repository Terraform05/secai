import React from "react";

interface UploadDocumentProps {
  uploadedFiles: { name: string }[]; // Updated to reflect files being displayed
  validateFiles: (files: FileList) => void;
  removeFile: (index: number) => void; // To handle file removal
}

const UploadDocument: React.FC<UploadDocumentProps> = ({
  uploadedFiles,
  validateFiles,
  removeFile,
}) => {
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    validateFiles(files);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      validateFiles(files);
    }
  };

  const handleBoxClick = () => {
    const fileInput = document.getElementById("fileInput") as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  };

  return (
    <section className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-4">
      <div
        className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 flex flex-col items-center justify-center w-full h-full text-gray-600 dark:text-gray-400 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleBoxClick}
      >
        <h2 className="text-xl font-semibold mb-4 text-center">
          Upload Document
        </h2>
        {uploadedFiles.length === 0 ? (
          <p className="text-center">Drag and drop your document here</p>
        ) : (
          <ul className="mt-2 text-sm w-full">
            {uploadedFiles.map((file, index) => (
              <li
                key={index}
                className="flex items-center justify-between gap-4 p-2 border-b border-gray-300 dark:border-gray-700"
              >
                <div className="flex items-center gap-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-6 h-6 text-gray-500"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
                    />
                  </svg>
                  <p className="truncate max-w-xs text-gray-800 dark:text-gray-200">
                    {file.name}
                  </p>
                </div>
                <button
                  className="text-gray-500 hover:text-red-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(index);
                  }}
                >
                  &#10005;
                </button>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-2 text-sm">or click to select a file</p>
        <input
          id="fileInput"
          type="file"
          accept=".pdf"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
    </section>
  );
};

export default UploadDocument;
