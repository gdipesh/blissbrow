/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CheckCircle,
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  Mail, 
  Phone, 
  FileText, 
  ChevronRight, 
  ChevronLeft, 
  ArrowLeft,
  Heart,
  Sparkles,
  MapPin,
  Check,
  AlertCircle
} from 'lucide-react';
import { Service, BusinessHours, BlockedDate, Appointment } from '../types';

interface BookViewProps {
  services: Service[];
  businessHours: BusinessHours[];
  blockedDates: BlockedDate[];
  existingAppointments: Appointment[];
  onCreateAppointment: (appointment: Omit<Appointment, 'id' | 'created_at' | 'status'>) => Promise<Appointment>;
  setRoute: (route: string) => void;
  showToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const BookView: React.FC<BookViewProps> = ({
  services,
  businessHours,
  blockedDates,
  existingAppointments,
  onCreateAppointment,
  setRoute,
  showToast
}) => {
  const [step, setStep] = useState<number>(1);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  
  // Date State
  const [currentYear, setCurrentYear] = useState<number>(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(new Date().getMonth()); // 0-11
  const [selectedDateStr, setSelectedDateStr] = useState<string>(''); // YYYY-MM-DD
  
  // Time Slot State
  const [selectedTime, setSelectedTime] = useState<string>(''); // HH:MM
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  
  // User Info State
  const [userInfo, setUserInfo] = useState({
    name: '',
    email: '',
    phone: '',
    notes: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedAppointment, setConfirmedAppointment] = useState<Appointment | null>(null);

  const activeServices = services.filter(s => s.is_active);

  // ==========================================
  // CALENDAR GENERATION HELPERS
  // ==========================================
  
  const monthNames = [
    "January", "February", "March", "April", "May", "June", 
    "July", "August", "September", "October", "November", "December"
  ];
  
  const daysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };
  
  const startDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay(); // 0 is Sunday, etc.
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  const prevMonth = () => {
    const now = new Date();
    // Don't navigate to past months
    if (currentYear === now.getFullYear() && currentMonth <= now.getMonth()) {
      return;
    }
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  // Check if a date is blocked or closed
  const isDateDisabled = (dayNum: number): { disabled: boolean; reason?: string } => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const targetDate = new Date(currentYear, currentMonth, dayNum);
    targetDate.setHours(0, 0, 0, 0);

    // Past dates are automatically disabled
    if (targetDate < today) {
      return { disabled: true, reason: "Passed" };
    }

    const yearStr = currentYear.toString();
    const monthStr = (currentMonth + 1).toString().padStart(2, '0');
    const dayStr = dayNum.toString().padStart(2, '0');
    const fullDateStr = `${yearStr}-${monthStr}-${dayStr}`;

    // 1. Check Blocked Dates
    const isBlocked = blockedDates.find(b => b.date === fullDateStr);
    if (isBlocked) {
      return { disabled: true, reason: isBlocked.reason || "Blocked" };
    }

    // 2. Check Business Hours Closed for that Day Index
    const dayOfWeek = targetDate.getDay(); // 0 is Sunday, etc.
    const dayConfig = businessHours.find(h => h.day_index === dayOfWeek);
    if (dayConfig?.is_closed) {
      return { disabled: true, reason: "Closed" };
    }

    return { disabled: false };
  };

  // Generate date string on select
  const handleDateSelect = (dayNum: number) => {
    const check = isDateDisabled(dayNum);
    if (check.disabled) {
      showToast(`This date is unavailable: ${check.reason}`, 'info');
      return;
    }
    const monthStr = (currentMonth + 1).toString().padStart(2, '0');
    const dayStr = dayNum.toString().padStart(2, '0');
    const dateStr = `${currentYear}-${monthStr}-${dayStr}`;
    setSelectedDateStr(dateStr);
    setSelectedTime(''); // Reset selected slot
  };

  // ==========================================
  // TIME SLOTS GENERATION HELPERS
  // ==========================================

  useEffect(() => {
    if (!selectedDateStr) return;

    // Determine day index for selected date
    const dateObj = new Date(selectedDateStr + 'T12:00:00'); // avoiding timezone skew
    const dayOfWeek = dateObj.getDay();
    const dayConfig = businessHours.find(h => h.day_index === dayOfWeek);

    if (!dayConfig || dayConfig.is_closed) {
      setAvailableSlots([]);
      return;
    }

    // Unpack open and close times, e.g., "09:00", "18:00"
    const [openH, openM] = dayConfig.open_time.split(':').map(Number);
    const [closeH, closeM] = dayConfig.close_time.split(':').map(Number);

    const startMins = openH * 60 + openM;
    const endMins = closeH * 60 + closeM;

    // Create 30-minute intervals
    const generatedSlots: string[] = [];
    for (let m = startMins; m < endMins; m += 30) {
      const slotH = Math.floor(m / 60);
      const slotM = m % 60;
      const formattedTime = `${slotH.toString().padStart(2, '0')}:${slotM.toString().padStart(2, '0')}`;
      generatedSlots.push(formattedTime);
    }

    // Filter slots already booked on this exact date and NOT cancelled
    const bookedOnThisDay = existingAppointments
      .filter(app => app.date === selectedDateStr && app.status !== 'cancelled')
      .map(app => app.time_slot);

    const nonBookedSlots = generatedSlots.filter(s => !bookedOnThisDay.includes(s));
    
    setAvailableSlots(nonBookedSlots);
  }, [selectedDateStr, businessHours, existingAppointments]);

  // ==========================================
  // STEP ROUTERS & SUBMISSION
  // ==========================================

  const handleNextStep = () => {
    if (step === 1 && !selectedService) {
      showToast('Please select a threading service to proceed.', 'error');
      return;
    }
    if (step === 2 && (!selectedDateStr || !selectedTime)) {
      showToast('Please select an available date & time slot.', 'error');
      return;
    }
    setStep(prev => prev + 1);
  };

  const handlePrevStep = () => {
    setStep(prev => prev - 1);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setUserInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleConfirmBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInfo.name.trim() || !userInfo.email.trim() || !userInfo.phone.trim()) {
      showToast('Please fill in your name, email, and mobile phone.', 'error');
      return;
    }

    if (!selectedService) return;

    setIsSubmitting(true);
    try {
      const newApp = await onCreateAppointment({
        name: userInfo.name,
        email: userInfo.email,
        phone: userInfo.phone,
        service: selectedService.name,
        service_price: selectedService.price,
        date: selectedDateStr,
        time_slot: selectedTime,
        notes: userInfo.notes
      });
      
      // Attempt to dispatch email confirmation via Resend server integration proxy
      try {
        const mailResponse = await fetch('/api/send-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: userInfo.name,
            email: userInfo.email,
            phone: userInfo.phone,
            service: selectedService.name,
            service_price: selectedService.price,
            date: selectedDateStr,
            time_slot: selectedTime,
            notes: userInfo.notes
          })
        });
        
        const mailData = await mailResponse.json();
        if (mailResponse.ok && mailData.success) {
          if (mailData.warning) {
            console.warn('[Resend warning]', mailData.warning);
            showToast('Booking saved! Note: Check your business email inbox for appointment details.', 'info');
          } else {
            showToast('Confirmation email with private directions dispatched via Resend!', 'success');
          }
        } else {
          // If the key is not set or something else failed, we log it warningly so standard bookings are unblocked
          console.warn('[Resend error alert]', mailData?.error || 'Could not send calendar triggers.');
        }
      } catch (mailErr) {
        console.warn('Silent email sending issue:', mailErr);
      }

