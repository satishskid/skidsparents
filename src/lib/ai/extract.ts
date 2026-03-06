/**
 * AI-powered document extraction using Workers AI vision model.
 * Reads photos/scans of medical reports and extracts structured data.
 */

export interface ExtractedRecord {
  recordType: string
  title: string
  providerName: string | null
  recordDate: string | null
  findings: { name: string; value?: string; unit?: string; status?: string }[]
  vaccinations: { vaccineName: string; dose: string; date?: string }[]
  summary: string
  confidence: number
}

const EXTRACTION_PROMPT = `You are a medical document reader for a pediatric health app used by Indian parents. Analyze this image of a medical document and extract structured information.

IMPORTANT RULES:
- Extract ONLY what you can clearly read from the document
- If a field is not visible or unclear, set it to null
- For dates, use ISO format (YYYY-MM-DD) if possible
- Be conservative — don't guess values you can't read
- This is for a child's health record, so focus on pediatric context

Extract the following as JSON:
{
  "recordType": one of ["doctor_visit", "lab_test", "vaccination", "prescription", "dental", "eye_checkup", "hearing_test", "growth_chart", "screening", "general"],
  "title": "brief descriptive title (e.g., 'Complete Blood Count - Apollo Hospital')",
  "providerName": "hospital/clinic/doctor name if visible",
  "recordDate": "date of report in YYYY-MM-DD format, or null",
  "findings": [{"name": "finding or test name", "value": "result value", "unit": "unit if applicable", "status": "normal/abnormal/borderline if indicated"}],
  "vaccinations": [{"vaccineName": "vaccine name", "dose": "dose number", "date": "YYYY-MM-DD if visible"}],
  "summary": "1-2 sentence parent-friendly summary of what this document shows",
  "confidence": 0.0 to 1.0 (how confident you are in the overall extraction)
}

Return ONLY valid JSON, no other text.`

export async function extractFromImage(
  ai: any,
  imageBytes: ArrayBuffer,
  parentHint?: string,
  childAgeMonths?: number
): Promise<ExtractedRecord> {
  const prompt = parentHint
    ? `${EXTRACTION_PROMPT}\n\nThe parent describes this document as: "${parentHint}"${childAgeMonths != null ? `\nChild's age: ${childAgeMonths} months` : ''}`
    : `${EXTRACTION_PROMPT}${childAgeMonths != null ? `\nChild's age: ${childAgeMonths} months` : ''}`

  try {
    const response = await ai.run('@cf/meta/llama-3.2-11b-vision-instruct', {
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      image: [...new Uint8Array(imageBytes)],
      max_tokens: 1024,
    })

    const text = response.response || ''

    // Try to parse JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0])
      return {
        recordType: parsed.recordType || 'general',
        title: parsed.title || parentHint || 'Uploaded Document',
        providerName: parsed.providerName || null,
        recordDate: parsed.recordDate || null,
        findings: Array.isArray(parsed.findings) ? parsed.findings : [],
        vaccinations: Array.isArray(parsed.vaccinations) ? parsed.vaccinations : [],
        summary: parsed.summary || 'Document uploaded successfully.',
        confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0.5,
      }
    }

    // Fallback if JSON parsing fails
    return {
      recordType: 'general',
      title: parentHint || 'Uploaded Document',
      providerName: null,
      recordDate: null,
      findings: [],
      vaccinations: [],
      summary: text.slice(0, 200) || 'Document uploaded. AI could not extract structured data.',
      confidence: 0.2,
    }
  } catch (err: any) {
    console.error('[Extract] AI error:', err)
    return {
      recordType: 'general',
      title: parentHint || 'Uploaded Document',
      providerName: null,
      recordDate: null,
      findings: [],
      vaccinations: [],
      summary: 'Document uploaded. AI extraction was not available.',
      confidence: 0,
    }
  }
}
