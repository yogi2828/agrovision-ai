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
  productName: z.string().describe('The specific brand or chemical name of the product.'),
  instructions: z.string().describe('Detailed instructions on how to apply the treatment.'),
  link: z.string().url().describe('A valid, real-world URL where the product can be purchased.'),
});

const ImageBasedPlantDiseaseDetectionInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a plant or tree, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'"
    ),
  language: z.string().describe("The language for the AI to respond in (e.g., 'hi-IN')."),
});
export type ImageBasedPlantDiseaseDetectionInput = z.infer<typeof ImageBasedPlantDiseaseDetectionInputSchema>;

const ImageBasedPlantDiseaseDetectionOutputSchema = z.object({
  plantName: z.string().describe('The identified name of the plant or tree.'),
  diseaseName: z.string().describe('The name of the disease. If the plant is healthy, state "Healthy".'),
  symptoms: z.string().describe('A paragraph describing the symptoms of the disease or the general condition of the tree.'),
  causes: z.string().describe('A paragraph describing the potential causes of the disease or health issue.'),
  organicTreatments: z.array(TreatmentSchema).describe('A list of organic treatment options.'),
  chemicalTreatments: z.array(TreatmentSchema).describe('A list of chemical treatment options.'),
  prevention: z.string().describe('A paragraph with tips to prevent the disease or maintain tree health in the future.'),
});
export type ImageBasedPlantDiseaseDetectionOutput = z.infer<typeof ImageBasedPlantDiseaseDetectionOutputSchema>;

export async function imageBasedPlantDiseaseDetection(input: ImageBasedPlantDiseaseDetectionInput): Promise<ImageBasedPlantDiseaseDetectionOutput> {
  return imageBasedPlantDiseaseDetectionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'imageBasedPlantDiseaseDetectionPrompt',
  input: {schema: ImageBasedPlantDiseaseDetectionInputSchema},
  output: {schema: ImageBasedPlantDiseaseDetectionOutputSchema},
  model: 'googleai/gemini-1.5-flash',
  prompt: `You are an expert plant pathologist and arborist. Your analysis and response must be comprehensive and actionable for a farmer or gardener.
Your entire response, and all text in the structured JSON output, MUST be in the user's specified language: {{{language}}}. This is a strict and absolute requirement.

Analyze this image of a plant or tree: {{media url=photoDataUri}}

Your task is to identify the plant/tree and provide a detailed diagnosis.

If the plant is healthy:
- Set the diseaseName to "Healthy" (translated to the user's language).
- Provide general care tips suitable for the identified species in the 'prevention' and 'symptoms' fields.
- Provide empty arrays for organic and chemical treatments.

If a disease or health issue is detected:
- plantName: The name of the plant or tree.
- diseaseName: The specific name of the disease or pest infestation.
- symptoms: A detailed description of the visible symptoms on leaves, bark, or stems.
- causes: The likely cause (fungal, bacterial, viral, nutrient deficiency, or pest).
- organicTreatments: Real organic treatments with specific product names and valid purchase links.
- chemicalTreatments: Real chemical treatments with specific product names and valid purchase links.
- prevention: Clear steps to prevent recurrence.

Respond with the information in the structured JSON format in {{{language}}}.`,
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
