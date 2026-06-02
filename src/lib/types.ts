// ============================================================
// AI Resume Builder — Core TypeScript Types
// ============================================================

// --- Database Entity Types ---

export interface UserProfile {
  user_id: string;
  full_name: string;
  email: string;
  location: string | null;
  target_roles: string[] | null;
  experience_years: number | null;
  avatar_url: string | null;
  github_username: string | null;
  created_at: string;
  updated_at: string;
}

export interface Resume {
  id: string;
  user_id: string;
  file_url: string;
  parsed_text: string | null;
  file_name: string;
  created_at: string;
}

export interface ResumeVersion {
  id: string;
  resume_id: string;
  job_id: string;
  ats_score: number;
  content_json: ResumeContent;
  pdf_url: string | null;
  changes_json: ResumeChanges | null;
  generated_at: string;
}

export interface Job {
  id: string;
  user_id: string;
  company_name: string;
  title: string;
  description: string;
  extracted_skills: string[] | null;
  embedding: number[] | null;
  ats_report: ATSReport | null;
  created_at: string;
}

export interface Application {
  id: string;
  user_id: string;
  job_id: string;
  resume_version_id: string;
  status: ApplicationStatus;
  applied_at: string;
  interview_at: string | null;
  offer_at: string | null;
}

export type ApplicationStatus =
  | "draft"
  | "applied"
  | "screening"
  | "interview"
  | "offer"
  | "rejected"
  | "accepted";

// --- Knowledge Graph ---

export interface UserSkill {
  id: string;
  user_id: string;
  skill_name: string;
  category: SkillCategory;
  sources_json: SkillSource[];
  confidence: number;
  verified: boolean;
  created_at: string;
  updated_at: string;
}

export type SkillCategory =
  | "language"
  | "framework"
  | "tool"
  | "platform"
  | "database"
  | "concept"
  | "soft_skill"
  | "other";

export interface SkillSource {
  type: "resume" | "github_repo" | "certificate" | "manual";
  name: string;
  evidence: string;
  url?: string;
}

// --- AI Cache ---

export interface AICache {
  id: string;
  cache_key: string;
  prompt_hash: string;
  response: string;
  model: string;
  tokens_used: number;
  created_at: string;
  expires_at: string;
}

// --- Analytics ---

export interface AnalyticsEvent {
  id: string;
  user_id: string;
  event_type: AnalyticsEventType;
  event_data: Record<string, unknown>;
  created_at: string;
}

export type AnalyticsEventType =
  | "resume_generated"
  | "resume_downloaded"
  | "job_applied"
  | "interview_received"
  | "offer_received"
  | "job_analyzed"
  | "skills_verified"
  | "github_connected";

// --- Agent Hooks (Future) ---

export interface AgentTask {
  id: string;
  user_id: string;
  task_type: string;
  status: "pending" | "running" | "completed" | "failed";
  input_data: Record<string, unknown>;
  output_data: Record<string, unknown> | null;
  created_at: string;
  completed_at: string | null;
}

// --- Subscriptions ---

export interface UserSubscription {
  id: string;
  user_id: string;
  plan: SubscriptionPlan;
  resumes_used: number;
  analyses_used: number;
  period_start: string;
  period_end: string;
  created_at: string;
}

export type SubscriptionPlan = "free" | "pro" | "premium";

export const PLAN_LIMITS: Record<SubscriptionPlan, { resumes: number; analyses: number }> = {
  free: { resumes: 5, analyses: 10 },
  pro: { resumes: -1, analyses: -1 }, // -1 = unlimited
  premium: { resumes: -1, analyses: -1 },
};

// --- Resume Content (Generated) ---

export interface ResumeContent {
  personal: {
    name: string;
    email: string;
    phone?: string;
    location?: string;
    linkedin?: string;
    github?: string;
    website?: string;
  };
  summary: string;
  experience: ExperienceEntry[];
  education: EducationEntry[];
  skills: { category: string; items: string[] }[];
  projects: ProjectEntry[];
  certifications?: CertificationEntry[];
}

export interface ExperienceEntry {
  title: string;
  company: string;
  location?: string;
  start_date: string;
  end_date: string | null;
  bullets: string[];
}

export interface EducationEntry {
  degree: string;
  institution: string;
  location?: string;
  graduation_date: string;
  gpa?: string;
  highlights?: string[];
}

export interface ProjectEntry {
  name: string;
  description: string;
  technologies: string[];
  url?: string;
  bullets: string[];
}

export interface CertificationEntry {
  name: string;
  issuer: string;
  date: string;
  url?: string;
}

// --- Resume Diffing ---

export interface ResumeChanges {
  added: string[];
  removed: string[];
  changed: { from: string; to: string }[];
}

// --- ATS Report ---

export interface ATSReport {
  overall_score: number;
  keyword_match: {
    matched: string[];
    missing: string[];
    match_percentage: number;
  };
  skills_gap: {
    required: string[];
    user_has: string[];
    user_missing: string[];
  };
  recommendations: string[];
  format_score: number;
  content_score: number;
}

// --- GitHub Analysis ---

export interface GitHubProfile {
  username: string;
  repos: GitHubRepo[];
  top_languages: { name: string; percentage: number }[];
  total_commits: number;
  contribution_score: number;
  profile_url: string;
}

export interface GitHubRepo {
  name: string;
  description: string | null;
  language: string | null;
  stars: number;
  forks: number;
  topics: string[];
  url: string;
  complexity_score: number;
}

// --- API Response Types ---

export interface APIResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
