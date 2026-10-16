import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  CheckCircle2, 
  Key, 
  Globe, 
  ExternalLink,
  Copy,
  Check,
  UserCheck
} from 'lucide-react';
import { isSupabaseConfigured, signInWithSupabaseGoogle, signOutSupabase } from '../lib/supabase';
import { StudentProfile } from '../types';

interface SupabaseAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: StudentProfile;
  onSignInMockGoogle: () => void;
}

export const SupabaseAuthModal: React.FC<SupabaseAuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSignInMockGoogle,
}) => {
  if (!isOpen) return null;

  const [copied, setCopied] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const handleCopyEnv = () => {
    navigator.clipboard.writeText(`VITE_SUPABASE_URL="https://your-project.supabase.co"\nVITE_SUPABASE_ANON_KEY="your-anon-key"`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGoogleSignIn = async () => {
    setAuthError(null);
    if (isSupabaseConfigured) {
      const res = await signInWithSupabaseGoogle();
      if (res.error) setAuthError(res.error);
    } else {
      // Immediate demo login
      onSignInMockGoogle();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-stone-200 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900 leading-tight">
                Supabase Google Authentication
              </h3>
              <p className="text-xs text-stone-500">
                Seamless OAuth setup & integration status
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-5">
          
          {/* Status Banner */}
          <div className={`p-4 rounded-xl border flex items-start gap-3 ${
            isSupabaseConfigured
              ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
              : 'bg-amber-50/80 border-amber-200 text-amber-950'
          }`}>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
              isSupabaseConfigured ? 'bg-emerald-600 text-white' : 'bg-amber-600 text-white'
            }`}>
              {isSupabaseConfigured ? <Check className="w-3.5 h-3.5" /> : <Key className="w-3.5 h-3.5" />}
            </div>

            <div>
              <h4 className="text-sm font-bold">
                {isSupabaseConfigured 
                  ? 'Supabase Integration Active' 
                  : 'Ready for Supabase Google Credentials'}
              </h4>
              <p className="text-xs mt-1 leading-relaxed">
                {isSupabaseConfigured
                  ? 'Your Supabase client is initialized. Click the Google button below to authenticate with OAuth.'
                  : 'The application is pre-architected with the @supabase/supabase-js client. When you add your Supabase URL & Anon Key, Google OAuth will connect seamlessly!'}
              </p>
            </div>
          </div>

          {/* Current Profile details */}
          <div className="p-4 bg-stone-50 rounded-xl border border-stone-200">
            <h5 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2.5">
              Active User Session:
            </h5>
            <div className="flex items-center gap-3">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-12 h-12 rounded-full object-cover ring-2 ring-stone-200"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-stone-900 truncate">
                    {currentUser.name}
                  </span>
                  <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                    Active
                  </span>
                </div>
                <p className="text-xs text-stone-500 truncate">{currentUser.email}</p>
                <p className="text-xs text-amber-800 font-medium mt-0.5">
                  {currentUser.specialty} • {currentUser.university}
                </p>
              </div>
            </div>
          </div>

          {/* Google OAuth Button */}
          <div>
            <button
              id="supabase-google-auth-btn"
              onClick={handleGoogleSignIn}
              className="w-full py-3 px-4 rounded-xl bg-white hover:bg-stone-50 text-stone-800 border-2 border-stone-200 hover:border-stone-300 font-semibold text-sm shadow-sm transition-all flex items-center justify-center gap-3 active:scale-[0.99]"
            >
              {/* Google G Logo SVG */}
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.9c2.27-2.09 3.645-5.17 3.645-9.15z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.9-3.05c-1.08.72-2.45 1.16-4.03 1.16-3.1 0-5.73-2.1-6.66-4.94H1.31v3.13C3.29 21.28 7.37 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.34 14.26c-.24-.72-.37-1.49-.37-2.26s.13-1.54.37-2.26V6.61H1.31C.48 8.27 0 10.08 0 12s.48 3.73 1.31 5.39l4.03-3.13z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.37 0 3.29 2.72 1.31 6.61l4.03 3.13c.93-2.84 3.56-4.99 6.66-4.99z"
                />
              </svg>
              <span>
                {isSupabaseConfigured
                  ? 'Sign In with Google (Supabase OAuth)'
                  : 'Continue with Google Account'}
              </span>
            </button>
            {authError && (
              <p className="text-xs text-rose-600 mt-2 text-center font-medium">
                {authError}
              </p>
            )}
          </div>

          {/* Quick instructions on providing credentials */}
          <div className="bg-stone-50 rounded-xl p-3.5 border border-stone-200">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                How to Provide Supabase Credentials:
              </span>
              <button
                onClick={handleCopyEnv}
                className="text-[11px] text-stone-600 hover:text-stone-900 flex items-center gap-1 font-semibold"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
            <pre className="text-[11px] font-mono bg-stone-900 text-stone-200 p-2.5 rounded-lg overflow-x-auto">
{`# In your environment or Settings:
VITE_SUPABASE_URL="https://xyzcompany.supabase.co"
VITE_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6..."`}
            </pre>
            <p className="text-[11px] text-stone-500 mt-1.5">
              When ready, paste your credentials and Google Auth will seamlessly activate without requiring any code modifications!
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold bg-stone-900 text-white rounded-lg hover:bg-stone-800"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
