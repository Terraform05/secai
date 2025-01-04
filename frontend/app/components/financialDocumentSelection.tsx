import React from "react";
import { Filing } from "../../public/types/types"; // Import types

interface FinancialDocumentsProps {
  documentTypes: string[];
  filings: Filing[];
  selectedItems: string[];
  toggleSelection: (item: string) => void;
}

const FinancialDocumentSelection: React.FC<FinancialDocumentsProps> = ({
  documentTypes,
  filings,
  selectedItems,
  toggleSelection,
}) => {
  // Function to get filing details for the given type
  const getFilingDetails = (type: string): Filing | null => {
    return filings.find((f) => f.formType === type) || null;
  };

  return (
    <section className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Financial Documents</h2>
      <div className="space-y-2">
        {documentTypes.map((item) => {
          const filingDetails = getFilingDetails(item);
          const isSelected = selectedItems.includes(item); // Check if the item is selected

          return (
            <div
              key={item}
              className={`flex flex-col p-4 border rounded-lg cursor-pointer transition-all 
              ${
                isSelected
                  ? "bg-blue-500 text-white"
                  : "border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
              onClick={() => toggleSelection(item)}
            >
              <span className="text-base font-semibold">{item}</span>
              {filingDetails ? (
                <div className="text-sm">
                  <p>
                    <strong>Date:</strong> {filingDetails.filingDate}
                  </p>
                  <p>
                    <strong>Accession Number:</strong>{" "}
                    {filingDetails.url ? (
                      <a
                        href={filingDetails.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`hover:underline ${
                          isSelected ? "text-blue-200" : "text-blue-600"
                        }`}
                        onClick={(e) => e.stopPropagation()} // Prevent parent click
                      >
                        {filingDetails.accessionNumber}
                      </a>
                    ) : (
                      <span className="text-gray-500">N/A</span>
                    )}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-gray-400">No filing available</p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default FinancialDocumentSelection;
