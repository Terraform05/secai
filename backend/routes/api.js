import express from "express";
import {
  getMostRecentFilings,
  getCIKSubmissions,
} from "../utils/filingsUtil.js";

//import { extractTextFromPDF } from "../utils/pdfUtil.js";
import multer from "multer";

const router = express.Router();



// PDF HANDLER

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

// Endpoint to handle uploaded files
router.post(
  "/analyze-uploaded-files",
  upload.array("files"),
  async (req, res) => {
    try {
      const files = req.files;

      if (!files || files.length === 0) {
        return res.status(400).json({ message: "No files uploaded." });
      }

      // Log file names
      files.forEach((file) => {
        console.log("Uploaded file:", file.originalname);
      });

      res.status(200).json({ message: "Files received successfully." });
    } catch (error) {
      console.error("Error receiving files:", error);
      res.status(500).json({ error: "Failed to receive files." });
    }
  }
);

// FILINGS HANDLER

router.get("/filings", async (req, res) => {
  const { CIK, formTypes } = req.query;

  if (!CIK || !formTypes) {
    console.error("Missing required parameters in /filings request");
    return res.status(400).json({ error: "Missing required parameters" });
  }

  try {
    console.log(`\nReceived request: CIK=${CIK}, formTypes=${formTypes}\n`);

    // Fetch the company data
    const submissions = await getCIKSubmissions(CIK);

    // Extract the company data
    const companyData = {
      cik: submissions.cik,
      entityType: submissions.entityType,
      sic: submissions.sic,
      sicDescription: submissions.sicDescription,
      ownerOrg: submissions.ownerOrg,
      //insiderTransactionForOwnerExists:submissions.insiderTransactionForOwnerExists,
      //insiderTransactionForIssuerExists:submissions.insiderTransactionForIssuerExists,
      name: submissions.name,
      ticker: submissions.tickers[0],
      exchanges: submissions.exchanges,
      ein: submissions.ein,
      description: submissions.description,
      //website: submissions.website,
      //investorWebsite: submissions.investorWebsite,
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
      })), // Map the array of former names
    };

    // Fetch the filings
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

    // Return both company data and filings
    res.json(final_response);
  } catch (error) {
    console.error("Error in /filings route:", error);
    res.status(500).json({ error: "Failed to fetch filings" });
  }
});

export default router;
