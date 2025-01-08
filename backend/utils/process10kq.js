// Function to load an HTML file and return its content
//import fs from "fs";
//import path from "path";
import * as cheerio from "cheerio";

/* function loadHtmlFile(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }
  return fs.readFileSync(filePath, "utf-8");
} */

// Function to normalize text
function restoreWindows1252Characters(text) {
  return text.replace(/[-]/g, (match) => {
    try {
      return Buffer.from([match.charCodeAt(0)]).toString("windows-1252");
    } catch (err) {
      return "";
    }
  });
}

// Replace all whitespace characters (spaces, newlines, tabs) with a single space
function formatText(text) {
  return text.replace(/\s+/g, " ").trim();
}

// Function to convert HTML table to JSON
function tableToJson(table, $) {
  const rows = table.find("tr").toArray();
  const data = rows
    .map((row) => {
      const cells = $(row).find("th, td").toArray();
      return cells
        .map((cell) => formatText($(cell).text()))
        .filter((text) => text !== ""); // Remove empty cells
    })
    .filter((row) => row.length > 0);

  return JSON.stringify(data);
}

// Function to format text and remove empty cells
function tableToText(table, $) {
  const rows = table.find("tr").toArray();
  return rows
    .map((row) => {
      const cells = $(row).find("th, td").toArray();
      const cellTexts = cells
        .map((cell) => formatText($(cell).text().trim())) // Trim whitespace
        .filter((text) => text !== ""); // Remove empty cells
      return cellTexts.length > 0 ? `| ${cellTexts.join(" | ")} |` : null; // Handle rows with no cells
    })
    .filter((line) => line !== null) // Remove empty rows
    .join("\n");
}


// Function to process 10-K/Q HTML
function process10kq_html(html, sectionNames = []) {
  const cleaned_html = restoreWindows1252Characters(html);
  const $ = cheerio.load(cleaned_html);

  let tableOfContentsHref = null;
  const idNameMapping = {};

  // Find section IDs by href elements
  $("a[href]").each((_, anchor) => {
    const $anchor = $(anchor);
    const text = formatText($anchor.text());
    if (text.toLowerCase().includes("table of contents")) {
      tableOfContentsHref = $anchor.attr("href");
      $anchor.remove();
    } else {
      const id = $anchor.attr("href").slice(1);
      const associatedName = formatText($anchor.parent().text());
      if (!isNaN(associatedName)) return;
      idNameMapping[id] = associatedName;
      if (associatedName === "Signature") return;
    }
  });

  // Remove unwanted IDs and elements
  $("div[id]").each((_, div) => {
    const $div = $(div);
    if (!idNameMapping[$div.attr("id")]) {
      $div.remove();
    }
  });

  if (tableOfContentsHref) {
    $(`a[href="${tableOfContentsHref}"]`).remove();
  }

  // Sections to analyze
  const sectionIdsToAnalyze =
    sectionNames.length > 0
      ? Object.fromEntries(
          Object.entries(idNameMapping).filter(([id, name]) =>
            sectionNames.some((sectionName) =>
              name.toLowerCase().includes(sectionName.toLowerCase())
            )
          )
        )
      : idNameMapping;

  // Extract text from sections
  const sectionData = {};
  Object.entries(sectionIdsToAnalyze).forEach(([id, name]) => {
    const section = $(`div#${id}`);
    if (section.length > 0) {
      const content = [];
      content.push(formatText(section.text()));

      let sibling = section.next();
      while (sibling.length > 0) {
        if (sibling.is("div[id]")) break;

        const table = sibling.find("table");
        if (table.length > 0) {
          content.push("JSON TABLE: "+tableToJson(table, $));
        } else {
          const text = formatText(sibling.text());
          if (text) content.push(text);
        }
        sibling = sibling.next();
      }
      sectionData[name] = content.join("\n");
      // print type of sectionData content
    }
  });

  return sectionData;
}

/* // Example usage
const filePath = "/Users/alexj/Code/secai/backend/10-Q_2024-10-30.htm";
const html = loadHtmlFile(filePath);
const sectionData = process10kq_html(html, [
  "Discussion and Analysis",
  "Risk Factors",
]);
console.log(sectionData);
 */

export async function process10kq(url, sectionNames = ["Discussion and Analysis"]) {
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

    // Process the HTML content
    const sectionData = process10kq_html(html, sectionNames);
    
    // Format output
    const formattedOutput = Object.entries(sectionData)
      .map(([section, content]) => `${section}\n${content}`)
      .join("\n\n");

    return formattedOutput;
  } catch (error) {
    console.error(`Error processing 10-K/Q: ${error.message}`);
    throw error;
  }
}