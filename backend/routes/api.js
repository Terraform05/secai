import express from "express";
import multer from "multer";
import {
  getMostRecentFilings,
  getCIKSubmissions,
} from "../utils/secRetrieval.js";
import { extractFormattedPdfTextFromBuffer } from "../utils/pdfProcessor.js";
import { process8k } from "../utils/process8k.js";
import { process10k } from "../utils/process10k.js";
import { process10kq } from "../utils/process10q.js";
import { generatePrompt } from "../utils/prompt.js"; // Import the prompt generation utility

const router = express.Router();

// Configure Multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== "application/pdf") {
      return cb(new Error("Only PDF files are allowed!"));
    }
    cb(null, true);
  },
});

// Analyze route
router.post("/analyze", upload.array("uploadedFiles"), async (req, res) => {
  try {
    const { selectedFilings } = req.body;
    const files = req.files;

    let summary = "";

    // Process selected filings
    if (selectedFilings) {
      const filings = JSON.parse(selectedFilings);
      console.log("Selected filings for analysis:", filings);

      for (const filing of filings) {
        try {
          if (filing.formType === "8-K") {
            const content = await process8k(filing.url);
            summary += `Filing: ${filing.formType} (${filing.filingDate})\n\n${content}\n\n`;
          } else if (filing.formType === "10-K") {
            const content = await process10kq(filing.url);
            summary += `Filing: ${filing.formType} (${filing.filingDate})\n\n${content}\n\n`;
          } else if (filing.formType === "10-Q") {
            const content = await process10kq(filing.url);
            summary += `Filing: ${filing.formType} (${filing.filingDate})\n\n${content}\n\n`;
          } else {
            throw new Error(`Unsupported form type: ${filing.formType}`);
          }
        } catch (error) {
          console.error(`Error analyzing filing ${filing.formType}:`, error);
          summary += `Filing: ${filing.formType} (${filing.filingDate}) failed to analyze. Error: ${error.message}\n\n`;
        }
      }
    }

    // Process uploaded files
    if (files && files.length > 0) {
      console.log("Processing uploaded files...");
      const processedFiles = await Promise.all(
        files.map(async (file) => {
          try {
            const uint8Array = new Uint8Array(file.buffer);
            const text = await extractFormattedPdfTextFromBuffer(uint8Array);
            return `Uploaded File: ${file.originalname} analyzed successfully.\n\n${text}`;
          } catch (error) {
            console.error(`Error processing file ${file.originalname}:`, error);
            return `Uploaded File: ${file.originalname} failed to analyze. Error: ${error.message}`;
          }
        })
      );

      summary += processedFiles.join("\n\n");
    }

    // Generate prompt based on the summary
    const prompt = generatePrompt(summary.replace(/\r?\n/g, "\n"));

    // Return the prompt to the frontend
    res.status(200).json({ AiAnalysisText: prompt });
  } catch (error) {
    console.error("Error analyzing documents:", error);
    res.status(500).json({ error: "Failed to analyze documents." });
  }
});


// FILINGS HANDLER
router.get("/filings", async (req, res) => {
  const { CIK, formTypes } = req.query;

  if (!CIK || !formTypes) {
    console.error("Missing required parameters in /filings request");
    return res.status(400).json({ error: "Missing required parameters" });
  }

  try {
    console.log(`\nReceived request: CIK=${CIK}, formTypes=${formTypes}\n`);

    const submissions = await getCIKSubmissions(CIK);

    const companyData = {
      cik: submissions.cik,
      entityType: submissions.entityType,
      sic: submissions.sic,
      sicDescription: submissions.sicDescription,
      ownerOrg: submissions.ownerOrg,
      name: submissions.name,
      ticker: submissions.tickers[0],
      exchanges: submissions.exchanges,
      ein: submissions.ein,
      description: submissions.description,
      category: submissions.category,
      fiscalYearEnd: submissions.fiscalYearEnd,
      stateOfIncorporation: submissions.stateOfIncorporation,
      businessAddress: {
        street1: submissions.addresses.business.street1,
        street2: submissions.addresses.business.street2,
        city: submissions.addresses.business.city,
        stateOrCountry: submissions.addresses.business.stateOrCountry,
        zipCode: submissions.addresses.business.zipCode,
        stateOrCountryDescription:
          submissions.addresses.business.stateOrCountryDescription,
      },
      phone: submissions.phone,
      flags: submissions.flags,
      formerNames: submissions.formerNames.map((nameData) => ({
        name: nameData.name,
        from: nameData.from,
        to: nameData.to,
      })),
    };

    const formTypesArray = formTypes.split(",");
    const filings = await getMostRecentFilings(
      submissions,
      CIK,
      formTypesArray
    );

    const final_response = {
      companyData: companyData,
      filings: filings,
    };

    console.log("Final response:", final_response);

    res.json(final_response);
  } catch (error) {
    console.error("Error in /filings route:", error);
    res.status(500).json({ error: "Failed to fetch filings" });
  }
});

export default router;
