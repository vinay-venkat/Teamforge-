import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  Award, 
  Users, 
  Briefcase, 
  Compass,
  ArrowUpDown,
  CheckCircle2,
  TrendingUp,
  AlertCircle,
  LogIn,
  LogOut,
  UserCheck
} from 'lucide-react';
import { 
  Project, 
  StudentProfile, 
  ApplicationRequest, 
  TeamInvitation, 
  ChatMessage, 
  ProjectCategory, 
  SpecialtyCategory 
} from './types';
import { 
  initialProjects, 
  initialStudents, 
  currentUserProfile, 
  initialApplications, 
  initialInvitations, 
  initialChatMessages 
} from './data/mockData';
import { calculateTeamBalance } from './lib/teamBalance';
import { Navbar, NavTab } from './components/Navbar';
import { ProjectCard } from './components/ProjectCard';
import { CollaboratorCard } from './components/CollaboratorCard';
import { ProjectDetailModal } from './components/ProjectDetailModal';
import { CreateProjectModal } from './components/CreateProjectModal';
import { TeamBalanceStudio } from './components/TeamBalanceStudio';
import { AiFitModal } from './components/AiFitModal';
import { InviteModal } from './components/InviteModal';
import { RequestsHub } from './components/RequestsHub';
import { MyProjectsView } from './components/MyProjectsView';
import { LoginAuthModal } from './components/LoginAuthModal';
import { ChangePhotoModal } from './components/ChangePhotoModal';
import { SupportChatWidget } from './components/SupportChatWidget';
import { 
  auth, 
  testFirestoreConnection, 
  mapFirebaseUserToStudent, 
  fetchUserProfileFromFirestore, 
  syncUserProfileToFirestore, 
  signOutFirebase 
} from './lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

