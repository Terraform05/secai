export interface Company {
  cik_str: string;
  ticker: string;
  title: string;
}

export interface Filing {
  formType: string;
  filingDate: string;
  accessionNumber: string;
  url?: string;
}

export interface CompanyData {
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