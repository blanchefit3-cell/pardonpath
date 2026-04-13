import { invokeLLM } from "./_core/llm";
import { getDocumentDownloadUrl, updateDocumentAIReview } from "./documents";

/**
 * AI-assisted document completeness review using Claude vision
 * Checks for missing signatures, dates, and required pages
 */
export interface DocumentReviewResult {
  isComplete: boolean;
  confidence: number; // 0-1
  missingElements: string[];
  missingSignatures: string[];
  missingDates: string[];
  missingPages: string[];
  notes: string;
  recommendations: string[];
}

/**
 * Review a document for completeness using Claude vision
 */
export async function reviewDocumentCompleteness(
  documentId: number,
  documentType: string
): Promise<DocumentReviewResult> {
  // Get the document download URL
  const downloadUrl = await getDocumentDownloadUrl(documentId);
  if (!downloadUrl) {
    throw new Error(`Document ${documentId} not found or cannot be accessed`);
  }

  // Define what to look for based on document type
  const reviewPrompt = getReviewPromptForDocumentType(documentType);

  // Call Claude with vision to analyze the document
  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: `You are a legal document reviewer specializing in Canadian criminal record suspension applications. 
        Your task is to review documents for completeness and compliance with Parole Board of Canada requirements.
        Be thorough but conservative - flag any uncertainty.`,
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: reviewPrompt,
          },
          {
            type: "file_url",
            file_url: {
              url: downloadUrl,
            },
          },
        ],
      },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "document_review",
        strict: true,
        schema: {
          type: "object",
          properties: {
            isComplete: {
              type: "boolean",
              description: "Whether the document appears complete and compliant",
            },
            confidence: {
              type: "number",
              description: "Confidence level (0-1) in the completeness assessment",
            },
            missingElements: {
              type: "array",
              items: { type: "string" },
              description: "List of missing or unclear elements",
            },
            missingSignatures: {
              type: "array",
              items: { type: "string" },
              description: "Locations where signatures are missing",
            },
            missingDates: {
              type: "array",
              items: { type: "string" },
              description: "Locations where dates are missing",
            },
            missingPages: {
              type: "array",
              items: { type: "string" },
              description: "Pages that appear to be missing",
            },
            notes: {
              type: "string",
              description: "Detailed notes about the document quality and compliance",
            },
            recommendations: {
              type: "array",
              items: { type: "string" },
              description: "Recommendations for the applicant",
            },
          },
          required: [
            "isComplete",
            "confidence",
            "missingElements",
            "missingSignatures",
            "missingDates",
            "missingPages",
            "notes",
            "recommendations",
          ],
          additionalProperties: false,
        },
      },
    },
  });

  // Parse the response
  const content = response.choices[0]?.message.content;
  if (!content || typeof content !== "string") {
    throw new Error("No response from Claude");
  }

  const result = JSON.parse(content) as DocumentReviewResult;

  // Update the document with AI review status
  const status = result.isComplete && result.confidence > 0.8 ? "approved" : result.confidence > 0.5 ? "flagged" : "flagged";
  await updateDocumentAIReview(documentId, status, result.notes);

  return result;
}

/**
 * Get the review prompt based on document type
 */
function getReviewPromptForDocumentType(documentType: string): string {
  const prompts: Record<string, string> = {
    court_record: `Please review this court record for completeness according to Parole Board of Canada requirements:
1. Check that all pages are present (should be a complete court document)
2. Verify that the document is signed and dated by the court
3. Confirm the offense type, date, and sentence are clearly visible
4. Check for any missing or illegible information
5. Verify the document is an official court record (not a copy or summary)

Report any missing signatures, dates, page numbers, or unclear information.`,

    police_certificate: `Please review this police certificate for completeness:
1. Verify the certificate is from the Royal Canadian Mounted Police (RCMP) or provincial police
2. Check that it is signed and dated
3. Confirm the applicant's name, date of birth, and identification number are present
4. Verify the list of convictions is complete and accurate
5. Check for the official seal or stamp
6. Confirm the certificate is current (issued within the last 6 months if possible)

Report any missing signatures, seals, dates, or unclear information.`,

    id_document: `Please review this identification document for completeness:
1. Verify it is a valid government-issued ID (driver's license, passport, etc.)
2. Check that the document is not expired
3. Confirm the applicant's name, date of birth, and photo are present
4. Verify the document number/ID is clearly visible
5. Check that the document is not damaged or illegible

Report any missing information or concerns about validity.`,

    other: `Please review this document for completeness and relevance to a criminal record suspension application:
1. Assess whether the document is relevant to the application
2. Check for any missing signatures, dates, or critical information
3. Verify the document is legible and complete
4. Identify any potential issues or concerns

Report your findings.`,
  };

  return prompts[documentType] || prompts.other;
}

/**
 * Batch review multiple documents
 */
export async function reviewDocumentsBatch(
  documentIds: number[],
  documentTypes: string[]
): Promise<Map<number, DocumentReviewResult>> {
  const results = new Map<number, DocumentReviewResult>();

  for (let i = 0; i < documentIds.length; i++) {
    try {
      const result = await reviewDocumentCompleteness(documentIds[i], documentTypes[i]);
      results.set(documentIds[i], result);
    } catch (error) {
      console.error(`Failed to review document ${documentIds[i]}:`, error);
      // Continue with next document
    }
  }

  return results;
}
