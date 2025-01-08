import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import * as fs from "fs/promises";

/**
 * Transform (x, y) coordinates using a transformation matrix.
 * @param {number} x - The x-coordinate.
 * @param {number} y - The y-coordinate.
 * @param {number[]} transform - The transformation matrix.
 * @returns {[number, number]} Transformed coordinates.
 */
function transformCoordinates(x, y, [a, b, c, d, e, f]) {
  const xt = x * a + y * c + e;
  const yt = x * b + y * d + f;
  return [xt, yt];
}

/**
 * Determines if a row represents a table based on its number of items.
 * @param {Array<{ x: number; text: string }>} row - A row of text items.
 * @returns {boolean} Whether the row represents a table.
 */
function isTableRow(row) {
  return row.length >= 5; // Rows with 3 or more items are considered part of a table
}

/**
 * Groups text items into rows by their `y` coordinates.
 * @param {Array<{ str: string; transform: number[] }>} items - Text items from the PDF.
 * @returns {Array<{ x: number; text: string }[]>} Grouped rows of text items.
 */
function groupRowsByYCoordinate(items) {
  const rows = {};
  const tolerance = 5; // Tolerance for grouping by Y-coordinate

  items.forEach(({ str, transform }) => {
    const [, y] = transformCoordinates(0, 0, transform);

    const matchingRow = Object.keys(rows).find(
      (key) => Math.abs(parseFloat(key) - y) <= tolerance
    );
    const rowKey = matchingRow !== undefined ? matchingRow : y;

    if (!rows[rowKey]) rows[rowKey] = [];
    rows[rowKey].push({ x: transform[4], text: str });
  });

  return Object.keys(rows)
    .sort((a, b) => parseFloat(b) - parseFloat(a)) // Sort rows top to bottom
    .map((key) => rows[key].sort((a, b) => a.x - b.x)); // Sort items left to right
}

/**
 * Formats rows as concatenated text or pipe-separated tables.
 * @param {Array<{ x: number; text: string }[]>} rows - Rows of text items.
 * @returns {string} Pretty-printed text with tables inline.
 */
function formatRows(rows) {
  const formattedRows = [];
  let inTable = false;

  rows.forEach((row) => {
    if (isTableRow(row)) {
      if (!inTable) {
        inTable = true;
        formattedRows.push(""); // Add newline before table starts
      }
      formattedRows.push(row.map((item) => item.text).join("|")); // Table row
    } else {
      if (inTable) {
        inTable = false;
        formattedRows.push(""); // Add newline after table ends
      }
      formattedRows.push(row.map((item) => item.text).join(" ")); // Regular text row
    }
  });

  return formattedRows.join("\n");
}

/**
 * Extracts text from a single page, formatting tables and paragraphs.
 * @param {any} page - The PDF page object.
 * @returns {Promise<string>} Formatted text with tables inline.
 */
async function extractPageText(page) {
  const textContent = await page.getTextContent();
  const rows = groupRowsByYCoordinate(textContent.items);
  return formatRows(rows);
}

/**
 * Extracts text from a PDF buffer, formatting tables and paragraphs.
 * @param {Uint8Array} pdfData - Binary data for the PDF file.
 * @returns {Promise<string>} Formatted text content of the PDF.
 */
export async function extractFormattedPdfTextFromBuffer(pdfData) {
  const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;
  const formattedText = [];

  for (let pageIndex = 0; pageIndex < pdf.numPages; pageIndex++) {
    const page = await pdf.getPage(pageIndex + 1);
    const pageText = await extractPageText(page);
    formattedText.push(`Page ${pageIndex + 1}:\n${pageText}`);
  }

  return formattedText.join("\n\n"); // Separate pages with double newlines
}

/**
 * Extracts formatted text from a PDF file.
 * @param {string} filePath - Path to the PDF file.
 * @returns {Promise<string>} Formatted text content of the PDF.
 */
export async function extractFormattedPdfText(filePath) {
  try {
    const fileBuffer = await fs.readFile(filePath);
    const pdfData = new Uint8Array(fileBuffer); // Convert to Uint8Array for processing
    return await extractFormattedPdfTextFromBuffer(pdfData);
  } catch (error) {
    throw new Error(`Error extracting PDF text: ${error.message}`);
  }
}
