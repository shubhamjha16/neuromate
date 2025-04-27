// 'use server'
'use server';

/**
 * @fileOverview Analyzes a journal entry for sentiment and provides supportive feedback.
 *
 * - analyzeJournalEntry - A function that analyzes a journal entry and provides feedback.
 * - AnalyzeJournalEntryInput - The input type for the analyzeJournalEntry function.
 * - AnalyzeJournalEntryOutput - The return type for the analyzeJournalEntry function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const AnalyzeJournalEntryInputSchema = z.object({
  entryText: z.string().describe('The text content of the journal entry.'),
});
export type AnalyzeJournalEntryInput = z.infer<typeof AnalyzeJournalEntryInputSchema>;

const AnalyzeJournalEntryOutputSchema = z.object({
  sentiment: z
    .string()
    .describe(
      'The sentiment of the journal entry (positive, negative, or neutral), as determined by the sentiment analysis.'
    ),
  feedback: z
    .string()
    .describe('Supportive feedback based on the sentiment of the journal entry.'),
});
export type AnalyzeJournalEntryOutput = z.infer<typeof AnalyzeJournalEntryOutputSchema>;

export async function analyzeJournalEntry(input: AnalyzeJournalEntryInput): Promise<AnalyzeJournalEntryOutput> {
  return analyzeJournalEntryFlow(input);
}

const analyzeJournalEntryPrompt = ai.definePrompt({
  name: 'analyzeJournalEntryPrompt',
  input: {
    schema: z.object({
      entryText: z.string().describe('The text content of the journal entry.'),
    }),
  },
  output: {
    schema: z.object({
      sentiment:
        z.string()
          .describe(
            'The sentiment of the journal entry (positive, negative, or neutral), as determined by the sentiment analysis.'
          ),
      feedback: z
        .string()
        .describe('Supportive feedback based on the sentiment of the journal entry.'),
    }),
  },
  prompt: `You are an AI assistant designed to analyze journal entries and provide supportive feedback to the user.
  Analyze the following journal entry and determine the sentiment (positive, negative, or neutral). Based on the sentiment,
  provide supportive feedback to help the user understand their emotional state and offer encouragement.

  Journal Entry:
  {{entryText}}

  Sentiment: // Sentiment analysis result here (positive, negative, or neutral)
  Feedback: // Supportive feedback based on the sentiment
  `,
});

const analyzeJournalEntryFlow = ai.defineFlow<
  typeof AnalyzeJournalEntryInputSchema,
  typeof AnalyzeJournalEntryOutputSchema
>({
  name: 'analyzeJournalEntryFlow',
  inputSchema: AnalyzeJournalEntryInputSchema,
  outputSchema: AnalyzeJournalEntryOutputSchema,
},
async input => {
  const {output} = await analyzeJournalEntryPrompt(input);
  return output!;
});
