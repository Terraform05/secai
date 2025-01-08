"use client";

import { useState } from "react";
import FinancialDocuments from "./components/financialDocumentSelection";
import UploadDocument from "./components/uploadDocument";
import AnalyzeDocuments from "./components/analyzeDocuments";
import CompanySearch from "./components/companySearch";
import DynamicAnalysisSection from "./components/analysisDisplay";
import CompanyDetails from "./components/companyDetails";
import { Company, Filing, CompanyData } from "../public/types/types"; // Import types

// Function to fetch company data
async function fetchRecentCompanyData(
  CIK: string,
  formTypes: string[]
): Promise<{ companyData: CompanyData; filings: Filing[] }> {
  try {
    const response = await fetch(
      `http://localhost:4000/api/filings?CIK=${CIK}&formTypes=${formTypes.join(
        ","
      )}`
    );

    if (!response.ok) {
      throw new Error(`Error fetching company data: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Failed to fetch company data:", error);
    throw error;
  }
}

export default function Home() {
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [companyData, setCompanyData] = useState<CompanyData | null>(null);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [analysisTriggered, setAnalysisTriggered] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [filings, setFilings] = useState<Filing[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]); // Uploaded files
  const [AiAnalysisTextResponse, setAiAnalysisTextResponse] = useState<
    string | null
  >(null); // Store returned AiAnalysisTextResponse

  const documentTypes: string[] = ["10-K", "10-Q", "8-K"];

  const toggleSelection = (item: string): void => {
    setSelectedItems((prevItems) =>
      prevItems.includes(item)
        ? prevItems.filter((i) => i !== item)
        : [...prevItems, item]
    );
  };

  const handleCompanySelect = async (company: Company): Promise<void> => {
    try {
      setSelectedCompany(company);
      setLoading(true);
      const { companyData, filings } = await fetchRecentCompanyData(
        company.cik_str,
        documentTypes
      );
      setCompanyData(companyData); // Set company data
      setFilings(filings); // Set filings
    } catch (error) {
      console.error("Failed to fetch company data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async (): Promise<void> => {
    if (selectedCompany === null) {
      console.error("No company selected.");
      setUploadError("No company selected for analysis.");
      return;
    }

    if (selectedItems.length === 0 && uploadedFiles.length === 0) {
      console.error("No files or filings selected.");
      setUploadError("No files or filings selected for analysis.");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();

      // Add selected filings (if any) to the payload
      if (selectedItems.length > 0) {
        const filingsData = JSON.stringify(
          filings.filter((filing) => selectedItems.includes(filing.formType))
        );
        console.log("Filings Data:", filingsData); // Debugging step
        formData.append("selectedFilings", filingsData);
      }

      // Add uploaded files (if any) to the payload
      if (uploadedFiles.length > 0) {
        uploadedFiles.forEach((file) => formData.append("uploadedFiles", file));
      }

      // Add company data to the payload
      const companyDataBody = {
        name: selectedCompany.title,
        industry: companyData?.sicDescription,
      };
      const companyDataString = JSON.stringify(companyDataBody);
      console.log("Company Data:", companyDataString); // Debugging step
      formData.append("companyData", companyDataString);

      // Log the complete FormData
      console.log("Form Data:", formData);

      // Send to the backend
      const response = await fetch("http://localhost:4000/api/analyze", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Analysis failed: ${response.statusText}`);
      }

      const data = await response.json();
      setAiAnalysisTextResponse(data.AiAnalysisTextResponse);
      console.log(
        "Received AiAnalysisTextResponse:",
        data.AiAnalysisTextResponse
      );

      setAnalysisTriggered(true);
    } catch (error) {
      console.error("Failed to analyze documents:", error);
      setUploadError("Failed to analyze the documents. Please try again.");
    } finally {
      setLoading(false);
    }
  };


  const validateFiles = (files: FileList) => {
    const validFiles = Array.from(files).filter(
      (file) => file.type === "application/pdf"
    );

    if (validFiles.length === 0) {
      setUploadError("Only PDF files are allowed.");
    } else {
      setUploadedFiles((prev) => [...prev, ...validFiles]);
      setUploadError(null);
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100 p-4">
      <header className="bg-blue-600 text-white py-2 text-center rounded-md mb-4">
        <div className="flex flex-col items-center w-full">
          <h1 className="text-3xl font-extrabold">SEC AI</h1>
        </div>
      </header>

      <main className="space-y-4">
        {/* Company Search Section */}
        <section className="mx-auto">
          <CompanySearch onCompanySelect={handleCompanySelect} />
        </section>

        {/* Display Company Data */}
        {companyData && <CompanyDetails companyData={companyData} />}

        {/* Grid Sections */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4 mx-auto">
          <FinancialDocuments
            documentTypes={documentTypes}
            filings={filings}
            selectedItems={selectedItems}
            toggleSelection={toggleSelection}
          />
          <UploadDocument
            uploadedFiles={uploadedFiles.map((file) => ({ name: file.name }))}
            validateFiles={validateFiles}
            removeFile={removeFile}
          />
        </section>

        {/* Analyze Documents Section */}
        <section className="mx-auto">
          <AnalyzeDocuments onAnalyze={handleAnalyze} />
        </section>

        {uploadError && <p className="text-red-500">{uploadError}</p>}
        {loading && <p>Loading reports, please wait...</p>}

        {AiAnalysisTextResponse && (
          <section className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-4">
            <h2 className="text-lg font-bold mb-2">Generated AiAnalysisTextResponse</h2>
            <pre className="whitespace-pre-wrap">{AiAnalysisTextResponse}</pre>
          </section>
        )}
      </main>
    </div>
  );
}
