import { supabase } from '@/integrations/supabase/client';

export interface Committee {
  name: string;
  url?: string;
  type: 'departmental' | 'select' | 'other';
}

export interface CommitteesResponse {
  success: boolean;
  error?: string;
  data?: {
    committees: Committee[];
    rawMarkdown?: string;
    scrapedAt: string;
  };
}

// Parliament external resource URLs
export const PARLIAMENT_URLS = {
  hansard: 'https://www.parliament.go.ke/the-national-assembly/house-business/hansard',
  billsTracker: 'https://www.parliament.go.ke/the-national-assembly/house-business/bills',
  committees: 'https://www.parliament.go.ke/the-national-assembly/committees',
  mpsList: 'https://www.parliament.go.ke/the-national-assembly/mps',
  orderPaper: 'https://www.parliament.go.ke/the-national-assembly/house-business/order-paper',
  votes: 'https://www.parliament.go.ke/the-national-assembly/house-business/votes-and-proceedings',
} as const;

// Scrape committees from Parliament website via edge function
export async function scrapeCommittees(): Promise<CommitteesResponse> {
  try {
    const { data, error } = await supabase.functions.invoke('scrape-committees');
    
    if (error) {
      console.error('Error invoking scrape-committees:', error);
      return { success: false, error: error.message };
    }
    
    return data;
  } catch (err) {
    console.error('Failed to scrape committees:', err);
    return { 
      success: false, 
      error: err instanceof Error ? err.message : 'Unknown error' 
    };
  }
}

// Check if a leader position is an MP (for showing parliamentary activity)
export function isMP(position: string): boolean {
  const posLower = position.toLowerCase();
  return posLower.startsWith('mp -') || 
         posLower.includes('member of parliament') ||
         posLower.includes('constituency');
}

// Check if a leader position is a Senator
export function isSenator(position: string): boolean {
  return position.toLowerCase().includes('senator');
}

// Check if a leader should show parliamentary activity section
export function showsParliamentaryActivity(position: string): boolean {
  return isMP(position) || isSenator(position);
}

// Get search URL for Hansard (Parliament doesn't have per-MP filtering, so we link to main page)
export function getHansardUrl(): string {
  return PARLIAMENT_URLS.hansard;
}

// Get bills tracker URL
export function getBillsTrackerUrl(): string {
  return PARLIAMENT_URLS.billsTracker;
}

// Get committees URL
export function getCommitteesUrl(): string {
  return PARLIAMENT_URLS.committees;
}
