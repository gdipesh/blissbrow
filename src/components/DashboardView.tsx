/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Briefcase, 
  Clock, 
  Calendar, 
  Phone, 
  ToggleLeft, 
  ToggleRight, 
  Plus, 
  Trash2, 
  Save, 
  Search, 
  Filter, 
  Settings, 
  Users, 
  CheckCircle, 
  XSquare, 
  MapPin, 
  FileCode, 
  Eye, 
  RefreshCw,
  Sparkles,
  Loader2,
  FileText
} from 'lucide-react';
import { 
  Appointment, 
  Service, 
  BusinessHours, 
  BusinessInfo, 
  BlockedDate, 
  AppointmentStatus 
} from '../types';

interface DashboardViewProps {
  appointments: Appointment[];
  services: Service[];
  businessHours: BusinessHours[];
  businessInfo: BusinessInfo;
  blockedDates: BlockedDate[];
  
  onUpdateStatus: (id: string, status: AppointmentStatus) => Promise<void>;
  onDeleteAppointment: (id: string) => Promise<void>;
  onSaveServices: (services: Service[]) => Promise<void>;
  onSaveBusinessHours: (hours: BusinessHours[]) => Promise<void>;
  onSaveBusinessInfo: (info: BusinessInfo) => Promise<void>;
  onSaveBlockedDates: (dates: BlockedDate[]) => Promise<void>;
  
