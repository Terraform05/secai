import fetch from "node-fetch";
import { load } from "cheerio";

/**
 * Processes a 10-K or 10-Q filing to extract the "Management's Discussion" section,
 * stop at the next numbered section, and format tables.
 * @param {string} url - The URL of the filing.
 * @returns {Promise<string>} - The extracted content between the two sections.
 */
export async function process10kq(url) {
  try {
    // Fetch the HTML content of the filing
    const response = await fetch(url, {
      headers: {
        "User-Agent": "your-app-name, your-email@example.com",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch the URL: ${response.statusText}`);
    }

    const html = await response.text();
    const $ = load(html);

    // Helper function to normalize text for comparison
    const normalizeText = (text) =>
      text?.trim().toLowerCase().replace(/\s+/g, " ") || "";

    // Patterns for identifying "Management's Discussion" section
    const managementPatterns = [
      "management's discussion and analysis of financial condition and results of operations",
      "discussion and analysis of financial condition and results of operations",
      "item \\d{1,2}: management's discussion and analysis of financial condition and results of operations",
      "item \\d{1,2}. management's discussion",
    ];

    // Patterns for identifying the stop section
    const stopPatterns = [
      "quantitative and qualitative disclosures about market risk",
      "item \\d{1,2}: quantitative and qualitative disclosures about market risk",
    ];

    let managementSectionId = null;
    let stopSectionId = null;

    // First attempt: Extract section IDs
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

    let managementStartElement = null;

    // Fallback: Search for sections directly in the document
    if (!managementSectionId) {
      managementStartElement = $("h1, h2, h3, p, div")
        .filter((_, el) => {
          const text = normalizeText($(el).text());
          return managementPatterns.some((pattern) =>
            new RegExp(pattern, "i").test(text)
          );
        })
        .first();
    } else {
      managementStartElement = $(`#${managementSectionId}`);
    }

    if (!managementStartElement.length) {
      throw new Error(
        "Management's Discussion section not found in the document."
      );
    }

    // Extract the section number from the title
    const managementSectionNumberMatch = managementStartElement
      .text()
      .match(/item (\d{1,2})/i);

    let managementSectionNumber = null;
    let nextSectionPattern = null;

    if (managementSectionNumberMatch) {
      managementSectionNumber = parseInt(managementSectionNumberMatch[1], 10);
      nextSectionPattern = new RegExp(
        `item ${managementSectionNumber + 1}`,
        "i"
      );
    }

    // Extract content between the management section and the next numbered section
    let content = "";
    let currentElement = managementStartElement;

    while (currentElement.length) {
      const text = currentElement.text().trim();

      // Stop extraction when reaching the next numbered section
      if (nextSectionPattern && nextSectionPattern.test(normalizeText(text))) {
        break;
      }

      // Stop extraction when reaching the stop section
      if (stopSectionId && currentElement.attr("id") === stopSectionId) {
        break;
      }

      // Handle table formatting
      if (currentElement.is("table")) {
        const tableRows = currentElement
          .find("tr")
          .map((_, row) => {
            const cells = $(row)
              .find("th, td")
              .map((_, cell) => $(cell).text().trim())
              .get();
            return cells.join("|"); // Join cells with pipe separators
          })
          .get();

        if (tableRows.length > 0) {
          content += "\n" + tableRows.join("\n") + "\n"; // Add formatted table rows
        }
      } else {
        // Append non-table text while excluding "Table of Contents"
        if (!normalizeText(text).includes("table of contents")) {
          content += text + "\n";
        }
      }

      currentElement = currentElement.next();
    }

    return content.trim(); // Ensure the extracted content is returned
  } catch (err) {
    console.error("Error processing filing:", err);
    throw err;
  }
}
