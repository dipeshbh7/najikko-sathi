export type Language = "en" | "ne";

export enum JobStatus {
  DISPATCHED = "DISPATCHED",
  ARRIVING = "ARRIVING",
  ARRIVED = "ARRIVED",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
}

export interface ServiceCategory {
  id: string;
  nameEn: string;
  nameNe: string;
  iconName: string; // Lucide icon name
  color: string; // Tailind class or hex value
  descEn: string;
  descNe: string;
  priceEn: string;
  priceNe: string;
}

export interface ServiceProvider {
  id: string;
  name: string;
  category: string;
  rating: number;
  completedJobs: number;
  phone: string;
  avatarUrl: string;
}

export interface Booking {
  id: string;
  categoryId: string;
  categoryName: string;
  technicianName: string;
  technicianPhone: string;
  technicianAvatar: string;
  problemScale: string; // "Minor" | "Moderate" | "Major"
  problemDetails: string;
  status: JobStatus;
  date: string;
  cost: string;
  address: string;
  isAiDiagnostic: boolean;
  diagnosticDetails?: {
    problemIdentified: string;
    estimatedCostRange: string;
    recommendedFixer: string;
    severity: string;
    immediateSteps: string[];
  };
  applianceName?: string;
  nextServicingIntervalDays?: number; // e.g., 90 days
  nextServicingReminderDate?: string; // ISO date string
  reminderTriggered?: boolean;
  finalAgreedCost?: string;
  rating?: number;
  feedbackText?: string;
  feedbackPhotoUrl?: string;
  feedbackTimestamp?: string;
}

export interface NotificationItem {
  id: string;
  titleEn: string;
  titleNe: string;
  bodyEn: string;
  bodyNe: string;
  timestamp: string;
  read: boolean;
}

export interface TrackingState {
  bookingId: string;
  technicianLat: number; // between 0 and 100 for simulated grid
  technicianLng: number; // between 0 and 100
  userLat: number;
  userLng: number;
  etaMinutes: number;
  bearing: number;
}
