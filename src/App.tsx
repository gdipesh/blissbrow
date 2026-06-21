/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { db, supabase, isSupabaseConfigured } from './lib/db';
import { 
  Service, 
  BusinessHours, 
  BusinessInfo, 
  BlockedDate, 
  Appointment, 
  AppointmentStatus 
} from './types';
import { Header } from './components/Header';
import { HomeView } from './components/HomeView';
import { BookView } from './components/BookView';
import { AuthView } from './components/AuthView';
import { DashboardView } from './components/DashboardView';
import { Notification, ToastType } from './components/Notification';
import { Sparkles, HelpCircle, PhoneCall, Heart } from 'lucide-react';

export default function App() {
  // Routes State ('/' | '/book' | '/authenticate' | '/dashboard')
  const [currentRoute, setRoute] = useState<string>('/');
  
  // Administrative Login Session
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    return sessionStorage.getItem('bb_admin_session') === 'true';
  });

  // DB States
  const [services, setServices] = useState<Service[]>([]);
  const [businessHours, setBusinessHours] = useState<BusinessHours[]>([]);
  const [businessInfo, setBusinessInfo] = useState<BusinessInfo>({
    id: '1',
    business_name: 'BrowBliss Threading',
    phone: '530-867-2298',
    address_note: 'Private home studio (exact address shared after booking)',
    city: 'Woodland',
    state: 'CA',
    tagline: 'Beautiful Brows, Happy You',
    about_text: 'BrowBliss Threading is a private home studio...'
  });
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  // Toast / Status Notification States
  const [toast, setToast] = useState<{ message: string; type: ToastType; isVisible: boolean }>({
    message: '',
    type: 'success',
    isVisible: false
  });

  // Load all initial db settings and appointments
  const loadDatabase = async () => {
    try {
      const dbServices = await db.getServices();
      const dbHours = await db.getBusinessHours();
      const dbInfo = await db.getBusinessInfo();
      const dbBlocked = await db.getBlockedDates();
      const dbAppointments = await db.getAppointments();

      setServices(dbServices);
      setBusinessHours(dbHours);
      setBusinessInfo(dbInfo);
      setBlockedDates(dbBlocked);
      setAppointments(dbAppointments);
    } catch (e) {
      triggerToast('Error synchronizing database adapter details.', 'error');
    }
  };

  // Load all database parameters, syncing state when login mode shifts
  useEffect(() => {
    loadDatabase();
  }, [isAdminLoggedIn]);

  // Subscribe to live Supabase authorization state changes to seamlessly handle active sessions
  useEffect(() => {
    if (isSupabaseConfigured && supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if (session?.user) {
          setIsAdminLoggedIn(true);
          sessionStorage.setItem('bb_admin_session', 'true');
        } else if (event === 'SIGNED_OUT') {
          setIsAdminLoggedIn(false);
          sessionStorage.setItem('bb_admin_session', 'false');
        }
        // Always refresh database state on auth transitions
        loadDatabase();
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, []);

  // Show Toast Dialog
  const triggerToast = (message: string, type: ToastType) => {
    setToast({
      message,
      type,
      isVisible: true
    });
  };

  const closeToast = () => {
    setToast(prev => ({ ...prev, isVisible: false }));
  };

  // ==========================================
  // DISPATCH CRUD ACTIONS
  // ==========================================

  const handleCreateAppointment = async (newApp: Omit<Appointment, 'id' | 'created_at' | 'status'>): Promise<Appointment> => {
    const app = await db.createAppointment(newApp);
    // Reload local list
    const updatedApps = await db.getAppointments();
    setAppointments(updatedApps);
    return app;
  };

  const handleUpdateStatus = async (id: string, status: AppointmentStatus) => {
    try {
      await db.updateAppointmentStatus(id, status);
      const updatedApps = await db.getAppointments();
      setAppointments(updatedApps);
      triggerToast(`Appointment is now successfully updated to: ${status}`, 'success');
    } catch {
      triggerToast('Failed to change appointment status.', 'error');
    }
  };

  const handleDeleteAppointment = async (id: string) => {
    try {
      await db.deleteAppointment(id);
      const updatedApps = await db.getAppointments();
      setAppointments(updatedApps);
      triggerToast('Appointment was removed from the guest calendar ledger.', 'info');
    } catch {
      triggerToast('Failed to delete appointment from store.', 'error');
    }
  };

  const handleSaveServices = async (updatedServices: Service[]) => {
    await db.saveServices(updatedServices);
    setServices(updatedServices);
    triggerToast('Services updated successfully!', 'success');
  };

  const handleSaveBusinessHours = async (updatedHours: BusinessHours[]) => {
    await db.saveBusinessHours(updatedHours);
    setBusinessHours(updatedHours);
    triggerToast('Business hours changed successfully!', 'success');
  };

  const handleSaveBusinessInfo = async (updatedInfo: BusinessInfo) => {
    await db.saveBusinessInfo(updatedInfo);
    setBusinessInfo(updatedInfo);
    triggerToast('Core business info updated!', 'success');
  };

  const handleSaveBlockedDates = async (updatedBlocked: BlockedDate[]) => {
    await db.saveBlockedDates(updatedBlocked);
    setBlockedDates(updatedBlocked);
    triggerToast('Blocked dates modified!', 'success');
  };

  const handleLoginSuccess = () => {
    setIsAdminLoggedIn(true);
    sessionStorage.setItem('bb_admin_session', 'true');
    setRoute('/dashboard');
  };

  const handleLogout = () => {
    setIsAdminLoggedIn(false);
    sessionStorage.removeItem('bb_admin_session');
    triggerToast('Logged out of Admin Workspace.', 'info');
    setRoute('/');
  };

  // Route protection mapping
  useEffect(() => {
    if (currentRoute === '/dashboard' && !isAdminLoggedIn) {
      setRoute('/authenticate');
      triggerToast('Authentication required to access administrative panel.', 'error');
    }
  }, [currentRoute, isAdminLoggedIn]);

  return (
    <div className="flex flex-col min-h-screen bg-cream selection:bg-blush/40 selection:text-dusty">
      
      {/* Universal Floating Toast */}
      <Notification
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={closeToast}
      />

      {/* Header navigations */}
      <Header
        currentRoute={currentRoute}
        setRoute={setRoute}
        isAdminLoggedIn={isAdminLoggedIn}
        onLogout={handleLogout}
      />

      {/* Core Dynamic Screen Routing */}
      <main className="flex-grow">
        {currentRoute === '/' && (
          <HomeView
            services={services}
            info={businessInfo}
            businessHours={businessHours}
            setRoute={setRoute}
          />
        )}

        {currentRoute === '/book' && (
          <BookView
            services={services}
            businessHours={businessHours}
            blockedDates={blockedDates}
            existingAppointments={appointments}
            onCreateAppointment={handleCreateAppointment}
            setRoute={setRoute}
            showToast={triggerToast}
          />
        )}

        {currentRoute === '/authenticate' && (
          <AuthView
            onLoginSuccess={handleLoginSuccess}
            setRoute={setRoute}
            showToast={triggerToast}
          />
        )}

        {currentRoute === '/dashboard' && isAdminLoggedIn && (
          <DashboardView
            appointments={appointments}
            services={services}
            businessHours={businessHours}
            businessInfo={businessInfo}
            blockedDates={blockedDates}
            onUpdateStatus={handleUpdateStatus}
            onDeleteAppointment={handleDeleteAppointment}
            onSaveServices={handleSaveServices}
            onSaveBusinessHours={handleSaveBusinessHours}
            onSaveBusinessInfo={handleSaveBusinessInfo}
            onSaveBlockedDates={handleSaveBlockedDates}
            showToast={triggerToast}
            setRoute={setRoute}
          />
        )}
      </main>

      {/* ================= UNIVERSAL FOOTER ================= */}
      <footer className="bg-charcoal text-cream py-16 px-6 md:px-12 border-t border-white/5 font-sans">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-6">
          
          {/* Tagline Column */}
          <div className="space-y-4">
            <div className="flex items-center gap-1">
              <Sparkles className="text-blush" size={18} />
              <h3 className="font-serif text-2xl font-semibold tracking-widest text-white">BrowBliss</h3>
            </div>
            <p className="text-xs tracking-[0.2em] text-cream/40 uppercase leading-none">Woodland’s Intimate Studio</p>
            <p className="text-sm font-light leading-relaxed text-cream/75 max-w-xs pt-2">
              "Beautiful Brows, Happy You" — Professional, precise, and highly affordable threading. Every block booked uniquely for you.
            </p>
          </div>

          {/* Quick Contact Info */}
          <div className="space-y-4 md:pl-6">
            <h4 className="font-serif text-lg font-bold text-blush tracking-wider">Connect With Us</h4>
            <div className="space-y-3 text-sm text-cream/80">
              <a 
                href={`tel:${businessInfo.phone}`}
                className="flex items-center gap-2.5 hover:text-white transition-colors group"
              >
                <PhoneCall size={14} className="text-blush inline group-hover:scale-110 transition-transform" />
                <span>Call or Text: {businessInfo.phone}</span>
              </a>
              <div className="flex items-start gap-2.5">
                <Heart size={14} className="text-blush shrink-0 mt-1" />
                <p className="font-light leading-relaxed">Located in Woodland, California. Close to Davis, West Sacramento, & Yolo County. Exact address shared instantly upon booking.</p>
              </div>
            </div>
          </div>

          {/* Payments & Admin quick link */}
          <div className="space-y-4">
            <h4 className="font-serif text-lg font-bold text-blush tracking-wider">Accepted Store Payments</h4>
            <p className="text-xs text-cream/60 leading-relaxed font-light">
              We accept Zelle transfers, Venmo, Apple Pay, and traditional Cash inside our home studio.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              {['Zelle', 'Venmo', 'Apple Pay', 'Cash'].map((pay) => (
                <span key={pay} className="text-[10px] font-semibold text-blush border border-blush/20 rounded px-2.5 py-1 bg-white/5 uppercase tracking-wider">
                  {pay}
                </span>
              ))}
            </div>
            
            <div className="pt-4 flex justify-between items-center text-[10px] text-cream/30 border-t border-white/5">
              <span>© {new Date().getFullYear()} BrowBliss Threading. All rights reserved.</span>
              <button 
                onClick={() => setRoute('/authenticate')}
                className="text-white/40 hover:text-blush hover:underline uppercase tracking-widest font-bold"
              >
                Staff Access
              </button>
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
}
