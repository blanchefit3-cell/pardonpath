import { PDFDocument, PDFForm } from 'pdf-lib';
import { storagePut, storageGet } from './storage';
import { notifyOwner } from './_core/notification';

/**
 * PBC Form Field Mapping
 * Maps application data to official PBC Record Suspension Application Form fields
 */
export interface FormFieldMapping {
  // Applicant Information
  applicantFirstName: string;
  applicantLastName: string;
  applicantDateOfBirth: string; // YYYY-MM-DD
  applicantSIN: string;
  applicantGender: 'M' | 'F' | 'X';
  
  // Contact Information
  applicantEmail: string;
  applicantPhone: string;
  applicantAddress: string;
  applicantCity: string;
  applicantProvince: string;
  applicantPostalCode: string;
  
  // Offense Information
  offenseType: string;
  offenseDate: string; // YYYY-MM-DD
  sentenceLength: string;
  sentenceType: 'Custody' | 'Conditional Sentence' | 'Probation' | 'Fine' | 'Other';
  
  // Additional Information
  employmentStatus: 'Employed' | 'Self-Employed' | 'Unemployed' | 'Student' | 'Retired';
  employerName?: string;
  jobTitle?: string;
  
  // Character References
  reference1Name?: string;
  reference1Relationship?: string;
  reference1Phone?: string;
  
  reference2Name?: string;
  reference2Relationship?: string;
  reference2Phone?: string;
}

/**
 * Generate a PBC Record Suspension Application Form PDF
 * 
 * This function creates a pre-filled PDF based on the official PBC form template.
 * If no template is available, it generates a custom form using PDFKit.
 */
export async function generatePBCForm(
  data: FormFieldMapping,
  templateUrl?: string
): Promise<{ url: string; fileKey: string }> {
  try {
    let pdfBytes: Uint8Array;
    
    if (templateUrl) {
      // Use existing PBC template and fill fields
      pdfBytes = await fillPBCTemplate(data, templateUrl);
    } else {
      // Generate custom form if no template available
      pdfBytes = await generateCustomForm(data);
    }
    
    // Upload to S3
    const fileName = `pbc-form-${data.applicantSIN}-${Date.now()}.pdf`;
    const fileKey = `forms/${data.applicantSIN}/${fileName}`;
    
    const { url } = await storagePut(fileKey, pdfBytes, 'application/pdf');
    
    return { url, fileKey };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    await notifyOwner({
      title: 'PBC Form Generation Failed',
      content: `Error generating PBC form for applicant: ${errorMessage}`,
    });
    throw new Error(`Failed to generate PBC form: ${errorMessage}`);
  }
}

/**
 * Fill PBC template with application data
 */
