'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { BrainCircuit, Loader2 } from 'lucide-react';

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
import { analyzeJournalEntry } from '@/ai/flows/analyze-journal-entry'; // Import the Genkit flow

const formSchema = z.object({
  entryText: z.string().min(10, {
    message: 'Journal entry must be at least 10 characters.',
  }),
});

type JournalEntry = {
  id: string;
  timestamp: Date;
  text: string;
  sentiment?: string;
  feedback?: string;
};

export default function JournalPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);
  const [analysisResult, setAnalysisResult] = React.useState<{ sentiment: string; feedback: string } | null>(null);
   const [journalEntries, setJournalEntries] = React.useState<JournalEntry[]>([]); // State to hold entries


  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      entryText: '',
    },
  });

 async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setAnalysisResult(null); // Clear previous analysis
    console.log('Submitting journal entry:', values.entryText);

    try {
      const result = await analyzeJournalEntry({ entryText: values.entryText });
      console.log('AI Analysis Result:', result);
      setAnalysisResult(result);

      // Simulate saving the entry (replace with actual Firestore logic)
      const newEntry: JournalEntry = {
        id: Date.now().toString(), // Simple ID generation
        timestamp: new Date(),
        text: values.entryText,
        sentiment: result.sentiment,
        feedback: result.feedback,
      };
      setJournalEntries([newEntry, ...journalEntries]); // Add new entry to the top

      toast({
        title: 'Journal Entry Saved',
        description: 'Your thoughts have been recorded.',
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
        Log your thoughts and feelings. NeuroMate will provide supportive feedback.
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
                      Your entry is private and secure.
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

        {analysisResult && (
            <Card className="mt-6 bg-secondary/30 border-secondary shadow-sm rounded-lg">
              <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-secondary-foreground">
                      <BrainCircuit className="w-5 h-5" /> AI Feedback
                  </CardTitle>
              </CardHeader>
              <CardContent className="text-secondary-foreground space-y-2">
                  <p><strong>Sentiment:</strong> {analysisResult.sentiment}</p>
                  <p><strong>Feedback:</strong> {analysisResult.feedback}</p>
              </CardContent>
            </Card>
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
                   {entry.sentiment && ` - Sentiment: ${entry.sentiment}`}
                 </CardDescription>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                <p className="text-foreground whitespace-pre-wrap">{entry.text}</p>
                {entry.feedback && (
                     <div className="p-3 bg-secondary/20 border-l-4 border-secondary rounded">
                        <p className="text-sm text-secondary-foreground font-medium">AI Feedback:</p>
                        <p className="text-sm text-secondary-foreground">{entry.feedback}</p>
                     </div>
                 )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
