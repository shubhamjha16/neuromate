'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookText, Target, BrainCircuit } from 'lucide-react'; // Added BrainCircuit for logo

import { cn } from '@/lib/utils';
import {
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

export function SidebarNav() {
  const pathname = usePathname();
  const { state } = useSidebar();

  const menuItems = [
    { href: '/journal', label: 'Journal', icon: BookText },
    { href: '/goals', label: 'Goals', icon: Target },
  ];

  return (
    <>
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
           <SidebarTrigger className="shrink-0 md:hidden" /> {/* Removed wrapping Button */}
          <BrainCircuit className="w-6 h-6 text-primary" />
          <span
            className={cn(
              'font-semibold text-lg whitespace-nowrap transition-opacity duration-300',
               state === 'collapsed' ? 'opacity-0' : 'opacity-100'
            )}
          >
            NeuroSync
          </span>
        </div>
      </SidebarHeader>
      <Separator className="my-0" />
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href} legacyBehavior passHref>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.href}
                  tooltip={item.label}
                >
                  <a>
                    <item.icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </a>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-4 hidden md:flex">
         {/* Can add user profile/settings link here later */}
        <Button variant="ghost" size="icon" className="ml-auto">
            <SidebarTrigger />
        </Button>
      </SidebarFooter>
    </>
  );
}
