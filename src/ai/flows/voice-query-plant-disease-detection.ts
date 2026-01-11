'use server';
/**
 * @fileOverview A flow to handle voice queries for plant disease detection.
 *
 * - voiceQueryPlantDiseaseDetection - A function that handles the voice query for plant disease detection.
 * - VoiceQueryPlantDiseaseDetectionInput - The input type for the voiceQueryPlantDiseaseDetection function.
 * - VoiceQueryPlantDiseaseDetectionOutput - The return type for the voiceQueryPlantDiseaseDetection function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const VoiceQueryPlantDiseaseDetectionInputSchema = z.object({
  voiceQuery: z.string().describe('The voice query about the plant disease.'),
  language: z.string().describe('The language to respond in.'),
});
export type VoiceQueryPlantDiseaseDetectionInput = z.infer<typeof VoiceQueryPlantDiseaseDetectionInputSchema>;

const VoiceQueryPlantDiseaseDetectionOutputSchema = z.object({
  plantName: z.string().describe('The name of the plant.'),
  diseaseName: z.string().describe('The name of the disease.'),
  confidenceLevel: z.number().describe('The confidence level of the disease detection (0-1).'),
  symptoms: z.string().describe('The symptoms of the disease.'),
  causes: z.string().describe('The causes of the disease.'),
  treatment: z.string().describe('The treatment for the disease.'),
  preventionTips: z.string().describe('The prevention tips for the disease.'),
});
export type VoiceQueryPlantDiseaseDetectionOutput = z.infer<typeof VoiceQueryPlantDiseaseDetectionOutputSchema>;

export async function voiceQueryPlantDiseaseDetection(input: VoiceQueryPlantDiseaseDetectionInput): Promise<VoiceQueryPlantDiseaseDetectionOutput> {
  return voiceQueryPlantDiseaseDetectionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'voiceQueryPlantDiseaseDetectionPrompt',
  input: {schema: VoiceQueryPlantDiseaseDetectionInputSchema},
  output: {schema: VoiceQueryPlantDiseaseDetectionOutputSchema},
  prompt: `You are an expert in plant diseases. A user will provide a voice query in {{{language}}} about a plant disease. Respond in the same language.

Voice Query: {{{voiceQuery}}}

Analyze the query and extract the following information:

- Plant Name: The name of the plant the user is asking about.
- Disease Name: The name of the disease the plant is suffering from.
- Confidence Level: How confident you are in the disease detection (0-1).
- Symptoms: The symptoms of the disease.
- Causes: The causes of the disease.
- Treatment: The treatment for the disease.
- Prevention Tips: Tips to prevent the disease in the future.

Respond with the extracted information in a structured format.`,
});

const voiceQueryPlantDiseaseDetectionFlow = ai.defineFlow(
  {
    name: 'voiceQueryPlantDiseaseDetectionFlow',
    inputSchema: VoiceQueryPlantDiseaseDetectionInputSchema,
    outputSchema: VoiceQueryPlantDiseaseDetectionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
