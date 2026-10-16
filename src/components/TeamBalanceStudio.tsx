import React, { useState } from 'react';
import { 
  Sparkles, 
  Users, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight, 
  Plus, 
  UserMinus, 
  TrendingUp,
  RefreshCw,
  Info
} from 'lucide-react';
import { Project, StudentProfile, ProjectMember, TeamBalanceBreakdown } from '../types';
import { calculateTeamBalance, simulateCandidateImpact } from '../lib/teamBalance';

interface TeamBalanceStudioProps {
  projects: Project[];
  students: StudentProfile[];
  currentUser: StudentProfile | null;
  onInviteCandidate: (student: StudentProfile, projectId: string) => void;
  onNavigateToCollaboratorsWithFilter: (specialty: string) => void;
}

export const TeamBalanceStudio: React.FC<TeamBalanceStudioProps> = ({
  projects,
  students,
  currentUser,
  onInviteCandidate,
  onNavigateToCollaboratorsWithFilter,
}) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>(
    projects[0]?.id || ''
  );
  const [simulatedCandidateId, setSimulatedCandidateId] = useState<string>('');

  const currentProject = projects.find((p) => p.id === selectedProjectId) || projects[0];

  const currentMembers: ProjectMember[] = currentProject ? currentProject.members : [];
  const currentBreakdown = currentProject 
    ? calculateTeamBalance(currentProject.members, currentProject.openRoles)
    : calculateTeamBalance([]);

  const simulatedCandidate = students.find((s) => s.id === simulatedCandidateId);
  const simulationResult = simulatedCandidate && currentProject
    ? simulateCandidateImpact(currentProject.members, simulatedCandidate, currentProject.openRoles)
    : null;

  // Potential candidates not already on the team
  const availableCandidates = students.filter(
    (s) => !currentMembers.some((m) => m.userId === s.id)
  );

  const getPillarColor = (score: number) => {
    if (score >= 70) return 'bg-emerald-500 text-emerald-700';
    if (score >= 45) return 'bg-amber-500 text-amber-700';
    return 'bg-rose-500 text-rose-700';
  };

  const activeBreakdown = simulationResult ? simulationResult.newBreakdown : currentBreakdown;

  return (
    <div className="space-y-6">
      
      {/* Hero Header explaining the core philosophy */}
      <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 rounded-3xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        <div className="max-w-2xl relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold text-amber-50 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-200" />
            Multidisciplinary Team Formation Engine
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Team Balance & Synergy Studio
          </h1>
          <p className="text-sm sm:text-base text-amber-100 mt-2 leading-relaxed">
            Most hackathon and student teams fail not from a lack of talent, but from <strong className="text-white font-semibold">skill redundancy</strong> (e.g. 4 coders and 0 presenters or designers). Balance your team across the 5 essential pillars to build a winning submission.
          </p>
        </div>

        {/* Decorative background shape */}
        <div className="absolute right-0 -bottom-10 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Interactive Balance Radar & Simulator */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Project Selector Bar */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-stone-500 block mb-1">
                Select Team to Inspect:
              </label>
              <select
                id="team-balance-project-select"
                value={selectedProjectId}
                onChange={(e) => {
                  setSelectedProjectId(e.target.value);
                  setSimulatedCandidateId('');
                }}
                className="bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2 text-sm font-semibold text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title} ({p.members.length}/{p.targetTeamSize} members)
                  </option>
                ))}
              </select>
            </div>

            {/* Quick stats */}
            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-xs text-stone-500 block">Overall Balance</span>
                <span className={`text-xl font-black ${
                  activeBreakdown.overallScore >= 75 ? 'text-emerald-600' :
                  activeBreakdown.overallScore >= 50 ? 'text-amber-600' : 'text-rose-600'
                }`}>
                  {activeBreakdown.overallScore}/100
                </span>
              </div>
              <div className="h-10 w-[1px] bg-stone-200" />
              <div>
                <span className="text-xs text-stone-500 block">Status</span>
                <span className="text-xs font-bold text-stone-800 bg-stone-100 px-2 py-1 rounded-md inline-block">
                  {activeBreakdown.healthStatus}
                </span>
              </div>
            </div>
          </div>

          {/* 5-Pillar Health Dashboard */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-stone-200 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-stone-900">
                  The 5 Core Pillars of a Balanced Team
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Real-time algorithmic measurement of your roster's combined skills
                </p>
              </div>

              {simulationResult && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold animate-pulse">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Simulating: +{simulationResult.scoreDelta} pts</span>
                </div>
              )}
            </div>

            <div className="space-y-4">
              
              {/* Pillar 1: Engineering */}
              <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/80">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-bold text-stone-800 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
                    1. Engineering & Code Execution
                  </span>
                  <span className="font-bold text-stone-700">
                    {activeBreakdown.engineering}%
                  </span>
                </div>
                <div className="w-full h-2.5 bg-stone-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-sky-500 rounded-full transition-all duration-500"
                    style={{ width: `${activeBreakdown.engineering}%` }}
                  />
                </div>
                <p className="text-[11px] text-stone-500 mt-1">
                  Full-stack code stability, API integration, and database structure.
                </p>
              </div>

              {/* Pillar 2: UI/UX Design */}
              <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/80">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-bold text-stone-800 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                    2. UI/UX & User Delight
                  </span>
                  <span className="font-bold text-stone-700">
                    {activeBreakdown.design}%
                  </span>
                </div>
                <div className="w-full h-2.5 bg-stone-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-rose-500 rounded-full transition-all duration-500"
                    style={{ width: `${activeBreakdown.design}%` }}
                  />
                </div>
                <p className="text-[11px] text-stone-500 mt-1">
                  Figma prototypes, ergonomic user flows, visual aesthetics, and usability polish.
                </p>
              </div>

              {/* Pillar 3: AI & Data Intelligence */}
              <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/80">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-bold text-stone-800 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    3. AI & Data Intelligence
                  </span>
                  <span className="font-bold text-stone-700">
                    {activeBreakdown.aiData}%
                  </span>
                </div>
                <div className="w-full h-2.5 bg-stone-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${activeBreakdown.aiData}%` }}
                  />
                </div>
                <p className="text-[11px] text-stone-500 mt-1">
                  Gemini API integration, prompt engineering, vector embeddings, and data analysis.
                </p>
              </div>

              {/* Pillar 4: Product & Pitch Storytelling */}
              <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/80">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-bold text-stone-800 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    4. Product Strategy & Pitch Presentation
                  </span>
                  <span className="font-bold text-stone-700">
                    {activeBreakdown.productPitch}%
                  </span>
                </div>
                <div className="w-full h-2.5 bg-stone-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-amber-500 rounded-full transition-all duration-500"
                    style={{ width: `${activeBreakdown.productPitch}%` }}
                  />
                </div>
                <p className="text-[11px] text-stone-500 mt-1">
                  3-minute judging deck, clear problem-solution narrative, and live demonstration.
                </p>
              </div>

              {/* Pillar 5: Domain Alignment */}
              <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/80">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-bold text-stone-800 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                    5. Domain & Competition Strategy
                  </span>
                  <span className="font-bold text-stone-700">
                    {activeBreakdown.domainStrategy}%
                  </span>
                </div>
                <div className="w-full h-2.5 bg-stone-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-purple-500 rounded-full transition-all duration-500"
                    style={{ width: `${activeBreakdown.domainStrategy}%` }}
                  />
                </div>
              </div>

            </div>

            {/* Gap Alerts */}
            {activeBreakdown.keyGapAlerts && activeBreakdown.keyGapAlerts.length > 0 && (
              <div className="bg-amber-50 rounded-xl p-4 border border-amber-200/80">
                <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  Identified Team Risks & Imbalance Warnings:
                </h4>
                <ul className="space-y-1.5">
                  {activeBreakdown.keyGapAlerts.map((alert, i) => (
                    <li key={i} className="text-xs text-amber-800 flex items-start gap-2">
                      <span className="text-amber-500 font-bold">•</span>
                      <span>{alert}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

          </div>

          {/* Interactive What-If Teammate Simulator */}
          <div className="bg-gradient-to-br from-amber-50/50 to-orange-50/30 rounded-2xl border border-amber-200 p-5 sm:p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-amber-600" />
              <h3 className="text-base font-bold text-stone-900">
                What-If Candidate Simulator
              </h3>
            </div>
            <p className="text-xs text-stone-600 mb-4">
              Test how adding a specific collaborator transforms your team balance score before sending an official invite.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <select
                id="simulator-candidate-select"
                value={simulatedCandidateId}
                onChange={(e) => setSimulatedCandidateId(e.target.value)}
                className="flex-1 bg-white border border-stone-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-medium text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="">-- Choose a Candidate to Simulate --</option>
                {availableCandidates.map((candidate) => (
                  <option key={candidate.id} value={candidate.id}>
                    {candidate.name} ({candidate.specialty} • {candidate.university.split(' ')[0]})
                  </option>
                ))}
              </select>

              {simulatedCandidateId && (
                <button
                  id="reset-simulation-btn"
                  onClick={() => setSimulatedCandidateId('')}
                  className="px-3 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900 bg-white border border-stone-200 rounded-xl hover:bg-stone-50"
                >
                  Clear Simulation
                </button>
              )}
            </div>

            {/* Simulation Preview Card */}
            {simulationResult && simulatedCandidate && (
              <div className="mt-4 p-4 rounded-xl bg-white border border-amber-300 shadow-sm animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={simulatedCandidate.avatar}
                      alt={simulatedCandidate.name}
                      className="w-12 h-12 rounded-full object-cover ring-2 ring-amber-400"
                    />
                    <div>
                      <h4 className="text-sm font-bold text-stone-900">
                        {simulatedCandidate.name}
                      </h4>
                      <p className="text-xs text-amber-800 font-medium">
                        {simulatedCandidate.specialty} • {simulatedCandidate.university}
                      </p>
                      <p className="text-xs text-stone-600 mt-1">
                        {simulationResult.highlightBenefit}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[11px] text-stone-500 block">Balance Leap</span>
                    <span className="text-lg font-black text-emerald-600">
                      {currentBreakdown.overallScore}% → {simulationResult.newBreakdown.overallScore}%
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-end gap-2">
                  <button
                    id="invite-simulated-candidate-btn"
                    onClick={() => onInviteCandidate(simulatedCandidate, currentProject.id)}
                    className="px-4 py-2 text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
                  >
                    <span>Invite {simulatedCandidate.name.split(' ')[0]} to Join</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Right Col: Current Roster, Open Role Gaps, and Auto-Matcher */}
        <div className="space-y-6">
          
          {/* Current Roster Card */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-stone-200 shadow-sm">
            <h3 className="text-sm font-bold text-stone-900 mb-1 flex items-center gap-2">
              <Users className="w-4 h-4 text-amber-600" />
              Active Roster ({currentMembers.length}/{currentProject.targetTeamSize})
            </h3>
            <p className="text-xs text-stone-500 mb-4">
              Current confirmed teammates on this project
            </p>

            <div className="space-y-2.5">
              {currentMembers.map((m) => (
                <div 
                  key={m.userId}
                  className="p-3 bg-stone-50 rounded-xl border border-stone-200/80 flex items-center gap-3"
                >
                  <img
                    src={m.avatar}
                    alt={m.name}
                    className="w-9 h-9 rounded-full object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-stone-900 truncate">
                      {m.name}
                    </div>
                    <div className="text-[11px] text-amber-800 font-medium">
                      {m.role}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Unfilled slots */}
            <div className="mt-4 pt-4 border-t border-stone-100">
              <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">
                Unfilled Roles ({currentProject.openRoles.filter(r => r.status === 'open').length}):
              </h4>
              <div className="space-y-2">
                {currentProject.openRoles.filter(r => r.status === 'open').map((role) => (
                  <div 
                    key={role.id}
                    className="p-2.5 bg-amber-50/60 rounded-xl border border-amber-200 flex items-center justify-between gap-2"
                  >
                    <div>
                      <div className="text-xs font-bold text-stone-900">
                        {role.roleName}
                      </div>
                      <div className="text-[10px] text-amber-800 font-medium">
                        {role.category}
                      </div>
                    </div>

                    <button
                      onClick={() => onNavigateToCollaboratorsWithFilter(role.category)}
                      className="text-[11px] font-semibold text-stone-700 bg-white hover:bg-stone-100 px-2 py-1 rounded border border-stone-200 transition-colors whitespace-nowrap"
                    >
                      Find Match →
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Winning Formula Quick Guide */}
          <div className="bg-stone-900 text-white p-5 rounded-2xl shadow-sm space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5" />
              The Hackathon Winning Rule of 4
            </h4>
            <div className="text-xs text-stone-300 space-y-2 leading-relaxed">
              <p>
                <strong className="text-white">1. The Builder:</strong> Writes reliable frontend & backend code.
              </p>
              <p>
                <strong className="text-white">2. The Designer:</strong> Makes the prototype look like a funded startup in Figma.
              </p>
              <p>
                <strong className="text-white">3. The Specialist:</strong> Deep AI, hardware, or data science model accuracy.
              </p>
              <p>
                <strong className="text-white">4. The Storyteller:</strong> Rehearses the 3-minute live pitch to mesmerize judges.
              </p>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
