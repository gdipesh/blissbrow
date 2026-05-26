/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Service {
  id: string;
  name: string;
  price: number;
  category: string;
  duration: number; // in minutes
  description: string;
  sort_order: number;
  is_active: boolean;
}

export interface BusinessHours {
  id: string;
  day_index: number; // 0 for Sunday, 1 for Monday, etc.
  day_name: string;
  open_time: string; // e.g., "09:00"
  close_time: string; // e.g., "18:00"
  is_closed: boolean;
}

export interface BusinessInfo {
  id: string;
  business_name: string;
  phone: string;
  address_note: string;
  city: string;
  state: string;
  tagline: string;
  about_text: string;
}

export interface BlockedDate {
  id: string;
  date: string; // YYYY-MM-DD
  reason: string;
}

export type AppointmentStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

export interface Appointment {
  id: string;
  name: string;
  email: string;
  phone: string;
  service: string;
  service_price: number;
  date: string; // YYYY-MM-DD
  time_slot: string; // HH:MM
  notes?: string;
  status: AppointmentStatus;
  created_at: string;
}

export interface DatabaseSeedData {
  services: Service[];
  business_hours: BusinessHours[];
  business_info: BusinessInfo;
  blocked_dates: BlockedDate[];
}
