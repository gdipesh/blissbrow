/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createClient } from '@supabase/supabase-js';
import { 
  Service, 
  BusinessHours, 
  BusinessInfo, 
  BlockedDate, 
  Appointment, 
  AppointmentStatus 
} from '../types';

// Supabase environment keys (optional, will fallback to LocalStorage if not set)
const env = (import.meta as any).env || {};
const SUPABASE_URL = env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = env.VITE_SUPABASE_ANON_KEY || '';

// Detect if we have real configured keys, filtering out any empty states or default settings placeholders
export const isSupabaseConfigured = !!(
  SUPABASE_URL && 
  SUPABASE_ANON_KEY && 
  !SUPABASE_URL.includes('your-supabase-project') && 
  !SUPABASE_ANON_KEY.includes('your-anon-publicKey') &&
  SUPABASE_URL.startsWith('https://')
);

export const supabaseDiagnostics = {
  urlPassed: !!SUPABASE_URL,
  keyPassed: !!SUPABASE_ANON_KEY,
  isPlaceholderUrl: SUPABASE_URL.includes('your-supabase-project'),
  isPlaceholderKey: SUPABASE_ANON_KEY.includes('your-anon-publicKey'),
  startsWithHttps: SUPABASE_URL.startsWith('https://'),
  urlVal: SUPABASE_URL,
  keyLength: SUPABASE_ANON_KEY.length
};

export const supabase = isSupabaseConfigured 
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) 
  : null;

// ==========================================
// SEED DATA FOR BACKEND / LOCAL STORAGE FALLBACKS
// ==========================================

const INITIAL_SERVICES: Service[] = [
  { id: '1', name: 'Eyebrow Threading', price: 6, category: 'Threading', duration: 15, description: 'Gentle, meticulous brow mapping & shaping designed to define your eyes.', sort_order: 1, is_active: true },
  { id: '2', name: 'Upper Lip', price: 4, category: 'Threading', duration: 10, description: 'Quick and clean threading for smooth, hair-free upper lips.', sort_order: 2, is_active: true },
  { id: '3', name: 'Chin', price: 5, category: 'Threading', duration: 10, description: 'Smooth face finish clearing any unwanted chin hair.', sort_order: 3, is_active: true },
  { id: '4', name: 'Neck', price: 5, category: 'Threading', duration: 10, description: 'Removal of hairline or underchin fuzzy neck hair.', sort_order: 4, is_active: true },
  { id: '5', name: 'Forehead', price: 5, category: 'Threading', duration: 10, description: 'Clear threading of forehead fuzz for an overall even glow.', sort_order: 5, is_active: true },
  { id: '6', name: 'Sideburns', price: 10, category: 'Threading', duration: 15, description: 'Smooth facial hair threading around ears and cheeks.', sort_order: 6, is_active: true },
  { id: '7', name: 'Full Face', price: 22, category: 'Threading', duration: 40, description: 'Comprehensive threading: brows, forehead, cheeks, lip, chin & neck.', sort_order: 7, is_active: true },
  { id: '8', name: 'Henna', price: 10, category: 'Tinting', duration: 30, description: 'Natural henna brow tint to accent, style, and define arches. (By Appointment Only)', sort_order: 8, is_active: true },
];

const INITIAL_HOURS: BusinessHours[] = [
  { id: 'h0', day_index: 0, day_name: 'Sunday', open_time: '10:00', close_time: '16:00', is_closed: true },
  { id: 'h1', day_index: 1, day_name: 'Monday', open_time: '09:00', close_time: '18:00', is_closed: false },
  { id: 'h2', day_index: 2, day_name: 'Tuesday', open_time: '09:00', close_time: '18:00', is_closed: false },
  { id: 'h3', day_index: 3, day_name: 'Wednesday', open_time: '09:00', close_time: '18:00', is_closed: false },
  { id: 'h4', day_index: 4, day_name: 'Thursday', open_time: '09:00', close_time: '18:00', is_closed: false },
  { id: 'h5', day_index: 5, day_name: 'Friday', open_time: '09:00', close_time: '18:00', is_closed: false },
  { id: 'h6', day_index: 6, day_name: 'Saturday', open_time: '09:00', close_time: '16:00', is_closed: false },
];

const INITIAL_INFO: BusinessInfo = {
  id: '1',
  business_name: 'BrowBliss Threading',
  phone: '530-867-2298',
  address_note: 'Private home studio (exact address shared after booking)',
  city: 'Woodland',
  state: 'CA',
  tagline: 'Beautiful Brows, Happy You',
  about_text: 'BrowBliss Threading is a private home studio located in Woodland, CA run by an experienced specialist dedicated to high hygiene, custom styling, and exceptional hair removal precision. We deliver warm, cozy, and private experiences for all of our guests, with a focus on affordable pricing for beautiful brows.'
};

