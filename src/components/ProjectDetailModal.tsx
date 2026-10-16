import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Users, 
  Calendar, 
  CheckCircle2, 
  Send, 
  AlertTriangle, 
  Award, 
  Briefcase,
  ShieldCheck,
  Loader2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Project, StudentProfile, ProjectRole } from '../types';

interface ProjectDetailModalProps {
  project: Project | null;
  currentUser: StudentProfile | null;
  isOpen: boolean;
  onClose: () => void;
  onApply: (projectId: string, roleId: string, pitchMessage: string) => void;
  initialApplyMode?: boolean;
  onOpenAuthModal?: () => void;
}

export const ProjectDetailModal: React.FC<ProjectDetailModalProps> = ({
  project,
  currentUser,
  isOpen,
  onClose,
  onApply,
  initialApplyMode = false,
  onOpenAuthModal,
}) => {
  if (!isOpen || !project) return null;

  const [selectedRoleId, setSelectedRoleId] = useState<string>(() => {
    const openRole = project.openRoles.find((r) => r.status === 'open');
    return openRole ? openRole.id : '';
  });

  const [pitchMessage, setPitchMessage] = useState('');
  const [isGeneratingPitch, setIsGeneratingPitch] = useState(false);
  const [pitchError, setPitchError] = useState<string | null>(null);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  const isMember = currentUser ? project.members.some((m) => m.userId === currentUser.id) : false;
  const selectedRole = project.openRoles.find((r) => r.id === selectedRoleId);
  const openRoles = project.openRoles.filter((r) => r.status === 'open');

  // AI Pitch Generator
  const handleGeneratePitch = async () => {
    if (!selectedRole || !currentUser) return;
    setIsGeneratingPitch(true);
    setPitchError(null);

    try {
      const res = await fetch('/api/gemini/generate-pitch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectName: project.title,
          projectDescription: project.description,
          targetRole: selectedRole.roleName,
          applicantProfile: {
            name: currentUser.name,
            specialty: currentUser.specialty,
            skills: currentUser.skills.map((s) => s.name),
            experienceLevel: currentUser.experienceLevel,
          },
        }),
      });

      const data = await res.json();
      if (data.pitch) {
        setPitchMessage(data.pitch);
      }
    } catch (err: any) {
      console.warn('AI pitch generation error:', err);
      // Fallback message
      setPitchMessage(
        `Hi ${project.ownerName}! I saw your project "${project.title}" and would love to join as the ${selectedRole.roleName}. With my background in ${currentUser.specialty} (${currentUser.skills.slice(0, 3).map(s => s.name).join(', ')}), I can help take the team's MVP and presentation to the winning tier!`
      );
    } finally {
      setIsGeneratingPitch(false);
    }
  };

  const handleSubmitApplication = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoleId || !pitchMessage.trim()) return;

    onApply(project.id, selectedRoleId, pitchMessage.trim());
    setSubmittedSuccess(true);

    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
      });
    } catch (e) {
      // ignore confetti error
    }

    setTimeout(() => {
      setSubmittedSuccess(false);
      onClose();
    }, 1600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl border border-stone-200 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-stone-200 flex items-start justify-between gap-4 bg-stone-50/50">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1.5">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                {project.category}
              </span>
              {project.eventName && (
                <span className="text-xs text-stone-600 font-medium flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-amber-600" />
                  {project.eventName}
                </span>
              )}
              <span className="text-xs px-2 py-0.5 rounded bg-stone-100 text-stone-700 font-medium">
                Stage: {project.stage}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight">
              {project.title}
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
              Created by <strong className="text-stone-700">{project.ownerName}</strong> ({project.ownerUniversity})
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
          
          {/* Vision & Description */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-2">
              Project Vision & Problem Statement
            </h4>
            <p className="text-sm text-stone-700 leading-relaxed whitespace-pre-line bg-stone-50/60 p-4 rounded-xl border border-stone-200/70">
              {project.description}
            </p>
          </div>

          {/* Team Balance Diagnostics & Radar */}
          <div className="bg-gradient-to-br from-stone-50 via-white to-amber-50/30 rounded-xl p-4 sm:p-5 border border-stone-200">
            <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-600" />
                <h4 className="text-sm font-bold text-stone-900">
                  Team Skill Balance Diagnostics
                </h4>
              </div>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                project.balanceBreakdown?.overallScore >= 75
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : project.balanceBreakdown?.overallScore >= 50
                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                  : 'bg-rose-50 text-rose-800 border-rose-200'
              }`}>
                Score: {project.balanceBreakdown?.overallScore}% • {project.balanceBreakdown?.healthStatus}
              </span>
            </div>

            {/* 4 Pillars meter */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
              <div className="bg-white p-3 rounded-lg border border-stone-200/80">
                <div className="flex justify-between text-xs font-medium text-stone-600 mb-1">
                  <span>Engineering</span>
                  <span className="font-bold">{project.balanceBreakdown?.engineering}%</span>
                </div>
                <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-sky-500 rounded-full transition-all"
                    style={{ width: `${project.balanceBreakdown?.engineering || 0}%` }}
                  />
                </div>
              </div>

              <div className="bg-white p-3 rounded-lg border border-stone-200/80">
                <div className="flex justify-between text-xs font-medium text-stone-600 mb-1">
                  <span>UI/UX Design</span>
                  <span className="font-bold">{project.balanceBreakdown?.design}%</span>
                </div>
                <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-rose-500 rounded-full transition-all"
                    style={{ width: `${project.balanceBreakdown?.design || 0}%` }}
                  />
                </div>
              </div>

              <div className="bg-white p-3 rounded-lg border border-stone-200/80">
                <div className="flex justify-between text-xs font-medium text-stone-600 mb-1">
                  <span>AI & Data</span>
                  <span className="font-bold">{project.balanceBreakdown?.aiData}%</span>
                </div>
                <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 rounded-full transition-all"
                    style={{ width: `${project.balanceBreakdown?.aiData || 0}%` }}
                  />
                </div>
              </div>

              <div className="bg-white p-3 rounded-lg border border-stone-200/80">
                <div className="flex justify-between text-xs font-medium text-stone-600 mb-1">
                  <span>Pitch & Strategy</span>
                  <span className="font-bold">{project.balanceBreakdown?.productPitch}%</span>
                </div>
                <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-amber-500 rounded-full transition-all"
                    style={{ width: `${project.balanceBreakdown?.productPitch || 0}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Gap warnings */}
            {project.balanceBreakdown?.keyGapAlerts && project.balanceBreakdown.keyGapAlerts.length > 0 && (
              <div className="mt-2 space-y-1">
                {project.balanceBreakdown.keyGapAlerts.map((gap, i) => (
                  <p key={i} className="text-xs text-amber-800 flex items-start gap-1.5 font-medium">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <span>{gap}</span>
                  </p>
                ))}
              </div>
            )}
          </div>

          {/* Two-Column layout: Current Roster vs Open Roles */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            
            {/* Current Members */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-stone-600" />
                  Confirmed Team Roster ({project.members.length}/{project.targetTeamSize})
                </h4>
              </div>

              <div className="space-y-2.5">
                {project.members.map((member) => (
                  <div 
                    key={member.userId}
                    className="p-3 bg-white rounded-xl border border-stone-200 flex items-center gap-3"
                  >
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="w-10 h-10 rounded-full object-cover ring-1 ring-stone-200"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-stone-900 truncate">
                          {member.name}
                        </span>
                        <span className="text-[10px] font-semibold text-stone-600 bg-stone-100 px-2 py-0.5 rounded">
                          {member.specialty}
                        </span>
                      </div>
                      <p className="text-xs text-amber-800 font-medium truncate">
                        {member.role}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {member.skills.slice(0, 3).map((sk) => (
                          <span key={sk} className="text-[10px] text-stone-500 bg-stone-50 px-1.5 py-0.5 rounded border border-stone-200/50">
                            {sk}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Open Roles to Fill */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-stone-600" />
                  Open Collaborator Roles Needed ({openRoles.length})
                </h4>
              </div>

              <div className="space-y-2.5">
                {project.openRoles.map((role) => {
                  const isOpen = role.status === 'open';
                  const isSelected = selectedRoleId === role.id;

                  return (
                    <div
                      key={role.id}
                      onClick={() => isOpen && setSelectedRoleId(role.id)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                        !isOpen
                          ? 'bg-stone-50 opacity-60 border-stone-200 cursor-not-allowed'
                          : isSelected
                          ? 'bg-amber-50/70 border-amber-400 ring-2 ring-amber-400/20'
                          : 'bg-white border-stone-200 hover:border-stone-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-stone-900">
                              {role.roleName}
                            </span>
                            <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-stone-100 text-stone-600">
                              {role.category}
                            </span>
                          </div>
                          {role.whyCrucial && (
                            <p className="text-[11px] text-stone-600 mt-1 leading-snug italic">
                              "{role.whyCrucial}"
                            </p>
                          )}
                        </div>

                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isOpen ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-600'
                        }`}>
                          {isOpen ? 'Recruiting' : 'Filled'}
                        </span>
                      </div>

                      {/* Required skills */}
                      <div className="mt-2 flex flex-wrap gap-1">
                        {role.requiredSkills.map((req) => (
                          <span key={req} className="text-[10px] bg-stone-100 text-stone-700 px-2 py-0.5 rounded font-medium">
                            {req}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Application Form Section */}
          {!isMember && openRoles.length > 0 && (
            <div className="pt-4 border-t border-stone-200">
              {!currentUser ? (
                <div className="bg-amber-50/70 p-5 rounded-2xl border border-amber-200/80 text-center space-y-3">
                  <h4 className="text-sm font-bold text-stone-900">Want to join this project?</h4>
                  <p className="text-xs text-stone-600 max-w-sm mx-auto">
                    Sign in to submit your custom role pitch and connect directly with {project.ownerName}.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenAuthModal?.();
                    }}
                    className="px-4 py-2 bg-stone-900 hover:bg-amber-600 text-white text-xs font-semibold rounded-lg transition-colors inline-flex items-center gap-1.5 shadow-sm active:scale-95"
                  >
                    <span>Sign In to Apply</span>
                  </button>
                </div>
              ) : (
                <div className="bg-stone-50 p-4 sm:p-5 rounded-2xl border border-stone-200">
                  <h4 className="text-sm font-bold text-stone-900 mb-1 flex items-center gap-2">
                    <Send className="w-4 h-4 text-amber-600" />
                    Apply to Join this Project as a Collaborator
                  </h4>
                  <p className="text-xs text-stone-600 mb-4">
                    Applying as <strong className="text-stone-800">{currentUser.name}</strong> ({currentUser.specialty} • {currentUser.university}).
                  </p>

                {submittedSuccess ? (
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center gap-3">
                    <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0" />
                    <div>
                      <h5 className="text-sm font-bold">Application Sent Successfully!</h5>
                      <p className="text-xs text-emerald-700 mt-0.5">
                        {project.ownerName} has been notified and will review your pitch in the Requests Hub.
                      </p>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitApplication} className="space-y-3.5">
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Select Target Role:
                      </label>
                      <select
                        id="apply-role-select"
                        value={selectedRoleId}
                        onChange={(e) => setSelectedRoleId(e.target.value)}
                        className="w-full bg-white border border-stone-300 rounded-lg px-3 py-2 text-xs sm:text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                        required
                      >
                        {openRoles.map((role) => (
                          <option key={role.id} value={role.id}>
                            {role.roleName} ({role.category})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-semibold text-stone-700">
                          Your Introduction & Value Pitch:
                        </label>
                        <button
                          type="button"
                          id="ai-generate-pitch-btn"
                          onClick={handleGeneratePitch}
                          disabled={isGeneratingPitch || !selectedRoleId}
                          className="text-[11px] font-semibold text-amber-700 hover:text-amber-800 bg-amber-100/70 hover:bg-amber-100 px-2.5 py-1 rounded-md transition-colors flex items-center gap-1.5 disabled:opacity-50"
                        >
                          {isGeneratingPitch ? (
                            <>
                              <Loader2 className="w-3 h-3 animate-spin text-amber-700" />
                              <span>Drafting tailored pitch...</span>
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-3 h-3 text-amber-600" />
                              <span>AI Draft Tailored Pitch</span>
                            </>
                          )}
                        </button>
                      </div>

                      <textarea
                        id="applicant-pitch-message"
                        rows={3}
                        value={pitchMessage}
                        onChange={(e) => setPitchMessage(e.target.value)}
                        placeholder="Explain why you are excited to collaborate, which parts of your background solve their open role, and your availability..."
                        className="w-full bg-white border border-stone-300 rounded-xl p-3 text-xs sm:text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                        required
                      />
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-800 hover:bg-stone-200/60 rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        id="submit-application-btn"
                        className="px-5 py-2 text-xs sm:text-sm font-semibold bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors flex items-center gap-2 shadow-sm"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Send Application</span>
                      </button>
                    </div>
                  </form>
                )}
              </div>
              )}
            </div>
          )}

          {isMember && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>You are an active member of this project roster. Check the Hub tab to collaborate!</span>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
