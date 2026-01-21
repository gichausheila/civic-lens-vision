// Database types for CivicLens

export interface County {
  id: string;
  name: string;
  code: number;
  region: string | null;
  population: number | null;
  area_sq_km: number | null;
  capital: string | null;
  created_at: string;
}

export interface ImpeachmentTimelineEvent {
  date: string;
  event: string;
}

export interface OfficialDocument {
  title: string;
  url: string;
  source: string;
  type: "senate" | "court" | "gazette";
}

export interface Leader {
  id: string;
  name: string;
  position: string;
  county_id: string | null;
  party: string | null;
  photo_url: string | null;
  bio: string | null;
  manifesto: ManifestoItem[];
  achievements: Achievement[];
  controversial_statements: ControversialStatement[];
  is_national: boolean;
  contact_email: string | null;
  contact_phone: string | null;
  social_media: SocialMedia;
  is_impeached: boolean;
  impeachment_date: string | null;
  impeachment_reasons: string[];
  impeachment_timeline: ImpeachmentTimelineEvent[];
  official_documents: OfficialDocument[];
  created_at: string;
  updated_at: string;
  // Joined data
  county?: County;
}

export interface ManifestoItem {
  title: string;
  description: string;
}

export interface Achievement {
  text: string;
  date?: string;
  media_url?: string;
}

export interface ControversialStatement {
  text: string;
  date: string;
  media_url?: string;
  source?: string;
}

export interface SocialMedia {
  twitter?: string;
  facebook?: string;
  instagram?: string;
  linkedin?: string;
}

export interface Survey {
  id: string;
  question: string;
  options: string[];
  is_active: boolean;
  created_at: string;
  expires_at: string | null;
}

export interface SurveyVote {
  id: string;
  survey_id: string;
  option_index: number;
  voter_identifier: string;
  created_at: string;
}

export interface SurveyWithVotes extends Survey {
  votes: number[];
  total_votes: number;
  user_voted: boolean;
  user_vote_index?: number;
}

export interface Feedback {
  id: string;
  name: string | null;
  email: string | null;
  subject: string;
  message: string;
  leader_id: string | null;
  county_id: string | null;
  status: string;
  created_at: string;
}

export interface FeedbackInput {
  name?: string;
  email?: string;
  subject: string;
  message: string;
  leader_id?: string;
  county_id?: string;
}