const INITIAL_BLOCKED: BlockedDate[] = [
  { id: 'b1', date: '2026-06-15', reason: 'Holiday Break' },
  { id: 'b2', date: '2026-07-04', reason: 'Independence Day' }
];

const INITIAL_APPOINTMENTS: Appointment[] = [
  { 
    id: 'a1', 
    name: 'Sarah Jenkins', 
    email: 'sarah.j@example.com', 
    phone: '530-555-0192', 
    service: 'Eyebrow Threading', 
    service_price: 6, 
    date: '2026-05-26', 
    time_slot: '10:30', 
    notes: 'Likes arches soft and natural.', 
    status: 'confirmed', 
    created_at: new Date(Date.now() - 2 * 3600000).toISOString() 
  },
  { 
    id: 'a2', 
    name: 'Jessica Miller', 
    email: 'jess.m@example.com', 
    phone: '530-555-0210', 
    service: 'Full Face', 
    service_price: 22, 
    date: '2026-05-26', 
    time_slot: '14:00', 
    notes: 'Very sensitive hair around lip area.', 
    status: 'pending', 
    created_at: new Date(Date.now() - 5 * 3600000).toISOString() 
  },
  { 
    id: 'a3', 
    name: 'Amandine Taylor', 
    email: 'amandine@example.com', 
    phone: '530-555-0783', 
    service: 'Eyebrow Threading', 
    service_price: 6, 
    date: '2026-05-27', 
    time_slot: '09:30', 
    notes: 'Wants neck threaded as well if possible!', 
    status: 'pending', 
    created_at: new Date(Date.now() - 10 * 3600000).toISOString() 
  },
  { 
    id: 'a4', 
    name: 'Emily Watson', 
    email: 'emily.w@example.com', 
    phone: '530-555-0348', 
    service: 'Henna', 
    service_price: 10, 
    date: '2026-05-25', 
    time_slot: '11:00', 
    notes: 'Looking for a lovely brow tint!', 
    status: 'completed', 
    created_at: new Date(Date.now() - 30 * 3600000).toISOString() 
  }
];

// Initialize localStorage if keys do not exist
const initLocalStorage = () => {
  if (!localStorage.getItem('bb_services')) {
    localStorage.setItem('bb_services', JSON.stringify(INITIAL_SERVICES));
  }
  if (!localStorage.getItem('bb_hours')) {
    localStorage.setItem('bb_hours', JSON.stringify(INITIAL_HOURS));
  }
  if (!localStorage.getItem('bb_info')) {
    localStorage.setItem('bb_info', JSON.stringify(INITIAL_INFO));
  }
  if (!localStorage.getItem('bb_blocked')) {
    localStorage.setItem('bb_blocked', JSON.stringify(INITIAL_BLOCKED));
  }
  if (!localStorage.getItem('bb_appointments')) {
    localStorage.setItem('bb_appointments', JSON.stringify(INITIAL_APPOINTMENTS));
  }
};

initLocalStorage();

// ==========================================
// DATA API INTERFACES
// ==========================================

