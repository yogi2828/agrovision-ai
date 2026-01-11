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

const TreatmentSchema = z.object({
  name: z.string().describe('The name of the treatment or product.'),
  description: z.string().describe('A brief description of how to use the treatment.'),
  link: z.string().url().describe('An example link to a product page for purchase.'),
});

const ImageBasedPlantDiseaseDetectionInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a plant, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  language: z.string().describe('The language for the AI to respond in.'),
});
export type ImageBasedPlantDiseaseDetectionInput = z.infer<typeof ImageBasedPlantDiseaseDetectionInputSchema>;

const ImageBasedPlantDiseaseDetectionOutputSchema = z.object({
  plantName: z.string().describe('The name of the plant.'),
  diseaseName: z.string().describe('The name of the disease. If the plant is healthy, state "Healthy".'),
  confidenceLevel: z.number().describe('The confidence level of the disease detection (0-1).'),
  symptoms: z.string().describe('A paragraph describing the symptoms of the disease.'),
  causes: z.string().describe('A paragraph describing the potential causes of the disease.'),
  organicTreatments: z.array(TreatmentSchema).describe('A list of organic treatment options.'),
  chemicalTreatments: z.array(TreatmentSchema).describe('A list of chemical treatment options.'),
  preventionTips: z.string().describe('A paragraph with tips to prevent the disease in the future.'),
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
  prompt: `You are an expert in plant diseases. A user will provide an image of a plant. Your response, and all text in the structured JSON output, MUST be in the user's specified language: {{{language}}}.

Image: {{media url=photoDataUri}}

Your task is to analyze the image and provide a comprehensive diagnosis. If the plant is healthy, set the diseaseName to "Healthy" (translated to the user's language) and provide general care tips in the other fields.

If a disease is detected, provide the following information:
- Plant Name: The name of the plant in the image.
- Disease Name: The specific name of the disease.
- Confidence Level: How confident you are in the diagnosis (from 0 to 1).
- Symptoms: A paragraph detailing the visible symptoms.
- Causes: A paragraph explaining the likely causes.
- Organic Treatments: Provide at least two distinct organic treatment options. For each, include its name, a brief description of its application, and a valid, placeholder URL for a product link (e.g., https://example.com/shop/product-name).
- Chemical Treatments: Provide at least two distinct chemical treatment options. For each, include its name, a brief description of its application, and a valid, placeholder URL for a product link (e.g., https://example.com/shop/product-name).
- Prevention Tips: A paragraph with actionable tips to prevent this disease in the future.

Respond with the extracted information in the structured JSON format. Ensure all text is in {{{language}}}.`,
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