export default function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState<NavTab>('projects');

  // Core Data States with localStorage fallback
  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem('teamforge_projects');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return initialProjects;
  });

  const [students, setStudents] = useState<StudentProfile[]>(initialStudents);
  const [currentUser, setCurrentUser] = useState<StudentProfile | null>(currentUserProfile);
  const [applications, setApplications] = useState<ApplicationRequest[]>(initialApplications);
  const [invitations, setInvitations] = useState<TeamInvitation[]>(initialInvitations);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(initialChatMessages);

  // Fallback profile for modal components when in guest mode
  const effectiveUser = currentUser || initialStudents[0];

  // Initialize Firebase connection and session listener
  useEffect(() => {
    testFirestoreConnection();

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const existingProfile = await fetchUserProfileFromFirestore(firebaseUser.uid);
          if (existingProfile) {
            setCurrentUser(existingProfile);
            setStudents((prev) => {
              const exists = prev.some((s) => s.id === existingProfile.id);
              return exists ? prev.map((s) => s.id === existingProfile.id ? existingProfile : s) : [existingProfile, ...prev];
            });
          } else {
            const mapped = mapFirebaseUserToStudent(firebaseUser);
            await syncUserProfileToFirestore(mapped);
            setCurrentUser(mapped);
            setStudents((prev) => {
              const exists = prev.some((s) => s.id === mapped.id);
              return exists ? prev.map((s) => s.id === mapped.id ? mapped : s) : [mapped, ...prev];
            });
          }
        } catch (e) {
          console.warn('Firebase profile sync error:', e);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Sync projects to localStorage
  useEffect(() => {
    localStorage.setItem('teamforge_projects', JSON.stringify(projects));
  }, [projects]);

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedProjectForDetail, setSelectedProjectForDetail] = useState<Project | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [initialApplyMode, setInitialApplyMode] = useState(false);

  const [selectedCandidateForFit, setSelectedCandidateForFit] = useState<StudentProfile | null>(null);
  const [isAiFitOpen, setIsAiFitOpen] = useState(false);

  const [selectedCandidateForInvite, setSelectedCandidateForInvite] = useState<StudentProfile | null>(null);
  const [inviteDefaultProjectId, setInviteDefaultProjectId] = useState<string | undefined>(undefined);
  const [isInviteOpen, setIsInviteOpen] = useState(false);

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isChangePhotoOpen, setIsChangePhotoOpen] = useState(false);

  const handleUpdateAvatar = async (newAvatarUrl: string) => {
    const targetUser = currentUser || students[0];
    if (!targetUser) return;
    const updatedUser: StudentProfile = {
      ...targetUser,
      avatar: newAvatarUrl,
    };
    setCurrentUser(updatedUser);

    // Update in students list
    setStudents((prev) => prev.map((s) => s.id === updatedUser.id ? updatedUser : s));

    // Update inside projects ownerAvatar and members if present
    setProjects((prev) => prev.map((p) => {
      const isOwner = p.ownerId === updatedUser.id;
      const updatedMembers = p.members.map((m) =>
        m.userId === updatedUser.id ? { ...m, avatar: newAvatarUrl } : m
      );
      return {
        ...p,
        ownerAvatar: isOwner ? newAvatarUrl : p.ownerAvatar,
        members: updatedMembers,
      };
    }));

    // Persist to Firestore
    try {
      await syncUserProfileToFirestore(updatedUser);
    } catch (err) {
      console.warn('Could not sync updated avatar to Firestore:', err);
    }
  };

  // Filter & Search states for Projects Tab
  const [projectSearch, setProjectSearch] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('All');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('All');
  const [onlyOpenRoles, setOnlyOpenRoles] = useState<boolean>(true);

  // Filter & Search states for Collaborators Tab
  const [studentSearch, setStudentSearch] = useState('');
  const [selectedSpecialtyFilter, setSelectedSpecialtyFilter] = useState<string>('All');
  const [selectedAvailabilityFilter, setSelectedAvailabilityFilter] = useState<string>('All');

  // Pending counts
  const pendingRequestsCount = useMemo(() => {
    if (!currentUser) return 0;
    const ownedIds = projects.filter((p) => p.ownerId === currentUser.id).map((p) => p.id);
    const incApps = applications.filter((a) => ownedIds.includes(a.projectId) && a.status === 'pending').length;
    const incInvs = invitations.filter((i) => i.invitedUserId === currentUser.id && i.status === 'pending').length;
    return incApps + incInvs;
  }, [projects, currentUser, applications, invitations]);

  // Handlers
  const handleCreateProject = (newProject: Project) => {
    setProjects([newProject, ...projects]);
  };

  const handleOpenDetail = (project: Project, applyMode = false) => {
    setSelectedProjectForDetail(project);
    setInitialApplyMode(applyMode);
    setIsDetailOpen(true);
  };

  const handleApplyToProject = (projectId: string, roleId: string, pitchMessage: string) => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }

    const targetProj = projects.find((p) => p.id === projectId);
    const targetRole = targetProj?.openRoles.find((r) => r.id === roleId);

    const newApp: ApplicationRequest = {
      id: `app-${Date.now()}`,
      projectId,
      projectTitle: targetProj?.title || 'Hackathon Project',
      applicantId: currentUser.id,
      applicantName: currentUser.name,
      applicantAvatar: currentUser.avatar,
      applicantUniversity: currentUser.university,
      applicantSpecialty: currentUser.specialty,
      applicantSkills: currentUser.skills.map((s) => s.name),
      targetRoleId: roleId,
      targetRoleName: targetRole?.roleName || 'Specialist',
      pitchMessage,
      matchScore: 94,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    setApplications([newApp, ...applications]);
  };

  const handleSendInvitation = (inv: TeamInvitation) => {
    setInvitations([inv, ...invitations]);
  };

  const handleAcceptApplication = (appId: string) => {
    const app = applications.find((a) => a.id === appId);
    if (!app) return;

    // 1. Mark app accepted
    setApplications(applications.map((a) => a.id === appId ? { ...a, status: 'accepted' } : a));

    // 2. Add applicant to project members, mark role filled, update balance
    setProjects(projects.map((proj) => {
      if (proj.id !== app.projectId) return proj;

      const newMember = {
        userId: app.applicantId,
        name: app.applicantName,
        role: app.targetRoleName,
        specialty: app.applicantSpecialty,
        avatar: app.applicantAvatar,
        skills: app.applicantSkills,
      };

      const updatedMembers = [...proj.members, newMember];
      const updatedRoles = proj.openRoles.map((r) =>
        r.id === app.targetRoleId ? { ...r, status: 'filled' as const } : r
      );

      const newBalance = calculateTeamBalance(updatedMembers, updatedRoles);

      return {
        ...proj,
        members: updatedMembers,
        openRoles: updatedRoles,
        balanceBreakdown: newBalance,
      };
    }));

    // Add welcoming message to project chat
    setChatMessages((prev) => [
      ...prev,
      {
        id: `chat-${Date.now()}`,
        projectId: app.projectId,
        senderId: currentUser?.id || app.applicantId,
        senderName: currentUser?.name || 'Project Lead',
        senderAvatar: currentUser?.avatar || app.applicantAvatar,
        content: `🎉 Welcome ${app.applicantName} to the team! They are joining us as our ${app.targetRoleName}.`,
        timestamp: 'Just now',
      },
    ]);
  };

  const handleDeclineApplication = (appId: string) => {
    setApplications(applications.map((a) => a.id === appId ? { ...a, status: 'declined' } : a));
  };

  const handleAcceptInvitation = (invId: string) => {
    const inv = invitations.find((i) => i.id === invId);
    if (!inv || !currentUser) return;

    setInvitations(invitations.map((i) => i.id === invId ? { ...i, status: 'accepted' } : i));

    setProjects(projects.map((proj) => {
      if (proj.id !== inv.projectId) return proj;

      const newMember = {
        userId: currentUser.id,
        name: currentUser.name,
        role: inv.targetRoleName,
        specialty: currentUser.specialty,
        avatar: currentUser.avatar,
        skills: currentUser.skills.map((s) => s.name),
      };

      const updatedMembers = [...proj.members, newMember];
      const updatedRoles = proj.openRoles.map((r) =>
        r.id === inv.targetRoleId ? { ...r, status: 'filled' as const } : r
      );
      const newBalance = calculateTeamBalance(updatedMembers, updatedRoles);

      return {
        ...proj,
        members: updatedMembers,
        openRoles: updatedRoles,
        balanceBreakdown: newBalance,
      };
    }));
  };

  const handleDeclineInvitation = (invId: string) => {
    setInvitations(invitations.map((i) => i.id === invId ? { ...i, status: 'declined' } : i));
  };

  const handleSendMessage = (projectId: string, content: string) => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    const newMsg: ChatMessage = {
      id: `chat-${Date.now()}`,
      projectId,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatar,
      content,
      timestamp: 'Just now',
    };
    setChatMessages([...chatMessages, newMsg]);
  };

  // Switch persona user helper
  const handleSwitchPersona = (student: StudentProfile) => {
    setCurrentUser(student);
  };

  const handleSignOut = async () => {
    await signOutFirebase();
    setCurrentUser(null);
  };

  // Filtered Projects
  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      // Search query
      const q = projectSearch.toLowerCase();
      const matchSearch = !q || 
        project.title.toLowerCase().includes(q) ||
        project.description.toLowerCase().includes(q) ||
        project.eventName?.toLowerCase().includes(q) ||
        project.tags.some((t) => t.toLowerCase().includes(q)) ||
        project.openRoles.some((r) => r.roleName.toLowerCase().includes(q) || r.requiredSkills.some((s) => s.toLowerCase().includes(q)));

      // Category filter
      const matchCategory = selectedCategoryFilter === 'All' || project.category === selectedCategoryFilter;

      // Role filter
      const matchRole = selectedRoleFilter === 'All' || project.openRoles.some((r) => r.category.toLowerCase().includes(selectedRoleFilter.toLowerCase()) && r.status === 'open');

      // Only Open Roles
      const matchOpen = !onlyOpenRoles || project.openRoles.some((r) => r.status === 'open');

      return matchSearch && matchCategory && matchRole && matchOpen;
    });
  }, [projects, projectSearch, selectedCategoryFilter, selectedRoleFilter, onlyOpenRoles]);

  // Filtered Students
  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const q = studentSearch.toLowerCase();
      const matchSearch = !q ||
        student.name.toLowerCase().includes(q) ||
        student.university.toLowerCase().includes(q) ||
        student.major.toLowerCase().includes(q) ||
        student.bio.toLowerCase().includes(q) ||
        student.skills.some((s) => s.name.toLowerCase().includes(q));

      const matchSpecialty = selectedSpecialtyFilter === 'All' || student.specialty.toLowerCase().includes(selectedSpecialtyFilter.toLowerCase());
      const matchAvail = selectedAvailabilityFilter === 'All' || student.availability === selectedAvailabilityFilter;

      return matchSearch && matchSpecialty && matchAvail;
    });
  }, [students, studentSearch, selectedSpecialtyFilter, selectedAvailabilityFilter]);

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-stone-900 flex flex-col font-sans selection:bg-amber-100 selection:text-amber-900">
      
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        students={students}
        onSelectPersona={handleSwitchPersona}
        onOpenCreateProject={() => {
          if (!currentUser) {
            setIsAuthModalOpen(true);
          } else {
            setIsCreateOpen(true);
          }
        }}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onSignOut={handleSignOut}
        pendingRequestsCount={pendingRequestsCount}
        onOpenChangePhoto={() => setIsChangePhotoOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        
        {/* VIEW 1: PROJECTS DIRECTORY */}
        {activeTab === 'projects' && (
          <div className="space-y-6">
            
            {/* Projects Directory Header */}
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-stone-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-amber-600" />
                  Projects & Team Openings
                </h2>
                <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
                  Browse hackathon, competition, and research projects actively seeking collaborators
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  id="post-project-btn"
                  onClick={() => setIsCreateOpen(true)}
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs sm:text-sm transition-all shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>Post a Project</span>
                </button>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-sm space-y-4">
              
              {/* Search input */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="project-search-input"
                    type="text"
                    value={projectSearch}
                    onChange={(e) => setProjectSearch(e.target.value)}
                    placeholder="Search projects by title, keywords, hackathon (e.g., CalHacks, AI, Figma)..."
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all"
                  />
                </div>

                {/* Only open roles checkbox toggle */}
                <label className="flex items-center gap-2 text-xs font-semibold text-stone-700 cursor-pointer select-none bg-stone-50 px-3 py-2.5 rounded-xl border border-stone-200">
                  <input
                    type="checkbox"
                    checked={onlyOpenRoles}
                    onChange={(e) => setOnlyOpenRoles(e.target.checked)}
                    className="w-4 h-4 text-amber-600 rounded border-stone-300 focus:ring-amber-500"
                  />
                  <span>Has Open Roles Only</span>
                </label>
              </div>

              {/* Categorical filters */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-stone-100">
                {/* Category Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                  <span className="text-xs font-bold text-stone-400 uppercase tracking-wider mr-1">
                    Event:
                  </span>
                  {['All', 'Hackathon', 'Competition', 'Startup', 'Research'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategoryFilter(cat)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                        selectedCategoryFilter === cat
                          ? 'bg-stone-900 text-white'
                          : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Missing Role Focus Filter */}
                <div className="flex items-center gap-1.5 overflow-x-auto">
                  <span className="text-xs font-bold text-stone-400 uppercase tracking-wider mr-1">
                    Seeking:
                  </span>
                  {['All', 'Design', 'Product/Pitch', 'AI/Data', 'Engineering'].map((rf) => (
                    <button
                      key={rf}
                      onClick={() => setSelectedRoleFilter(rf)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                        selectedRoleFilter === rf
                          ? 'bg-amber-600 text-white'
                          : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                      }`}
                    >
                      {rf}
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* Projects Grid */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold uppercase tracking-wider text-stone-500">
                  Active Projects Seeking Teammates ({filteredProjects.length})
                </h2>
                <span className="text-xs text-stone-500">
                  Sorted by urgency and skill match
                </span>
              </div>

              {filteredProjects.length === 0 ? (
                <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center space-y-3">
                  <Briefcase className="w-10 h-10 text-stone-400 mx-auto" />
                  <h3 className="text-base font-bold text-stone-800">
                    No projects match your current filters
                  </h3>
                  <p className="text-xs text-stone-500 max-w-sm mx-auto">
                    Try clearing your search query or role filter, or post your own project to find teammates!
                  </p>
                  <button
                    onClick={() => {
                      setProjectSearch('');
                      setSelectedCategoryFilter('All');
                      setSelectedRoleFilter('All');
                    }}
                    className="px-4 py-2 bg-stone-900 text-white text-xs font-semibold rounded-lg hover:bg-stone-800"
                  >
                    Reset All Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProjects.map((project) => (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      currentUser={currentUser}
                      onViewDetails={(p) => handleOpenDetail(p, false)}
                      onOpenApply={(p) => handleOpenDetail(p, true)}
                    />
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

        {/* VIEW 2: COLLABORATORS & STUDENT DIRECTORY */}
        {activeTab === 'collaborators' && (
          <div className="space-y-6">
            
            {/* Collaborators Banner */}
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-stone-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2">
                  <Users className="w-5 h-5 text-amber-600" />
                  Student Collaborator Directory
                </h2>
                <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
                  Browse talent by design, AI, pitch storytelling, and engineering specialty
                </p>
              </div>

              <div className="text-xs font-semibold text-stone-600 bg-stone-50 px-3 py-1.5 rounded-xl border border-stone-200">
                {students.filter(s => s.availability === 'Actively Looking').length} students actively looking for teams
              </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-sm space-y-4">
              <div className="relative">
                <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="student-search-input"
                  type="text"
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  placeholder="Search students by name, skills (e.g. PyTorch, Figma, Pitch), university, or major..."
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-stone-100">
                {/* Specialty filters */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                  <span className="text-xs font-bold text-stone-400 uppercase tracking-wider mr-1">
                    Specialty:
                  </span>
                  {['All', 'UI/UX Design', 'Product & Pitch', 'AI / ML', 'Engineering', 'Data Science'].map((spec) => (
                    <button
                      key={spec}
                      onClick={() => setSelectedSpecialtyFilter(spec)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                        selectedSpecialtyFilter === spec
                          ? 'bg-stone-900 text-white'
                          : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                      }`}
                    >
                      {spec}
                    </button>
                  ))}
                </div>

                {/* Availability filter */}
                <div className="flex items-center gap-1.5 overflow-x-auto">
                  <span className="text-xs font-bold text-stone-400 uppercase tracking-wider mr-1">
                    Status:
                  </span>
                  {['All', 'Actively Looking', 'Open to Offers'].map((status) => (
                    <button
                      key={status}
                      onClick={() => setSelectedAvailabilityFilter(status)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                        selectedAvailabilityFilter === status
                          ? 'bg-amber-600 text-white'
                          : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Collaborators Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredStudents.map((student) => (
                <CollaboratorCard
                  key={student.id}
                  student={student}
                  currentUser={currentUser}
                  onAnalyzeFit={(cand) => {
                    setSelectedCandidateForFit(cand);
                    setIsAiFitOpen(true);
                  }}
                  onInvite={(cand) => {
                    setSelectedCandidateForInvite(cand);
                    setIsInviteOpen(true);
                  }}
                  onOpenChangePhoto={() => setIsChangePhotoOpen(true)}
                />
              ))}
            </div>

          </div>
        )}

        {/* VIEW 3: TEAM BALANCE STUDIO (The Core Architectural Innovation) */}
        {activeTab === 'balance' && (
          <TeamBalanceStudio
            projects={projects}
            students={students}
            currentUser={effectiveUser}
            onInviteCandidate={(candidate, projId) => {
              if (!currentUser) {
                setIsAuthModalOpen(true);
              } else {
                setSelectedCandidateForInvite(candidate);
                setInviteDefaultProjectId(projId);
                setIsInviteOpen(true);
              }
            }}
            onNavigateToCollaboratorsWithFilter={(specialty) => {
              setSelectedSpecialtyFilter(specialty);
              setActiveTab('collaborators');
            }}
          />
        )}

        {/* VIEW 4: MY PROJECTS & ROSTERS */}
        {activeTab === 'my-projects' && (
          currentUser ? (
            <MyProjectsView
              projects={projects}
              currentUser={currentUser}
              onCreateProjectClick={() => setIsCreateOpen(true)}
              onViewProjectDetails={(p) => handleOpenDetail(p, false)}
              onOpenTeamBalanceStudio={(projId) => {
                setActiveTab('balance');
              }}
            />
          ) : (
            <div className="p-12 text-center bg-white rounded-3xl border border-stone-200 shadow-sm space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
                <LogIn className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-stone-900">Sign In to View Your Teams</h3>
              <p className="text-xs sm:text-sm text-stone-500 max-w-md mx-auto">
                Log in to manage your created hackathon projects, track balance scores, and invite collaborators.
              </p>
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs sm:text-sm shadow-sm transition-all"
              >
                Sign In / Open Login Modal
              </button>
            </div>
          )
        )}

        {/* VIEW 5: REQUESTS & COLLABORATION HUB */}
        {activeTab === 'hub' && (
          currentUser ? (
            <RequestsHub
              applications={applications}
              invitations={invitations}
              projects={projects}
              currentUser={currentUser}
              chatMessages={chatMessages}
              onAcceptApplication={handleAcceptApplication}
              onDeclineApplication={handleDeclineApplication}
              onAcceptInvitation={handleAcceptInvitation}
              onDeclineInvitation={handleDeclineInvitation}
              onSendMessage={handleSendMessage}
            />
          ) : (
            <div className="p-12 text-center bg-white rounded-3xl border border-stone-200 shadow-sm space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
                <LogIn className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-stone-900">Sign In to Check Join Requests</h3>
              <p className="text-xs sm:text-sm text-stone-500 max-w-md mx-auto">
                Incoming role applications and team invitations are linked to your student profile.
              </p>
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs sm:text-sm shadow-sm transition-all"
              >
                Sign In to View Requests
              </button>
            </div>
          )
        )}

      </main>

      {/* MODALS */}
      <ProjectDetailModal
        project={selectedProjectForDetail}
        currentUser={currentUser}
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedProjectForDetail(null);
        }}
        onApply={handleApplyToProject}
        initialApplyMode={initialApplyMode}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
      />

      <CreateProjectModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        currentUser={currentUser}
        onCreateProject={handleCreateProject}
      />

      <AiFitModal
        isOpen={isAiFitOpen}
        onClose={() => {
          setIsAiFitOpen(false);
          setSelectedCandidateForFit(null);
        }}
        candidate={selectedCandidateForFit}
        projects={projects}
        currentUser={currentUser}
        onInvite={(cand, projId) => {
          if (!currentUser) {
            setIsAuthModalOpen(true);
          } else {
            setSelectedCandidateForInvite(cand);
            setInviteDefaultProjectId(projId);
            setIsInviteOpen(true);
          }
        }}
      />

      <InviteModal
        isOpen={isInviteOpen}
        onClose={() => {
          setIsInviteOpen(false);
          setSelectedCandidateForInvite(null);
          setInviteDefaultProjectId(undefined);
        }}
        candidate={selectedCandidateForInvite}
        projects={projects}
        currentUser={currentUser}
        defaultProjectId={inviteDefaultProjectId}
        onSendInvitation={handleSendInvitation}
      />

      <LoginAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        students={students}
        onSelectUser={(user) => setCurrentUser(user)}
        onSignOut={handleSignOut}
        onOpenChangePhoto={() => setIsChangePhotoOpen(true)}
      />

      {(currentUser || students.length > 0) && (
        <ChangePhotoModal
          isOpen={isChangePhotoOpen}
          onClose={() => setIsChangePhotoOpen(false)}
          currentUser={currentUser || students[0]}
          onSaveAvatar={handleUpdateAvatar}
        />
      )}

      {/* Floating Chat Widget on the bottom right corner */}
      <SupportChatWidget />

    </div>
  );
}
