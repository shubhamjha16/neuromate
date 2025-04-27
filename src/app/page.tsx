import { redirect } from 'next/navigation';

export default function Home() {
  // Redirect to the journal page by default
  redirect('/journal');

  // Or display a welcome message / dashboard if preferred
  // return (
  //   <div className="flex flex-col items-center justify-center min-h-screen p-8">
  //     <h1 className="text-4xl font-bold mb-4 text-primary">Welcome to NeuroSync</h1>
  //     <p className="text-lg text-muted-foreground text-center max-w-md">
  //       Navigate using the sidebar to start journaling your emotions or tracking your goals.
  //     </p>
  //   </div>
  // );
}
