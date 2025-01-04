import fetch from "node-fetch";
import { load } from "cheerio";

export async function process10k(url) {
  try {
    // Fetch the HTML from the given URL with a User-Agent header
    const response = await fetch(url, {
      headers: {
        "User-Agent": "your-app-name, your-email@example.com",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch the URL: ${response.statusText}`);
    }

    const html = await response.text();

    // Load the HTML into Cheerio
    const $ = load(html);

    // Helper function to normalize text for comparison
    const normalizeText = (text) =>
      text.trim().toLowerCase().replace(/\s+/g, " ");

    // Define robust patterns for the section titles
    const managementPatterns = [
      "management's discussion and analysis of financial condition and results of operations",
      "discussion and analysis of financial condition and results of operations",
    ];

    const stopPatterns = [
      "quantitative and qualitative disclosures about market risk",
    ];

    let managementSectionId = null;
    let stopSectionId = null;

    // Find the IDs for the target sections
    $("a").each((_, element) => {
      const linkText = normalizeText($(element).text());

      if (
        managementPatterns.some((pattern) => linkText.includes(pattern)) &&
        !managementSectionId
      ) {
        managementSectionId = $(element).attr("href")?.replace("#", "");
      }

      if (
        stopPatterns.some((pattern) => linkText.includes(pattern)) &&
        !stopSectionId
      ) {
        stopSectionId = $(element).attr("href")?.replace("#", "");
      }
    });

    if (!managementSectionId) {
      throw new Error(
        "Management Discussion section not found in the document."
      );
    }

    // Retrieve content of the Management Discussion section up to the stop section
    const managementSection = $(`#${managementSectionId}`);
    if (!managementSection.length) {
      throw new Error("Management Discussion section content not found.");
    }

    let content = "";
    let currentElement = managementSection;

    while (currentElement.length) {
      const currentId = currentElement.attr("id");

      // Stop if we reach the stop section ID
      if (stopSectionId && currentId === stopSectionId) {
        break;
      }

      // Append text while excluding "Table of Contents"
      const text = currentElement.text().trim();
      if (!text.toLowerCase().includes("table of contents")) {
        content += text + "\n";
      }

      currentElement = currentElement.next();
    }

    return content.trim(); // Return the extracted content
  } catch (err) {
    console.error("Error processing 10-Q/K document:", err);
    throw err;
  }
}