      setConfirmedAppointment(newApp);
      setStep(4);
      showToast('Appointment requested successfully!', 'success');
    } catch (e) {
      showToast('Failed to create appointment. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Support local printable/download card of reservation
  const handlePrintBooking = () => {
    window.print();
  };

  // Build Calendar grid cells
  const firstDayIndex = startDayOfMonth(currentMonth, currentYear);
  const totalDays = daysInMonth(currentMonth, currentYear);
  const daysArray = Array.from({ length: totalDays }, (_, i) => i + 1);
  
  // Padding cells before first day
  const paddingArray = Array.from({ length: firstDayIndex }, (_, i) => i);

  return (
    <div className="bg-cream min-h-[90vh] py-16 px-4 md:px-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Title & Back Link */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
          <div>
            <button 
              onClick={() => setRoute('/')}
              className="inline-flex items-center gap-2 text-dusty hover:text-dusty/80 text-sm font-semibold transition-all mb-2 cursor-pointer"
            >
              <ArrowLeft size={14} />
              Back to Home
            </button>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-charcoal flex items-center gap-2">
              <Heart size={20} className="text-dusty fill-dusty/10" />
              Book Your BrowBliss Appointment
            </h2>
          </div>
          <p className="text-xs font-sans tracking-widest text-dusty uppercase bg-blush/20 border border-dusty/10 rounded-full px-4 py-1.5 font-bold">
            By Appointment Only
          </p>
        </div>

        {/* ================= STEP TIMELINE INDICATOR ================= */}
        {step < 4 && (
          <div className="grid grid-cols-3 gap-2 mb-10 text-center max-w-lg mx-auto">
            {[
              { num: 1, text: 'Select Service' },
              { num: 2, text: 'Date & Time' },
              { num: 3, text: 'Your Details' }
            ].map(s => (
              <div 
                key={s.num} 
                className={`py-3 rounded-2xl border transition-all ${
                  step === s.num 
                    ? 'bg-dusty text-cream border-dusty shadow-md font-bold' 
                    : step > s.num 
                      ? 'bg-blush/25 text-dusty border-dusty/15 font-semibold' 
                      : 'bg-white text-charcoal/40 border-cream'
                }`}
              >
                <div className="text-xs uppercase tracking-widest font-sans flex items-center justify-center gap-1.5">
                  <span className={`w-4 h-4 rounded-full text-[9px] flex items-center justify-center ${
                    step >= s.num ? 'bg-white text-dusty font-extrabold' : 'bg-charcoal/10 text-charcoal'
                  }`}>
                    {s.num}
                  </span>
                  <span className="hidden sm:inline">{s.text}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ================= MAIN CONTAINER ================= */}
        <div className="bg-white border border-blush/20 rounded-3xl p-6 md:p-10 shadow-xl shadow-dusty/5 min-h-[450px]">
          
          <AnimatePresence mode="wait">
            
            {/* ================= STEP 1: CHOOSE SERVICE ================= */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-2xl font-serif font-semibold text-charcoal mb-2">
                    Choose Your Pamper Service
                  </h3>
                  <p className="text-sm text-charcoal/60 leading-relaxed font-light">
                    Select from our highly precise menu items. Every appointment features clean skin mapping.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activeServices.map((service) => {
                    const isSelected = selectedService?.id === service.id;
                    return (
                      <button
                        key={service.id}
                        onClick={() => setSelectedService(service)}
                        className={`text-left p-5 rounded-2xl border-2 transition-all flex justify-between items-start gap-3 cursor-pointer ${
                          isSelected 
                            ? 'bg-blush/10 border-dusty shadow-md shadow-dusty/5' 
                            : 'bg-cream/20 border-cream hover:border-blush/50 hover:bg-white'
                        }`}
                      >
                        <div className="space-y-1">
                          <p className="font-serif text-lg font-bold text-charcoal flex items-center gap-1.5">
                            {isSelected && <Check size={14} className="text-dusty" />}
                            {service.name}
                          </p>
                          <p className="text-xs text-charcoal/50 leading-relaxed">
                            {service.description || "Beautiful, natural finish mapping."}
                          </p>
                          <p className="text-[10px] text-dusty font-semibold tracking-wider uppercase pt-1">
                            Duration: ~{service.duration} mins
                          </p>
                        </div>
                        <span className="text-xl font-serif font-bold text-dusty shrink-0">
                          ${service.price}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="pt-6 flex justify-end">
                  <button
                    onClick={handleNextStep}
                    disabled={!selectedService}
                    className="px-8 py-3.5 rounded-full bg-dusty disabled:opacity-40 text-cream font-semibold tracking-widest uppercase text-xs hover:scale-[1.03] transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-dusty/15"
                  >
                    Select Date & Time
                    <ChevronRight size={14} />
                  </button>
                </div>
              </motion.div>
            )}

            {/* ================= STEP 2: PICK DATE & TIME ================= */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div>
                  <h3 className="text-2xl font-serif font-semibold text-charcoal mb-2">
                    Select Date & Available Slot
                  </h3>
                  <p className="text-sm text-charcoal/60 leading-relaxed font-light">
                    Pick a date from our active calendar. Slots are computed in real time.
                  </p>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                  
                  {/* Visual Interactive Custom Calendar */}
                  <div className="lg:w-1/2 bg-cream/35 p-5 rounded-2xl border border-blush/15 self-start w-full">
                    <div className="flex items-center justify-between mb-4 px-2">
                      <span className="font-serif font-bold text-charcoal text-lg">
                        {monthNames[currentMonth]} {currentYear}
                      </span>
                      <div className="flex gap-1.5">
                        <button 
                          onClick={prevMonth}
                          className="p-1 rounded bg-white hover:bg-blush/10 border border-blush/20 text-dusty disabled:opacity-30 cursor-pointer"
                          disabled={currentYear === new Date().getFullYear() && currentMonth <= new Date().getMonth()}
                        >
                          <ChevronLeft size={16} />
                        </button>
                        <button 
                          onClick={nextMonth}
                          className="p-1 rounded bg-white hover:bg-blush/10 border border-blush/20 text-dusty cursor-pointer"
                        >
                          <ChevronRight size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Weekday Labels */}
                    <div className="grid grid-cols-7 text-center text-xs font-semibold text-charcoal/40 uppercase tracking-widest mb-2 border-b border-blush/10 pb-2">
                      <span>Su</span>
                      <span>Mo</span>
                      <span>Tu</span>
                      <span>We</span>
                      <span>Th</span>
                      <span>Fr</span>
                      <span>Sa</span>
                    </div>

                    {/* Day Grid cells */}
                    <div className="grid grid-cols-7 gap-1.5 text-center">
                      {/* Empty padding cells */}
                      {paddingArray.map((idx) => (
                        <div key={`pad-${idx}`} className="h-9"></div>
                      ))}

                      {/* Day cells */}
                      {daysArray.map((dayNum) => {
                        const dateCheck = isDateDisabled(dayNum);
                        const disabled = dateCheck.disabled;
                        
                        // Construct YYYY-MM-DD
                        const cellMonthStr = (currentMonth + 1).toString().padStart(2, '0');
                        const cellDayStr = dayNum.toString().padStart(2, '0');
                        const cellDateStr = `${currentYear}-${cellMonthStr}-${cellDayStr}`;
                        const isSelected = selectedDateStr === cellDateStr;

                        return (
                          <button
                            key={dayNum}
                            onClick={() => handleDateSelect(dayNum)}
                            disabled={disabled}
                            className={`h-9 w-full text-xs font-medium rounded-lg flex flex-col items-center justify-center transition-all ${
                              isSelected 
                                ? 'bg-dusty text-white font-bold scale-105 shadow shadow-dusty/25' 
                                : disabled
                                  ? 'text-charcoal/20 bg-transparent line-through cursor-not-allowed'
                                  : 'bg-white text-charcoal border border-cream hover:border-dusty/40 hover:bg-cream/20 cursor-pointer'
                            }`}
                            title={dateCheck.reason ? `Unavailable: ${dateCheck.reason}` : "Available Slot"}
                          >
                            <span>{dayNum}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Legend */}
                    <div className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-1 text-[11px] text-charcoal/40">
                      <div className="flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded bg-white border border-cream"></span>
                        <span>Available</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded bg-dusty"></span>
                        <span>Selected</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="line-through text-charcoal/30 font-semibold">15</span>
                        <span>Closed/Holiday</span>
                      </div>
                    </div>
                  </div>

                  {/* Time Slots Area */}
                  <div className="lg:w-1/2 flex-grow space-y-4">
                    <p className="text-sm font-semibold text-charcoal flex items-center gap-1.5">
                      <Clock size={16} className="text-dusty" />
                      Available Times on {selectedDateStr ? new Date(selectedDateStr + 'T12:00:00').toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' }) : "(Choose date first)"}
                    </p>

                    {!selectedDateStr ? (
                      <div className="border border-dashed border-blush/30 rounded-2xl p-8 text-center text-charcoal/40 text-sm">
                        Please touch or click a highlight date on the calendar to view available threading blocks.
                      </div>
                    ) : availableSlots.length === 0 ? (
                      <div className="border border-dashed border-rose-200/50 bg-rose-50/20 text-rose-700 rounded-2xl p-8 text-center text-sm flex flex-col items-center gap-2">
                        <AlertCircle size={20} />
                        No available slots are left on this day. Please try another calendar date!
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 gap-2.5">
                        {availableSlots.map((slot) => {
                          const isSelectedSlot = selectedTime === slot;
                          // Convert 24h to 12h for visual ease
                          const [hourStr, minStr] = slot.split(':');
                          const hour = Number(hourStr);
                          const ampm = hour >= 12 ? 'PM' : 'AM';
                          const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
                          const displayTime = `${displayHour}:${minStr} ${ampm}`;

                          return (
                            <button
                              key={slot}
                              onClick={() => setSelectedTime(slot)}
                              className={`py-3 px-2 rounded-xl text-xs font-semibold border-2 text-center transition-all cursor-pointer ${
                                isSelectedSlot
                                  ? 'bg-dusty text-cream border-dusty shadow-md'
                                  : 'bg-cream/10 border-cream hover:border-dusty/30 hover:bg-white text-charcoal/80'
                              }`}
                            >
                              {displayTime}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                </div>

                <div className="pt-6 border-t border-cream flex justify-between">
                  <button
                    onClick={handlePrevStep}
                    className="px-6 py-3 rounded-full border border-dusty/30 text-dusty font-semibold text-xs tracking-widest uppercase hover:bg-cream/20 transition-all flex items-center gap-1"
                  >
                    <ArrowLeft size={12} />
                    Back
                  </button>
                  <button
                    onClick={handleNextStep}
                    disabled={!selectedDateStr || !selectedTime}
                    className="px-8 py-3.5 rounded-full bg-dusty disabled:opacity-40 text-cream font-semibold tracking-widest uppercase text-xs hover:scale-[1.03] transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-dusty/15"
                  >
                    Enter My Details
                    <ChevronRight size={14} />
                  </button>
                </div>
              </motion.div>
            )}

            {/* ================= STEP 3: USER DETAILS ================= */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-2xl font-serif font-semibold text-charcoal mb-2">
                    Enter Personal Details
                  </h3>
                  <p className="text-sm text-charcoal/60 leading-relaxed font-light">
                    These details are used to instantly send contact confirmation and address security notes.
                  </p>
                </div>

                <form onSubmit={handleConfirmBooking} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Fields */}
                  <div className="space-y-5">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal/60 mb-1.5">
                        Your Full Name <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-3 text-dusty" size={16} />
                        <input
                          type="text"
                          name="name"
                          required
                          placeholder="Sarah Jenkins"
                          value={userInfo.name}
                          onChange={handleFormChange}
                          className="w-full bg-cream/10 border border-blush/25 focus:border-dusty focus:outline-none rounded-xl py-2.5 pl-10 pr-4 text-sm font-sans"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal/60 mb-1.5">
                        Your Email Address <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-3 text-dusty" size={16} />
                        <input
                          type="email"
                          name="email"
                          required
                          placeholder="sarah.j@example.com"
                          value={userInfo.email}
                          onChange={handleFormChange}
                          className="w-full bg-cream/10 border border-blush/25 focus:border-dusty focus:outline-none rounded-xl py-2.5 pl-10 pr-4 text-sm font-sans"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal/60 mb-1.5">
                        Your Mobile Phone <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3.5 top-3 text-dusty" size={16} />
                        <input
                          type="tel"
                          name="phone"
                          required
                          placeholder="530-555-0192"
                          value={userInfo.phone}
                          onChange={handleFormChange}
                          className="w-full bg-cream/10 border border-blush/25 focus:border-dusty focus:outline-none rounded-xl py-2.5 pl-10 pr-4 text-sm font-sans"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Booking Notes and Overview Card */}
                  <div className="space-y-5">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal/60 mb-1.5">
                        Special Instructions / Notes (Optional)
                      </label>
                      <div className="relative">
                        <FileText className="absolute left-3.5 top-3.5 text-dusty" size={16} />
                        <textarea
                          name="notes"
                          rows={3}
                          placeholder="Please arches soft and natural, sensitive skin..."
                          value={userInfo.notes}
                          onChange={handleFormChange}
                          className="w-full bg-cream/10 border border-blush/25 focus:border-dusty focus:outline-none rounded-xl py-2.5 pl-10 pr-4 text-sm font-sans resize-none"
                        />
                      </div>
                    </div>

                    {/* Booking Review summary card */}
                    <div className="bg-cream/40 rounded-2xl p-5 border border-blush/20 space-y-3">
                      <p className="text-xs font-semibold text-dusty uppercase tracking-widest mb-1">Reservation Recap</p>
                      
                      {selectedService && (
                        <div className="flex justify-between items-center text-sm border-b border-blush/10 pb-2">
                          <span className="text-charcoal/60">Service Offered:</span>
                          <span className="font-semibold text-charcoal">{selectedService.name}</span>
                        </div>
                      )}

                      <div className="flex justify-between items-center text-sm border-b border-blush/10 pb-2">
                        <span className="text-charcoal/60">Date:</span>
                        <span className="font-semibold text-charcoal">
                          {selectedDateStr ? new Date(selectedDateStr + 'T12:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : ''}
                        </span>
                      </div>

                      <div className="flex justify-between items-center text-sm border-b border-blush/10 pb-1">
                        <span className="text-charcoal/60">Time Block:</span>
                        <span className="font-semibold text-charcoal">{selectedTime}</span>
                      </div>

                      {selectedService && (
                        <div className="flex justify-between items-center text-sm font-bold border-t border-blush/20 pt-2 text-dusty">
                          <span>Service Cost:</span>
                          <span>${selectedService.price}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Submission and buttons */}
                  <div className="md:col-span-2 pt-6 border-t border-cream flex justify-between items-center">
                    <button
                      type="button"
                      onClick={handlePrevStep}
                      className="px-6 py-3 rounded-full border border-dusty/30 text-dusty font-semibold text-xs tracking-widest uppercase hover:bg-cream/20 transition-all flex items-center gap-1"
                    >
                      <ArrowLeft size={12} />
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-8 py-3.5 rounded-full bg-dusty text-cream font-semibold tracking-widest uppercase text-xs hover:scale-[1.03] transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-dusty/15 disabled:opacity-60"
                    >
                      {isSubmitting ? 'Requesting Block...' : 'Confirm Reservation'}
                      <CheckCircle size={14} />
                    </button>
                  </div>

                </form>
              </motion.div>
            )}

            {/* ================= STEP 4: CONFIRMATION/SUCCESS ================= */}
            {step === 4 && confirmedAppointment && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-8 max-w-xl mx-auto py-6"
              >
                <div className="flex justify-center">
                  <div className="w-20 h-20 rounded-full bg-emerald-50 border-2 border-emerald-400 flex items-center justify-center text-emerald-500 shadow-md shadow-emerald-100">
                    <CheckCircle size={44} className="stroke-[2.5]" />
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-3xl font-serif font-bold text-charcoal">
                    Thank You, {confirmedAppointment.name}!
                  </h3>
                  <p className="text-sm text-charcoal/70 leading-relaxed font-light">
                    Your styling appointment request is set.
                  </p>
                  
                  {/* Address Privacy Notice */}
                  <div className="my-5 p-4 bg-blush/10 border border-dusty/15 rounded-2xl inline-block text-left max-w-md mx-auto">
                    <div className="flex items-start gap-3">
                      <MapPin className="text-dusty flex-shrink-0 mt-0.5 animate-bounce" size={20} />
                      <div>
                        <p className="text-xs font-semibold text-dusty uppercase tracking-wide">WOODLAND STUDIO ADDRESS</p>
                        <p className="text-xs text-charcoal/80 mt-1 leading-relaxed">
                          This is a private residential aesthetic studio helper. For confidentiality support, the complete street address and directions are messaged directly to:
                        </p>
                        <p className="text-xs font-bold text-charcoal mt-1.5 font-mono">
                          {confirmedAppointment.phone} & {confirmedAppointment.email}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Printable Booking Voucher Panel */}
                <div className="border border-blush/25 rounded-3xl p-6 bg-cream/20 text-left space-y-4 max-w-md mx-auto relative overflow-hidden shadow-md">
                  <div className="absolute top-0 right-0 p-3">
                    <Sparkles className="text-gold/30" size={24} />
                  </div>
                  
                  <div className="border-b border-blush/10 pb-3 flex justify-between items-center">
                    <div>
                      <h4 className="font-serif text-lg font-bold text-dusty">BrowBliss Threading</h4>
                      <p className="text-[9px] uppercase tracking-widest text-charcoal/40">Appointment Pass</p>
                    </div>
                    <span className="text-[10px] uppercase font-semibold text-dusty px-2 py-0.5 rounded-full bg-blush/20">
                      ID: {confirmedAppointment.id}
                    </span>
                  </div>

                  <div className="space-y-2.5 text-xs font-sans">
                    <div className="flex justify-between">
                      <span className="text-charcoal/50">Scheduled Guest:</span>
                      <span className="font-semibold text-charcoal">{confirmedAppointment.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-charcoal/50">Threading Treatment:</span>
                      <span className="font-semibold text-charcoal">{confirmedAppointment.service}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-charcoal/50">Calendar Date:</span>
                      <span className="font-semibold text-charcoal">
                        {new Date(confirmedAppointment.date + 'T12:00:00').toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-charcoal/50">Assigned Time Slot:</span>
                      <span className="font-semibold text-charcoal font-mono">{confirmedAppointment.time_slot}</span>
                    </div>
                    <div className="flex justify-between border-t border-blush/10 pt-2.5 text-dusty font-bold">
                      <span>Store Price Due:</span>
                      <span>${confirmedAppointment.service_price}</span>
                    </div>
                  </div>
                </div>

                {/* Confirm note and buttons */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={handlePrintBooking}
                    className="px-6 py-3 rounded-full border border-dusty/30 hover:bg-blush/10 text-dusty font-semibold text-xs tracking-widest uppercase transition-all"
                  >
                    Download / Save Pass
                  </button>
                  <button
                    onClick={() => {
                      // Reset values
                      setConfirmedAppointment(null);
                      setStep(1);
                      setSelectedService(null);
                      setSelectedDateStr('');
                      setSelectedTime('');
                      setUserInfo({ name: '', email: '', phone: '', notes: '' });
                      setRoute('/');
                    }}
                    className="px-8 py-3.5 rounded-full bg-dusty text-white font-semibold tracking-widest uppercase text-xs hover:scale-105 transition-all shadow-md shadow-dusty/15"
                  >
                    Done & Back to Home
                  </button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>

        </div>
      </div>
    </div>
  );
};
