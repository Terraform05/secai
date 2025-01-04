import { load } from "cheerio";

export async function process8k(url) {
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

    // Load into Cheerio
    const $ = load(html);

    // Debugging: Log all <hr> tags
    const allHrTags = $("hr").toArray();

    // Locate the starting <hr> element or fallback
    let startHr = $('hr[style*="page-break-after"]').first();
    if (!startHr.length) {
      console.warn("Default <hr> not found. Trying fallback method.");
      startHr = $('[style*="page-break-after"]').first();
    }
    if (!startHr.length) {
      throw new Error("Starting <hr> tag or fallback not found.");
    }

    // Locate the content after the starting element
    const content = startHr.nextAll();

    const items = {};
    let currentKey = null;

    content.each((_, element) => {
      const text = $(element).text().trim();

      // Stop at the "SIGNATURES" section
      if (text === "SIGNATURES") return false;

      // Capture "Item X.XX" titles
      const itemMatch = text.match(/Item\s\d+\.\d+/);
      if (itemMatch) {
        currentKey = `${itemMatch[0]} - ${text
          .replace(itemMatch[0], "")
          .replace(/[\s\r\n]+/g, " ")
          .trim()}`;
        items[currentKey] = [];
      } else if (currentKey && text) {
        // Append content
        items[currentKey].push(text.replace(/[\s\r\n]+/g, " ").trim());
      }
    });

    // Format output
    const formattedOutput = Object.entries(items)
      .map(([item, content]) => `${item}\n- ${content.join("\n- ")}`)
      .join("\n\n");

    return formattedOutput;
  } catch (err) {
    console.error("Error parsing the 8-K document:", err);
    throw err;
  }
}

// Example Usage
/* const url =
  "https://www.sec.gov/Archives/edgar/data/2488/000000248824000172/amd-20241113.htm";
parse8k(url)
  .then((output) => console.log(output))
  .catch((err) => console.error(err));
 */