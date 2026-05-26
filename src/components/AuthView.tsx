/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Lock, Mail, Key, Sparkles, ArrowLeft, ArrowUpRight } from 'lucide-react';
import { isSupabaseConfigured, supabase, supabaseDiagnostics } from '../lib/db';

interface AuthViewProps {
  onLoginSuccess: () => void;
  setRoute: (route: string) => void;
  showToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const AuthView: React.FC<AuthViewProps> = ({
  onLoginSuccess,
  setRoute,
  showToast
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      showToast('Please enter both your email and security password.', 'error');
      return;
    }

    setIsLoading(true);

    if (isSupabaseConfigured && supabase) {
      try {
        const { error, data } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (error) {
          showToast(error.message, 'error');
        } else if (data?.user) {
          showToast('Welcome back, Admin!', 'success');
          onLoginSuccess();
          setRoute('/dashboard');
        }
      } catch (err: any) {
        const errorMsg = err?.message || '';
        if (errorMsg.toLowerCase().includes('fetch') || errorMsg.includes('network')) {
          showToast('Network Connection Error (Failed to fetch). Since remote Supabase project is not reachable, please check your URL or remove placeholder keys from your environment variables to run in Demo Sandbox mode.', 'error');
        } else {
          showToast(errorMsg || 'Authentication failed.', 'error');
        }
      } finally {
        setIsLoading(false);
      }
    } else {
      // Offline/Local Storage Sandbox Authentication Mock (Full support)
      setTimeout(() => {
        setIsLoading(false);
        if (
          (email.trim().toLowerCase() === 'admin@browbliss.com' && password === 'browblissadmin') ||
          (email.trim().toLowerCase() === 'gdipesh913@gmail.com' && password === 'browbliss')
        ) {
          showToast('Sandbox mode: Sign in successful!', 'success');
          onLoginSuccess();
          setRoute('/dashboard');
        } else {
          showToast('Invalid credentials. Check the sandbox helper below.', 'error');
        }
      }, 700);
    }
  };

