export interface User {
  id: number;
  email: string;
  name: string | null;
  college: string | null;
}

export interface Profile {
  user_id: number;
  branch: string | null;
  year: string | null;
  experience: string | null;
  career_goal: string | null;
  daily_time: string | null;
  interests: string[];
  onboarding_complete: number | boolean;
}

export interface Career {
  id: string;
  name: string;
  description: string;
  what_you_do: string;
  difficulty: string;
  languages: string[];
  skills: string[];
  tools: string[];
  typical_projects: string[];
  roadmap_beginner: string[];
  roadmap_intermediate: string[];
  roadmap_advanced: string[];
  internship_prep: string[];
  interview_prep: string[];
  match_traits: string[];
}

export interface SkillRow {
  id: string;
  name: string;
  category: string;
  status: "not_started" | "learning" | "practicing" | "completed";
  progress: number;
}

export interface Resource {
  id: string;
  title: string;
  platform: string;
  topic: string;
  difficulty: string;
  free: number;
  duration: string;
  description: string;
  link: string;
  why: string;
}

export interface ProjectItem {
  id: string;
  name: string;
  difficulty: string;
  technologies: string[];
  skills_learned: string[];
  description: string;
  features: string[];
  steps: string[];
  outcome: string;
  portfolio_value: string;
  career_tags: string[];
}

export interface DashboardData {
  user: User;
  profile: Profile | null;
  primaryCareer: Career | null;
  overallProgress: number;
  nextStep: { title: string; progress: number; why: string; skillId: string | null } | null;
  skills: SkillRow[];
  streak: number;
  readinessScore: number;
  upcomingGoals: string[];
}
