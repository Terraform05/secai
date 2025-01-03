import fetch from "node-fetch";
import { load } from "cheerio";

async function getManagementDiscussionContent(url) {
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

    // Find the link for "Management's Discussion and Analysis" in the table of contents
    const tocLinks = $("a");
    let managementSectionId = null;
    let nextSectionId = null;

    tocLinks.each((index, element) => {
      const linkText = $(element).text().trim();

      if (
        linkText.includes("Management's Discussion and Analysis") ||
        linkText.includes("Discussion and Analysis of Financial Condition")
      ) {
        managementSectionId = $(element).attr("href")?.replace("#", "");
        // Look for the next DIFFERENT ID
        for (let i = index + 1; i < tocLinks.length; i++) {
          const nextHref = $(tocLinks[i]).attr("href")?.replace("#", "");
          if (nextHref && nextHref !== managementSectionId) {
            nextSectionId = nextHref;
            break;
          }
        }
        return false; // Break out of the loop once found
      }
    });

    if (!managementSectionId) {
      console.error("Management Discussion section not found in the table of contents.");
      return;
    }

    console.log("Management Section ID:", managementSectionId);
    console.log("Next Section ID:", nextSectionId || "No next section ID found");

    // Retrieve content of the Management Discussion section up to the next section
    const managementSection = $(`#${managementSectionId}`);
    if (!managementSection.length) {
      console.error("Management Discussion section content not found.");
      return;
    }

    let content = "";
    let currentElement = managementSection;

    while (currentElement.length) {
      const currentId = currentElement.attr("id");
      if (nextSectionId && currentId === nextSectionId) {
        break;
      }

      // Append text while excluding "Table of Contents"
      const text = currentElement.text().trim();
      if (!text.includes("Table of Contents")) {
        content += text + "\n";
      }

      currentElement = currentElement.next();
    }

    console.log("Extracted Content (without 'Table of Contents'):");
    console.log(content.trim());
  } catch (err) {
    console.error("Error:", err);
  }
}

// Example usage
/* const url =
  "https://www.sec.gov/Archives/edgar/data/2488/000000248824000012/amd-20231230.htm";

getManagementDiscussionContent(url);
*/