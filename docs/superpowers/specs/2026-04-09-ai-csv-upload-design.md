# AI-Powered CSV Upload Design

## Overview
The goal is to replace the rigid, hardcoded CSV column-mapping logic in `ManageAward.tsx` with an intelligent, AI-powered processor using Google's Gemini AI. Instead of rejecting a CSV file for mismatched headers or missing optional fields, the AI will parse the raw rows, intelligently map columns to our schema, and even generate/enhance nominee descriptions.

## Architecture & Data Flow
1. **PapaParse (Local Parsing):** The user uploads a CSV file. PapaParse converts the CSV text into an array of generic JSON objects (raw rows).
2. **Batching:** To avoid token limits and API timeouts, the array of raw rows is divided into batches of 20-25 rows each.
3. **AI Processing (Gemini):**
   - Each batch is stringified and sent to the `GoogleGenAI` instance with a specific prompt.
   - The prompt instructs the AI to map the raw fields (like `First Name`, `Webiste Link`, `Person Linkedin`) to our standardized schema (`name`, `email`, `categoryName`, `title`, `company`, `website`, `linkedinUrl`, `logoUrl`, `description`, `aiSummary`).
   - If `description` is missing or very short, the AI will generate a suitable `aiSummary` based on the available information (title, company, category).
4. **Validation & Fallbacks:** The AI returns a structured JSON array. The application safely parses this JSON and filters out any nominees missing absolute requirements (`name`, `email`, `categoryName`). It also validates that the `categoryName` exists in the current award's categories.
5. **Firestore Insertion:** The sanitized, AI-enhanced nominees are added to the `nominees` collection in Firebase, and the local React state is updated to reflect the new additions immediately.

## Components Modified
- `src/pages/ManageAward.tsx`
  - Update `handleFileUpload` to implement the chunking logic.
  - Integrate `@google/genai` inside `handleFileUpload` to call `gemini-2.5-flash` for each chunk.
  - Update the UI to show an "AI is processing..." loading state with a progress indicator (e.g., "Processing batch 1 of 5...").

## Edge Cases Handled
- **Malformed JSON from AI:** Wrapped in a robust `try/catch` with fallback parsing.
- **Missing Categories:** If the AI maps a category incorrectly or the category doesn't exist, the nominee is flagged as an error and skipped, preventing corrupted data.
- **Empty Rows:** Filtered out locally before being sent to the AI.

## Testing
- Upload a poorly formatted CSV with typos in headers (e.g., `Tittle`, `Profile Pic`).
- Ensure the AI successfully extracts the 100 rows in batches without dropping any valid rows.
- Verify that AI summaries are generated for nominees lacking a description.