'use server';
/**
 * @fileOverview This file defines a Genkit flow for handling follow-up questions about plant diagnoses.
 *
 * It includes:
 * - followUpPlantQueries: The main function to process follow-up queries.
 * - FollowUpPlantQueriesInput: The input type for the function.
 * - FollowUpPlantQueriesOutput: The output type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FollowUpPlantQueriesInputSchema = z.object({
  diagnosisSummary: z.string().describe('The summary of the initial plant diagnosis. This may be empty if the user is asking a general question.'),
  followUpQuery: z.string().describe('The follow-up question about the diagnosis.'),
  language: z.string().optional().describe('The language for the answer (e.g., "en", "es").'),
});
export type FollowUpPlantQueriesInput = z.infer<typeof FollowUpPlantQueriesInputSchema>;

const FollowUpPlantQueriesOutputSchema = z.object({
  answer: z.string().describe('The answer to the follow-up question.'),
});
export type FollowUpPlantQueriesOutput = z.infer<typeof FollowUpPlantQueriesOutputSchema>;

export async function followUpPlantQueries(input: FollowUpPlantQueriesInput): Promise<FollowUpPlantQueriesOutput> {
  return followUpPlantQueriesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'followUpPlantQueriesPrompt',
  input: {schema: FollowUpPlantQueriesInputSchema},
  output: {schema: FollowUpPlantQueriesOutputSchema},
  prompt: `You are a helpful and knowledgeable AI assistant specializing in agriculture and botany. Your response MUST be entirely in the following language: {{language}}. If no language is specified, default to English (en).

  A user is asking a follow-up question.
  
  {{#if diagnosisSummary}}
  The context for the user's question is based on this previous diagnosis summary:
  "{{diagnosisSummary}}"
  {{else}}
  The user is asking a general question not related to a specific, recent diagnosis.
  {{/if}}

  The user's question is:
  "{{followUpQuery}}"

  Provide a concise, accurate, and easy-to-understand answer. If the question is related to a diagnosis, use that context. If it's a general question, answer it based on your broad horticultural knowledge. Remember to respond only in the specified language: {{language}}.`,
});

const followUpPlantQueriesFlow = ai.defineFlow(
  {
    name: 'followUpPlantQueriesFlow',
    inputSchema: FollowUpPlantQueriesInputSchema,
    outputSchema: FollowUpPlantQueriesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
