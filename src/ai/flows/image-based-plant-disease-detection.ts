
'use server';
/**
 * @fileOverview A flow to handle image-based plant disease detection.
 *
 * - imageBasedPlantDiseaseDetection - A function that handles the image for plant disease detection.
 * - ImageBasedPlantDiseaseDetectionInput - The input type for the imageBasedPlantDiseaseDetection function.
 * - ImageBasedPlantDiseaseDetectionOutput - The return type for the imageBasedPlantDiseaseDetection function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ImageBasedPlantDiseaseDetectionInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a plant, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ).optional(),
  question: z.string().describe("The user's voice question about the plant.").optional(),
  language: z.string().describe("The language for the AI to respond in (e.g., 'hi-IN')."),
});
export type ImageBasedPlantDiseaseDetectionInput = z.infer<typeof ImageBasedPlantDiseaseDetectionInputSchema>;

const ImageBasedPlantDiseaseDetectionOutputSchema = z.object({
  plantName: z.string().describe('The name of the plant.'),
  diseaseName: z.string().describe('The name of the disease. If the plant is healthy, state "Healthy".'),
  symptoms: z.string().describe('A paragraph describing the symptoms of the disease.'),
  causes: z.string().describe('A paragraph describing the potential causes of the disease.'),
  treatment: z.string().describe('A detailed paragraph explaining treatment options.'),
  prevention: z.string().describe('A paragraph with tips to prevent the disease in the future.'),
});
export type ImageBasedPlantDiseaseDetectionOutput = z.infer<typeof ImageBasedPlantDiseaseDetectionOutputSchema>;

export async function imageBasedPlantDiseaseDetection(input: ImageBasedPlantDiseaseDetectionInput): Promise<ImageBasedPlantDiseaseDetectionOutput> {
  return imageBasedPlantDiseaseDetectionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'imageBasedPlantDiseaseDetectionPrompt',
  input: {schema: ImageBasedPlantDiseaseDetectionInputSchema},
  output: {schema: ImageBasedPlantDiseaseDetectionOutputSchema},
  model: 'googleai/gemini-2.5-flash',
  prompt: `You are an expert plant pathologist. Analyze the plant disease from the provided information.
Your entire response, and all text in the structured JSON output, MUST be in the user's specified language: {{{language}}}. Do not use any other language.

{{#if photoDataUri}}
Image: {{media url=photoDataUri}}
{{/if}}
{{#if question}}
Question: "{{{question}}}"
{{/if}}

Your task is to analyze the image and/or question and provide a comprehensive diagnosis.
If the plant is healthy, set the diseaseName to "Healthy" (translated to the user's language) and provide general care tips in the other fields.

If a disease is detected, provide the following information:
- Plant Name: The name of the plant in the image.
- Disease Name: The specific name of the disease.
- Symptoms: A paragraph detailing the visible symptoms.
- Causes: A paragraph explaining the likely causes.
- Treatment: A detailed paragraph explaining treatment options.
- Prevention: A paragraph with actionable tips to prevent this disease in the future.

Respond with the extracted information in the structured JSON format. Ensure all text in your response is in {{{language}}}.`,
});

const imageBasedPlantDiseaseDetectionFlow = ai.defineFlow(
  {
    name: 'imageBasedPlantDiseaseDetectionFlow',
    inputSchema: ImageBasedPlantDiseaseDetectionInputSchema,
    outputSchema: ImageBasedPlantDiseaseDetectionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