async function fillPBCTemplate(
  data: FormFieldMapping,
  templateUrl: string
): Promise<Uint8Array> {
  try {
    // Fetch the template PDF from storage
    const templateResponse = await fetch(templateUrl);
    if (!templateResponse.ok) {
      throw new Error(`Failed to fetch template: ${templateResponse.statusText}`);
    }
    
    const templateBytes = await templateResponse.arrayBuffer();
    const pdfDoc = await PDFDocument.load(templateBytes);
    const form = pdfDoc.getForm();
    
    // Map data to form fields
    // Note: Field names depend on the actual PBC form structure
    // These are common field names used in PBC forms
    const fieldMappings: Record<string, string | undefined> = {
      'FirstName': data.applicantFirstName,
      'LastName': data.applicantLastName,
      'DateOfBirth': data.applicantDateOfBirth,
      'SIN': data.applicantSIN,
      'Gender': data.applicantGender,
      'Email': data.applicantEmail,
      'Phone': data.applicantPhone,
      'Address': data.applicantAddress,
      'City': data.applicantCity,
      'Province': data.applicantProvince,
      'PostalCode': data.applicantPostalCode,
      'OffenseType': data.offenseType,
      'OffenseDate': data.offenseDate,
      'SentenceLength': data.sentenceLength,
      'SentenceType': data.sentenceType,
      'EmploymentStatus': data.employmentStatus,
      'EmployerName': data.employerName,
      'JobTitle': data.jobTitle,
      'Reference1Name': data.reference1Name,
      'Reference1Relationship': data.reference1Relationship,
      'Reference1Phone': data.reference1Phone,
      'Reference2Name': data.reference2Name,
      'Reference2Relationship': data.reference2Relationship,
      'Reference2Phone': data.reference2Phone,
    };
    
    // Fill form fields
    for (const [fieldName, fieldValue] of Object.entries(fieldMappings)) {
      if (fieldValue) {
        try {
          const field = form.getField(fieldName);
          if (field && 'setText' in field) {
            (field as any).setText(fieldValue);
          }
        } catch (e) {
          // Field may not exist in this template, continue
          console.warn(`Field ${fieldName} not found in template`);
        }
      }
    }
    
    // Flatten form (make it read-only after filling)
    form.flatten();
    
    return await pdfDoc.save();
  } catch (error) {
    throw new Error(`Failed to fill PBC template: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Generate a custom PBC form if no template is available
 * This creates a basic form structure with the provided data
 */
async function generateCustomForm(data: FormFieldMapping): Promise<Uint8Array> {
  // For now, return a placeholder implementation
  // In production, this would use PDFKit or similar to generate a custom form
  // with proper formatting, headers, and field organization
  
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([612, 792]); // Letter size
  
  const { height } = page.getSize();
  let yPosition = height - 50;
  
  // Add title
  page.drawText('RECORD SUSPENSION APPLICATION FORM', {
    x: 50,
    y: yPosition,
    size: 16,
  });
  
  yPosition -= 40;
  
  // Add applicant information section
  page.drawText('APPLICANT INFORMATION', {
    x: 50,
    y: yPosition,
    size: 12,
  });
  
  yPosition -= 20;
  
  const lines = [
    `Name: ${data.applicantFirstName} ${data.applicantLastName}`,
    `Date of Birth: ${data.applicantDateOfBirth}`,
    `SIN: ${data.applicantSIN}`,
    `Gender: ${data.applicantGender}`,
    `Email: ${data.applicantEmail}`,
    `Phone: ${data.applicantPhone}`,
    `Address: ${data.applicantAddress}`,
    `City: ${data.applicantCity}, ${data.applicantProvince} ${data.applicantPostalCode}`,
  ];
  
  for (const line of lines) {
    page.drawText(line, {
      x: 50,
      y: yPosition,
      size: 10,
    });
    yPosition -= 15;
  }
  
  yPosition -= 20;
  
  // Add offense information section
  page.drawText('OFFENSE INFORMATION', {
    x: 50,
    y: yPosition,
    size: 12,
  });
  
  yPosition -= 20;
  
  const offenseLines = [
    `Offense Type: ${data.offenseType}`,
    `Offense Date: ${data.offenseDate}`,
    `Sentence Length: ${data.sentenceLength}`,
    `Sentence Type: ${data.sentenceType}`,
  ];
  
  for (const line of offenseLines) {
    page.drawText(line, {
      x: 50,
      y: yPosition,
      size: 10,
    });
    yPosition -= 15;
  }
  
  return await pdfDoc.save();
}

/**
 * Validate form data before generation
 */
export function validateFormData(data: Partial<FormFieldMapping>): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!data.applicantFirstName) errors.push('First name is required');
  if (!data.applicantLastName) errors.push('Last name is required');
  if (!data.applicantDateOfBirth) errors.push('Date of birth is required');
  if (!data.applicantSIN) errors.push('SIN is required');
  if (!data.applicantEmail) errors.push('Email is required');
  if (!data.applicantPhone) errors.push('Phone number is required');
  if (!data.applicantAddress) errors.push('Address is required');
  if (!data.applicantCity) errors.push('City is required');
  if (!data.applicantProvince) errors.push('Province is required');
  if (!data.applicantPostalCode) errors.push('Postal code is required');
  if (!data.offenseType) errors.push('Offense type is required');
  if (!data.offenseDate) errors.push('Offense date is required');
  if (!data.sentenceLength) errors.push('Sentence length is required');
  if (!data.sentenceType) errors.push('Sentence type is required');
  
  // Validate date formats
  if (data.applicantDateOfBirth && !isValidDate(data.applicantDateOfBirth)) {
    errors.push('Invalid date of birth format (use YYYY-MM-DD)');
  }
  if (data.offenseDate && !isValidDate(data.offenseDate)) {
    errors.push('Invalid offense date format (use YYYY-MM-DD)');
  }
  
  // Validate SIN format (9 digits)
  if (data.applicantSIN && !/^\d{9}$/.test(data.applicantSIN.replace(/\s/g, ''))) {
    errors.push('Invalid SIN format (must be 9 digits)');
  }
  
  // Validate email format
  if (data.applicantEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.applicantEmail)) {
    errors.push('Invalid email format');
  }
  
  // Validate postal code format (Canadian: A1A 1A1)
  if (data.applicantPostalCode && !/^[A-Z]\d[A-Z]\s?\d[A-Z]\d$/.test(data.applicantPostalCode.toUpperCase())) {
    errors.push('Invalid postal code format (use A1A 1A1)');
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Helper function to validate date format
 */
function isValidDate(dateString: string): boolean {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) return false;
  
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
}
