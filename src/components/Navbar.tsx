import React, { useState, useEffect } from 'react';
import { 
  Menu,
  X,
  Compass, 
  Users, 
  Layers, 
  FolderKanban, 
  Inbox, 
  PlusCircle, 
  Sliders,
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
  LogIn,
  LogOut,
  UserCheck,
  Camera
} from 'lucide-react';
import { StudentProfile } from '../types';

export type NavTab = 'projects' | 'collaborators' | 'balance' | 'my-projects' | 'hub';

interface NavbarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  currentUser: StudentProfile | null;
  students: StudentProfile[];
  onSelectPersona: (student: StudentProfile) => void;
  onOpenCreateProject: () => void;
  onOpenAuthModal: () => void;
  onSignOut: () => void;
  pendingRequestsCount: number;
  onOpenChangePhoto?: () => void;
}

const TAB_INFO: Record<NavTab, { label: string; icon: React.ComponentType<{ className?: string }>; desc: string }> = {
  projects: {
    label: 'Find Projects',
    icon: Compass,
    desc: 'Browse open student teams & hackathons',
  },
  collaborators: {
    label: 'Find Teammates',
    icon: Users,
    desc: 'Discover engineers, designers & leads',
  },
  balance: {
    label: 'Team Balance Studio',
    icon: Sliders,
    desc: 'Multidisciplinary team builder',
  },
  'my-projects': {
    label: 'My Teams',
    icon: FolderKanban,
    desc: 'Projects you lead or joined',
  },
  hub: {
    label: 'Requests & Invites',
    icon: Inbox,
    desc: 'Manage applications & team invites',
  },
};

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  students,
  onSelectPersona,
  onOpenCreateProject,
  onOpenAuthModal,
  onSignOut,
  pendingRequestsCount,
  onOpenChangePhoto,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isPersonaListOpen, setIsPersonaListOpen] = useState(false);

  // Close drawer on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Prevent background scroll when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  const handleSelectTab = (tab: NavTab) => {
    setActiveTab(tab);
    setIsMenuOpen(false);
  };

  return (
    <>
      {/* Top Simple & Clean Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-3">
            
            {/* Left Corner: Menu Button + Brand */}
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Main Menu Button at the Left Corner */}
              <button
                id="left-corner-menu-btn"
                onClick={() => setIsMenuOpen(true)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200/80 active:bg-stone-200 text-stone-800 transition-all font-semibold text-sm cursor-pointer border border-stone-200/70 shadow-sm group"
                aria-label="Open Navigation Menu"
                title="Open Navigation Menu"
              >
                <Menu className="w-5 h-5 text-stone-700 group-hover:scale-110 transition-transform" />
                <span className="hidden xs:inline text-xs font-bold uppercase tracking-wider text-stone-700">
                  Menu
                </span>
                {pendingRequestsCount > 0 && (
                  <span className="w-4 h-4 text-[10px] font-bold rounded-full bg-orange-600 text-white flex items-center justify-center -ml-0.5">
                    {pendingRequestsCount}
                  </span>
                )}
              </button>

              <div className="h-5 w-px bg-stone-200 hidden sm:block" />

              {/* Brand Logo & Name */}
              <button 
                id="brand-logo-btn"
                onClick={() => setActiveTab('projects')} 
                className="flex items-center gap-2.5 text-left group focus:outline-none"
              >
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-600 via-orange-500 to-amber-500 flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-base sm:text-lg text-stone-900 tracking-tight">TeamForge</span>
                    <span className="text-[10px] sm:text-[11px] font-semibold uppercase px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200/60">
                      Student
                    </span>
                  </div>
                  <p className="text-[10px] sm:text-[11px] text-stone-500 hidden sm:block">Balanced Collaborator Matcher</p>
                </div>
              </button>
            </div>

            {/* Right Side: Clean Quick Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Quick Post Project Button */}
              <button
                onClick={onOpenCreateProject}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs sm:text-sm font-semibold shadow-sm transition-all active:scale-95 cursor-pointer"
                title="Post a new project or idea"
              >
                <PlusCircle className="w-4 h-4" />
                <span className="hidden sm:inline">Post Project</span>
              </button>

              {/* User Avatar / Login */}
              {currentUser ? (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setIsMenuOpen(true)}
                    className="flex items-center gap-2 p-1 pl-1 pr-2 sm:pr-3 rounded-xl border border-stone-200 hover:bg-stone-50 transition-colors text-left"
                    title="Open user profile & menu"
                  >
                    <div className="relative flex-shrink-0">
                      <img
                        src={currentUser.avatar}
                        alt={currentUser.name}
                        className="w-8 h-8 rounded-full object-cover ring-1 ring-amber-400/60"
                      />
                      <span 
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenChangePhoto?.();
                        }}
                        title="Change Profile Photo"
                        className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-amber-600 hover:bg-amber-700 text-white flex items-center justify-center cursor-pointer shadow-xs transition-transform hover:scale-110"
                      >
                        <Camera className="w-2.5 h-2.5" />
                      </span>
                    </div>
                    <div className="hidden sm:block text-left">
                      <p className="text-xs font-bold text-stone-900 leading-none truncate max-w-[90px]">
                        {currentUser.name}
                      </p>
                      <span className="text-[10px] text-amber-700 font-medium leading-none">
                        {currentUser.specialty}
                      </span>
                    </div>
                  </button>
                </div>
              ) : (
                <button
                  onClick={onOpenAuthModal}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs sm:text-sm font-semibold shadow-sm transition-all active:scale-95"
                >
                  <LogIn className="w-4 h-4 text-amber-400" />
                  <span>Sign In</span>
                </button>
              )}
            </div>

          </div>
        </div>
      </header>

      {/* Left Corner Sliding Menu Drawer & Backdrop */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Dark Backdrop */}
          <div 
            className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
            onClick={() => setIsMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Sliding Side Drawer from the Left */}
          <div 
            id="left-side-navigation-drawer"
            className="relative w-full max-w-sm sm:max-w-md bg-white shadow-2xl flex flex-col h-full z-10 animate-in slide-in-from-left duration-200 ease-out border-r border-stone-200"
          >
            {/* Drawer Header */}
            <div className="p-4 sm:p-5 border-b border-stone-100 flex items-center justify-between bg-stone-50/70">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 via-orange-500 to-amber-500 flex items-center justify-center text-white shadow-sm">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-lg text-stone-900 tracking-tight">TeamForge</span>
                    <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                      Menu
                    </span>
                  </div>
                  <p className="text-xs text-stone-500">Student Team Matcher</p>
                </div>
              </div>

              {/* Close Button */}
              <button
                id="close-menu-btn"
                onClick={() => setIsMenuOpen(false)}
                className="w-8 h-8 rounded-lg text-stone-500 hover:text-stone-900 hover:bg-stone-200/80 flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-6">
              
              {/* User Card inside Menu */}
              {currentUser ? (
                <div className="p-3.5 bg-gradient-to-br from-amber-50/80 to-orange-50/40 rounded-2xl border border-amber-200/70 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="relative group flex-shrink-0">
                      <img
                        src={currentUser.avatar}
                        alt={currentUser.name}
                        className="w-13 h-13 rounded-full object-cover ring-2 ring-amber-400/80 shadow-xs"
                      />
                      <button
                        id="avatar-camera-overlay-btn"
                        type="button"
                        onClick={() => {
                          setIsMenuOpen(false);
                          onOpenChangePhoto?.();
                        }}
                        className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-amber-600 hover:bg-amber-700 text-white flex items-center justify-center shadow-md transition-transform hover:scale-110 cursor-pointer"
                        title="Change Profile Photo"
                        aria-label="Change Profile Photo"
                      >
                        <Camera className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-bold text-stone-900 truncate">
                          {currentUser.name}
                        </p>
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-1.5 py-0.2 rounded">
                          Active
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-amber-800 truncate">
                        {currentUser.specialty}
                      </p>
                      <p className="text-[11px] text-stone-500 truncate">
                        {currentUser.university}
                      </p>
                      
                      {/* Button on profile to change profile photo */}
                      <button
                        id="change-profile-photo-btn"
                        type="button"
                        onClick={() => {
                          setIsMenuOpen(false);
                          onOpenChangePhoto?.();
                        }}
                        className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 hover:text-amber-950 bg-amber-200/60 hover:bg-amber-200 px-2 py-0.5 rounded-md transition-colors cursor-pointer border border-amber-300/60"
                      >
                        <Camera className="w-3 h-3 text-amber-800" />
                        <span>Change Photo</span>
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1 border-t border-amber-200/50">
                    <button
                      id="top-login-pill-btn"
                      onClick={() => {
                        setIsMenuOpen(false);
                        onOpenAuthModal();
                      }}
                      className="flex-1 py-1.5 px-2.5 rounded-lg bg-white hover:bg-amber-50 text-stone-700 text-xs font-semibold border border-stone-200/80 transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                      <span>Account Settings</span>
                    </button>

                    <button
                      id="menu-sign-out-btn"
                      onClick={() => {
                        setIsMenuOpen(false);
                        onSignOut();
                      }}
                      className="py-1.5 px-2.5 rounded-lg hover:bg-rose-50 text-rose-600 text-xs font-semibold border border-transparent hover:border-rose-200 transition-colors flex items-center gap-1"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
                  <div className="flex items-center gap-2 text-stone-800 font-bold text-xs">
                    <UserCheck className="w-4 h-4 text-amber-600" />
                    <span>Guest Mode</span>
                  </div>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    Sign in with Google or Firebase to apply for open project roles or recruit student teammates.
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      id="navbar-login-btn"
                      onClick={() => {
                        setIsMenuOpen(false);
                        onOpenAuthModal();
                      }}
                      className="flex-1 py-2 px-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm"
                    >
                      <LogIn className="w-3.5 h-3.5 text-amber-400" />
                      <span>Sign In / Log In</span>
                    </button>

                    <button
                      id="top-login-pill-btn"
                      onClick={() => {
                        setIsMenuOpen(false);
                        onOpenAuthModal();
                      }}
                      className="py-2 px-3 rounded-xl bg-white hover:bg-stone-100 text-stone-700 text-xs font-semibold border border-stone-300 transition-colors"
                      title="Firebase Login & Config"
                    >
                      Auth
                    </button>
                  </div>
                </div>
              )}

              {/* Primary Post Project Action in Menu */}
              <button
                id="create-project-top-btn"
                onClick={() => {
                  setIsMenuOpen(false);
                  onOpenCreateProject();
                }}
                className="w-full py-3 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>+ Post a New Project / Idea</span>
              </button>

              {/* Navigation Links (Moved from Home Page Header into Menu) */}
              <div className="space-y-1">
                <p className="text-[11px] font-bold text-stone-400 uppercase tracking-wider px-2 mb-2">
                  Navigation
                </p>

                {/* 1. Projects */}
                <button
                  id="nav-tab-projects"
                  onClick={() => handleSelectTab('projects')}
                  className={`w-full text-left p-3 rounded-xl font-medium transition-all flex items-center justify-between group cursor-pointer ${
                    activeTab === 'projects'
                      ? 'bg-stone-900 text-white shadow-sm'
                      : 'text-stone-700 hover:bg-stone-100 hover:text-stone-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      activeTab === 'projects' ? 'bg-stone-800 text-amber-400' : 'bg-stone-100 text-stone-600 group-hover:text-stone-900'
                    }`}>
                      <Compass className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-sm font-bold block leading-tight">Find Projects</span>
                      <span className={`text-[11px] block ${
                        activeTab === 'projects' ? 'text-stone-300' : 'text-stone-500'
                      }`}>
                        Browse student teams & hackathons
                      </span>
                    </div>
                  </div>
                  <ChevronRight className={`w-4 h-4 ${activeTab === 'projects' ? 'text-stone-400' : 'text-stone-300 group-hover:text-stone-500'}`} />
                </button>

                {/* 2. Collaborators */}
                <button
                  id="nav-tab-collaborators"
                  onClick={() => handleSelectTab('collaborators')}
                  className={`w-full text-left p-3 rounded-xl font-medium transition-all flex items-center justify-between group cursor-pointer ${
                    activeTab === 'collaborators'
                      ? 'bg-stone-900 text-white shadow-sm'
                      : 'text-stone-700 hover:bg-stone-100 hover:text-stone-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      activeTab === 'collaborators' ? 'bg-stone-800 text-amber-400' : 'bg-stone-100 text-stone-600 group-hover:text-stone-900'
                    }`}>
                      <Users className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-sm font-bold block leading-tight">Find Teammates</span>
                      <span className={`text-[11px] block ${
                        activeTab === 'collaborators' ? 'text-stone-300' : 'text-stone-500'
                      }`}>
                        Engineers, designers, AI & PM students
                      </span>
                    </div>
                  </div>
                  <ChevronRight className={`w-4 h-4 ${activeTab === 'collaborators' ? 'text-stone-400' : 'text-stone-300 group-hover:text-stone-500'}`} />
                </button>

                {/* 3. Balance Studio */}
                <button
                  id="nav-tab-balance"
                  onClick={() => handleSelectTab('balance')}
                  className={`w-full text-left p-3 rounded-xl font-medium transition-all flex items-center justify-between group cursor-pointer ${
                    activeTab === 'balance'
                      ? 'bg-stone-900 text-white shadow-sm'
                      : 'text-stone-700 hover:bg-stone-100 hover:text-stone-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      activeTab === 'balance' ? 'bg-stone-800 text-amber-400' : 'bg-stone-100 text-stone-600 group-hover:text-stone-900'
                    }`}>
                      <Sliders className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold block leading-tight">Team Balance Studio</span>
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      </div>
                      <span className={`text-[11px] block ${
                        activeTab === 'balance' ? 'text-stone-300' : 'text-stone-500'
                      }`}>
                        Analyze & fix team skill imbalances
                      </span>
                    </div>
                  </div>
                  <ChevronRight className={`w-4 h-4 ${activeTab === 'balance' ? 'text-stone-400' : 'text-stone-300 group-hover:text-stone-500'}`} />
                </button>

                {/* 4. My Teams */}
                <button
                  id="nav-tab-my-projects"
                  onClick={() => handleSelectTab('my-projects')}
                  className={`w-full text-left p-3 rounded-xl font-medium transition-all flex items-center justify-between group cursor-pointer ${
                    activeTab === 'my-projects'
                      ? 'bg-stone-900 text-white shadow-sm'
                      : 'text-stone-700 hover:bg-stone-100 hover:text-stone-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      activeTab === 'my-projects' ? 'bg-stone-800 text-amber-400' : 'bg-stone-100 text-stone-600 group-hover:text-stone-900'
                    }`}>
                      <FolderKanban className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-sm font-bold block leading-tight">My Teams</span>
                      <span className={`text-[11px] block ${
                        activeTab === 'my-projects' ? 'text-stone-300' : 'text-stone-500'
                      }`}>
                        Manage your created & joined projects
                      </span>
                    </div>
                  </div>
                  <ChevronRight className={`w-4 h-4 ${activeTab === 'my-projects' ? 'text-stone-400' : 'text-stone-300 group-hover:text-stone-500'}`} />
                </button>

                {/* 5. Requests Hub */}
                <button
                  id="nav-tab-hub"
                  onClick={() => handleSelectTab('hub')}
                  className={`w-full text-left p-3 rounded-xl font-medium transition-all flex items-center justify-between group cursor-pointer ${
                    activeTab === 'hub'
                      ? 'bg-stone-900 text-white shadow-sm'
                      : 'text-stone-700 hover:bg-stone-100 hover:text-stone-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center relative ${
                      activeTab === 'hub' ? 'bg-stone-800 text-amber-400' : 'bg-stone-100 text-stone-600 group-hover:text-stone-900'
                    }`}>
                      <Inbox className="w-4 h-4" />
                      {pendingRequestsCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 text-[10px] font-bold rounded-full bg-orange-600 text-white flex items-center justify-center">
                          {pendingRequestsCount}
                        </span>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold block leading-tight">Requests & Invites</span>
                        {pendingRequestsCount > 0 && (
                          <span className="px-1.5 py-0.2 rounded bg-orange-100 text-orange-800 text-[10px] font-bold">
                            {pendingRequestsCount} New
                          </span>
                        )}
                      </div>
                      <span className={`text-[11px] block ${
                        activeTab === 'hub' ? 'text-stone-300' : 'text-stone-500'
                      }`}>
                        Review candidate applications & team invites
                      </span>
                    </div>
                  </div>
                  <ChevronRight className={`w-4 h-4 ${activeTab === 'hub' ? 'text-stone-400' : 'text-stone-300 group-hover:text-stone-500'}`} />
                </button>
              </div>

              {/* Student Personas Quick Switcher Accordion inside Menu */}
              <div className="pt-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsPersonaListOpen(!isPersonaListOpen)}
                  className="w-full flex items-center justify-between p-2 rounded-lg text-xs font-bold text-stone-600 hover:bg-stone-100 transition-colors"
                >
                  <span className="flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-stone-500" />
                    <span>Switch Test Student Persona</span>
                  </span>
                  <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isPersonaListOpen ? 'rotate-90' : ''}`} />
                </button>

                {isPersonaListOpen && (
                  <div className="mt-2 space-y-1 max-h-48 overflow-y-auto pl-1 pr-1">
                    {students.map((student) => (
                      <button
                        key={student.id}
                        id={`menu-switch-persona-${student.id}`}
                        onClick={() => {
                          onSelectPersona(student);
                          setIsMenuOpen(false);
                        }}
                        className={`w-full text-left px-2.5 py-2 rounded-lg flex items-center gap-2.5 transition-colors ${
                          currentUser?.id === student.id 
                            ? 'bg-amber-100/70 text-stone-900 font-bold' 
                            : 'hover:bg-stone-100 text-stone-700'
                        }`}
                      >
                        <img
                          src={student.avatar}
                          alt={student.name}
                          className="w-7 h-7 rounded-full object-cover flex-shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs truncate">{student.name}</span>
                            {currentUser?.id === student.id && (
                              <CheckCircle2 className="w-3 h-3 text-amber-700 flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-[10px] text-stone-500 truncate">
                            {student.specialty} • {student.university.split(' ')[0]}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

            </div>

            {/* Drawer Footer */}
            <div className="p-3.5 bg-stone-50 border-t border-stone-200 flex items-center justify-between text-xs text-stone-500">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-[11px] font-medium">Firebase Auth & DB Active</span>
              </div>
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  onOpenAuthModal();
                }}
                className="text-[11px] font-bold text-amber-700 hover:text-amber-800 hover:underline"
              >
                Config
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
};