  showToast: (msg: string, type: 'success' | 'error' | 'info') => void;
  setRoute: (route: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  appointments,
  services,
  businessHours,
  businessInfo,
  blockedDates,
  onUpdateStatus,
  onDeleteAppointment,
  onSaveServices,
  onSaveBusinessHours,
  onSaveBusinessInfo,
  onSaveBlockedDates,
  showToast,
  setRoute
}) => {
  // Main Tab Navigation
  const [activeTab, setActiveTab] = useState<'overview' | 'appointments' | 'settings'>('overview');
  
  // Settings Sub-Tabs
  const [settingsTab, setSettingsTab] = useState<'services' | 'hours' | 'info' | 'blocked' | 'export'>('services');

  // Appointments filter & search
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Settings State variables (Editable copies)
  const [editServices, setEditServices] = useState<Service[]>([]);
  const [editHours, setEditHours] = useState<BusinessHours[]>([]);
  const [editInfo, setEditInfo] = useState<BusinessInfo | null>(null);
  const [editBlocked, setEditBlocked] = useState<BlockedDate[]>([]);
  
  // New Blocked Date Input state
  const [newBlockedDate, setNewBlockedDate] = useState('');
  const [newBlockedReason, setNewBlockedReason] = useState('');

  // Synchronize internal editable state when props change
  useEffect(() => {
    setEditServices([...services]);
  }, [services]);

  useEffect(() => {
    setEditHours([...businessHours].sort((a,b) => a.day_index - b.day_index));
  }, [businessHours]);

  useEffect(() => {
    if (businessInfo) setEditInfo({ ...businessInfo });
  }, [businessInfo]);

  useEffect(() => {
    setEditBlocked([...blockedDates]);
  }, [blockedDates]);

  // ==========================================
  // CALCULATE STATS
  // ==========================================
  const todayStr = new Date().toISOString().split('T')[0];
  
  const totalBookings = appointments.length;
  const todayBookings = appointments.filter(a => a.date === todayStr && a.status !== 'cancelled').length;
  const pendingBookings = appointments.filter(a => a.status === 'pending').length;
  const confirmedBookings = appointments.filter(a => a.status === 'confirmed').length;

  // Filter appointments
  const filteredAppointments = appointments.filter(app => {
    const matchesSearch = app.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          app.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          app.phone.includes(searchTerm) || 
                          app.service.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // ==========================================
  // HANDLERS FOR SETTINGS
  // ==========================================

  // Services Edit Handlers
  const handleServiceFieldChange = (index: number, key: keyof Service, value: any) => {
    const updated = [...editServices];
    updated[index] = { ...updated[index], [key]: value };
    setEditServices(updated);
  };

  const handleSaveServices = async () => {
    try {
      await onSaveServices(editServices);
      showToast('Services and pricing list saved successfully!', 'success');
    } catch {
      showToast('Failed to save services.', 'error');
    }
  };

  // Business Hours Edit Handlers
  const handleHoursChange = (index: number, key: keyof BusinessHours, value: any) => {
    const updated = [...editHours];
    updated[index] = { ...updated[index], [key]: value };
    setEditHours(updated);
  };

  const handleSaveHours = async () => {
    try {
      await onSaveBusinessHours(editHours);
      showToast('Business hours saved successfully!', 'success');
    } catch {
      showToast('Failed to save business hours.', 'error');
    }
  };

  // Business Info Handlers
  const handleInfoChange = (key: keyof BusinessInfo, value: any) => {
    if (!editInfo) return;
    setEditInfo({ ...editInfo, [key]: value });
  };

  const handleSaveInfo = async () => {
    if (!editInfo) return;
    try {
      await onSaveBusinessInfo(editInfo);
      showToast('Business text and contact info updated.', 'success');
    } catch {
      showToast('Failed to update business info.', 'error');
    }
  };

  // Blocked Dates Handlers
  const handleAddBlockedDate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBlockedDate) {
      showToast('Please pick a calendar date to block.', 'error');
      return;
    }
    
    // Check if copy has this date already
    if (editBlocked.find(b => b.date === newBlockedDate)) {
      showToast('This date is already blocked.', 'info');
      return;
    }

    const newItem: BlockedDate = {
      id: 'blk_' + Math.random().toString(36).substr(2, 9),
      date: newBlockedDate,
      reason: newBlockedReason.trim() || 'Closed'
    };

    const updated = [...editBlocked, newItem];
    setEditBlocked(updated);
    
    try {
      await onSaveBlockedDates(updated);
      showToast(`Date ${newBlockedDate} is now blocked.`, 'success');
      setNewBlockedDate('');
      setNewBlockedReason('');
    } catch {
      showToast('Failed to save blocked date.', 'error');
    }
  };

  const handleDeleteBlockedDate = async (id: string) => {
    const updated = editBlocked.filter(b => b.id !== id);
    setEditBlocked(updated);
    try {
      await onSaveBlockedDates(updated);
      showToast('Date block removed successfully.', 'success');
    } catch {
      showToast('Failed to remove blocked date.', 'error');
    }
  };

  // Download SQL script helper
  const handleDownloadSQL = () => {
    const sqlContent = `
-- BrowBliss Threading Supabase Database Schema
-- Run this SQL command directly inside the Supabase SQL Editor

-- 1. Create Appointments Table
CREATE TABLE IF NOT EXISTS appointments (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  service TEXT NOT NULL,
  service_price NUMERIC NOT NULL,
  date DATE NOT NULL,
  time_slot TEXT NOT NULL,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Row Level Security (RLS) for appointments
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allows anonymous guest to book" 
  ON appointments FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Allows authenticated administrators full access" 
  ON appointments FOR ALL 
  TO authenticated 
  USING (true);

-- 2. Create Services Table
CREATE TABLE IF NOT EXISTS services (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price NUMERIC NOT NULL,
  category TEXT NOT NULL,
  duration INTEGER NOT NULL DEFAULT 15,
  description TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- Row Level Security for services
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read active services" 
  ON services FOR SELECT 
  USING (is_active = true);

CREATE POLICY "Admin full service management" 
  ON services FOR ALL 
  TO authenticated 
  USING (true);

-- 3. Create Business Hours Table
CREATE TABLE IF NOT EXISTS business_hours (
  id TEXT PRIMARY KEY,
  day_index INTEGER UNIQUE NOT NULL,
  day_name TEXT NOT NULL,
  open_time TEXT NOT NULL,
  close_time TEXT NOT NULL,
  is_closed BOOLEAN NOT NULL DEFAULT false
);

ALTER TABLE business_hours ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read business hours" 
  ON business_hours FOR SELECT 
  USING (true);

CREATE POLICY "Admin update business hours" 
  ON business_hours FOR ALL 
  TO authenticated 
  USING (true);

-- 4. Create Business Info Table
CREATE TABLE IF NOT EXISTS business_info (
  id TEXT PRIMARY KEY DEFAULT '1',
  business_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address_note TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  tagline TEXT NOT NULL,
  about_text TEXT NOT NULL
);

ALTER TABLE business_info ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public access business info" 
  ON business_info FOR SELECT 
  USING (true);

CREATE POLICY "Admin edit business settings" 
  ON business_info FOR ALL 
  TO authenticated 
  USING (true);

-- 5. Create Blocked Dates Table
CREATE TABLE IF NOT EXISTS blocked_dates (
  id TEXT PRIMARY KEY,
  date DATE NOT NULL UNIQUE,
  reason TEXT
);

ALTER TABLE blocked_dates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read blocked dates" 
  ON blocked_dates FOR SELECT 
  USING (true);

CREATE POLICY "Admin block calendar dates" 
  ON blocked_dates FOR ALL 
  TO authenticated 
  USING (true);

-- ================= SEED STAGE DATA =================

INSERT INTO services (id, name, price, category, duration, description, sort_order, is_active) VALUES
('1', 'Eyebrow Threading', 6, 'Threading', 15, 'Gentle, meticulous brow mapping & shaping designed to define your eyes.', 1, true),
('2', 'Upper Lip', 4, 'Threading', 10, 'Quick and clean threading for smooth, hair-free upper lips.', 2, true),
('3', 'Chin', 5, 'Threading', 10, 'Smooth face finish clearing any unwanted chin hair.', 3, true),
('4', 'Neck', 5, 'Threading', 10, 'Removal of hairline or underchin fuzzy neck hair.', 4, true),
('5', 'Forehead', 5, 'Threading', 10, 'Clear threading of forehead fuzz for an overall even glow.', 5, true),
('6', 'Sideburns', 10, 'Threading', 15, 'Smooth facial hair threading around ears and cheeks.', 6, true),
('7', 'Full Face', 22, 'Threading', 40, 'Includes brows, forehead, cheeks, lip, chin & neck.', 7, true),
('8', 'Henna', 10, 'Tinting', 30, 'Natural henna brow tint to accent and define. (By Appointment Only)', 8, true)
ON CONFLICT (id) DO UPDATE SET price = EXCLUDED.price;

INSERT INTO business_hours (id, day_index, day_name, open_time, close_time, is_closed) VALUES
('h0', 0, 'Sunday', '10:00', '16:00', true),
('h1', 1, 'Monday', '09:00', '18:00', false),
('h2', 2, 'Tuesday', '09:00', '18:00', false),
('h3', 3, 'Wednesday', '09:00', '18:00', false),
('h4', 4, 'Thursday', '09:00', '18:00', false),
('h5', 5, 'Friday', '09:00', '18:00', false),
('h6', 6, 'Saturday', '09:00', '16:00', false)
ON CONFLICT (day_index) DO UPDATE SET is_closed = EXCLUDED.is_closed, open_time = EXCLUDED.open_time, close_time = EXCLUDED.close_time;

INSERT INTO business_info (id, business_name, phone, address_note, city, state, tagline, about_text) VALUES
('1', 'BrowBliss Threading', '530-867-2298', 'Private home studio (exact address shared after booking)', 'Woodland', 'CA', 'Beautiful Brows, Happy You', 'BrowBliss Threading is a private home studio located in Woodland, CA run by an experienced specialist dedicated to high hygiene, custom styling, and exceptional hair removal precision.')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, tagline = EXCLUDED.tagline;
`;

    const blob = new Blob([sqlContent], { type: 'text/sql' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'supabase-setup.sql';
    a.click();
    window.URL.revokeObjectURL(url);
    showToast('supabase-setup.sql downloaded. Ready to paste in your SQL Editor!', 'success');
  };

  return (
    <div className="bg-cream min-h-screen text-charcoal font-sans">
      
      {/* ================= DASHBOARD HEADER ================= */}
      <div className="bg-white border-b border-blush/20 py-8 px-6 md:px-12 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1 text-center md:text-left">
          <div className="flex items-center gap-2 justify-center md:justify-start">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span className="text-[10px] font-sans tracking-widest text-dusty uppercase font-extrabold bg-blush/20 px-2.5 py-0.5 rounded-full">
              Administrative Command Center
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-charcoal">
            BrowBliss Management Console
          </h2>
          <p className="text-xs text-charcoal/60">
            Keep track of Woodland client calendars, customize menus, and schedule holiday blockdates.
          </p>
        </div>

        {/* Dynamic Route Toggle Row */}
        <div className="flex gap-2">
          {['overview', 'appointments', 'settings'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-5 py-2.5 rounded-2xl text-xs font-semibold tracking-wider uppercase transition-all shadow-sm cursor-pointer ${
                activeTab === tab
                  ? 'bg-dusty text-cream'
                  : 'bg-white border border-blush/20 text-charcoal hover:bg-cream/50'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* ================= MAIN CONTAINER ================= */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-10">
        
        {/* ================= OVERVIEW TAB ================= */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            
            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white border border-blush/20 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
                <div className="text-charcoal/40 text-xs uppercase tracking-widest font-semibold flex items-center gap-1.5 mb-2">
                  <Calendar size={14} className="text-dusty" />
                  Today
                </div>
                <div>
                  <p className="text-3xl font-serif font-black text-charcoal">{todayBookings}</p>
                  <p className="text-[10px] text-charcoal/50 mt-1">Confirmed/pending today</p>
                </div>
              </div>

              <div className="bg-white border border-blush/20 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
                <div className="text-charcoal/40 text-xs uppercase tracking-widest font-semibold flex items-center gap-1.5 mb-2">
                  <Loader2 size={14} className="text-gold animate-spin" />
                  Pending Reviews
                </div>
                <div>
                  <p className="text-3xl font-serif font-black text-charcoal">{pendingBookings}</p>
                  <p className="text-[10px] text-gold font-medium mt-1">Requires confirmation</p>
                </div>
              </div>

              <div className="bg-white border border-blush/20 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
                <div className="text-charcoal/40 text-xs uppercase tracking-widest font-semibold flex items-center gap-1.5 mb-2">
                  <CheckCircle size={14} className="text-emerald-500" />
                  Confirmed
                </div>
                <div>
                  <p className="text-3xl font-serif font-black text-emerald-600">{confirmedBookings}</p>
                  <p className="text-[10px] text-charcoal/50 mt-1">Arriving on schedule</p>
                </div>
              </div>

              <div className="bg-white border border-blush/20 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
                <div className="text-charcoal/40 text-xs uppercase tracking-widest font-semibold flex items-center gap-1.5 mb-2">
                  <Users size={14} className="text-dusty" />
                  Total Bookings
                </div>
                <div>
                  <p className="text-3xl font-serif font-black text-charcoal">{totalBookings}</p>
                  <p className="text-[10px] text-charcoal/50 mt-1">Historical guest list</p>
                </div>
              </div>
            </div>

            {/* Quick Pending List or Help Block */}
            <div className="bg-white rounded-3xl border border-blush/20 p-6 md:p-8 shadow-sm space-y-6">
              <div className="flex justify-between items-center border-b border-blush/10 pb-4">
                <h3 className="font-serif text-2xl font-bold text-charcoal flex items-center gap-2">
                  <Clock size={18} className="text-dusty" />
                  Outstanding Guest Inquiries
                </h3>
                <span className="text-xs font-semibold px-3 py-1 rounded bg-gold/15 text-gold">
                  {pendingBookings} awaiting approval
                </span>
              </div>

              {appointments.filter(a => a.status === 'pending').length === 0 ? (
                <div className="text-center py-12 text-charcoal/40 text-sm italic">
                  All guest queues are fully empty right now. Beautiful brows are sailing smooth!
                </div>
              ) : (
                <div className="divide-y divide-cream/60">
                  {appointments.filter(a => a.status === 'pending').map((app) => (
                    <div key={app.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-serif text-lg font-bold text-charcoal">{app.name}</p>
                          <span className="bg-blush/25 text-dusty font-semibold text-[10px] tracking-wide uppercase px-2 py-0.5 rounded-full">
                            {app.service}
                          </span>
                        </div>
                        <div className="flex items-center gap-x-4 gap-y-1 text-xs text-charcoal/50 flex-wrap mt-1">
                          <span className="flex items-center gap-1">
                            <Calendar size={12} />
                            {new Date(app.date + 'T12:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Clock size={12} />
                            {app.time_slot}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Phone size={12} />
                            {app.phone}
                          </span>
                        </div>
                        {app.notes && (
                          <p className="text-xs text-charcoal/60 bg-cream/30 border border-blush/10 rounded-lg p-2 mt-2 italic font-light">
                            Notes: "{app.notes}"
                          </p>
                        )}
                      </div>

                      {/* Approval Buttons */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => onUpdateStatus(app.id, 'confirmed')}
                          className="bg-emerald-600 hover:bg-emerald-700 text-cream text-[11px] font-bold tracking-wider uppercase py-2 px-3.5 rounded-xl cursor-pointer transition-all"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => onUpdateStatus(app.id, 'cancelled')}
                          className="bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-100 text-[11px] font-bold tracking-wider uppercase py-2 px-3.5 rounded-xl cursor-pointer transition-all"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

        {/* ================= APPOINTMENTS TABLE TAB ================= */}
        {activeTab === 'appointments' && (
          <div className="bg-white rounded-3xl border border-blush/20 p-6 md:p-8 shadow-sm space-y-6">
            
            {/* Table Controls */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-cream/20 p-4 rounded-2xl border border-blush/10">
              
              {/* Search */}
              <div className="relative w-full md:w-72">
                <Search className="absolute left-3.5 top-3 text-dusty" size={16} />
                <input
                  type="text"
                  placeholder="Query guest name, phone, service..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white border border-blush/25 focus:border-dusty focus:outline-none rounded-xl py-2 pl-10 pr-4 text-xs font-sans text-charcoal"
                />
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                <Filter className="text-dusty shrink-0" size={14} />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-white border border-blush/25 text-xs rounded-xl focus:border-dusty focus:outline-none p-2 font-sans text-charcoal cursor-pointer"
                >
                  <option value="all">All Booking Statuses</option>
                  <option value="pending">Pending Review</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>

            {/* Main Grid View */}
            <div className="overflow-x-auto rounded-2xl border border-cream">
              <table className="w-full border-collapse font-sans text-xs">
                <thead>
                  <tr className="bg-cream/40 text-charcoal/70 uppercase tracking-widest text-[10px] border-b border-blush/15">
                    <th className="py-4 px-4 text-left font-semibold">Guest</th>
                    <th className="py-4 px-4 text-left font-semibold">Treatment</th>
                    <th className="py-4 px-4 text-left font-semibold">Date & Clock Block</th>
                    <th className="py-4 px-4 text-left font-semibold">Live Price</th>
                    <th className="py-4 px-4 text-left font-semibold">Current Queue Status</th>
                    <th className="py-4 px-4 text-center font-semibold">Security Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cream">
                  {filteredAppointments.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-16 text-charcoal/40 italic">
                        No appointments found matching this filter query.
                      </td>
                    </tr>
                  ) : (
                    filteredAppointments.map((app) => (
                      <tr key={app.id} className="hover:bg-cream/10 transition-colors">
                        {/* Guest details */}
                        <td className="py-4 px-4">
                          <div>
                            <p className="font-semibold text-charcoal text-sm">{app.name}</p>
                            <p className="text-[10px] text-charcoal/40">{app.email}</p>
                            <p className="text-[10px] font-mono text-dusty font-bold">{app.phone}</p>
                          </div>
                        </td>

                        {/* Treatment */}
                        <td className="py-4 px-4">
                          <span className="font-semibold text-charcoal text-[11px] uppercase tracking-wider">{app.service}</span>
                        </td>

                        {/* Date & Time */}
                        <td className="py-4 px-4">
                          <div>
                            <p className="font-medium text-charcoal/80">
                              {new Date(app.date + 'T12:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                            </p>
                            <p className="text-[10px] font-mono text-dusty font-semibold">{app.time_slot}</p>
                          </div>
                        </td>

                        {/* Fee */}
                        <td className="py-4 px-4 text-sm font-bold text-charcoal font-serif">
                          ${app.service_price}
                        </td>

                        {/* Current Queue Status */}
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-1.5">
                            <span className={`inline-flex items-center gap-1 font-sans text-[10px] font-extrabold uppercase tracking-wide px-2.5 py-0.5 rounded-full ${
                              app.status === 'confirmed' ? 'bg-emerald-100 text-emerald-800' :
                              app.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                              app.status === 'completed' ? 'bg-indigo-100 text-indigo-800' :
                              'bg-rose-100 text-rose-800'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${
                                app.status === 'confirmed' ? 'bg-emerald-500' :
                                app.status === 'pending' ? 'bg-amber-500 animate-pulse' :
                                app.status === 'completed' ? 'bg-indigo-500' :
                                'bg-rose-500'
                              }`}></span>
                              {app.status}
                            </span>
                          </div>
                          {app.notes && (
                            <p className="text-[10px] text-charcoal/40 mt-1 max-w-[180px] break-words italic">
                              "{app.notes}"
                            </p>
                          )}
                        </td>

                        {/* Action buttons */}
                        <td className="py-2 px-4">
                          <div className="flex items-center justify-center gap-1.5 flex-wrap">
                            <select
                              value={app.status}
                              onChange={(e) => onUpdateStatus(app.id, e.target.value as AppointmentStatus)}
                              className="bg-cream/40 border border-blush/20 text-[10px] rounded p-1 font-semibold focus:outline-none cursor-pointer"
                            >
                              <option value="pending">Set Pending</option>
                              <option value="confirmed">Confirm</option>
                              <option value="cancelled">Cancel</option>
                              <option value="completed">Completed</option>
                            </select>
                            
                            <button
                              onClick={() => {
                                if (confirm(`Delete the reservation for ${app.name}?`)) {
                                  onDeleteAppointment(app.id);
                                }
                              }}
                              className="p-1 rounded text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer"
                              title="Delete Appointment"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= SETTINGS TABS ================= */}
        {activeTab === 'settings' && (
          <div className="flex flex-col lg:flex-row gap-8">
            
            {/* Sub Nav vertical tabs */}
            <div className="lg:w-1/4 bg-white border border-blush/20 rounded-3xl p-5 shadow-sm space-y-1 h-fit self-start w-full">
              {[
                { tab: 'services', label: 'Services & Pricing', icon: Briefcase },
                { tab: 'hours', label: 'Business Hours', icon: Clock },
                { tab: 'info', label: 'Business Info', icon: MapPin },
                { tab: 'blocked', label: 'Blocked Dates', icon: Calendar },
                { tab: 'export', label: 'Supabase SQL / Export', icon: FileCode }
              ].map((s) => {
                const Icon = s.icon;
                return (
                  <button
                    key={s.tab}
                    onClick={() => setSettingsTab(s.tab as any)}
                    className={`w-full text-left px-4 py-3 rounded-2xl text-xs font-semibold uppercase tracking-wider flex items-center gap-2.5 transition-all cursor-pointer ${
                      settingsTab === s.tab
                        ? 'bg-dusty text-cream'
                        : 'text-charcoal hover:bg-cream/40'
                    }`}
                  >
                    <Icon size={14} />
                    {s.label}
                  </button>
                );
              })}
            </div>

            {/* Master Settings Sub-Panels */}
            <div className="lg:w-3/4 flex-grow bg-white border border-blush/20 rounded-3xl p-6 md:p-8 shadow-sm">
              
              {/* 1. SERVICES AND PRICING EDITOR */}
              {settingsTab === 'services' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center border-b border-blush/10 pb-4">
                    <div>
                      <h3 className="font-serif text-2xl font-bold text-charcoal">Edit Services, Speeds, & Prices</h3>
                      <p className="text-xs text-charcoal/50 font-light leading-none mt-1">Changes are instantly published to homepage and date booking card.</p>
                    </div>
                    <button
                      onClick={handleSaveServices}
                      className="px-4 py-2 bg-dusty text-cream hover:bg-dusty/90 hover:scale-[1.01] rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Save size={12} />
                      Save List
                    </button>
                  </div>

                  <div className="space-y-4">
                    {editServices.map((service, idx) => (
                      <div key={service.id} className="p-4 rounded-2xl bg-cream/15 border border-blush/10 grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                        <div className="md:col-span-4 font-serif text-base font-bold text-charcoal flex items-center gap-2">
                          <span className="text-xs font-mono text-dusty bg-white border border-blush/20 w-5 h-5 rounded-full flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <input
                            type="text"
                            value={service.name}
                            onChange={(e) => handleServiceFieldChange(idx, 'name', e.target.value)}
                            className="bg-transparent border-b border-dashed border-blush/30 focus:border-dusty focus:outline-none px-1 w-full text-base font-serif font-bold text-charcoal"
                          />
                        </div>

                        <div className="md:col-span-2 flex items-center gap-1.5 focus-within:text-dusty text-charcoal/60">
                          <span className="text-sm font-bold text-dusty font-serif">$</span>
                          <input
                            type="number"
                            value={service.price}
                            onChange={(e) => handleServiceFieldChange(idx, 'price', Number(e.target.value))}
                            className="w-16 text-sm font-serif font-bold bg-white text-charcoal border border-blush/20 rounded-lg p-1 text-center"
                          />
                          <span className="text-[10px] text-charcoal/40 uppercase">Fee</span>
                        </div>

                        <div className="md:col-span-2 flex items-center gap-1.5 text-charcoal/60">
                          <input
                            type="number"
                            value={service.duration}
                            onChange={(e) => handleServiceFieldChange(idx, 'duration', Number(e.target.value))}
                            className="w-14 text-xs font-semibold bg-white text-charcoal border border-blush/20 rounded-lg p-1 text-center"
                          />
                          <span className="text-[10px] text-charcoal/40 uppercase">Mins</span>
                        </div>

                        <div className="md:col-span-4 flex justify-between items-center gap-2">
                          <input
                            type="text"
                            placeholder="Description details"
                            value={service.description || ''}
                            onChange={(e) => handleServiceFieldChange(idx, 'description', e.target.value)}
                            className="bg-white border text-xs text-charcoal border-blush/20 rounded-lg p-1 flex-grow focus:outline-none"
                          />
                          
                          <button
                            onClick={() => handleServiceFieldChange(idx, 'is_active', !service.is_active)}
                            className="p-1 cursor-pointer"
                            title={service.is_active ? 'Service is live.' : 'Service is hidden.'}
                          >
                            {service.is_active ? (
                              <ToggleRight size={24} className="text-dusty" />
                            ) : (
                              <ToggleLeft size={24} className="text-charcoal/30" />
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 2. BUSINESS HOURS EDITOR */}
              {settingsTab === 'hours' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center border-b border-blush/10 pb-4">
                    <div>
                      <h3 className="font-serif text-2xl font-bold text-charcoal">Edit Studio Open Hours</h3>
                      <p className="text-xs text-charcoal/50 font-light mt-1 text-left">Configure open block, close block, or shut down days. Booking calendar respects this.</p>
                    </div>
                    <button
                      onClick={handleSaveHours}
                      className="px-4 py-2 bg-dusty text-cream hover:bg-dusty/90 hover:scale-[1.01] rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Save size={12} />
                      Save Hours
                    </button>
                  </div>

                  <div className="space-y-4">
                    {editHours.map((hr, idx) => (
                      <div key={hr.id} className="p-4 rounded-2xl bg-cream/15 border border-blush/10 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                        <div className="sm:col-span-3 font-semibold text-charcoal flex items-center gap-2 text-sm">
                          <Clock size={14} className="text-dusty" />
                          {hr.day_name}
                        </div>

                        <div className="sm:col-span-6 flex items-center gap-2 justify-center">
                          <input
                            type="time"
                            disabled={hr.is_closed}
                            value={hr.open_time}
                            onChange={(e) => handleHoursChange(idx, 'open_time', e.target.value)}
                            className="bg-white border border-blush/25 text-xs text-charcoal font-mono rounded-lg p-1.5 text-center focus:outline-none focus:border-dusty disabled:opacity-30"
                          />
                          <span className="text-xs text-charcoal/40">to</span>
                          <input
                            type="time"
                            disabled={hr.is_closed}
                            value={hr.close_time}
                            onChange={(e) => handleHoursChange(idx, 'close_time', e.target.value)}
                            className="bg-white border border-blush/25 text-xs text-charcoal font-mono rounded-lg p-1.5 text-center focus:outline-none focus:border-dusty disabled:opacity-30"
                          />
                        </div>

                        <div className="sm:col-span-3 flex justify-end">
                          <button
                            onClick={() => handleHoursChange(idx, 'is_closed', !hr.is_closed)}
                            className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-colors cursor-pointer ${
                              hr.is_closed 
                                ? 'bg-rose-50 border border-rose-200 text-rose-600' 
                                : 'bg-emerald-50 border border-emerald-200 text-emerald-700'
                            }`}
                          >
                            {hr.is_closed ? 'Closed Day' : 'Open Day'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 3. BUSINESS INFO */}
              {settingsTab === 'info' && editInfo && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center border-b border-blush/10 pb-4">
                    <div>
                      <h3 className="font-serif text-2xl font-bold text-charcoal">Edit Studio Texts & Slogans</h3>
                      <p className="text-xs text-charcoal/50 font-light mt-1">Core telephone settings, address privacy guidelines, and welcome notes.</p>
                    </div>
                    <button
                      onClick={handleSaveInfo}
                      className="px-4 py-2 bg-dusty text-cream hover:bg-dusty/90 hover:scale-[1.01] rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Save size={12} />
                      Save Details
                    </button>
                  </div>

                  <div className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-semibold uppercase tracking-wider text-charcoal/50 mb-1.5">Business Name</label>
                        <input
                          type="text"
                          value={editInfo.business_name}
                          onChange={(e) => handleInfoChange('business_name', e.target.value)}
                          className="w-full bg-cream/10 border border-blush/20 focus:border-dusty focus:outline-none rounded-xl py-2 px-3 text-xs text-charcoal"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-[11px] font-semibold uppercase tracking-wider text-charcoal/50 mb-1.5">Phone Contact (Call or Text)</label>
                        <input
                          type="text"
                          value={editInfo.phone}
                          onChange={(e) => handleInfoChange('phone', e.target.value)}
                          className="w-full bg-cream/10 border border-blush/20 focus:border-dusty focus:outline-none rounded-xl py-2 px-3 text-xs text-charcoal"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold uppercase tracking-wider text-charcoal/50 mb-1.5">Address Note / Disclaimer</label>
                      <input
                        type="text"
                        value={editInfo.address_note}
                        onChange={(e) => handleInfoChange('address_note', e.target.value)}
                        className="w-full bg-cream/10 border border-blush/20 focus:border-dusty focus:outline-none rounded-xl py-2 px-3 text-xs text-charcoal"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-semibold uppercase tracking-wider text-charcoal/50 mb-1.5">City</label>
                        <input
                          type="text"
                          value={editInfo.city}
                          onChange={(e) => handleInfoChange('city', e.target.value)}
                          className="w-full bg-cream/10 border border-blush/20 focus:border-dusty focus:outline-none rounded-xl py-2 px-3 text-xs text-charcoal"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold uppercase tracking-wider text-charcoal/50 mb-1.5">State Code</label>
                        <input
                          type="text"
                          value={editInfo.state}
                          onChange={(e) => handleInfoChange('state', e.target.value)}
                          className="w-full bg-cream/10 border border-blush/20 focus:border-dusty focus:outline-none rounded-xl py-2 px-3 text-xs text-charcoal"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold uppercase tracking-wider text-charcoal/50 mb-1.5">Business Slogan / Tagline</label>
                      <input
                        type="text"
                        value={editInfo.tagline}
                        onChange={(e) => handleInfoChange('tagline', e.target.value)}
                        className="w-full bg-cream/10 border border-blush/20 focus:border-dusty focus:outline-none rounded-xl py-2 px-3 text-xs text-charcoal"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold uppercase tracking-wider text-charcoal/50 mb-1.5">About Us Text</label>
                      <textarea
                        rows={4}
                        value={editInfo.about_text}
                        onChange={(e) => handleInfoChange('about_text', e.target.value)}
                        className="w-full bg-cream/10 border border-blush/20 focus:border-dusty focus:outline-none rounded-xl py-2 px-3 text-xs text-charcoal resize-none font-sans leading-relaxed"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* 4. BLOCKED DATES EDITOR */}
              {settingsTab === 'blocked' && (
                <div className="space-y-6">
                  <div className="border-b border-blush/10 pb-4">
                    <h3 className="font-serif text-2xl font-bold text-charcoal">Block Calendar Dates</h3>
                    <p className="text-xs text-charcoal/50 font-light mt-1">Block specific days for vacations, public holidays, or resting days. Blocked days instantly disable on the booking map.</p>
                  </div>

                  {/* Add Blocked Date Form */}
                  <form onSubmit={handleAddBlockedDate} className="bg-cream/15 p-5 border border-blush/10 rounded-2xl grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <div>
                      <label className="block text-[11px] font-semibold uppercase tracking-wider text-charcoal/50 mb-1.5">Date to Block</label>
                      <input
                        type="date"
                        required
                        value={newBlockedDate}
                        onChange={(e) => setNewBlockedDate(e.target.value)}
                        className="bg-white border border-blush/25 text-xs text-charcoal rounded-xl py-2 px-3 w-full focus:outline-none focus:border-dusty font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold uppercase tracking-wider text-charcoal/50 mb-1.5">Reason e.g. Christmas Day</label>
                      <input
                        type="text"
                        placeholder="Holiday break, custom rest..."
                        value={newBlockedReason}
                        onChange={(e) => setNewBlockedReason(e.target.value)}
                        className="bg-white border border-blush/25 text-xs text-charcoal rounded-xl py-2 px-3 w-full focus:outline-none focus:border-dusty"
                      />
                    </div>

                    <button
                      type="submit"
                      className="bg-dusty hover:bg-dusty/95 hover:scale-[1.01] text-cream py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1 cursor-pointer shadow-md"
                    >
                      <Plus size={14} />
                      Insert Block
                    </button>
                  </form>

                  {/* Active blocks list */}
                  <div className="space-y-2.5">
                    <h4 className="text-xs font-semibold text-charcoal uppercase tracking-widest">Active Calendar Blocks</h4>
                    
                    {editBlocked.length === 0 ? (
                      <div className="p-6 text-center text-charcoal/40 text-xs italic bg-cream/10 border border-dashed border-blush/15 rounded-2xl">
                        No custom calendar dates are blocked right now.
                      </div>
                    ) : (
                      <div className="divide-y divide-cream/60">
                        {editBlocked.map(b => (
                          <div key={b.id} className="py-3 flex justify-between items-center bg-white">
                            <div className="flex items-center gap-3">
                              <span className="font-mono text-xs text-dusty font-bold bg-blush/10 border border-blush/20 rounded px-2.5 py-0.5">
                                {b.date}
                              </span>
                              <span className="text-xs font-medium text-charcoal/80 italic font-sans">— {b.reason}</span>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleDeleteBlockedDate(b.id)}
                              className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 p-1 rounded-lg transition-colors cursor-pointer"
                              title="Delete Block"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 5. SUPABASE / EXPORT PANEL */}
              {settingsTab === 'export' && (
                <div className="space-y-6">
                  <div className="border-b border-blush/10 pb-4">
                    <h3 className="font-serif text-2xl font-bold text-charcoal">Supabase Integration & Export Guidance</h3>
                    <p className="text-xs text-charcoal/50 font-light mt-1 text-left">Your code is 100% prepared to run against remote Supabase backends. Read instructions to synchronize schemas.</p>
                  </div>

                  <div className="space-y-4">
                    <div className="p-5 rounded-2xl bg-cream/20 border border-blush/10 text-xs text-charcoal/80 space-y-3 leading-relaxed font-sans">
                      <p className="font-semibold text-dusty">Database Deployment Steps:</p>
                      <ul className="list-decimal pl-4 space-y-1.5 font-light">
                        <li>Press the **Download SQL Script** button below to grab the structured schema script.</li>
                        <li>Log in to your **Supabase Dashboard** (https://supabase.com).</li>
                        <li>Open the **SQL Editor** tab inside your Supabase project layout.</li>
                        <li>Paste and run the downloaded SQL query lines directly to create all tables (appointments, services, info, blocked_dates, business_hours).</li>
                        <li>Configure the environment keys inside your **Settings / Env variables** panel (`VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`).</li>
                      </ul>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        onClick={handleDownloadSQL}
                        className="px-6 py-3.5 bg-dusty text-cream hover:bg-dusty/90 hover:scale-[1.01] rounded-full text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
                      >
                        <FileCode size={14} />
                        Download SQL Script
                      </button>
                      
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        )}

      </div>
    </div>
  );
};
