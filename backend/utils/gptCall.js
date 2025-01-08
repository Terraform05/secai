import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config();

// Initialize OpenAI client
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // API key is loaded from environment variables
});

export async function gptCall(prompt) {
  try {
    // Validate prompt
    if (!prompt || typeof prompt !== "string") {
      throw new Error("Invalid prompt: Must be a non-empty string.");
    }

    // Define the model configuration
    const params = {
      model: process.env.OPENAI_MODEL || "gpt-4o-mini", // Default to 'gpt-4o-mini'
      messages: [
        {
          role: "system",
          content:
            "You are an assistant specialized in financial analyst, evaluating corporate financial filings and providing detailed insights on bear and bull signals for both stock equity and credit.",
        },
        { role: "user", content: prompt },
      ],
      max_tokens: 1000, // Adjust as needed
      temperature: 0.7,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    };

    // Send request to OpenAI API
    const chatCompletion = await client.chat.completions.create(params);

    // Return the model's response
    return chatCompletion.choices[0].message.content.trim();
  } catch (error) {
    if (error instanceof OpenAI.APIError) {
      console.error("API Error:", {
        status: error.status,
        message: error.message,
        code: error.code,
        type: error.type,
      });
      throw new Error(`GPT API error: ${error.message}`);
    } else {
      console.error("Unexpected Error:", error);
      throw new Error("An unexpected error occurred. Please try again.");
    }
  }
}
