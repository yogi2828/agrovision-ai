
'use server';

/**
 * @fileOverview Provides a daily AI-generated farming tip relevant to the current season and user location.
 *
 * - `getDailyFarmingTip` - A function that retrieves the daily farming tip.
 * - `DailyFarmingTipInput` - The input type for the `getDailyFarmingTip` function.
 * - `DailyFarmingTipOutput` - The return type for the `getDailyFarmingTip` function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DailyFarmingTipInputSchema = z.object({
  location: z.string().describe('The geographical location of the farmer.'),
  season: z.string().describe('The current season (e.g., Spring, Summer, Autumn, Winter).'),
  lastTip: z.string().optional().describe('The last farming tip provided to the user. Used to prevent duplicates.'),
});
export type DailyFarmingTipInput = z.infer<typeof DailyFarmingTipInputSchema>;

const DailyFarmingTipOutputSchema = z.object({
  tip: z.string().describe('The AI-generated farming tip.'),
});
export type DailyFarmingTipOutput = z.infer<typeof DailyFarmingTipOutputSchema>;

export async function getDailyFarmingTip(input: DailyFarmingTipInput): Promise<DailyFarmingTipOutput> {
  return dailyFarmingTipFlow(input);
}

const dailyFarmingTipPrompt = ai.definePrompt({
  name: 'dailyFarmingTipPrompt',
  input: {schema: DailyFarmingTipInputSchema},
  output: {schema: DailyFarmingTipOutputSchema},
  model: 'googleai/gemini-1.5-flash-latest',
  prompt: `You are an AI farming assistant providing daily tips to farmers.

  Generate a single, actionable farming tip relevant to the current season and location.
  The tip should be concise and easy to understand. Consider the following when generating the tip:

  *   Common farming practices for the given season and location.
  *   Potential challenges farmers might face during this time.
  *   Sustainable and eco-friendly farming methods.

  Location: {{{location}}}
  Season: {{{season}}}

  {% if lastTip %}
  Avoid repeating the following tip: {{{lastTip}}}
  {% endif %}

  Tip:`,
});

const dailyFarmingTipFlow = ai.defineFlow(
  {
    name: 'dailyFarmingTipFlow',
    inputSchema: DailyFarmingTipInputSchema,
    outputSchema: DailyFarmingTipOutputSchema,
  },
  async input => {
    const {output} = await dailyFarmingTipPrompt(input);
    return output!;
  }
);
