"use client";

import { useState } from "react";
import FinancialDocuments from "./components/financialDocumentSelection";
import UploadDocument from "./components/uploadDocument";
import AnalyzeDocuments from "./components/analyzeDocuments";
import CompanySearch from "./components/companySearch";
import DynamicAnalysisSection from "./components/analysisDisplay";
import CompanyDetails from "./components/companyDetails";

interface Company {
  cik_str: string;
  ticker: string;
  title: string;
}

interface Filing {
  formType: string;
  filingDate: string;
  accessionNumber: string;
  url?: string;
}

interface CompanyData {
  cik: string;
  entityType: string;
  sic: string;
  sicDescription: string;
  ownerOrg: string;
  name: string;
  ticker: string;
  exchanges: string[];
  ein: string;
  description: string;
  category: string;
  fiscalYearEnd: string;
  stateOfIncorporation: string;
  businessAddress: {
    street1: string;
    street2?: string | null;
    city: string;
    stateOrCountry: string;
    zipCode: string;
    stateOrCountryDescription: string;
  };
  phone: string;
  flags: string;
  formerNames: {
    name: string;
    from: string;
    to: string;
  }[];
}

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
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]); // Fixing this to pass properly

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
    if (uploadedFiles.length === 0) {
      console.error("No files uploaded.");
      return;
    }

    try {
      setLoading(true);

      // Prepare the FormData payload
      const formData = new FormData();
      uploadedFiles.forEach((file) => formData.append("files", file));

      // Send files to the backend
      const response = await fetch(
        "http://localhost:4000/api/analyze-uploaded-files",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error(`Analysis failed: ${response.statusText}`);
      }

      console.log("Files uploaded successfully for analysis.");

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

    console.log("Valid files:", validFiles);

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

        {analysisTriggered && (
          <DynamicAnalysisSection
            selectedItems={selectedItems}
            retrievedReports={filings}
            uploadedFiles={uploadedFiles.map((file) => ({
              name: file.name,
              text: "",
            }))}
          />
        )}
      </main>
    </div>
  );
}
