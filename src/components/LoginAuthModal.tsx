import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  CheckCircle2, 
  Key, 
  Mail, 
  Lock, 
  User, 
  GraduationCap, 
  Sparkles, 
  Copy, 
  Check, 
  LogIn, 
  LogOut, 
  UserPlus,
  ArrowRight,
  HelpCircle,
  Briefcase,
  Camera
} from 'lucide-react';
import { 
  signInWithFirebaseGoogle, 
  signInWithFirebaseEmail, 
  registerWithFirebaseEmail, 
  mapFirebaseUserToStudent, 
  syncUserProfileToFirestore,
  signOutFirebase 
} from '../lib/firebase';
import firebaseConfig from '../../firebase-applet-config.json';
import { isSupabaseConfigured, signInWithSupabaseGoogle, signOutSupabase } from '../lib/supabase';
import { StudentProfile, SpecialtyCategory } from '../types';

interface LoginAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: StudentProfile | null;
  students: StudentProfile[];
  onSelectUser: (user: StudentProfile) => void;
  onSignOut: () => void;
  onOpenChangePhoto?: () => void;
}

export const LoginAuthModal: React.FC<LoginAuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  students,
  onSelectUser,
  onSignOut,
  onOpenChangePhoto,
}) => {
  if (!isOpen) return null;

  const [activeAuthTab, setActiveAuthTab] = useState<'google' | 'email' | 'personas' | 'config'>('google');
  const [emailMode, setEmailMode] = useState<'signin' | 'register'>('signin');
  
  // Email Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [university, setUniversity] = useState('');
  const [specialty, setSpecialty] = useState<SpecialtyCategory>('Engineering');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCopyConfig = () => {
    navigator.clipboard.writeText(JSON.stringify(firebaseConfig, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Google Sign-In with Firebase Authentication
  const handleGoogleSignIn = async () => {
    setAuthError(null);
    setAuthSuccess(null);
    setLoading(true);

    try {
      const res = await signInWithFirebaseGoogle();
      setLoading(false);
      
      if (res.error) {
        setAuthError(res.error);
        return;
      }

      if (res.user) {
        const student = mapFirebaseUserToStudent(res.user);
        await syncUserProfileToFirestore(student);
        onSelectUser(student);
        setAuthSuccess(`Welcome, ${student.name}! Authenticated with Firebase Google.`);
        setTimeout(() => {
          onClose();
        }, 1000);
      }
    } catch (err: any) {
      setLoading(false);
      setAuthError(err?.message || 'Google sign-in encountered an unexpected error.');
    }
  };

  // Email form submit with Firebase
  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccess(null);

    if (!email.trim() || !password.trim()) {
      setAuthError('Please enter both your email address and password.');
      return;
    }

    setLoading(true);

    try {
      if (emailMode === 'register') {
        if (!fullName.trim() || !university.trim()) {
          setAuthError('Please provide your full name and university.');
          setLoading(false);
          return;
        }

        const res = await registerWithFirebaseEmail(email.trim(), password.trim(), fullName.trim());
        setLoading(false);

        if (res.error) {
          setAuthError(res.error);
          return;
        }

        if (res.user) {
          const student = mapFirebaseUserToStudent(res.user, {
            name: fullName.trim(),
            university: university.trim(),
            specialty,
            major: `${specialty} Student`,
          });
          await syncUserProfileToFirestore(student);
          onSelectUser(student);
          setAuthSuccess(`Welcome to TeamForge, ${fullName}! Your Firebase student account is ready.`);
          setTimeout(() => onClose(), 1200);
        }
      } else {
        const res = await signInWithFirebaseEmail(email.trim(), password.trim());
        setLoading(false);

        if (res.error) {
          setAuthError(res.error);
          return;
        }

        if (res.user) {
          const student = mapFirebaseUserToStudent(res.user);
          await syncUserProfileToFirestore(student);
          onSelectUser(student);
          setAuthSuccess(`Welcome back, ${student.name}!`);
          setTimeout(() => onClose(), 1000);
        }
      }
    } catch (err: any) {
      setLoading(false);
      setAuthError(err?.message || 'Authentication error.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-stone-200 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-600 flex items-center justify-center text-white shadow-sm">
              <LogIn className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-stone-900 leading-tight">
                Student Sign In & Login
              </h3>
              <p className="text-xs text-stone-500">
                Access your projects, team requests, and balanced rosters
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Auth Mode Tabs */}
        <div className="flex border-b border-stone-200 bg-stone-50/70 px-4 pt-2 gap-1 overflow-x-auto">
          <button
            id="tab-auth-google"
            onClick={() => setActiveAuthTab('google')}
            className={`px-3 py-2 text-xs font-semibold rounded-t-lg transition-colors whitespace-nowrap flex items-center gap-1.5 border-b-2 ${
              activeAuthTab === 'google'
                ? 'bg-white text-stone-900 border-amber-600 shadow-sm'
                : 'text-stone-500 hover:text-stone-800 border-transparent'
            }`}
          >
            <span>Google Login</span>
            <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.2 rounded">
              Firebase
            </span>
          </button>

          <button
            id="tab-auth-email"
            onClick={() => setActiveAuthTab('email')}
            className={`px-3 py-2 text-xs font-semibold rounded-t-lg transition-colors whitespace-nowrap flex items-center gap-1.5 border-b-2 ${
              activeAuthTab === 'email'
                ? 'bg-white text-stone-900 border-amber-600 shadow-sm'
                : 'text-stone-500 hover:text-stone-800 border-transparent'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Email & Password</span>
          </button>

          <button
            id="tab-auth-personas"
            onClick={() => setActiveAuthTab('personas')}
            className={`px-3 py-2 text-xs font-semibold rounded-t-lg transition-colors whitespace-nowrap flex items-center gap-1.5 border-b-2 ${
              activeAuthTab === 'personas'
                ? 'bg-white text-stone-900 border-amber-600 shadow-sm'
                : 'text-stone-500 hover:text-stone-800 border-transparent'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Student Personas</span>
          </button>

          <button
            id="tab-auth-config"
            onClick={() => setActiveAuthTab('config')}
            className={`px-3 py-2 text-xs font-semibold rounded-t-lg transition-colors whitespace-nowrap flex items-center gap-1.5 border-b-2 ${
              activeAuthTab === 'config'
                ? 'bg-white text-stone-900 border-amber-600 shadow-sm'
                : 'text-stone-500 hover:text-stone-800 border-transparent'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Firebase Status</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 max-h-[70vh] overflow-y-auto space-y-4">
          
          {/* Active User Session status */}
          {currentUser ? (
            <div className="p-3.5 bg-amber-50/70 rounded-xl border border-amber-200/80 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative flex-shrink-0">
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-11 h-11 rounded-full object-cover ring-2 ring-amber-300"
                  />
                  {onOpenChangePhoto && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenChangePhoto();
                      }}
                      title="Change Profile Photo"
                      className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-amber-600 hover:bg-amber-700 text-white flex items-center justify-center cursor-pointer shadow-xs"
                    >
                      <Camera className="w-2.5 h-2.5" />
                    </button>
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-stone-900 truncate">
                      {currentUser.name}
                    </span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-1.5 py-0.5 rounded">
                      Firebase Session Active
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-600 truncate">
                    {currentUser.email} • {currentUser.specialty}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                {onOpenChangePhoto && (
                  <button
                    id="modal-change-photo-btn"
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenChangePhoto();
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold flex items-center gap-1 shadow-2xs cursor-pointer transition-colors"
                  >
                    <Camera className="w-3 h-3" />
                    <span>Change Photo</span>
                  </button>
                )}

                <button
                  id="sign-out-btn"
                  onClick={async () => {
                    await signOutFirebase();
                    onSignOut();
                    setAuthSuccess('Signed out of session.');
                    setTimeout(() => setAuthSuccess(null), 2000);
                  }}
                  className="px-2.5 py-1.5 rounded-lg border border-stone-300 text-stone-700 hover:bg-stone-100 text-xs font-semibold flex items-center gap-1 flex-shrink-0 cursor-pointer"
                >
                  <LogOut className="w-3 h-3 text-stone-500" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-stone-100 rounded-xl text-xs text-stone-600 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-stone-400 flex-shrink-0" />
              <span>You are currently browsing as Guest. Sign in below to apply for roles or post projects.</span>
            </div>
          )}

          {/* Feedback messages */}
          {authError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-medium">
              {authError}
            </div>
          )}

          {authSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{authSuccess}</span>
            </div>
          )}

          {/* TAB 1: GOOGLE & FIREBASE SIGN IN */}
          {activeAuthTab === 'google' && (
            <div className="space-y-4 pt-1">
              <div className="text-center space-y-1">
                <h4 className="text-sm font-bold text-stone-900">
                  One-Click Google Authentication
                </h4>
                <p className="text-xs text-stone-500 max-w-sm mx-auto">
                  Sign in instantly with your Google account via Firebase Authentication. Your profile synchronizes across team rosters and projects.
                </p>
              </div>

              <button
                id="btn-google-oauth-login"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-white hover:bg-stone-50 text-stone-800 border-2 border-stone-200 hover:border-amber-400 font-semibold text-sm shadow-sm transition-all flex items-center justify-center gap-3 active:scale-[0.99] cursor-pointer disabled:opacity-60"
              >
                {loading ? (
                  <span className="text-xs font-medium text-stone-500">Connecting to Google...</span>
                ) : (
                  <>
                    {/* Google G SVG */}
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.9c2.27-2.09 3.645-5.17 3.645-9.15z"/>
                      <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.9-3.05c-1.08.72-2.45 1.16-4.03 1.16-3.1 0-5.73-2.1-6.66-4.94H1.31v3.13C3.29 21.28 7.37 24 12 24z"/>
                      <path fill="#FBBC05" d="M5.34 14.26c-.24-.72-.37-1.49-.37-2.26s.13-1.54.37-2.26V6.61H1.31C.48 8.27 0 10.08 0 12s.48 3.73 1.31 5.39l4.03-3.13z"/>
                      <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.37 0 3.29 2.72 1.31 6.61l4.03 3.13c.93-2.84 3.56-4.99 6.66-4.99z"/>
                    </svg>
                    <span>Continue with Google Account (Firebase)</span>
                  </>
                )}
              </button>

              {/* Status pill */}
              <div className="flex items-center justify-between p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs text-stone-600">
                <span className="flex items-center gap-1.5 font-medium">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Firebase Authentication Engine:
                </span>
                <span className="px-2 py-0.5 rounded font-bold text-[11px] bg-emerald-100 text-emerald-800">
                  Provisioned & Ready
                </span>
              </div>
            </div>
          )}

          {/* TAB 2: EMAIL & PASSWORD */}
          {activeAuthTab === 'email' && (
            <div className="space-y-4 pt-1">
              <div className="flex bg-stone-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setEmailMode('signin')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                    emailMode === 'signin' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => setEmailMode('register')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                    emailMode === 'register' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500'
                  }`}
                >
                  Create Student Account
                </button>
              </div>

              <form onSubmit={handleEmailAuth} className="space-y-3">
                {emailMode === 'register' && (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        Full Name
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="e.g., Konduru Achary"
                          className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-9 pr-3 py-2 text-xs text-stone-900 focus:bg-white focus:ring-2 focus:ring-amber-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-stone-700 mb-1">
                          University / College
                        </label>
                        <div className="relative">
                          <GraduationCap className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            value={university}
                            onChange={(e) => setUniversity(e.target.value)}
                            placeholder="e.g., UC Berkeley, Stanford"
                            className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-9 pr-3 py-2 text-xs text-stone-900 focus:bg-white focus:ring-2 focus:ring-amber-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-stone-700 mb-1">
                          Primary Superpower / Role
                        </label>
                        <select
                          value={specialty}
                          onChange={(e) => setSpecialty(e.target.value as SpecialtyCategory)}
                          className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-900 focus:bg-white focus:ring-2 focus:ring-amber-500"
                        >
                          <option value="UI/UX Design">UI/UX Design (Figma)</option>
                          <option value="Engineering">Engineering (Full-Stack / React)</option>
                          <option value="AI / ML">AI / ML (Python / LLMs)</option>
                          <option value="Product & Pitch">Product & Pitch (Storytelling)</option>
                          <option value="Data Science">Data Science & Analytics</option>
                        </select>
                      </div>
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Student Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="student@university.edu"
                      required
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-9 pr-3 py-2 text-xs text-stone-900 focus:bg-white focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-9 pr-3 py-2 text-xs text-stone-900 focus:bg-white focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl font-bold text-xs shadow-sm transition-all"
                >
                  {emailMode === 'signin' ? 'Sign In to Account' : 'Create & Join TeamForge'}
                </button>
              </form>
            </div>
          )}

          {/* TAB 3: QUICK STUDENT PERSONAS */}
          {activeAuthTab === 'personas' && (
            <div className="space-y-3 pt-1">
              <p className="text-xs text-stone-500">
                Click any collaborator profile below to instantly log in as that student:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {students.map((student) => (
                  <button
                    key={student.id}
                    id={`persona-login-${student.id}`}
                    onClick={() => {
                      onSelectUser(student);
                      setAuthSuccess(`Logged in as ${student.name}!`);
                      setTimeout(() => onClose(), 800);
                    }}
                    className={`text-left p-3 rounded-xl border transition-all flex items-center gap-3 ${
                      currentUser?.id === student.id
                        ? 'bg-amber-50/90 border-amber-300 ring-1 ring-amber-400'
                        : 'bg-white border-stone-200 hover:border-stone-300 hover:bg-stone-50'
                    }`}
                  >
                    <img
                      src={student.avatar}
                      alt={student.name}
                      className="w-10 h-10 rounded-full object-cover flex-shrink-0 ring-1 ring-stone-200"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-stone-900 truncate">
                          {student.name}
                        </span>
                        {currentUser?.id === student.id && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-[11px] text-amber-800 font-semibold truncate">
                        {student.specialty}
                      </p>
                      <p className="text-[10px] text-stone-500 truncate">
                        {student.university}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: FIREBASE CONFIGURATION & STATUS */}
          {activeAuthTab === 'config' && (
            <div className="space-y-3 pt-1">
              <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-bold text-stone-800">
                      Firebase Project & Firestore Status
                    </span>
                  </div>
                  <button
                    onClick={handleCopyConfig}
                    className="text-[11px] text-stone-600 hover:text-stone-900 flex items-center gap-1 font-semibold"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Copied Config' : 'Copy Config'}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                  <div className="bg-white p-2.5 rounded-lg border border-stone-200">
                    <span className="text-stone-400 block text-[10px] font-medium">PROJECT ID</span>
                    <span className="font-mono font-semibold text-stone-800">{firebaseConfig.projectId}</span>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-stone-200">
                    <span className="text-stone-400 block text-[10px] font-medium">AUTH DOMAIN</span>
                    <span className="font-mono font-semibold text-stone-800">{firebaseConfig.authDomain}</span>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-stone-200 sm:col-span-2">
                    <span className="text-stone-400 block text-[10px] font-medium">FIRESTORE DATABASE ID</span>
                    <span className="font-mono font-semibold text-stone-800">{firebaseConfig.firestoreDatabaseId}</span>
                  </div>
                </div>

                <div className="p-2.5 bg-emerald-50 rounded-lg border border-emerald-200 flex items-center gap-2 text-xs text-emerald-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Firebase Authentication & Firestore Database are provisioned and active.</span>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between">
          <span className="text-[11px] text-stone-500">
            TeamForge Secure Student Auth
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold bg-stone-900 text-white rounded-lg hover:bg-stone-800 transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
