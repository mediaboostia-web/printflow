'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ShieldAlert, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  Globe, 
  Clock, 
  Activity, 
  Building2, 
  CheckCircle2 
} from 'lucide-react';
import { useAppStore } from '@/lib/state/store';
import { formatFCFA } from '@/lib/utils/money';

export default function SuperAdminLoginPage() {
  const router = useRouter();
  const superAdminLogin = useAppStore((state) => state.superAdminLogin);
  const hasHydrated = useAppStore((state) => state.hasHydrated);
  const isAuthenticated = useAppStore((state) => state.isAuthenticated);
  const isSuperAdmin = useAppStore((state) => state.isSuperAdmin);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Rate Limiter states
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutTimer, setLockoutTimer] = useState(0);

  // Countdown timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (lockoutTimer > 0) {
      interval = setInterval(() => {
        setLockoutTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [lockoutTimer]);

  useEffect(() => {
    if (hasHydrated && isAuthenticated && isSuperAdmin) {
      router.replace('/super-admin');
    }
  }, [hasHydrated, isAuthenticated, isSuperAdmin, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (lockoutTimer > 0) {
      setError(`Accès temporairement verrouillé. Veuillez patienter encore ${lockoutTimer}s.`);
      return;
    }

    if (!email.trim() || !password) {
      setError('Veuillez renseigner votre e-mail et votre mot de passe.');
      return;
    }

    setIsSubmitting(true);
    const result = await superAdminLogin(email, password);
    setIsSubmitting(false);

    if (!result.success) {
      const nextAttempts = failedAttempts + 1;
      setFailedAttempts(nextAttempts);

      if (nextAttempts >= 5) {
        setLockoutTimer(60);
        setFailedAttempts(0);
        setError("Nombre maximal de 5 tentatives atteint. Accès suspendu pendant 60 secondes.");
      } else {
        setError(`${result.error || 'Identifiants Super Admin incorrects.'} (${nextAttempts}/5 tentatives)`);
      }
      return;
    }

    setFailedAttempts(0);
    setLockoutTimer(0);
    router.push('/super-admin');
  };

  return (
    <div className="h-screen w-full bg-[#090D16] text-white flex items-center justify-center p-4 sm:p-6 lg:p-8 overflow-hidden font-sans">
      {/* 2-Column Main Card Container */}
      <div className="w-full max-w-5xl h-full max-h-[640px] bg-[#101726] border border-[#1E293B] rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row relative">
        
        {/* Left Column: Form Section */}
        <div className="w-full md:w-1/2 p-6 sm:p-8 lg:p-10 flex flex-col justify-between overflow-y-auto no-scrollbar">
          
          {/* Top Logo */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand-primary flex items-center justify-center text-white shadow-sm shrink-0">
              <Globe className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">
              Print<span className="text-brand-primary">_Flow</span> <span className="text-slate-400 text-xs font-normal">SuperAdmin</span>
            </span>
          </div>

          {/* Form Content Block */}
          <div className="my-auto py-4 space-y-6 max-w-sm w-full mx-auto">
            <div className="space-y-1 text-left">
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Console Racine
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Authentification de sécurité globale pour les opérateurs de l'architecture.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Rate Limiting / Error Alert */}
              {error && (
                <div className="p-3 bg-rose-950/30 border border-rose-900/50 rounded-2xl flex items-center gap-2.5 text-rose-400 text-xs font-medium animate-fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Rate Limiter Active Lock Banner */}
              {lockoutTimer > 0 && (
                <div className="p-3 bg-amber-950/30 border border-amber-900/50 rounded-2xl flex items-center gap-2.5 text-amber-300 text-xs font-bold animate-pulse">
                  <Clock className="w-4 h-4 shrink-0 text-amber-500" />
                  <span>Accès suspendu. Réessai disponible dans {lockoutTimer}s.</span>
                </div>
              )}

              {/* Email */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Identifiant Opérateur *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="superadmin@printflow.io"
                    autoComplete="email"
                    className="w-full pl-9 pr-4 py-2 bg-[#1A2333] border border-[#1E293B] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary text-white placeholder:text-slate-500 transition"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Mot de passe système *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className="w-full pl-9 pr-10 py-2 bg-[#1A2333] border border-[#1E293B] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary text-white placeholder:text-slate-500 transition"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Options */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-3.5 h-3.5 rounded border-[#1E293B] bg-[#1A2333] text-brand-primary focus:ring-brand-primary"
                  />
                  <span>Session sécurisée persistante</span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || lockoutTimer > 0}
                className="w-full h-10 mt-2 rounded-full bg-brand-primary hover:bg-brand-primary-hover text-white text-xs font-bold transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                ) : (
                  <span>Connexion Super Admin</span>
                )}
              </button>
            </form>
          </div>

          {/* Footer Copyright */}
          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-[#1E293B]">
            <span>© 2026 Print_Flow Architecture.</span>
            <span>Protocole SSL / TLS</span>
          </div>

        </div>

        {/* Right Column: Clean Background Image with Title & Description Only */}
        <div className="hidden md:flex md:w-1/2 m-3 rounded-2xl md:rounded-3xl bg-slate-950 text-white p-8 flex-col justify-end relative overflow-hidden shadow-xl border border-slate-800">
          
          {/* Background Image from public */}
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-50" 
            style={{ backgroundImage: "url('/Background Flux.png')" }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

          {/* Title & Description */}
          <div className="relative z-10 space-y-2 text-left">
            <h2 className="text-2xl lg:text-3xl font-black leading-tight tracking-tight text-white font-sans">
              Supervision Globale de la Plateforme
            </h2>
            <p className="text-xs lg:text-sm text-slate-300 leading-relaxed max-w-sm font-sans">
              Console d'administration réservée à l'opérateur SaaS : gestion des organisations, abonnements et traçabilité globale.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}
