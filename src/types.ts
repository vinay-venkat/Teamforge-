export type SpecialtyCategory = 
  | 'Engineering' 
  | 'UI/UX Design' 
  | 'AI / ML' 
  | 'Product & Pitch' 
  | 'Data Science' 
  | 'Mobile & IoT';

export type ExperienceLevel = 
  | 'Beginner' 
  | 'Intermediate' 
  | 'Experienced' 
  | 'Hackathon Winner';

export type AvailabilityStatus = 
  | 'Actively Looking' 
  | 'Open to Offers' 
  | 'Team Formed';

export type ProjectCategory = 
  | 'Hackathon' 
  | 'Research' 
  | 'Competition' 
  | 'Startup' 
  | 'Side Project';

export type ProjectStage = 
  | 'Ideation' 
  | 'Wireframing' 
  | 'Building MVP' 
  | 'Preparing Pitch & Submission';

export interface StudentSkill {
  name: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  category: 'code' | 'design' | 'ai' | 'business' | 'other';
}

export interface StudentProfile {
  id: string;
  name: string;
  avatar: string;
  email: string;
  university: string;
  major: string;
  year: string;
  bio: string;
  specialty: SpecialtyCategory;
  skills: StudentSkill[];
  interests: string[];
  experienceLevel: ExperienceLevel;
  availability: AvailabilityStatus;
  hoursPerWeek: number;
  githubUrl?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  pastProjectsCount: number;
  hackathonsAttended: number;
  badges: string[];
}

export interface ProjectRole {
  id: string;
  roleName: string;
  category: 'Engineering' | 'Design' | 'AI/Data' | 'Product/Pitch';
  requiredSkills: string[];
  responsibilities: string[];
  whyCrucial?: string;
  status: 'open' | 'filled';
  assignedMemberId?: string;
  assignedMemberName?: string;
  assignedMemberAvatar?: string;
}

export interface ProjectMember {
  userId: string;
  name: string;
  role: string;
  specialty: SpecialtyCategory;
  avatar: string;
  skills: string[];
}

export interface TeamBalanceBreakdown {
  engineering: number; // 0 - 100
  design: number;      // 0 - 100
  aiData: number;      // 0 - 100
  productPitch: number;// 0 - 100
  domainStrategy: number; // 0 - 100
  overallScore: number; // 0 - 100
  healthStatus: 'Balanced & Formidable' | 'Good Foundation' | 'Skill Imbalance Detected' | 'Critical Gaps';
  keyGapAlerts: string[];
  strengths: string[];
}

export interface Project {
  id: string;
  title: string;
  tagline: string;
  description: string;
  category: ProjectCategory;
  eventName?: string;
  deadline?: string;
  ownerId: string;
  ownerName: string;
  ownerAvatar: string;
  ownerUniversity: string;
  targetTeamSize: number;
  members: ProjectMember[];
  openRoles: ProjectRole[];
  tags: string[];
  stage: ProjectStage;
  createdAt: string;
  balanceBreakdown: TeamBalanceBreakdown;
  demoPitchVideoUrl?: string;
}

export interface ApplicationRequest {
  id: string;
  projectId: string;
  projectTitle: string;
  applicantId: string;
  applicantName: string;
  applicantAvatar: string;
  applicantUniversity: string;
  applicantSpecialty: SpecialtyCategory;
  applicantSkills: string[];
  targetRoleId: string;
  targetRoleName: string;
  pitchMessage: string;
  status: 'pending' | 'accepted' | 'declined';
  matchScore: number;
  createdAt: string;
}

export interface TeamInvitation {
  id: string;
  projectId: string;
  projectTitle: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  invitedUserId: string;
  invitedUserName: string;
  targetRoleId: string;
  targetRoleName: string;
  customNote: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  projectId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  content: string;
  timestamp: string;
  isSystem?: boolean;
}

export interface AiMatchResult {
  matchScore: number;
  bestFitRole: string;
  strengths: string[];
  gapCoverage: string;
  recommendationVerdict: string;
  discussionQuestions: string[];
}
