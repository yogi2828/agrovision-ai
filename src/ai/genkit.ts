
import {genkit, ModelArgument} from 'genkit';
import {googleAI as googleAIPlugin} from '@genkit-ai/google-genai';

export const googleAI = googleAIPlugin();

export const ai = genkit({
  plugins: [googleAI],
  // The model to use for text generation.
  defaultModel: 'googleai/gemini-1.5-flash-latest' as ModelArgument,
});
