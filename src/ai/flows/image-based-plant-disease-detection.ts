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
    ),
  language: z.string().describe('The language to respond in.'),
});
export type ImageBasedPlantDiseaseDetectionInput = z.infer<typeof ImageBasedPlantDiseaseDetectionInputSchema>;

const ImageBasedPlantDiseaseDetectionOutputSchema = z.object({
  plantName: z.string().describe('The name of the plant.'),
  diseaseName: z.string().describe('The name of the disease.'),
  confidenceLevel: z.number().describe('The confidence level of the disease detection (0-1).'),
  symptoms: z.string().describe('The symptoms of the disease.'),
  causes: z.string().describe('The causes of the disease.'),
  treatment: z.string().describe('The treatment for the disease.'),
  preventionTips: z.string().describe('The prevention tips for the disease.'),
});
export type ImageBasedPlantDiseaseDetectionOutput = z.infer<typeof ImageBasedPlantDiseaseDetectionOutputSchema>;

export async function imageBasedPlantDiseaseDetection(input: ImageBasedPlantDiseaseDetectionInput): Promise<ImageBasedPlantDiseaseDetectionOutput> {
  return imageBasedPlantDiseaseDetectionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'imageBasedPlantDiseaseDetectionPrompt',
  input: {schema: ImageBasedPlantDiseaseDetectionInputSchema},
  output: {schema: ImageBasedPlantDiseaseDetectionOutputSchema},
  prompt: `You are an expert in plant diseases. A user will provide an image of a plant. Analyze the image and respond in {{{language}}}.

Image: {{media url=photoDataUri}}

Analyze the image and extract the following information:

- Plant Name: The name of the plant in the image.
- Disease Name: The name of the disease the plant is suffering from. If the plant is healthy, state that.
- Confidence Level: How confident you are in the disease detection (0-1).
- Symptoms: The symptoms of the disease.
- Causes: The causes of the disease.
- Treatment: The treatment for the disease.
- Prevention Tips: Tips to prevent the disease in the future.

Respond with the extracted information in a structured format.`,
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
