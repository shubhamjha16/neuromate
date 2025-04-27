'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { BrainCircuit, Loader2, Lightbulb, Target } from 'lucide-react'; // Added Lightbulb and Target

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { AnalyzeJournalEntryOutput, analyzeJournalEntry } from '@/ai/flows/analyze-journal-entry'; // Import the Genkit flow and output type
import Link from 'next/link';


const formSchema = z.object({
  entryText: z.string().min(10, {
    message: 'Journal entry must be at least 10 characters.',
  }),
});

// Define the structure for therapist notes within the JournalEntry type
type TherapistNotes = {
  coreIssues: string;
  potentialDiagnosis: string;
  therapeuticSuggestions: string;
};

type JournalEntry = {
  id: string;
  timestamp: Date;
  text: string;
  sentiment?: string;
  feedback?: string;
  therapistNotes?: TherapistNotes; // Add optional therapist notes field
  suggestedGoals?: string[]; // Add optional suggested goals field
};

export default function JournalPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);
  const [analysisResult, setAnalysisResult] = React.useState<AnalyzeJournalEntryOutput | null>(null); // Store the full analysis output temporarily
  const [journalEntries, setJournalEntries] = React.useState<JournalEntry[]>([]); // State to hold entries

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      entryText: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setAnalysisResult(null); // Clear previous analysis display
    console.log('Submitting journal entry:', values.entryText);

    try {
      const result = await analyzeJournalEntry({ entryText: values.entryText });
      console.log('AI Analysis Result:', result);
      setAnalysisResult(result); // Set the full result for display

      // Simulate saving the entry (replace with actual Firestore logic)
      const newEntry: JournalEntry = {
        id: Date.now().toString(), // Simple ID generation
        timestamp: new Date(),
        text: values.entryText,
        sentiment: result.sentiment,
        feedback: result.feedback,
        therapistNotes: result.therapistNotes, // Store the therapist notes
        suggestedGoals: result.suggestedGoals || [], // Store suggested goals
      };
      setJournalEntries([newEntry, ...journalEntries]); // Add new entry to the top

      toast({
        title: 'Journal Entry Saved',
        description: 'Your thoughts have been recorded and analyzed.',
      });
      form.reset(); // Reset form after successful submission
    } catch (error) {
      console.error('Error analyzing journal entry:', error);
      toast({
        variant: 'destructive',
        title: 'Analysis Failed',
        description: 'Could not analyze your entry. Please try again.',
      });
       // Still save the entry even if analysis fails
       const newEntry: JournalEntry = {
         id: Date.now().toString(),
         timestamp: new Date(),
         text: values.entryText,
         // No sentiment, feedback, therapist notes or goals on error
       };
       setJournalEntries([newEntry, ...journalEntries]);
       form.reset(); // Reset form even on error, but keep text if needed
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="container mx-auto p-4 md:p-8 space-y-8">
      <h1 className="text-3xl font-bold text-foreground">Emotion Journal</h1>
      <p className="text-muted-foreground">
        Log your thoughts and feelings. NeuroMate will provide supportive feedback and goal suggestions.
      </p>

      <Card className="shadow-md rounded-lg">
        <CardHeader>
          <CardTitle>New Journal Entry</CardTitle>
          <CardDescription>How are you feeling today?</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="entryText"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Today's Entry</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Write about your day, your feelings, or anything on your mind..."
                        className="resize-y min-h-[150px] text-base"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Your entry is private and secure. AI feedback and goal suggestions are provided for support. Therapist notes are generated but kept confidential.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving & Analyzing...
                  </>
                ) : (
                  'Save Entry'
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

        {/* Display AI Feedback and Suggested Goals */}
        {analysisResult && (
            <div className="mt-6 space-y-4">
                {/* AI Feedback Card */}
                {analysisResult.feedback && (
                    <Card className="bg-secondary/30 border-secondary shadow-sm rounded-lg">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-secondary-foreground">
                            <BrainCircuit className="w-5 h-5" /> AI Feedback
                        </CardTitle>
                        {analysisResult.sentiment && <CardDescription className="text-secondary-foreground/80">Detected Sentiment: {analysisResult.sentiment}</CardDescription>}
                    </CardHeader>
                    <CardContent className="text-secondary-foreground">
                        <p>{analysisResult.feedback}</p>
                    </CardContent>
                    </Card>
                )}

                {/* Suggested Goals Card */}
                {analysisResult.suggestedGoals && analysisResult.suggestedGoals.length > 0 && (
                    <Card className="bg-accent/30 border-accent shadow-sm rounded-lg">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-accent-foreground">
                            <Lightbulb className="w-5 h-5" /> Suggested Goals
                        </CardTitle>
                         <CardDescription className="text-accent-foreground/80">Consider adding these to your goals:</CardDescription>
                    </CardHeader>
                    <CardContent className="text-accent-foreground space-y-2">
                        <ul className="list-disc list-inside space-y-1">
                            {analysisResult.suggestedGoals.map((goal, index) => (
                                <li key={index}>{goal}</li>
                            ))}
                        </ul>
                        <Button variant="link" className="p-0 h-auto text-accent-foreground hover:text-accent-foreground/80" asChild>
                            <Link href="/goals">
                                Go to Goals Page <Target className="ml-1 h-4 w-4"/>
                            </Link>
                        </Button>
                    </CardContent>
                    </Card>
                )}
             </div>
        )}


      <Separator />

      {/* Section to display past entries */}
       <div className="space-y-6">
        <h2 className="text-2xl font-semibold text-foreground">Past Entries</h2>
        {journalEntries.length === 0 ? (
          <p className="text-muted-foreground">You haven't added any journal entries yet.</p>
        ) : (
          journalEntries.map((entry) => (
            <Card key={entry.id} className="shadow-sm rounded-lg overflow-hidden">
              <CardHeader className="bg-muted/50 p-4">
                <CardTitle className="text-lg">
                   {entry.timestamp.toLocaleDateString('en-US', {
                      year: 'numeric', month: 'long', day: 'numeric'
                   })}
                </CardTitle>
                 <CardDescription className="text-xs">
                  {entry.timestamp.toLocaleTimeString('en-US', {
                      hour: '2-digit', minute: '2-digit'
                   })}
                   {/* Display sentiment if available */}
                   {entry.sentiment && ` - Sentiment: ${entry.sentiment}`}
                 </CardDescription>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <p className="text-foreground whitespace-pre-wrap">{entry.text}</p>
                 {/* Display user feedback if available */}
                {entry.feedback && (
                     <div className="p-3 bg-secondary/20 border-l-4 border-secondary rounded mt-3">
                        <p className="text-sm text-secondary-foreground font-medium mb-1">AI Feedback:</p>
                        <p className="text-sm text-secondary-foreground">{entry.feedback}</p>
                     </div>
                 )}
                 {/* Display suggested goals if available */}
                 {entry.suggestedGoals && entry.suggestedGoals.length > 0 && (
                     <div className="p-3 bg-accent/20 border-l-4 border-accent rounded mt-3">
                        <p className="text-sm text-accent-foreground font-medium mb-1">Suggested Goals:</p>
                        <ul className="list-disc list-inside space-y-1 text-sm text-accent-foreground">
                            {entry.suggestedGoals.map((goal, index) => (
                                <li key={index}>{goal}</li>
                            ))}
                        </ul>
                     </div>
                 )}
                 {/* IMPORTANT: DO NOT RENDER entry.therapistNotes here. It should be stored but not displayed. */}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
