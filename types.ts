
export interface SummarySection {
  heading: string;
  points: string[];
}

export interface SummaryData {
  title: string;
  sections: SummarySection[];
}

export interface Question {
  id: number;
  text: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
}

export interface QuizData {
  questions: Question[];
}

export interface UploadedFile {
  name: string;
  mimeType: string;
  data: string; // Base64
}

export enum AppState {
  LANGUAGE_SELECT = 'LANGUAGE_SELECT',
  UPLOAD = 'UPLOAD',
  PROCESSING = 'PROCESSING',
  DASHBOARD = 'DASHBOARD',
}

export type Tab = 'summary' | 'quiz' | 'generator';

export type Language = 'en' | 'ar';

export type SummaryTone = 'formal' | 'friendly';