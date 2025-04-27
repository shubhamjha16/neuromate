'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Target, PlusCircle, CheckCircle2, Trash2, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';


const goalSchema = z.object({
  goalDescription: z.string().min(5, {
    message: 'Goal description must be at least 5 characters.',
  }),
});

type Goal = {
  id: string;
  description: string;
  isCompleted: boolean;
  createdAt: Date;
};

export default function GoalsPage() {
  const { toast } = useToast();
  const [goals, setGoals] = React.useState<Goal[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);

  const form = useForm<z.infer<typeof goalSchema>>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      goalDescription: '',
    },
  });

  // Simulate loading goals (replace with Firestore fetch)
  React.useEffect(() => {
    // Placeholder: load goals from local storage or API
    // const storedGoals = localStorage.getItem('neuroSyncGoals');
    // if (storedGoals) {
    //   setGoals(JSON.parse(storedGoals).map((g: any) => ({...g, createdAt: new Date(g.createdAt)})));
    // }
  }, []);

  // Simulate saving goals (replace with Firestore save)
  React.useEffect(() => {
     // Placeholder: save goals to local storage or API
    // if (goals.length > 0) {
    //   localStorage.setItem('neuroSyncGoals', JSON.stringify(goals));
    // } else {
    //    localStorage.removeItem('neuroSyncGoals');
    // }
  }, [goals]);


  function onSubmit(values: z.infer<typeof goalSchema>) {
    setIsLoading(true);
    // Simulate API call delay
    setTimeout(() => {
      const newGoal: Goal = {
        id: Date.now().toString(), // Simple ID
        description: values.goalDescription,
        isCompleted: false,
        createdAt: new Date(),
      };
      setGoals([newGoal, ...goals]); // Add to the top
      toast({
        title: 'Goal Added',
        description: `"${values.goalDescription}" has been added to your goals.`,
      });
      form.reset();
      setIsLoading(false);
    }, 500); // 0.5 second delay
  }

 const toggleGoalCompletion = (id: string) => {
    setGoals(goals.map(goal =>
      goal.id === id ? { ...goal, isCompleted: !goal.isCompleted } : goal
    ));
    const updatedGoal = goals.find(g => g.id === id);
     toast({
        title: `Goal ${updatedGoal && !updatedGoal.isCompleted ? 'Marked as Complete' : 'Marked as Incomplete'}`,
        description: `"${updatedGoal?.description}" status updated.`,
      });
  };

  const deleteGoal = (id: string) => {
     const goalToDelete = goals.find(g => g.id === id);
     setGoals(goals.filter(goal => goal.id !== id));
      toast({
        variant: 'destructive',
        title: 'Goal Deleted',
        description: `"${goalToDelete?.description}" has been removed.`,
      });
  };

 const activeGoals = goals.filter(goal => !goal.isCompleted).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
 const completedGoals = goals.filter(goal => goal.isCompleted).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());


  return (
    <div className="container mx-auto p-4 md:p-8 space-y-8">
      <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
        <Target className="w-7 h-7 text-primary" /> Personal Goals
      </h1>
      <p className="text-muted-foreground">
        Set, track, and achieve your personal milestones for growth and well-being.
      </p>

      <Card className="shadow-md rounded-lg">
        <CardHeader>
          <CardTitle>Add a New Goal</CardTitle>
          <CardDescription>What would you like to accomplish?</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col sm:flex-row gap-4 items-start">
              <FormField
                control={form.control}
                name="goalDescription"
                render={({ field }) => (
                  <FormItem className="flex-grow">
                    <FormLabel className="sr-only">Goal Description</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Practice mindfulness for 10 minutes daily" {...field} className="text-base"/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading} className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground shrink-0">
                {isLoading ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Adding...
                    </>
                ) : (
                    <>
                        <PlusCircle className="mr-2 h-4 w-4" /> Add Goal
                    </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Separator />

      {/* Active Goals Section */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-foreground">Active Goals</h2>
        {activeGoals.length === 0 ? (
          <p className="text-muted-foreground">You have no active goals. Add one above to get started!</p>
        ) : (
          <div className="space-y-3">
            {activeGoals.map((goal) => (
             <Card key={goal.id} className="flex items-center p-4 gap-4 shadow-sm rounded-lg hover:bg-muted/50 transition-colors">
                <Checkbox
                  id={`goal-${goal.id}`}
                  checked={goal.isCompleted}
                  onCheckedChange={() => toggleGoalCompletion(goal.id)}
                  aria-label={`Mark goal "${goal.description}" as complete`}
                />
                <Label htmlFor={`goal-${goal.id}`} className="flex-grow text-base cursor-pointer">
                  {goal.description}
                </Label>
                 <AlertDialog>
                    <AlertDialogTrigger asChild>
                         <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive shrink-0">
                            <Trash2 className="w-4 h-4" />
                             <span className="sr-only">Delete goal</span>
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the goal: "{goal.description}".
                        </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deleteGoal(goal.id)} className="bg-destructive hover:bg-destructive/90">
                            Delete
                        </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

              </Card>
            ))}
          </div>
        )}
      </div>

       {/* Completed Goals Section */}
       {completedGoals.length > 0 && (
         <>
            <Separator />
            <div className="space-y-4">
                <h2 className="text-2xl font-semibold text-foreground flex items-center gap-2">
                    <CheckCircle2 className="w-6 h-6 text-secondary-foreground" /> Completed Goals
                </h2>
                <div className="space-y-3">
                {completedGoals.map((goal) => (
                    <Card key={goal.id} className="flex items-center p-4 gap-4 bg-secondary/20 border-secondary shadow-sm rounded-lg opacity-70">
                    <Checkbox
                        id={`goal-${goal.id}`}
                        checked={goal.isCompleted}
                        onCheckedChange={() => toggleGoalCompletion(goal.id)}
                         aria-label={`Mark goal "${goal.description}" as incomplete`}
                         className="border-secondary-foreground data-[state=checked]:bg-secondary data-[state=checked]:text-secondary-foreground"
                    />
                    <Label htmlFor={`goal-${goal.id}`} className="flex-grow text-base text-muted-foreground line-through cursor-pointer">
                        {goal.description}
                    </Label>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive shrink-0">
                                <Trash2 className="w-4 h-4" />
                                <span className="sr-only">Delete goal</span>
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the completed goal: "{goal.description}".
                            </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteGoal(goal.id)} className="bg-destructive hover:bg-destructive/90">
                                Delete
                            </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                    </Card>
                ))}
                </div>
            </div>
         </>
       )}
    </div>
  );
}

