import fetch from "node-fetch";
import { DOMParser } from "xmldom";

// Fetch CIK Submissions
export async function getCIKSubmissions(CIK) {
  const submissionsBaseUrl = `https://data.sec.gov/submissions/CIK${CIK}.json`;
  try {
    console.log(`Fetching CIK Submissions: ${submissionsBaseUrl}`);
    const response = await fetch(submissionsBaseUrl, {
      headers: {
        "User-Agent": "your-app-name, your-email@example.com",
      },
    });

    if (!response.ok) {
      console.error(
        `SEC API returned an error: ${response.status} ${response.statusText}`
      );
      throw new Error(`Error fetching submissions: ${response.statusText}`);
    }

    const data = await response.json();
    //console.log("Fetched CIK Submissions:", data);
    return data;
  } catch (error) {
    console.error("Error in getCIKSubmissions:", error);
    throw error;
  }
}

// Fetch the URL for a specific filing document
export async function getActualUrl(CIK, formType, accessionNumber) {
  const filingSummaryBaseUrl = `https://www.sec.gov/Archives/edgar/data/${CIK}/${accessionNumber}/FilingSummary.xml`;

  try {
    const response = await fetch(filingSummaryBaseUrl, {
      headers: {
        "User-Agent": "your-app-name, your-email@example.com",
      },
    });

    if (!response.ok) {
      throw new Error(
        `Error fetching FilingSummary.xml: ${response.statusText}`
      );
    }

    const xmlText = await response.text();
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, "application/xml");

    const files = xmlDoc.getElementsByTagName("File");
    for (let i = 0; i < files.length; i++) {
      const fileElement = files[i];
      const docType = fileElement.getAttribute("doctype");
      const fileName = fileElement.textContent;

      if (docType === formType && fileName) {
        return `https://www.sec.gov/Archives/edgar/data/${CIK}/${accessionNumber}/${fileName}`;
      }
    }

    return null;
  } catch (error) {
    console.error(`Error fetching or parsing FilingSummary.xml: ${error}`);
    throw error;
  }
}

// Get the most recent filings
export async function getMostRecentFilings(submissions, CIK, formTypes) {
  const filings = submissions?.filings?.recent || {};
  const forms = filings.form || [];
  const dates = filings.filingDate || [];
  const accessionNumbers = filings.accessionNumber || [];

  const mostRecentFilings = {};

  for (let index = 0; index < forms.length; index++) {
    const formType = forms[index];
    const filingDate = dates[index];
    const accessionNumber = accessionNumbers[index]?.replace(/-/g, "");

    if (formTypes.includes(formType)) {
      if (
        !mostRecentFilings[formType] ||
        new Date(filingDate) > new Date(mostRecentFilings[formType].filingDate)
      ) {
        const actualUrl = await getActualUrl(CIK, formType, accessionNumber);

        mostRecentFilings[formType] = {
          formType,
          filingDate,
          accessionNumber,
          url: actualUrl || undefined,
        };
      }
    }
  }

  return Object.values(mostRecentFilings);
}