  return (
    <div className="bg-charcoal text-cream min-h-[90vh] flex items-center justify-center px-6 py-12 relative overflow-hidden">
      
      {/* Delicate background circles decoration */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-dusty/15 rounded-full filter blur-3xl opacity-50"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blush/10 rounded-full filter blur-3xl opacity-40"></div>
      
      <div className="max-w-md w-full z-10 space-y-8">
        
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <button 
            onClick={() => setRoute('/')}
            className="inline-flex items-center gap-2 text-blush hover:text-white transition-all text-xs font-semibold tracking-wider uppercase mb-3 cursor-pointer"
          >
            <ArrowLeft size={12} />
            Back to Studio Website
          </button>
          
          <div className="mx-auto w-12 h-12 rounded-full bg-dusty/20 flex items-center justify-center border border-blush/20">
            <Lock className="text-blush" size={20} />
          </div>
          
          <h2 className="text-3xl font-serif font-bold tracking-wide text-white">
            BrowBliss Admin Workspace
          </h2>
          <p className="text-xs font-sans tracking-[0.2em] text-cream/40 uppercase">
            Beautiful Brows, Happy You
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-cream/5 border border-white/10 backdrop-blur-md rounded-3xl p-8 shadow-2xl relative">
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-cream/60 mb-2">
                Administrator Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 text-blush/60" size={16} />
                <input
                  type="email"
                  required
                  placeholder="admin@browbliss.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 focus:border-blush focus:outline-none rounded-xl py-2.5 pl-10 pr-4 text-sm font-sans tracking-wide text-white transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-cream/60 mb-2">
                Secure Security Password
              </label>
              <div className="relative">
                <Key className="absolute left-3.5 top-3 text-blush/60" size={16} />
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 focus:border-blush focus:outline-none rounded-xl py-2.5 pl-10 pr-4 text-sm font-sans text-white transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-xl bg-dusty text-cream hover:bg-dusty/90 hover:scale-[1.01] active:scale-[0.99] font-semibold tracking-wider uppercase text-xs transition-all flex items-center justify-center gap-2 cursor-pointer mt-8 shadow-lg shadow-dusty/20"
            >
              {isLoading ? 'Decrypting Access...' : 'Authenticate Account'}
              <Sparkles size={12} className="text-gold" />
            </button>
          </form>

          {/* Sandbox Helper Message Block */}
          {!isSupabaseConfigured && (
            <div className="mt-8 pt-6 border-t border-white/10 space-y-3 text-center">
              <div>
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-gold bg-gold/10 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Demo Sandbox Active
                </span>
                <p className="text-[11px] text-cream/60 leading-relaxed font-light mt-2">
                  The application is running in local **Offline Sandbox Mode** because configured Supabase environment variables were not detected.
                </p>
              </div>

              {/* Real-time Environment Diagnostics */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 text-left text-xs space-y-2">
                <div className="text-[10px] font-bold uppercase tracking-widest text-gold mb-1">Local Config Diagnostics:</div>
                <div className="flex justify-between">
                  <span className="text-cream/40">VITE_SUPABASE_URL:</span>
                  <span className={supabaseDiagnostics.urlPassed ? (supabaseDiagnostics.isPlaceholderUrl ? 'text-orange-300 font-semibold' : 'text-emerald-400 font-semibold') : 'text-rose-400 font-semibold'}>
                    {!supabaseDiagnostics.urlPassed ? 'Missing' : supabaseDiagnostics.isPlaceholderUrl ? 'Using Placeholder' : 'Successfully Loaded'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-cream/40">VITE_SUPABASE_ANON_KEY:</span>
                  <span className={supabaseDiagnostics.keyPassed ? (supabaseDiagnostics.isPlaceholderKey ? 'text-orange-300 font-semibold' : 'text-emerald-400 font-semibold') : 'text-rose-400 font-semibold'}>
                    {!supabaseDiagnostics.keyPassed ? 'Missing' : supabaseDiagnostics.isPlaceholderKey ? 'Using Placeholder' : 'Successfully Loaded'}
                  </span>
                </div>

                {/* Display troubleshooting checklist */}
                {(!supabaseDiagnostics.urlPassed || !supabaseDiagnostics.keyPassed || supabaseDiagnostics.isPlaceholderUrl || supabaseDiagnostics.isPlaceholderKey) && (
                  <div className="pt-2 text-[10.5px] text-cream/70 border-t border-white/5 space-y-1">
                    <p className="font-semibold text-white/90">How to activate your live Supabase connection:</p>
                    <ul className="list-disc pl-4 space-y-1 font-light">
                      <li>Create / edit a <code className="bg-black/35 px-1 rounded font-mono text-[9px] text-gold">.env</code> or <code className="bg-black/35 px-1 rounded font-mono text-[9px] text-gold">.env.local</code> file in your workspace root.</li>
                      <li>Copy your actual API keys from your Supabase Dashboard & verify they do not contain placeholder strings like <code className="text-orange-200">your-supabase-project</code>.</li>
                      <li><strong>CRITICAL:</strong> Restart your local terminal dev server (<code className="bg-black/35 px-1 rounded font-mono text-[9px] text-gold">npm run dev</code>) so Vite reads the new keys!</li>
                    </ul>
                  </div>
                )}
              </div>

              {/* Default Credentials Fallback for local sandbox */}
              <div className="space-y-1 text-center">
                <p className="text-[11px] text-cream/40 italic">
                  To continue in offline Demo Sandbox Mode, use:
                </p>
                <div className="p-3 bg-white/5 rounded-xl text-left border border-white/5 text-[11px] font-mono space-y-1 mt-1">
                  <div className="flex justify-between">
                    <span className="text-cream/40">Email:</span>
                    <span className="text-white">admin@browbliss.com</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-cream/40">Password:</span>
                    <span className="text-white">browblissadmin</span>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
