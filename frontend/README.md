My Project: SEC Document Processor

This application processes SEC documents (10-K, 10-Q) and provides a user interface to interact with the extracted data. It consists of a **backend** for data processing and a **frontend** for displaying the results.

---

## Setup and Run

### Backend
1. Navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the backend server:
   ```bash
   node server.js
   ```
4. The backend server will start on `http://localhost:4000`.

### Frontend
1. Navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the frontend development server:
   ```bash
   npm run dev
   ```
4. Open `http://localhost:3000` in your browser to interact with the application.

---

## Project Layout

### Backend

The backend folder contains logic for processing SEC documents, handling API routes, and utilities for data transformation.

- **`server.js`**  
  **Packages:** `express`, `cors`, `body-parser`  
  Starts the server, handles routing, and manages API endpoints.

- **`routes/api.js`**  
  **Packages:** `express`, `multer`  
  Defines the API routes for interacting with the frontend, e.g., sending processed data and analyzing SEC filings.  
  Key routes include:  
  - **`POST /analyze`**  
    - Handles analysis of uploaded files and selected SEC filings.  
    - **Carries:**  
      - `uploadedFiles`: Files uploaded by the user (PDFs).  
      - `selectedFilings`: Filings selected by the user for analysis.  
      - `companyData`: Metadata about the company being analyzed.  
    - **Functionality:**  
      - Processes 8-K, 10-K, and 10-Q filings.  
      - Extracts text from uploaded PDFs.  
      - Generates an AI prompt using `generatePrompt`.  
      - Calls OpenAI's GPT API using `gptCall` for document analysis.  

  - **`GET /filings`**  
    - Fetches the most recent filings for a given company.  
    - **Carries:**  
      - `CIK`: The company's Central Index Key.  
      - `formTypes`: A comma-separated list of form types to retrieve (e.g., `10-K,10-Q,8-K`).  
    - **Functionality:**  
      - Retrieves CIK submissions using `getCIKSubmissions`.  
      - Filters filings by form type using `getMostRecentFilings`.  
      - Responds with detailed company information and a list of filings.  

- **`utils/`**  
  A collection of utility modules for document processing and API calls:
  - **`gptCall.js`**: Handles communication with OpenAI's API (does not use Axios).  
    **Packages:** `openai`  
  - **`pdfProcessor.js`**: Extracts and processes data from PDF documents.  
    **Packages:** `pdfjs-dist`  
  - **`process8k.js`**: Processes 8-K forms, extracting relevant information.  
  - **`process10kq.js`**: Processes 10-K and 10-Q forms for key financial data.  
  - **`prompt.js`**: Constructs prompts for AI-based data extraction.  
  - **`secRetrieval.js`**: Retrieves SEC documents using the Edgar API.  
    **Packages:** `node-fetch`, `cheerio`, `xmldom`

- **`data/`**  
  Contains sample SEC documents and `CIK_data.json`, a mapping of CIKs to company names and ticker symbols.

- **`package.json**  
  Lists backend dependencies and scripts.


### Frontend

The frontend folder contains the code for the user interface, built with Next.js and styled using Tailwind CSS.

- **`app/`**  
  Implements the frontend application layout and primary components:
  - **`components/`**: Reusable React components for the UI:
    - **`analysisDisplay.tsx`**: Dynamically displays the AI-analyzed results and document summaries.  
      **Carries:** AI analysis results from the backend.  
      **Functionality:** Renders the output from AI analysis in a readable and structured format.  
    - **`analyzeDocuments.tsx`**: Provides the functionality to trigger document analysis.  
      **Carries:** Button or input to initiate analysis.  
      **Functionality:** Sends requests to the backend to analyze selected filings and uploaded files.  
    - **`companyDetails.tsx`**: Displays metadata and details about a selected company.  
      **Carries:** `CompanyData` from the backend.  
      **Functionality:** Shows company-specific information such as name, industry, and fiscal data.  
    - **`companySearch.tsx`**: Enables searching for companies using their CIK or name.  
      **Carries:** Search input from the user.  
      **Functionality:** Fetches and displays companies matching the search query.  
    - **`financialDocumentSelection.tsx`**: Allows users to select SEC filings for analysis.  
      **Carries:** List of available filings and user-selected documents.  
      **Functionality:** Displays available filings and lets users choose which to analyze.  
    - **`uploadDocument.tsx`**: Handles uploading of PDF documents for custom analysis.  
      **Carries:** Uploaded files from the user.  
      **Functionality:** Validates, lists, and manages uploaded PDF files for AI processing.  

  - **`globals.css`**: Global styles for the application.  
    - Provides styling for the entire app, including light and dark mode support.

  - **`layout.tsx`**: Defines the overall structure and navigation of the application.  
    - Contains the header, footer, and general layout for all pages.

  - **`page.tsx`**: The main landing page of the application.  
    - Coordinates all components, including search, upload, and analysis features.

- **`public/`**  
  Static assets such as images, fonts, and icons.

- **`next.config.ts`**  
  Next.js configuration file. Configures application behavior such as API routes and build settings.

- **`tailwind.config.ts`**  
  Tailwind CSS configuration file. Contains theme customizations and plugins for styling.

- **`package.json`**  
  Lists frontend dependencies and scripts.



---

## Dependencies

### Backend
```
├── @types/express@5.0.0
├── @types/node@22.10.5
├── @types/xmldom@0.1.34
├── cheerio@1.0.0
├── cors@2.8.5
├── dotenv@16.4.7
├── express@4.21.2
├── multer@1.4.5-lts.1
├── node-fetch@3.3.2
├── openai@4.77.3
├── pdfjs-dist@4.10.38
├── typescript@5.7.2
└── xmldom@0.6.0
```

### Frontend
```
├── @types/node@22.10.5
├── @types/react@19.0.2
├── autoprefixer@10.4.20
├── eslint-config-next@15.1.3
├── eslint@9.17.0
├── next@15.1.3
├── postcss@8.4.49
├── react-dom@19.0.0
├── react@19.0.0
├── tailwindcss@3.4.17
└── typescript@5.7.2
```

---

## Key Features

1. **Document Processing**:  
   - Backend processes 10-K, 10-Q, and other SEC filings.
   - Extracts key financial and textual data.

2. **Interactive UI**:  
   - Frontend displays processed data in an easy-to-navigate interface.
   - Users can filter and explore extracted information.

3. **AI Integration**:  
   - Uses GPT models to analyze and summarize documents.

---

## Learn More

- [Node.js Documentation](https://nodejs.org/en/docs/)  
- [Next.js Documentation](https://nextjs.org/docs)  
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

---

Feel free to reach out with any feedback or contributions!
