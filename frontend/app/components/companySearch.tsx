"use client";

import { useState, useRef, useEffect, ChangeEvent } from "react";
import cikData from "../../../backend/data/CIK_data.json"; // Import CIK data
import { Company } from "../../public/types/types"; // Import types

interface CompanySearchProps {
  onCompanySelect: (company: Company) => void;
}

export default function CompanySearch({ onCompanySelect }: CompanySearchProps) {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [suggestedCompanies, setSuggestedCompanies] = useState<Company[]>([]);

  const dropdownRef = useRef<HTMLUListElement | null>(null);

  const MAX_RESULTS = 10; // Limit the number of suggestions shown

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const term = event.target.value;
    setSearchTerm(term);

    if (term) {
      // Filter and sort based on relevance (company name or ticker match)
      const filteredCompanies = Object.values(cikData)
        .filter(
          (entry) =>
            entry.ticker.toLowerCase().includes(term.toLowerCase()) ||
            entry.title.toLowerCase().includes(term.toLowerCase())
        )
        .slice(0, MAX_RESULTS); // Limit results to MAX_RESULTS

      const companiesWithStringCik = filteredCompanies.map((entry) => ({
        ...entry,
        cik_str: entry.cik_str.toString(),
      }));
      setSuggestedCompanies(companiesWithStringCik as Company[]);
    } else {
      setSuggestedCompanies([]);
    }
  };

  const handleClickOutsideDropdown = (event: MouseEvent): void => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target as Node)
    ) {
      setSuggestedCompanies([]);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutsideDropdown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutsideDropdown);
    };
  }, []);

  const handleCompanySelect = (company: Company): void => {
    const paddedCIK = company.cik_str.padStart(10, "0"); // Pad CIK with leading zeroes
    const updatedCompany = { ...company, cik_str: paddedCIK }; // Store padded CIK as a string

    onCompanySelect(updatedCompany); // Notify parent component with the updated company
    setSearchTerm(`${company.title} (${company.ticker}) - CIK ${paddedCIK}`); // Update search bar with the ticker and padded CIK
    setSuggestedCompanies([]); // Clear suggestions
  };

  return (
    <section className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-4 w-full">
      <input
        type="text"
        className="w-full px-4 py-2 border border-gray-300 rounded-md"
        placeholder="Search for ticker or company..."
        value={searchTerm}
        onChange={handleSearchChange}
      />
      {suggestedCompanies.length > 0 && (
        <ul
          className="absolute bg-white border border-gray-300 rounded-md mt-1 max-h-60 w-full overflow-y-auto z-10"
          ref={dropdownRef}
        >
          {suggestedCompanies.map((company) => (
            <li
              key={`${company.title} (${company.ticker}) - CIK ${company.cik_str}`}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => handleCompanySelect(company)}
            >
              {company.title} ({company.ticker}) - CIK{" "}
              {company.cik_str.toString().padStart(10, "0")}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
