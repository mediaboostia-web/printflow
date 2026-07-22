'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Printer, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  Building2, 
  User, 
  Phone, 
  Clock, 
  TrendingUp, 
  CheckCircle2, 
  ShieldCheck 
} from 'lucide-react';
import { useAppStore } from '@/lib/state/store';
import { formatFCFA } from '@/lib/utils/money';

export default function LoginPage() {
  const router = useRouter();
  const login = useAppStore((state) => state.login);
  const registerFreeTrial = useAppStore((state) => state.registerFreeTrial);
  const hasHydrated = useAppStore((state) => state.hasHydrated);
  const isAuthenticated = useAppStore((state) => state.isAuthenticated);
  const isSuperAdmin = useAppStore((state) => state.isSuperAdmin);

  // Form input states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sign up form states
  const [isRegistering, setIsRegistering] = useState(false);
  const [orgName, setOrgName] = useState('');
  const [adminFullName, setAdminFullName] = useState('');
  const [phoneInput, setPhoneInput] = useState('');

  // Rate Limiting states (Max 5 failed attempts -> 60s lockout)
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutTimer, setLockoutTimer] = useState(0);

  // Countdown timer effect for rate limiting
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (lockoutTimer > 0) {
      interval = setInterval(() => {
        setLockoutTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [lockoutTimer]);

  // Already logged in as an org user? Skip straight to the dashboard.
  useEffect(() => {
    if (hasHydrated && isAuthenticated && !isSuperAdmin) {
      router.replace('/dashboard');
    }
  }, [hasHydrated, isAuthenticated, isSuperAdmin, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Check rate limiter lock
    if (lockoutTimer > 0) {
      setError(`Accès temporairement verrouillé. Veuillez patienter encore ${lockoutTimer}s.`);
      return;
    }

    if (isRegistering) {
      if (!orgName.trim() || !adminFullName.trim() || !email.trim() || !password) {
        setError('Veuillez renseigner tous les champs obligatoires (*).');
        return;
      }
      setIsSubmitting(true);
      const res = await registerFreeTrial({ orgName, adminFullName, email, phone: phoneInput, password });
      setIsSubmitting(false);
      if (res.success) {
        router.push('/dashboard');
      } else {
        setError(res.error || "Une erreur est survenue lors de l'inscription.");
      }
    } else {
      if (!email.trim() || !password) {
        setError('Veuillez renseigner votre e-mail et votre mot de passe.');
        return;
      }

      setIsSubmitting(true);
      const result = await login(email, password);
      setIsSubmitting(false);

      if (!result.success) {
        const nextAttempts = failedAttempts + 1;
        setFailedAttempts(nextAttempts);

        if (nextAttempts >= 5) {
          setLockoutTimer(60);
          setFailedAttempts(0);
          setError("Nombre maximal de 5 tentatives atteint. Accès suspendu pendant 60 secondes par sécurité.");
        } else {
          setError(`${result.error || 'Identifiants incorrects.'} (${nextAttempts}/5 tentatives)`);
        }
        return;
      }

      // Reset rate limiter on success
      setFailedAttempts(0);
      setLockoutTimer(0);
      router.push('/dashboard');
    }
  };

  return (
    <div className="h-screen w-full bg-slate-100 dark:bg-[#070A10] flex items-center justify-center p-4 sm:p-6 lg:p-8 overflow-hidden font-sans text-text-main">
      {/* 2-Column Main Card Container */}
      <div className="w-full max-w-5xl h-full max-h-[640px] bg-bg-card border border-border-subtle rounded-3xl shadow-premium overflow-hidden flex flex-col md:flex-row relative">
        
        {/* Left Column: Form Section */}
        <div className="w-full md:w-1/2 p-6 sm:p-8 lg:p-10 flex flex-col justify-between overflow-y-auto no-scrollbar">
          
          {/* Top Logo */}
          <div className="flex items-center gap-2.5">
            <img src="/Favicon_PrintFlow.png" alt="Print_Flow" className="w-9 h-9 object-contain rounded-xl shrink-0" />
            <span className="text-xl font-extrabold tracking-tight text-text-main">
              Print<span className="text-brand-primary">_Flow</span>
            </span>
          </div>

          {/* Form Content Block */}
          <div className="my-auto py-4 space-y-6 max-w-sm w-full mx-auto">
            <div className="space-y-1 text-left">
              <h1 className="text-2xl sm:text-3xl font-black text-text-main tracking-tight">
                {isRegistering ? "Créer un espace" : "Bienvenue"}
              </h1>
              <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                {isRegistering
                  ? "Rejoignez Print_Flow et optimisez vos opérations d'impression."
                  : "Saisissez votre e-mail et votre mot de passe pour accéder à votre espace."}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Rate Limiting / Error Alert */}
              {error && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 rounded-2xl flex items-center gap-2.5 text-rose-700 dark:text-rose-400 text-xs font-medium animate-fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Rate Limiter Active Lock Banner */}
              {lockoutTimer > 0 && (
                <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-2xl flex items-center gap-2.5 text-amber-800 dark:text-amber-300 text-xs font-bold animate-pulse">
                  <Clock className="w-4 h-4 shrink-0 text-amber-600" />
                  <span>Tentatives bloquées. Réessai disponible dans {lockoutTimer}s.</span>
                </div>
              )}

              {/* Sign Up Fields */}
              {isRegistering && (
                <>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-text-secondary uppercase tracking-wider block">
                      Nom de l'imprimerie *
                    </label>
                    <div className="relative">
                      <Building2 className="w-4 h-4 text-text-secondary absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={orgName}
                        onChange={(e) => setOrgName(e.target.value)}
                        placeholder="ex: Sud Print Imprimerie"
                        className="w-full pl-9 pr-4 py-2 bg-input-bg border border-border-subtle rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-text-main transition"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-text-secondary uppercase tracking-wider block">
                      Nom du responsable *
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-text-secondary absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={adminFullName}
                        onChange={(e) => setAdminFullName(e.target.value)}
                        placeholder="ex: Amadou Diallo"
                        className="w-full pl-9 pr-4 py-2 bg-input-bg border border-border-subtle rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-text-main transition"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-text-secondary uppercase tracking-wider block">
                      Téléphone
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-text-secondary absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={phoneInput}
                        onChange={(e) => setPhoneInput(e.target.value)}
                        placeholder="ex: +221 77 123 45 67"
                        className="w-full pl-9 pr-4 py-2 bg-input-bg border border-border-subtle rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-text-main transition"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Email */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-text-secondary uppercase tracking-wider block">
                  Adresse email *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-text-secondary absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="vous@imprimerie.sn"
                    autoComplete="email"
                    className="w-full pl-9 pr-4 py-2 bg-input-bg border border-border-subtle rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-text-main transition"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-text-secondary uppercase tracking-wider block">
                  Mot de passe *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-text-secondary absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className="w-full pl-9 pr-10 py-2 bg-input-bg border border-border-subtle rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-text-main transition"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-main transition"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me & Options */}
              {!isRegistering && (
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 text-xs text-text-secondary cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-3.5 h-3.5 rounded border-border-subtle text-brand-primary focus:ring-brand-primary"
                    />
                    <span>Se souvenir de moi</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => alert("Pour réinitialiser votre mot de passe, contactez l'administrateur de votre imprimerie.")}
                    className="text-xs font-bold text-brand-primary hover:underline"
                  >
                    Mot de passe oublié ?
                  </button>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || lockoutTimer > 0}
                className="w-full h-10 mt-2 rounded-full bg-brand-primary hover:bg-brand-primary-hover text-white text-xs font-bold transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                ) : (
                  <span>{isRegistering ? "Créer mon espace gratuit" : "Se connecter"}</span>
                )}
              </button>
            </form>

            {/* Toggle registration / login link */}
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsRegistering(!isRegistering);
                  setError('');
                }}
                className="text-xs font-bold text-text-secondary hover:text-brand-primary transition cursor-pointer"
              >
                {isRegistering ? (
                  <span>Déjà inscrit ? <strong className="text-brand-primary underline">Se connecter</strong></span>
                ) : (
                  <span>Pas encore de compte ? <strong className="text-brand-primary underline">S'inscrire (Essai 7 jours)</strong></span>
                )}
              </button>
            </div>
          </div>

          {/* Footer Copyright */}
          <div className="flex items-center justify-between text-[11px] text-text-secondary pt-2 border-t border-border-subtle">
            <span>© 2026 Print_Flow LTD.</span>
            <span className="hover:underline cursor-pointer">Confidentialité</span>
          </div>

        </div>

        {/* Right Column: Hero Visual Graphic Banner */}
        <div className="hidden md:flex md:w-1/2 m-3 rounded-2xl md:rounded-3xl bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-900 text-white p-8 flex-col justify-between relative overflow-hidden shadow-lg">
          
          {/* Subtle Tech-Luxe Radial Glow & Mesh Overlay */}
          <div
            className="absolute inset-0 opacity-30 pointer-events-none"
            style={{
              background:
                'radial-gradient(circle at 10% 10%, rgba(255,255,255,0.4), transparent 50%), radial-gradient(circle at 90% 90%, rgba(0,0,0,0.5), transparent 60%)',
            }}
          />

          {/* Top Banner Tagline */}
          <div className="relative z-10 space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold text-white shadow-sm">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
              <span>Solution N°1 en Afrique francophone</span>
            </div>
            <h2 className="text-2xl lg:text-3xl font-black leading-tight tracking-tight">
              Gérez efficacement vos opérations & votre équipe.
            </h2>
            <p className="text-xs lg:text-sm text-emerald-100/90 leading-relaxed max-w-sm">
              Devis express, Bon à Tirer (BAT), suivi de production en atelier, livraisons et facturation au même endroit.
            </p>
          </div>

          {/* Floating Glassmorphism Dashboard Preview Card */}
          <div className="relative z-10 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 space-y-3 shadow-2xl my-auto">
            <div className="flex items-center justify-between text-xs font-bold border-b border-white/10 pb-2">
              <span className="flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-emerald-300" />
                Performance Atelier
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-200 text-[10px]">En direct</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-black/20 rounded-xl p-2.5 space-y-0.5">
                <p className="text-[10px] text-emerald-200 uppercase font-semibold">Devis Validés</p>
                <p className="text-lg font-black text-white">42 devis</p>
              </div>
              <div className="bg-black/20 rounded-xl p-2.5 space-y-0.5">
                <p className="text-[10px] text-emerald-200 uppercase font-semibold">Volume Mensuel</p>
                <p className="text-lg font-black text-emerald-300">{formatFCFA(12500000)}</p>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-emerald-100 pt-1">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                Taux de validation BAT: 98.4%
              </span>
            </div>
          </div>

          {/* Bottom Security Badge */}
          <div className="relative z-10 flex items-center justify-between text-[11px] text-emerald-200/80 border-t border-white/10 pt-3">
            <span>Accès chiffré TLS 256-bit</span>
            <span>FCFA Currency Ready</span>
          </div>

        </div>

      </div>
    </div>
  );
}
