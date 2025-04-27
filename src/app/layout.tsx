import type { Metadata } from 'next';
import { Inter } from 'next/font/google'; // Using Inter for clean sans-serif font
import './globals.css';
import { cn } from '@/lib/utils';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import { SidebarNav } from '@/components/layout/sidebar-nav';
import { Toaster } from "@/components/ui/toaster"; // Import Toaster

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'NeuroMate', // Updated title
  description: 'Your personal companion for emotional well-being and goal achievement.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          'min-h-screen bg-background font-sans antialiased',
          inter.variable
        )}
      >
        <SidebarProvider>
          <Sidebar>
            <SidebarNav />
          </Sidebar>
          <SidebarInset>{children}</SidebarInset>
        </SidebarProvider>
        <Toaster /> {/* Add Toaster component here */}
      </body>
    </html>
  );
}
