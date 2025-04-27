'use server';

/**
 * @fileOverview Analyzes a journal entry for sentiment and provides empathetic, supportive, and therapeutic feedback.
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

// Output schema remains the same, but the 'feedback' content will be different.
const AnalyzeJournalEntryOutputSchema = z.object({
  sentiment: z
    .string()
    .describe(
      'The underlying sentiment of the journal entry (e.g., hopeful, anxious, grateful, frustrated, content, sad, etc.), as determined by the analysis.'
    ),
  feedback: z
    .string()
    .describe(
      'Empathetic and therapeutic feedback that validates the user\'s feelings, offers understanding, and potentially gentle prompts for reflection, based on the journal entry.'
    ),
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
    // The output schema definition guides the AI on the desired structure.
    schema: z.object({
      sentiment:
        z.string()
          .describe(
            'Identify the primary sentiment expressed in the journal entry. Be specific (e.g., anxious, grateful, frustrated, content, overwhelmed, hopeful).'
          ),
      feedback: z
        .string()
        .describe(
          'Provide an empathetic and supportive response. Validate the user\'s feelings without judgment. Offer understanding and gentle encouragement. Avoid giving direct advice unless it\'s about self-care practices. Frame it as a caring companion or a non-clinical therapeutic guide. If appropriate, you can gently ask an open-ended question to encourage further reflection, but prioritize validation and support.'
          ),
    }),
  },
  // Updated prompt for more empathetic and therapeutic responses.
  prompt: `You are NeuroMate, a deeply empathetic and supportive AI companion. Your role is to read journal entries and respond in a way that makes the user feel heard, understood, and validated. Avoid clinical jargon or diagnosing. Focus on emotional support and gentle encouragement.

  Read the following journal entry carefully:
  '''
  {{entryText}}
  '''

  Based on the entry:
  1.  **Identify the primary sentiment:** What is the core emotion or feeling being expressed? Be specific (e.g., 'anxious and overwhelmed', 'cautiously optimistic', 'deeply grateful', 'frustrated but resilient').
  2.  **Write an empathetic feedback response:**
      *   Acknowledge and validate the feelings you identified. Use phrases like "It sounds like you're feeling...", "It's completely understandable that you'd feel...", "Thank you for sharing this, it takes courage to express...".
      *   Show understanding and compassion.
      *   Offer gentle support or encouragement. Reassure them that their feelings are valid.
      *   If it feels natural and supportive, you *can* ask a gentle, open-ended question like "What does support look like for you right now?" or "Is there anything small you could do to be kind to yourself today?" but only if it fits the context and doesn't feel probing. Prioritize validation first.
      *   Keep the tone warm, caring, and non-judgmental.

  Provide your response in the specified output format.
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
  // Basic check for valid output, although the prompt and schema should handle this.
  if (!output || !output.sentiment || !output.feedback) {
      console.error("AI analysis failed to produce valid output structure.");
      // Provide a default, gentle fallback response
      return {
          sentiment: 'Neutral', // Default sentiment
          feedback: 'Thank you for sharing your thoughts. Remember to be kind to yourself today.'
      };
  }
  return output;
});
