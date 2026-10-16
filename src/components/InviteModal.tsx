import React, { useState } from 'react';
import { 
  X, 
  UserPlus, 
  Send, 
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { StudentProfile, Project, TeamInvitation } from '../types';

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidate: StudentProfile | null;
  projects: Project[];
  currentUser: StudentProfile | null;
  onSendInvitation: (invitation: TeamInvitation) => void;
  defaultProjectId?: string;
}

export const InviteModal: React.FC<InviteModalProps> = ({
  isOpen,
  onClose,
  candidate,
  projects,
  currentUser,
  onSendInvitation,
  defaultProjectId,
}) => {
  if (!isOpen || !candidate) return null;

  // Owned or member projects
  const myProjects = currentUser
    ? projects.filter(
        (p) => p.ownerId === currentUser.id || p.members.some((m) => m.userId === currentUser.id)
      )
    : projects;

  const [projectId, setProjectId] = useState<string>(
    defaultProjectId || myProjects[0]?.id || projects[0]?.id || ''
  );

  const selectedProject = projects.find((p) => p.id === projectId) || projects[0];
  const openRoles = selectedProject?.openRoles.filter((r) => r.status === 'open') || [];

  const [targetRoleId, setTargetRoleId] = useState<string>(
    openRoles[0]?.id || ''
  );

  const [customNote, setCustomNote] = useState(
    `Hey ${candidate.name.split(' ')[0]}! We saw your ${candidate.specialty} skills and would love to invite you to join our project "${selectedProject?.title}". We think your expertise would complete our team!`
  );

  const [sentSuccess, setSentSuccess] = useState(false);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject || !targetRoleId) return;

    const role = selectedProject.openRoles.find((r) => r.id === targetRoleId);

    const newInvite: TeamInvitation = {
      id: `inv-${Date.now()}`,
      projectId: selectedProject.id,
      projectTitle: selectedProject.title,
      senderId: currentUser?.id || 'guest-lead',
      senderName: currentUser?.name || 'Project Lead',
      senderAvatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      invitedUserId: candidate.id,
      invitedUserName: candidate.name,
      targetRoleId: targetRoleId,
      targetRoleName: role?.roleName || candidate.specialty,
      customNote: customNote.trim(),
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    onSendInvitation(newInvite);
    setSentSuccess(true);

    try {
      confetti({
        particleCount: 40,
        spread: 50,
      });
    } catch (e) {}

    setTimeout(() => {
      setSentSuccess(false);
      onClose();
    }, 1400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-stone-200 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-amber-600" />
            <div>
              <h3 className="text-base font-bold text-stone-900 leading-tight">
                Invite {candidate.name} to Team
              </h3>
              <p className="text-xs text-stone-500">
                Send a personalized project recruitment invitation
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

        {/* Form Body */}
        {sentSuccess ? (
          <div className="p-8 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
            <h4 className="text-base font-bold text-stone-900">
              Invitation Sent to {candidate.name}!
            </h4>
            <p className="text-xs text-stone-600">
              They will receive your invitation in their Requests Hub.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSend} className="p-5 sm:p-6 space-y-4">
            
            {/* Candidate summary */}
            <div className="flex items-center gap-3 p-3 bg-stone-50 rounded-xl border border-stone-200">
              <img
                src={candidate.avatar}
                alt={candidate.name}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <div className="text-xs font-bold text-stone-900">{candidate.name}</div>
                <div className="text-[11px] text-amber-800 font-medium">
                  {candidate.specialty} • {candidate.university}
                </div>
              </div>
            </div>

            {/* Target Project Dropdown */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Select Project:
              </label>
              <select
                id="invite-select-project"
                value={projectId}
                onChange={(e) => {
                  setProjectId(e.target.value);
                  const p = projects.find((proj) => proj.id === e.target.value);
                  const open = p?.openRoles.filter((r) => r.status === 'open') || [];
                  setTargetRoleId(open[0]?.id || '');
                }}
                className="w-full bg-white border border-stone-300 rounded-lg px-3 py-2 text-xs sm:text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                required
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title} ({p.members.length}/{p.targetTeamSize} members)
                  </option>
                ))}
              </select>
            </div>

            {/* Target Role Dropdown */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Assign to Open Role:
              </label>
              {openRoles.length > 0 ? (
                <select
                  id="invite-select-role"
                  value={targetRoleId}
                  onChange={(e) => setTargetRoleId(e.target.value)}
                  className="w-full bg-white border border-stone-300 rounded-lg px-3 py-2 text-xs sm:text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  required
                >
                  {openRoles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.roleName} ({role.category})
                    </option>
                  ))}
                </select>
              ) : (
                <p className="text-xs text-rose-600 font-medium bg-rose-50 p-2 rounded border border-rose-200">
                  This project currently has no open roles. You can create open roles in "My Teams".
                </p>
              )}
            </div>

            {/* Personal Invitation Note */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Personal Invitation Message:
              </label>
              <textarea
                id="invite-custom-note"
                rows={3}
                value={customNote}
                onChange={(e) => setCustomNote(e.target.value)}
                className="w-full bg-white border border-stone-300 rounded-xl p-3 text-xs sm:text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                required
              />
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-800 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                id="send-team-invite-btn"
                disabled={openRoles.length === 0}
                className="px-5 py-2 text-xs sm:text-sm font-semibold bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Official Invite</span>
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
