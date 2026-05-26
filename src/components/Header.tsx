/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Sparkles, Calendar, Lock, LayoutDashboard, PhoneCall } from 'lucide-react';

interface HeaderProps {
  currentRoute: string;
  setRoute: (route: string) => void;
  isAdminLoggedIn: boolean;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRoute,
  setRoute,
  isAdminLoggedIn,
  onLogout
}) => {
  return (
    <header className="sticky top-0 z-40 bg-cream/90 backdrop-blur-md border-b border-blush/20 py-4 px-6 md:px-12 flex justify-between items-center transition-all duration-300">
      {/* Brand Logo and Title */}
      <button 
        onClick={() => setRoute('/')}
        className="flex items-center gap-2 group cursor-pointer text-left"
      >
        <div className="w-10 h-10 rounded-full bg-blush/30 group-hover:bg-blush/50 transition-colors flex items-center justify-center border border-dusty/10">
          <Sparkles className="text-dusty" size={18} />
        </div>
        <div>
          <h1 className="text-xl md:text-2xl font-serif font-bold text-dusty tracking-tight leading-none">
            BrowBliss <span className="text-gold font-normal italic">Threading</span>
          </h1>
          <p className="text-[9px] font-sans tracking-[0.2em] text-charcoal/60 uppercase leading-none mt-1">
            Professional • Precise • Affordable
          </p>
        </div>
      </button>

      {/* Navigation Links */}
      <nav className="flex items-center gap-2 md:gap-6">
        <button
          onClick={() => setRoute('/')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium font-sans tracking-wide transition-all ${
            currentRoute === '/' 
              ? 'text-dusty bg-blush/10 font-semibold' 
              : 'text-charcoal/75 hover:text-dusty hover:bg-cream/50'
          }`}
        >
          Home
        </button>
        
        <button
          onClick={() => setRoute('/book')}
          className={`px-4 py-2 rounded-full text-xs md:text-sm font-semibold font-sans tracking-wider uppercase transition-all flex items-center gap-1.5 border ${
            currentRoute === '/book'
              ? 'bg-dusty text-cream border-dusty shadow-md'
              : 'bg-blush/20 text-dusty border-dusty/20 hover:bg-dusty hover:text-cream hover:border-dusty hover:scale-[1.03]'
          }`}
        >
          <Calendar size={14} />
          Book Now
        </button>

        {isAdminLoggedIn ? (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setRoute('/dashboard')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium font-sans tracking-wide transition-all flex items-center gap-1.5 ${
                currentRoute === '/dashboard'
                  ? 'text-dusty bg-blush/10 font-semibold'
                  : 'text-charcoal/75 hover:text-dusty hover:bg-cream/50'
              }`}
            >
              <LayoutDashboard size={14} />
              <span className="hidden sm:inline">Dashboard</span>
            </button>
            <button
              onClick={onLogout}
              className="text-xs font-sans font-medium text-rose-600 hover:text-rose-800 hover:bg-rose-50 px-2 py-1 rounded"
            >
              Log Out
            </button>
          </div>
        ) : (
          <button
            onClick={() => setRoute('/authenticate')}
            className={`p-2 rounded-lg text-charcoal/60 hover:text-dusty hover:bg-cream/50 transition-all`}
            title="Admin Login"
          >
            <Lock size={16} />
          </button>
        )}
      </nav>
    </header>
  );
};
