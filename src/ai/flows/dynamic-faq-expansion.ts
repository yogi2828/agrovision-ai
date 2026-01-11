'use server';

/**
 * @fileOverview An AI agent that dynamically expands on predefined questions in the chatbot.
 *
 * - expandFAQ - A function that handles the expansion of predefined questions.
 * - ExpandFAQInput - The input type for the expandFAQ function.
 * - ExpandFAQOutput - The return type for the expandFAQ function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExpandFAQInputSchema = z.object({
  question: z.string().describe('The predefined question selected by the user.'),
  language: z.string().describe("The language for the AI to respond in."),
});
export type ExpandFAQInput = z.infer<typeof ExpandFAQInputSchema>;

const ExpandFAQOutputSchema = z.object({
  expandedAnswer: z.string().describe('The AI-expanded answer to the predefined question.'),
});
export type ExpandFAQOutput = z.infer<typeof ExpandFAQOutputSchema>;

export async function expandFAQ(input: ExpandFAQInput): Promise<ExpandFAQOutput> {
  return expandFAQFlow(input);
}

const expandFAQPrompt = ai.definePrompt({
  name: 'expandFAQPrompt',
  input: {schema: ExpandFAQInputSchema},
  output: {schema: ExpandFAQOutputSchema},
  model: 'googleai/gemini-2.5-flash',
  prompt: `You are an AI chatbot assistant designed to provide comprehensive answers to predefined questions about plant care and diseases.

  The user has selected the following question:
  "{{question}}"

  Your response MUST be in the following language: {{{language}}}.

  Provide a detailed and contextually relevant answer that expands on the initial scope of the question. Be as helpful as possible.
  `,
});

const expandFAQFlow = ai.defineFlow(
  {
    name: 'expandFAQFlow',
    inputSchema: ExpandFAQInputSchema,
    outputSchema: ExpandFAQOutputSchema,
  },
  async input => {
    const {output} = await expandFAQPrompt(input);
    return output!;
  }
);
