'use server';
/**
 * @fileOverview A multilingual AI chatbot that responds in the user's selected language.
 *
 * - multilingualAIChatbotResponses - A function that handles the chatbot conversation and returns a response in the selected language.
 * - MultilingualAIChatbotResponsesInput - The input type for the multilingualAIChatbotResponses function.
 * - MultilingualAIChatbotResponsesOutput - The return type for the multilingualAIChatbotResponses function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MultilingualAIChatbotResponsesInputSchema = z.object({
  userMessage: z.string().describe('The message from the user.'),
  language: z.string().describe('The language selected by the user.'),
});
export type MultilingualAIChatbotResponsesInput = z.infer<typeof MultilingualAIChatbotResponsesInputSchema>;

const MultilingualAIChatbotResponsesOutputSchema = z.object({
  aiResponse: z.string().describe('The AI response in the selected language.'),
});
export type MultilingualAIChatbotResponsesOutput = z.infer<typeof MultilingualAIChatbotResponsesOutputSchema>;

export async function multilingualAIChatbotResponses(input: MultilingualAIChatbotResponsesInput): Promise<MultilingualAIChatbotResponsesOutput> {
  return multilingualAIChatbotResponsesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'multilingualAIChatbotResponsesPrompt',
  input: {schema: MultilingualAIChatbotResponsesInputSchema},
  output: {schema: MultilingualAIChatbotResponsesOutputSchema},
  prompt: `You are a multilingual AI chatbot that specializes in agriculture and plant care. Your response MUST be in the user's selected language.

User message: {{{userMessage}}}

Respond in: {{{language}}}`,
});

const multilingualAIChatbotResponsesFlow = ai.defineFlow(
  {
    name: 'multilingualAIChatbotResponsesFlow',
    inputSchema: MultilingualAIChatbotResponsesInputSchema,
    outputSchema: MultilingualAIChatbotResponsesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
