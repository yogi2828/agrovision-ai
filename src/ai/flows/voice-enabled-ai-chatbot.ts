'use server';
/**
 * @fileOverview AI chatbot flow that supports voice input and output in multiple Indian languages.
 *
 * - aiChatbot - A function that handles the chatbot interaction.
 * - AIChatbotInput - The input type for the aiChatbot function.
 * - AIChatbotOutput - The return type for the aiChatbot function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AIChatbotInputSchema = z.object({
  language: z.string().describe('The language to use for the chatbot interaction.'),
  query: z.string().describe('The user query for the chatbot.'),
});
export type AIChatbotInput = z.infer<typeof AIChatbotInputSchema>;

const AIChatbotOutputSchema = z.object({
  response: z.string().describe('The chatbot response.'),
  audio: z.string().optional().describe('The audio data of the chatbot response in WAV format as a data URI.'),
});
export type AIChatbotOutput = z.infer<typeof AIChatbotOutputSchema>;

import wav from 'wav';

async function toWav(
  pcmData: Buffer,
  channels = 1,
  rate = 24000,
  sampleWidth = 2
): Promise<string> {
  return new Promise((resolve, reject) => {
    const writer = new wav.Writer({
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    });

    let bufs = [] as any[];
    writer.on('error', reject);
    writer.on('data', function (d) {
      bufs.push(d);
    });
    writer.on('end', function () {
      resolve(Buffer.concat(bufs).toString('base64'));
    });

    writer.write(pcmData);
    writer.end();
  });
}

export async function aiChatbot(input: AIChatbotInput): Promise<AIChatbotOutput> {
  return aiChatbotFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiChatbotPrompt',
  input: {schema: AIChatbotInputSchema},
  output: {schema: AIChatbotOutputSchema},
  prompt: `You are a helpful AI assistant for Indian farmers. You are able to provide information on crop care, fertilizer guidance, and seasonal farming tips in the user's local language.

Language: {{{language}}}
Query: {{{query}}}

Response:`, // DO NOT use the tts model for generating the response here. Only generate plain text. The TTS will happen in the flow instead.
});

const aiChatbotFlow = ai.defineFlow(
  {
    name: 'aiChatbotFlow',
    inputSchema: AIChatbotInputSchema,
    outputSchema: AIChatbotOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error('No output from prompt');
    }

    const { media } = await ai.generate({
      model: ai.model('gemini-2.5-flash-preview-tts'),
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Algenib' }, // TODO: Figure out how to map Indian languages to appropriate voice configs.
          },
        },
      },
      prompt: output.response,
    });

    let audioDataUri;
    if (media) {
      const audioBuffer = Buffer.from(
          media.url.substring(media.url.indexOf(',') + 1),
          'base64'
      );
      audioDataUri = 'data:audio/wav;base64,' + (await toWav(audioBuffer));
    }

    return {
      response: output.response,
      audio: audioDataUri
    };
  }
);
