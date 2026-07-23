'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
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
          setError("Nombre maximal de 5 tentatives atteint. Accès suspendu pendant 60 secondes.");
        } else {
          setError(`${result.error || 'Identifiants incorrects.'} (${nextAttempts}/5 tentatives)`);
        }
        return;
      }

      setFailedAttempts(0);
      setLockoutTimer(0);
      router.push('/dashboard');
    }
  };

  return (
    <div className="h-screen w-full bg-[#F5F2F9] dark:bg-[#070A10] flex items-center justify-center p-2 sm:p-4 overflow-hidden font-sans text-text-main">
      {/* 2-Column Main Card Container - Strict Height fit without page scroll */}
      <div className="w-full max-w-4xl h-full max-h-[580px] bg-bg-card border border-border-subtle rounded-3xl shadow-xl overflow-hidden flex flex-col md:flex-row relative">
        
        {/* Left Column: Compact Form Section */}
        <div className="w-full md:w-1/2 p-5 sm:p-6 flex flex-col justify-between overflow-hidden">
          
          {/* Top Logo */}
          <div className="flex items-center gap-2">
            <img src="/Favicon_PrintFlow.png" alt="Print_Flow" className="w-8 h-8 object-contain rounded-xl shrink-0" />
            <span className="text-lg font-black tracking-tight text-text-main">
              Print<span className="text-purple-600 dark:text-emerald-400">_Flow</span>
            </span>
          </div>

          {/* Form Content Block */}
          <div className="my-auto space-y-3 max-w-sm w-full mx-auto">
            <div className="space-y-0.5 text-left">
              <h1 className="text-xl sm:text-2xl font-black text-text-main tracking-tight">
                {isRegistering ? "Créer un espace (7j Essai)" : "Bienvenue sur Print_Flow"}
              </h1>
              <p className="text-[11px] text-text-secondary">
                {isRegistering
                  ? "Renseignez votre imprimerie pour démarrer l'essai gratuit."
                  : "Connectez-vous à votre espace d'impression."}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-2">
              {/* Error Alert */}
              {error && (
                <div className="p-2 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 rounded-xl flex items-center gap-2 text-rose-700 dark:text-rose-400 text-[11px] font-medium">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Sign Up Fields in 2-column grid for compactness */}
              {isRegistering ? (
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-0.5">
                      <label className="text-[10px] font-bold text-text-secondary uppercase">
                        Imprimerie *
                      </label>
                      <div className="relative">
                        <Building2 className="w-3.5 h-3.5 text-text-secondary absolute left-2.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={orgName}
                          onChange={(e) => setOrgName(e.target.value)}
                          placeholder="Nom imprimerie"
                          className="w-full pl-8 pr-2.5 py-1.5 bg-input-bg border border-border-subtle rounded-xl text-xs focus:outline-none focus:border-purple-600 text-text-main"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-0.5">
                      <label className="text-[10px] font-bold text-text-secondary uppercase">
                        Responsable *
                      </label>
                      <div className="relative">
                        <User className="w-3.5 h-3.5 text-text-secondary absolute left-2.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={adminFullName}
                          onChange={(e) => setAdminFullName(e.target.value)}
                          placeholder="Nom & Prénom"
                          className="w-full pl-8 pr-2.5 py-1.5 bg-input-bg border border-border-subtle rounded-xl text-xs focus:outline-none focus:border-purple-600 text-text-main"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-0.5">
                    <label className="text-[10px] font-bold text-text-secondary uppercase">
                      Téléphone
                    </label>
                    <div className="relative">
                      <Phone className="w-3.5 h-3.5 text-text-secondary absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={phoneInput}
                        onChange={(e) => setPhoneInput(e.target.value)}
                        placeholder="ex: +221 77 123 45 67"
                        className="w-full pl-8 pr-2.5 py-1.5 bg-input-bg border border-border-subtle rounded-xl text-xs focus:outline-none focus:border-purple-600 text-text-main"
                      />
                    </div>
                  </div>
                </div>
              ) : null}

              {/* Email */}
              <div className="space-y-0.5">
                <label className="text-[10px] font-bold text-text-secondary uppercase">
                  Adresse email *
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-text-secondary absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="vous@imprimerie.sn"
                    autoComplete="email"
                    className="w-full pl-8 pr-2.5 py-1.5 bg-input-bg border border-border-subtle rounded-xl text-xs focus:outline-none focus:border-purple-600 text-text-main"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-0.5">
                <label className="text-[10px] font-bold text-text-secondary uppercase">
                  Mot de passe *
                </label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 text-text-secondary absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className="w-full pl-8 pr-8 py-1.5 bg-input-bg border border-border-subtle rounded-xl text-xs focus:outline-none focus:border-purple-600 text-text-main"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-main"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || lockoutTimer > 0}
                className="w-full py-2.5 mt-2 rounded-full bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold transition shadow-sm disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                ) : (
                  <span>{isRegistering ? "Activer mon essai gratuit 7 jours" : "Connexion à l'espace"}</span>
                )}
              </button>
            </form>

            {/* Toggle registration / login link */}
            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => {
                  setIsRegistering(!isRegistering);
                  setError('');
                }}
                className="text-[11px] font-bold text-text-secondary hover:text-purple-700 transition cursor-pointer"
              >
                {isRegistering ? (
                  <span>Déjà un compte ? <strong className="text-purple-700 underline">Se connecter</strong></span>
                ) : (
                  <span>Pas encore de compte ? <strong className="text-purple-700 underline">S'inscrire (Essai 7j)</strong></span>
                )}
              </button>
            </div>
          </div>

          {/* Footer Copyright */}
          <div className="flex items-center justify-between text-[10px] text-text-secondary pt-2 border-t border-border-subtle">
            <span>© 2026 Print_Flow.</span>
            <span>Accès sécurisé FCFA/XAF</span>
          </div>

        </div>

        {/* Right Column: Clean Background Image with Title & Description Only */}
        <div className="hidden md:flex md:w-1/2 m-2 rounded-2xl bg-purple-950 text-white p-8 flex-col justify-end relative overflow-hidden shadow-lg border border-purple-800">
          
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-60" 
            style={{ backgroundImage: "url('/Sign in et login .png')" }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-purple-950 via-purple-950/40 to-transparent" />

          {/* Title & Description Overlay */}
          <div className="relative z-10 space-y-2 text-left">
            <h2 className="text-2xl font-black leading-tight text-white font-sans">
              Centralisez Devis, BAT & Production.
            </h2>
            <p className="text-xs text-purple-100/90 leading-relaxed max-w-md font-sans">
              Gérez efficacement votre imprimerie : suivi d'atelier en temps réel, zéro oubli de facturation et encaissement d'acomptes en toute sérénité.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}
