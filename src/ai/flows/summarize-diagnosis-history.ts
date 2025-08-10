'use server';

/**
 * @fileOverview Summarizes a user's diagnosis history to identify trends and recurring issues.
 *
 * - summarizeDiagnosisHistory - A function that summarizes the diagnosis history.
 * - SummarizeDiagnosisHistoryInput - The input type for the summarizeDiagnosisHistory function.
 * - SummarizeDiagnosisHistoryOutput - The return type for the summarizeDiagnosisHistory function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeDiagnosisHistoryInputSchema = z.object({
  diagnosisHistory: z
    .string()
    .describe('A JSON string containing the user diagnosis history, with each record including plant name, disease, and date.'),
});

export type SummarizeDiagnosisHistoryInput = z.infer<typeof SummarizeDiagnosisHistoryInputSchema>;

const SummarizeDiagnosisHistoryOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the diagnosis history, identifying trends, recurring issues, and offering high-level advice.'),
});

export type SummarizeDiagnosisHistoryOutput = z.infer<typeof SummarizeDiagnosisHistoryOutputSchema>;

export async function summarizeDiagnosisHistory(
  input: SummarizeDiagnosisHistoryInput
): Promise<SummarizeDiagnosisHistoryOutput> {
  return summarizeDiagnosisHistoryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeDiagnosisHistoryPrompt',
  input: {schema: SummarizeDiagnosisHistoryInputSchema},
  output: {schema: SummarizeDiagnosisHistoryOutputSchema},
  prompt: `You are an AI agronomist assistant. Your task is to analyze a user's plant diagnosis history and provide a helpful summary.

  Analyze the provided JSON data of the user's diagnosis history. Identify any recurring diseases, plants that are frequently having issues, or seasonal patterns. 
  
  Based on your analysis, write a concise summary that highlights these trends and offers practical, high-level advice to help the user improve their plant care skills and prevent future problems.

  Diagnosis History:
  {{diagnosisHistory}}`,
});

const summarizeDiagnosisHistoryFlow = ai.defineFlow(
  {
    name: 'summarizeDiagnosisHistoryFlow',
    inputSchema: SummarizeDiagnosisHistoryInputSchema,
    outputSchema: SummarizeDiagnosisHistoryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
