import React, { useState } from "react";

// Types
interface BusinessAddress {
  street1: string;
  street2?: string | null;
  city: string;
  stateOrCountry: string;
  zipCode: string;
  stateOrCountryDescription: string;
}

interface FormerName {
  name: string;
  from: string;
  to: string;
}

interface CompanyDataProps {
  companyData: {
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
    businessAddress: BusinessAddress;
    phone: string;
    flags: string;
    formerNames: FormerName[];
  };
}

const CompanyDetails: React.FC<CompanyDataProps> = ({ companyData }) => {
  const [isCollapsed, setIsCollapsed] = useState(true);

  const toggleCollapse = () => {
    setIsCollapsed((prev) => !prev);
  };

  return (
    <section className="bg-white shadow-md rounded-md">
      {/* Title Bar */}
      <div
        className="p-6 flex items-center cursor-pointer rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
        onClick={toggleCollapse}
      >
        {/* Collapse Indicator */}
        <span
          className="text-2xl font-bold mr-2 flex items-center justify-center"
          style={{ minWidth: "2rem" }}
        >
          [{isCollapsed ? "+" : "-"}]
        </span>
        <h2 className="text-2xl font-bold">
          {companyData.name} ({companyData.ticker})
        </h2>
      </div>

      {/* Details Section */}
      {!isCollapsed && (
        <div className="px-6 pb-6 grid lg:grid-flow-col md:grid-cols-2 sm:grid-cols-2 gap-x-8 gap-y-6 justify-start text-left">
          {/* Col 1 CIK EIN SIC */}
          <div className="space-y-1">
            <p>
              <strong>CIK:</strong> {companyData.cik}
            </p>
            <p>
              <strong>EIN:</strong> {companyData.ein}
            </p>
            <p>
              <strong>SIC:</strong> {companyData.sic} - {companyData.sicDescription}
            </p>
            <p>
              <strong>Owner Org:</strong> {companyData.ownerOrg}
            </p>
          </div>

          {/* Col 2 Location Category Fiscal Year */}
          <div className="space-y-1">
            <p>
              <strong>State location:</strong> {companyData.businessAddress.stateOrCountryDescription}
            </p>
            <p>
              <strong>State of incorporation:</strong> {companyData.stateOfIncorporation}
            </p>
            <p>
              <strong>Category:</strong> {companyData.category}
            </p>
            <p>
              <strong>Fiscal year end:</strong> December {parseInt(companyData.fiscalYearEnd.substring(2), 10)}
            </p>
          </div>

          {/* Column Address Phone */}
          <div className="space-y-1">
            <h3 className="font-semibold">Business address:</h3>
            <p>
              {companyData.businessAddress.street1}
              {companyData.businessAddress.street2 && `, ${companyData.businessAddress.street2}`}
            </p>
            <p>
              {companyData.businessAddress.city}, {companyData.businessAddress.stateOrCountry},{" "}
              {companyData.businessAddress.zipCode}
            </p>
            <p>
              <strong>Phone:</strong> {companyData.phone}
            </p>
          </div>

          {/* Column 4 */}
          <div className="space-y-1">
            <h3 className="font-semibold">Former names:</h3>
            {companyData.formerNames.length > 0 ? (
              <ul className="list-disc list-inside">
                {companyData.formerNames.map((name, index) => (
                  <li key={index}>
                    {name.name} - filings through {new Date(name.to).toLocaleDateString()}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No former names available.</p>
            )}
          </div>
        </div>
      )}
    </section>
  );
};

export default CompanyDetails;
