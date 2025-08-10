
'use server';
/**
 * @fileOverview A plant health diagnosis AI agent.
 *
 * - diagnosePlantHealth - A function that handles the plant health diagnosis process.
 * - DiagnosePlantHealthInput - The input type for the diagnosePlantHealth function.
 * - DiagnosePlantHealthOutput - The return type for the diagnosePlantHealth function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DiagnosePlantHealthInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a plant, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  language: z.string().optional().describe('The language for the diagnosis output (e.g., "en", "es").'),
});
export type DiagnosePlantHealthInput = z.infer<typeof DiagnosePlantHealthInputSchema>;

const TreatmentSuggestionSchema = z.object({
    name: z.string().describe("The name of the treatment."),
    description: z.string().describe("A brief, point-wise description of how to apply the treatment."),
    productUrl: z.string().describe("A search URL on a major e-commerce website (like amazon.com) for a product that can be used for this treatment. Example: 'https://www.amazon.com/s?k=neem+oil'"),
});

const DiagnosePlantHealthOutputSchema = z.object({
  plantIdentification: z.object({
    commonName: z.string().describe("The common name of the identified plant."),
    latinName: z.string().describe("The Latin name of the identified plant."),
    isPlant: z.boolean().describe("Whether the image contains a plant or not."),
  }).describe("The identification of the plant in the image."),
  diseaseName: z.string().describe('The name of the disease, if any. "Healthy" if no disease is detected.'),
  stage: z.string().describe('The stage of the disease, if applicable (e.g., "early", "advanced").'),
  symptoms: z.string().describe('A detailed, point-wise summary of the symptoms observed on the plant.'),
  causes: z.string().describe('The potential causes of the disease or issue, formatted in bullet points.'),
  treatmentSuggestions: z.object({
    organic: z.array(TreatmentSuggestionSchema).describe('A list of 4-5 organic treatment suggestions.'),
    chemical: z.array(TreatmentSuggestionSchema).describe('A list of 4-5 chemical treatment suggestions.'),
  }).describe('Treatment suggestions for the diagnosed issue.'),
  recoveryEstimateDays: z.number().describe('Estimated recovery time in days.'),
  careRecommendations: z.object({
      watering: z.string().describe("Recommendation for watering frequency and amount."),
      sunlight: z.string().describe("Recommendation for sunlight exposure."),
      fertilizer: z.string().describe("Recommendation for fertilizer usage."),
  }).describe("General plant care recommendations."),
  budgetEstimate: z.string().describe("A general budget estimate for the treatments (e.g., 'Low (under $15)', 'Moderate ($15-$30)', 'High (over $30)') with a brief explanation."),
  summary: z.string().describe("A concise one-paragraph summary of the entire diagnosis and key actions."),
  feedbackRating: z.number().optional().describe("The user's feedback rating for the diagnosis (1-5 stars)."),
  feedbackSubmittedAt: z.string().optional().describe("The timestamp when the feedback was submitted."),
});
export type DiagnosePlantHealthOutput = z.infer<typeof DiagnosePlantHealthOutputSchema>;

export async function diagnosePlantHealth(input: DiagnosePlantHealthInput): Promise<DiagnosePlantHealthOutput> {
  return diagnosePlantHealthFlow(input);
}

const prompt = ai.definePrompt({
  name: 'diagnosePlantHealthPrompt',
  input: {schema: DiagnosePlantHealthInputSchema},
  output: {schema: DiagnosePlantHealthOutputSchema},
  prompt: `You are an expert agronomist and plant pathologist with decades of field experience. Your task is to provide a professional, accurate, and helpful plant health diagnosis based on a user-provided image. Your response MUST be entirely in the following language: {{language}}. If no language is specified, default to English (en).

  Follow this process precisely:

  1.  **Image Analysis:**
      *   Carefully examine the provided image.
      *   Identify the plant species. Provide its common and scientific (Latin) names.
      *   If the image does not clearly show a plant, set 'isPlant' to false and explain that a plant could not be identified. Do not attempt to diagnose a non-plant image.

  2.  **Health Assessment:**
      *   If a plant is identified, determine its health status.
      *   If the plant is healthy, set 'diseaseName' to "Healthy" and provide robust care recommendations to maintain its condition. The rest of the disease-specific fields can be brief and confirm its healthy state.
      *   If a disease, pest, or nutrient deficiency is detected, identify it by its common name.

  3.  **Detailed Diagnosis (for unhealthy plants):**
      *   **Disease Stage:** Describe the stage of the affliction (e.g., "Early," "Advanced," "Initial Infestation").
      *   **Symptoms:** Detail the specific symptoms visible in the photo and commonly associated with the diagnosis in a point-wise list. Use markdown for bullet points.
      *   **Causes:** Explain the likely causes in a point-wise list. Use markdown for bullet points.
      *   **Treatment Plan:** Provide distinct lists of 4-5 organic and chemical treatment options. For each treatment, include a name, a step-by-step description, and a real productUrl which MUST be a search query URL on a major e-commerce site like Amazon (e.g., 'https://www.amazon.com/s?k=organic+neem+oil+for+plants').
      *   **Prognosis:**
          *   Estimate the recovery time in days. This MUST be between 7 and 14 days.
          *   Provide a general budget estimate. The estimate MUST be one of 'Low (under $15)', 'Moderate ($15-$30)', or 'High (over $30)' and include a brief justification.
      *   **Preventative Care Recommendations:** Provide tailored advice for watering, sunlight, and fertilizer to help the plant recover and prevent future issues.

  4.  **Summary:**
      *   Conclude with a concise, one-paragraph summary of the entire diagnosis, reiterating the plant name, the primary issue, and the most critical actions the user should take.

  The entire response, including all fields in the output schema, must be in the specified language: {{language}}.

  Image: {{media url=photoDataUri}}
`,
});

const diagnosePlantHealthFlow = ai.defineFlow(
  {
    name: 'diagnosePlantHealthFlow',
    inputSchema: DiagnosePlantHealthInputSchema,
    outputSchema: DiagnosePlantHealthOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
