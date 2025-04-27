'use server';

/**
 * @fileOverview Analyzes a journal entry for sentiment and provides empathetic, supportive, and therapeutic feedback for the user,
 * as well as separate, more clinical notes intended for a therapist, and suggests positive goals based on the analysis.
 *
 * - analyzeJournalEntry - A function that analyzes a journal entry and provides feedback and goal suggestions.
 * - AnalyzeJournalEntryInput - The input type for the analyzeJournalEntry function.
 * - AnalyzeJournalEntryOutput - The return type for the analyzeJournalEntry function, including user feedback, therapist notes, and suggested goals.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const AnalyzeJournalEntryInputSchema = z.object({
  entryText: z.string().describe('The text content of the journal entry.'),
});
export type AnalyzeJournalEntryInput = z.infer<typeof AnalyzeJournalEntryInputSchema>;

// Define the structure for therapist-specific notes
const TherapistNotesSchema = z.object({
    coreIssues: z.string().describe('Identify potential underlying core psychological issues or themes observed in the entry (e.g., attachment anxiety, low self-worth, cognitive distortions like catastrophizing). Focus on patterns, not just surface emotions.'),
    potentialDiagnosis: z.string().describe('Based on the entry, suggest potential diagnostic considerations or patterns (e.g., "Presents with symptoms consistent with mild anxiety," "Shows signs of persistent depressive thinking," "Possible indicators of adjustment difficulties"). Use cautious, suggestive language. THIS IS NOT A CLINICAL DIAGNOSIS.'),
    therapeuticSuggestions: z.string().describe('Recommend relevant evidence-based therapeutic approaches or techniques a therapist might consider (e.g., "Consider CBT techniques for challenging negative automatic thoughts," "Exploration of past experiences via psychodynamic approach may be beneficial," "Introduce mindfulness and distress tolerance skills from DBT"). Be specific about the modality and its target.')
}).optional().describe('Confidential notes intended only for a qualified therapist reviewing this entry. **DO NOT SHOW THIS TO THE USER.**');


// Updated output schema to include therapist notes and suggested goals.
const AnalyzeJournalEntryOutputSchema = z.object({
  sentiment: z
    .string()
    .describe(
      'The primary underlying sentiment or emotional tone of the journal entry (e.g., hopeful, anxious, grateful, frustrated, content, sad, overwhelmed, reflective), as determined by the analysis.'
    ),
  feedback: z
    .string()
    .describe(
      'Deeply empathetic, validating, and gently therapeutic feedback for the user. Acknowledge feelings, offer understanding, normalize experiences where appropriate, and provide gentle prompts for self-compassion or reflection. Avoid jargon and direct advice unless it pertains to general self-care.'
    ),
   therapistNotes: TherapistNotesSchema, // Add the therapist notes section
   suggestedGoals: z.array(z.string()).optional().describe('Suggest 1-3 positive, actionable goals based on the analysis, particularly focusing on counteracting negative themes identified. Frame these as gentle suggestions (e.g., "Consider practicing self-compassion for 5 minutes daily," "Explore identifying one small positive moment each day," "Try a 3-minute breathing exercise when feeling overwhelmed"). Keep goals concise and user-friendly.')
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
            'Identify the primary sentiment expressed in the journal entry. Be specific and nuanced (e.g., anxious and overwhelmed, cautiously optimistic, deeply grateful, frustrated but resilient, numb, reflective sadness).'
          ),
      feedback: z
        .string()
        .describe(
          '**For the User:** Provide a deeply empathetic, warm, and validating response. Acknowledge the specific feelings expressed, normalize their experience if appropriate ("It makes sense you\'d feel..."). Offer genuine understanding and compassion like a caring companion. Use "I" statements like "I hear how difficult that sounds" or "I understand that feeling of...". Encourage self-compassion. Avoid clinical terms, diagnosis, or strong directives. Gentle, open-ended reflection prompts are okay (e.g., "What kindness could you offer yourself in this moment?"), but prioritize validation.'
          ),
      therapistNotes: z.object({
           coreIssues: z.string().describe('**For the Therapist ONLY:** Analyze the text for potential underlying psychological themes or core issues. Look beyond surface emotions. Examples: unresolved grief, perfectionism, fear of abandonment, negative self-concept, possible trauma indicators, difficulty with emotional regulation.'),
           potentialDiagnosis: z.string().describe('**For the Therapist ONLY:** Based *only* on this text, note any potential diagnostic considerations or patterns using cautious, suggestive language. Frame as observations, not conclusions. Examples: "Entry suggests patterns consistent with GAD features," "Observed cognitive distortions align with depressive thinking," "Possible signs of social anxiety," "Rule out adjustment disorder." **Explicitly state this is not a diagnosis.**'),
           therapeuticSuggestions: z.string().describe('**For the Therapist ONLY:** Suggest relevant evidence-based therapeutic approaches or interventions a therapist might consider exploring. Be specific. Examples: "Cognitive restructuring (CBT) for negative automatic thoughts," "Mindfulness-based stress reduction (MBSR) techniques," "Schema therapy interventions for maladaptive schemas," "Emotion regulation skills training (DBT)," "Consider exploring attachment history." Link suggestions to the core issues noted.')
      }).describe('**Confidential Section for Therapist Review ONLY.** Contains clinical analysis and suggestions based on psychological principles. DO NOT show this section to the user.'),
      suggestedGoals: z.array(z.string()).optional().describe('**For the User:** Based on the overall analysis (especially negative themes identified in the therapist notes, if applicable), suggest 1-3 simple, positive, and actionable goals. Frame them as gentle invitations. Examples: "Maybe try noticing one thing you appreciate about yourself today?", "Consider dedicating 5 minutes to mindful breathing when stress rises.", "How about writing down one small accomplishment each evening?". Keep goals concise and focused on well-being or shifting perspective positively.')
    }),
  },
  // Updated prompt for empathetic feedback, therapist notes, and goal suggestions.
  prompt: `You are NeuroMate, an AI assistant trained in analyzing journal entries with psychological insight. Your task is threefold:
  1.  Provide a deeply empathetic and supportive response directly to the user who wrote the entry.
  2.  Generate separate, analytical notes intended ONLY for a qualified therapist reviewing the entry. This section MUST remain confidential from the user.
  3.  Suggest 1-3 positive, actionable goals for the user based on the analysis, aiming to counteract identified negative patterns or promote well-being.

  **Journal Entry:**
  '''
  {{entryText}}
  '''

  **Analysis Task:**

  **Part 1: For the User (Output field: 'feedback')**
  *   Read the entry with deep empathy. Identify the primary feelings and experiences being shared.
  *   Write a warm, validating, and supportive response. Use "I" statements to convey understanding (e.g., "I hear how challenging this situation is for you," "It sounds like you're carrying a heavy weight").
  *   Acknowledge and normalize their feelings without judgment ("It's completely understandable to feel X given Y").
  *   Focus on compassion and gentle encouragement towards self-kindness.
  *   Avoid clinical jargon, diagnosis, or giving strong advice (unless suggesting general self-care like deep breathing).
  *   Keep the tone therapeutic, like a caring, non-clinical guide. A gentle reflection question is acceptable if it flows naturally (e.g., "I wonder what support feels like for you right now?").

  **Part 2: For the Therapist (Output object: 'therapistNotes') - CONFIDENTIAL**
  *   **Core Issues:** Analyze the text for deeper psychological themes, patterns, or potential core issues (e.g., cognitive distortions, defense mechanisms, attachment patterns, self-worth issues).
  *   **Potential Diagnosis:** Based SOLELY on this text, cautiously note any potential diagnostic considerations or symptom clusters that a therapist might explore further. Use phrases like "suggests features of...", "possible indicators of...", "consistent with..." Phrase this carefully, stating it is NOT a formal diagnosis.
  *   **Therapeutic Suggestions:** Recommend specific, evidence-based therapeutic modalities or techniques relevant to the observed issues (e.g., CBT, DBT, ACT, psychodynamic exploration, EMDR if trauma indicators present). Link the suggestion to the identified core issue or potential diagnosis.

  **Part 3: Goal Suggestions (Output field: 'suggestedGoals')**
  *   Review your analysis (including the confidential therapist notes).
  *   If negative patterns, distress, or areas for growth are identified, formulate 1-3 simple, positive, and actionable goals.
  *   Focus on goals that promote self-compassion, mindfulness, positive reframing, or small behavioral changes related to well-being.
  *   Phrase them as gentle invitations or considerations (e.g., "Maybe consider...", "Perhaps try...", "What if you explored...?").
  *   Example Goal Ideas: Practice gratitude journaling for 2 minutes daily, identify one strength you used today, engage in a 5-minute calming activity when feeling overwhelmed, challenge one negative thought with a more balanced perspective.
  *   Ensure goals are user-friendly and not overly clinical.

  **Output Format:**
  Provide your complete response structured according to the defined output schema. Ensure the 'therapistNotes' section contains ONLY the analytical information for the therapist and IS NOT included in the user-facing feedback. Ensure the 'feedback' is purely supportive and empathetic. Provide the 'suggestedGoals' as a list of strings.
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
  // Basic check for valid output structure.
  if (!output || !output.sentiment || !output.feedback) {
      console.error("AI analysis failed to produce valid user output structure.");
      // Provide a default, gentle fallback response for the user part
      return {
          sentiment: 'Neutral', // Default sentiment
          feedback: 'Thank you for sharing your thoughts. Remember to be kind to yourself today.',
          therapistNotes: undefined, // Ensure therapist notes are undefined if basic output fails
          suggestedGoals: [] // Ensure goals are empty array if basic output fails
      };
  }
   // Even if user feedback is present, check if therapist notes were generated as expected
   if (!output.therapistNotes) {
       console.warn("AI analysis did not generate therapist notes for this entry.");
       // Return the output without therapist notes, but log the warning
        return {
            sentiment: output.sentiment,
            feedback: output.feedback,
            therapistNotes: undefined,
            suggestedGoals: output.suggestedGoals || [] // Include goals even if therapist notes missing
        };
   }

   // Ensure suggestedGoals is at least an empty array if not provided
   output.suggestedGoals = output.suggestedGoals || [];

  return output;
});