export const db = {
  // SERVICES
  async getServices(): Promise<Service[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('services')
          .select('*')
          .order('sort_order', { ascending: true });
        if (!error && data) return data as Service[];
        if (error) console.warn('Supabase services query returned an error:', error);
      } catch (e) {
        console.warn('Failed to fetch services from Supabase, using LocalStorage fallback:', e);
      }
    }
    const val = localStorage.getItem('bb_services');
    return val ? JSON.parse(val) : INITIAL_SERVICES;
  },

  async saveServices(services: Service[]): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      try {
        // Upsert into Supabase services
        for (const service of services) {
          await supabase.from('services').upsert(service);
        }
      } catch (e) {
        console.warn('Failed to save services to Supabase, updating LocalStorage:', e);
      }
    }
    localStorage.setItem('bb_services', JSON.stringify(services));
  },

  // BUSINESS HOURS
  async getBusinessHours(): Promise<BusinessHours[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('business_hours')
          .select('*')
          .order('day_index', { ascending: true });
        if (!error && data) return data as BusinessHours[];
        if (error) console.warn('Supabase business_hours query returned an error:', error);
      } catch (e) {
        console.warn('Failed to fetch business hours from Supabase, using LocalStorage fallback:', e);
      }
    }
    const val = localStorage.getItem('bb_hours');
    if (val) {
      const parsed = JSON.parse(val);
      // Sort by day_index
      return parsed.sort((a: BusinessHours, b: BusinessHours) => a.day_index - b.day_index);
    }
    return INITIAL_HOURS;
  },

  async saveBusinessHours(hours: BusinessHours[]): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      try {
        for (const hr of hours) {
          await supabase.from('business_hours').upsert(hr);
        }
      } catch (e) {
        console.warn('Failed to save business hours to Supabase, updating LocalStorage:', e);
      }
    }
    localStorage.setItem('bb_hours', JSON.stringify(hours));
  },

  // BUSINESS INFO
  async getBusinessInfo(): Promise<BusinessInfo> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('business_info')
          .select('*')
          .maybeSingle();
        if (!error && data) return data as BusinessInfo;
        if (error) console.warn('Supabase business_info query returned an error:', error);
      } catch (e) {
        console.warn('Failed to fetch business info from Supabase, using LocalStorage fallback:', e);
      }
    }
    const val = localStorage.getItem('bb_info');
    return val ? JSON.parse(val) : INITIAL_INFO;
  },

  async saveBusinessInfo(info: BusinessInfo): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('business_info').upsert({ ...info, id: '1' });
      } catch (e) {
        console.warn('Failed to save business info to Supabase, updating LocalStorage:', e);
      }
    }
    localStorage.setItem('bb_info', JSON.stringify(info));
  },

  // BLOCKED DATES
  async getBlockedDates(): Promise<BlockedDate[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('blocked_dates')
          .select('*');
        if (!error && data) return data as BlockedDate[];
        if (error) console.warn('Supabase blocked_dates query returned an error:', error);
      } catch (e) {
        console.warn('Failed to fetch blocked dates from Supabase, using LocalStorage fallback:', e);
      }
    }
    const val = localStorage.getItem('bb_blocked');
    return val ? JSON.parse(val) : INITIAL_BLOCKED;
  },

  async saveBlockedDates(dates: BlockedDate[]): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      try {
        // Clear all and insert new ones
        await supabase.from('blocked_dates').delete().neq('id', '0');
        for (const item of dates) {
          await supabase.from('blocked_dates').insert({ date: item.date, reason: item.reason });
        }
      } catch (e) {
        console.warn('Failed to save blocked dates to Supabase, updating LocalStorage:', e);
      }
    }
    localStorage.setItem('bb_blocked', JSON.stringify(dates));
  },

  // APPOINTMENTS
  async getAppointments(): Promise<Appointment[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('appointments')
          .select('*')
          .order('date', { ascending: false });
        if (!error && data) return data as Appointment[];
        if (error) console.warn('Supabase appointments query returned an error:', error);
      } catch (e) {
        console.warn('Failed to fetch appointments from Supabase, using LocalStorage fallback:', e);
      }
    }
    const val = localStorage.getItem('bb_appointments');
    return val ? JSON.parse(val) : INITIAL_APPOINTMENTS;
  },

  async createAppointment(appointment: Omit<Appointment, 'id' | 'created_at' | 'status'>): Promise<Appointment> {
    const newAppointment: Appointment = {
      ...appointment,
      id: 'app_' + Math.random().toString(36).substr(2, 9),
      status: 'pending',
      created_at: new Date().toISOString()
    };

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('appointments')
          .insert(newAppointment)
          .select()
          .single();
        if (!error && data) return data as Appointment;
        if (error) console.warn('Supabase insert appointment returned an error:', error);
      } catch (e) {
        console.warn('Failed to build appointment in Supabase, updating LocalStorage fallback:', e);
      }
    }

    const appointments = await this.getAppointments();
    appointments.unshift(newAppointment);
    localStorage.setItem('bb_appointments', JSON.stringify(appointments));
    return newAppointment;
  },

  async updateAppointmentStatus(id: string, status: AppointmentStatus): Promise<Appointment | null> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('appointments')
          .update({ status })
          .eq('id', id)
          .select()
          .single();
        if (!error && data) return data as Appointment;
        if (error) console.warn('Supabase update status returned an error:', error);
      } catch (e) {
        console.warn('Failed to change appointment status on Supabase, changing LocalStorage:', e);
      }
    }

    const appointments = await this.getAppointments();
    const index = appointments.findIndex(app => app.id === id);
    if (index !== -1) {
      appointments[index].status = status;
      localStorage.setItem('bb_appointments', JSON.stringify(appointments));
      return appointments[index];
    }
    return null;
  },

  async deleteAppointment(id: string): Promise<boolean> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase
          .from('appointments')
          .delete()
          .eq('id', id);
        if (!error) return true;
        if (error) console.warn('Supabase delete appointment returned an error:', error);
      } catch (e) {
        console.warn('Failed to delete appointment from Supabase, removing from LocalStorage:', e);
      }
    }

    const appointments = await this.getAppointments();
    const filtered = appointments.filter(app => app.id !== id);
    localStorage.setItem('bb_appointments', JSON.stringify(filtered));
    return true;
  }
};
