import React from "react";

interface DynamicAnalysisSectionProps {
  selectedItems: string[];
  uploadedFiles: { name: string; text: string }[];
  retrievedReports: any[];
}


const DynamicAnalysisSection: React.FC<DynamicAnalysisSectionProps> = ({
  selectedItems,
  uploadedFiles,
  retrievedReports,
}) => {
  return (
    <section className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Analysis Results</h2>

      {/* Display Retrieved Reports */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold">Retrieved Reports:</h3>
        <ul className="list-disc pl-5">
          {retrievedReports.length > 0 ? (
            retrievedReports.map((report, index) => (
              <li key={index}>
                {report.formType} filed on {report.filingDate} -{" "}
                <a
                  href={report.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 underline"
                >
                  View Report
                </a>
              </li>
            ))
          ) : (
            <li>No reports retrieved.</li>
          )}
        </ul>
      </div>

      {/* Display Selected Items */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold">Selected Items:</h3>
        <ul className="list-disc pl-5">
          {selectedItems.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </div>

      {/* Display Uploaded Files */}
      <div>
        <h3 className="text-lg font-semibold">Uploaded Files:</h3>
        <ul className="list-disc pl-5">
          {uploadedFiles.map((file, index) => (
            <div key={index}>
              <li>{file.name}</li>
              <p>{file.text}</p>
            </div>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default DynamicAnalysisSection;
