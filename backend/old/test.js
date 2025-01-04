import { extractFormattedPdfText } from "../utils/pdfProcessor.js";

const filePath = "./test.pdf"; // Replace with your PDF file path

extractFormattedPdfText(filePath)
  .then((formattedText) => {
    console.log("Formatted PDF Text:\n");
    console.log(formattedText);
  })
  .catch((error) => {
    console.error("Error:", error.message);
  });
