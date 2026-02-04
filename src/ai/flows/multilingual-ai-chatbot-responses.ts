
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
  language: z.string().describe("The language for the AI to respond in (e.g., 'hi-IN')."),
});
export type MultilingualAIChatbotResponsesInput = z.infer<typeof MultilingualAIChatbotResponsesInputSchema>;

const MultilingualAIChatbotResponsesOutputSchema = z.object({
  aiResponse: z.string().describe('The AI response in the selected language. Use markdown for formatting.'),
});
export type MultilingualAIChatbotResponsesOutput = z.infer<typeof MultilingualAIChatbotResponsesOutputSchema>;

export async function multilingualAIChatbotResponses(input: MultilingualAIChatbotResponsesInput): Promise<MultilingualAIChatbotResponsesOutput> {
  return multilingualAIChatbotResponsesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'multilingualAIChatbotResponsesPrompt',
  input: {schema: MultilingualAIChatbotResponsesInputSchema},
  output: {schema: MultilingualAIChatbotResponsesOutputSchema},
  model: 'googleai/gemini-1.5-flash',
  prompt: `You are AgroVision AI, an expert agriculture assistant.
  Your entire response, and all text in the structured JSON output, MUST be in the following language: {{{language}}}. This is a strict and absolute requirement. Do not use English unless the specified language is English.
  Format your response using markdown for clarity (e.g., lists, bold text).
  Keep your answers simple, clear, and easy for a farmer to understand.

  User message: "{{{userMessage}}}"`,
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
