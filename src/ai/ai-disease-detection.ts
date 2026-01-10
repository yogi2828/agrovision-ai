
// src/ai/ai-disease-detection.ts
'use server';
/**
 * @fileOverview A plant disease detection AI agent.
 *
 * - detectDisease - A function that handles the plant disease detection process.
 * - DetectDiseaseInput - The input type for the detectDisease function.
 * - DetectDiseaseOutput - The return type for the detectDisease function.
 */

import {ai, googleAI} from '@/ai/genkit';
import {z} from 'genkit';

const DetectDiseaseInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a plant, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type DetectDiseaseInput = z.infer<typeof DetectDiseaseInputSchema>;

const DetectDiseaseOutputSchema = z.object({
  plantName: z.string().describe('The name of the plant.'),
  diseaseName: z.string().describe('The name of the disease detected.'),
  confidenceLevel: z.number().describe('The confidence level of the disease detection (0-1).'),
  symptoms: z.string().describe('The symptoms of the disease.'),
  causes: z.string().describe('The causes of the disease.'),
  treatment: z.object({
    organic: z.string().describe('Organic treatment options for the disease.'),
    chemical: z.string().describe('Chemical treatment options for the disease.'),
  }).describe('Treatment options for the detected disease.'),
});
export type DetectDiseaseOutput = z.infer<typeof DetectDiseaseOutputSchema>;

export async function detectDisease(input: DetectDiseaseInput): Promise<DetectDiseaseOutput> {
  return detectDiseaseFlow(input);
}

const prompt = ai.definePrompt({
  name: 'detectDiseasePrompt',
  input: {schema: DetectDiseaseInputSchema},
  output: {schema: DetectDiseaseOutputSchema},
  model: googleAI.model('gemini-pro-vision'),
  prompt: `You are an expert in plant pathology. Analyze the provided image and identify any diseases present.

  Provide the plant name, disease name, confidence level (0-1), symptoms, causes, and both organic and chemical treatment options.

  Image: {{media url=photoDataUri}}`,
});

const detectDiseaseFlow = ai.defineFlow(
  {
    name: 'detectDiseaseFlow',
    inputSchema: DetectDiseaseInputSchema,
    outputSchema: DetectDiseaseOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
