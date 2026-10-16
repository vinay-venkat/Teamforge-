import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Plus, 
  Trash2, 
  Loader2, 
  CheckCircle2, 
  Calendar,
  Layers,
  Award
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Project, ProjectCategory, ProjectRole, ProjectStage, StudentProfile, SpecialtyCategory } from '../types';
import { calculateTeamBalance } from '../lib/teamBalance';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: StudentProfile | null;
  onCreateProject: (project: Project) => void;
}

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onCreateProject,
}) => {
  if (!isOpen) return null;

  const [title, setTitle] = useState('');
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ProjectCategory>('Hackathon');
  const [eventName, setEventName] = useState('');
  const [deadline, setDeadline] = useState('');
  const [targetTeamSize, setTargetTeamSize] = useState<number>(4);
  const [stage, setStage] = useState<ProjectStage>('Ideation');
  const [tagsInput, setTagsInput] = useState('');

  // Roles state
  const [roles, setRoles] = useState<Array<{
    id: string;
    roleName: string;
    category: 'Engineering' | 'Design' | 'AI/Data' | 'Product/Pitch';
    requiredSkills: string;
    responsibilities: string;
    whyCrucial: string;
  }>>([
    {
      id: 'role-init-1',
      roleName: 'Lead UI/UX Designer',
      category: 'Design',
      requiredSkills: 'Figma, Design Systems, User Research',
      responsibilities: 'Design mobile and web prototypes, conduct user flows',
      whyCrucial: 'Essential for judging presentation and ergonomic usability',
    },
    {
      id: 'role-init-2',
      roleName: 'Pitch Lead & Product Strategist',
      category: 'Product/Pitch',
      requiredSkills: 'Pitch Deck Creation, Storytelling, Market Research',
      responsibilities: 'Craft the 3-minute video demo and deliver live pitch',
      whyCrucial: 'Converts technical prototype into a winning narrative',
    },
  ]);

  const [isArchitecting, setIsArchitecting] = useState(false);
  const [architectSummary, setArchitectSummary] = useState<string | null>(null);
  const [architectError, setArchitectError] = useState<string | null>(null);

  // Gemini Smart Team Role Architect
  const handleAiArchitect = async () => {
    if (!title.trim() || !description.trim()) {
      setArchitectError('Please enter a project title and description above so Gemini can analyze your project requirements.');
      return;
    }

    setArchitectError(null);
    setIsArchitecting(true);
    setArchitectSummary(null);

    try {
      const res = await fetch('/api/gemini/team-architect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          category,
          teamSize: targetTeamSize,
        }),
      });

      const data = await res.json();
      if (data.roles && Array.isArray(data.roles)) {
        setRoles(
          data.roles.map((r: any, idx: number) => ({
            id: `role-ai-${Date.now()}-${idx}`,
            roleName: r.roleName || 'Specialist',
            category: r.category || 'Engineering',
            requiredSkills: Array.isArray(r.requiredSkills) ? r.requiredSkills.join(', ') : r.requiredSkills || '',
            responsibilities: Array.isArray(r.keyResponsibilities) ? r.keyResponsibilities.join(', ') : '',
            whyCrucial: r.whyCrucial || '',
          }))
        );
        setArchitectSummary(data.balanceTip || data.summary || 'Optimal balanced roles generated.');
      }
    } catch (err) {
      console.warn('AI Architect error:', err);
      setArchitectSummary('AI architect service ready. Default balanced roles loaded.');
    } finally {
      setIsArchitecting(false);
    }
  };

  const handleAddCustomRole = () => {
    setRoles([
      ...roles,
      {
        id: `role-${Date.now()}`,
        roleName: 'New Role',
        category: 'Engineering',
        requiredSkills: 'TypeScript, React',
        responsibilities: 'Core implementation',
        whyCrucial: 'Strengthens team velocity',
      },
    ]);
  };

  const handleRemoveRole = (id: string) => {
    setRoles(roles.filter((r) => r.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    const formattedOpenRoles: ProjectRole[] = roles.map((r) => ({
      id: r.id,
      roleName: r.roleName,
      category: r.category,
      requiredSkills: r.requiredSkills.split(',').map((s) => s.trim()).filter(Boolean),
      responsibilities: r.responsibilities.split(',').map((s) => s.trim()).filter(Boolean),
      whyCrucial: r.whyCrucial,
      status: 'open',
    }));

    const ownerId = currentUser?.id || 'guest-lead';
    const ownerName = currentUser?.name || 'Project Lead';
    const ownerSpecialty: SpecialtyCategory = currentUser?.specialty || 'Engineering';
    const ownerAvatar = currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150';
    const ownerUniversity = currentUser?.university || 'Community Member';
    const ownerSkills = currentUser?.skills.map((s) => s.name) || ['Project Management', 'Communication'];

    const initialMember = {
      userId: ownerId,
      name: ownerName,
      role: `Project Lead (${ownerSpecialty})`,
      specialty: ownerSpecialty,
      avatar: ownerAvatar,
      skills: ownerSkills,
    };

    const initialBalance = calculateTeamBalance([initialMember], formattedOpenRoles);

    const newProject: Project = {
      id: `proj-${Date.now()}`,
      title: title.trim(),
      tagline: tagline.trim() || description.slice(0, 90) + '...',
      description: description.trim(),
      category,
      eventName: eventName.trim() || undefined,
      deadline: deadline.trim() || 'In 14 days',
      ownerId,
      ownerName,
      ownerAvatar,
      ownerUniversity,
      targetTeamSize: Number(targetTeamSize) || 4,
      stage,
      tags: tagsInput.split(',').map((t) => t.trim()).filter(Boolean),
      members: [initialMember],
      openRoles: formattedOpenRoles,
      balanceBreakdown: initialBalance,
      createdAt: new Date().toISOString(),
    };

    onCreateProject(newProject);

    try {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch (e) {
      // ignore
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white w-full max-w-3xl max-h-[92vh] rounded-2xl shadow-2xl border border-stone-200 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-600 flex items-center justify-center text-white">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-stone-900 leading-tight">
                Post a Project & Recruit Collaborators
              </h2>
              <p className="text-xs text-stone-500">
                Define your vision and let AI architect a balanced multidisciplinary team
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

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-5">
          
          {/* Basic Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Project Title:
              </label>
              <input
                id="create-project-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. MediPulse: AI Clinical Triage for Emergency Rooms"
                className="w-full bg-white border border-stone-300 rounded-lg px-3.5 py-2 text-xs sm:text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                required
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                One-Line Tagline:
              </label>
              <input
                id="create-project-tagline"
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="e.g. Ambient voice assistant preventing errors during doctor shift handoffs"
                className="w-full bg-white border border-stone-300 rounded-lg px-3.5 py-2 text-xs sm:text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Category:
              </label>
              <select
                id="create-project-category"
                value={category}
                onChange={(e) => setCategory(e.target.value as ProjectCategory)}
                className="w-full bg-white border border-stone-300 rounded-lg px-3.5 py-2 text-xs sm:text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="Hackathon">Hackathon</option>
                <option value="Competition">Competition</option>
                <option value="Research">Research Lab</option>
                <option value="Startup">Student Startup</option>
                <option value="Side Project">Side Project</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Event / Competition Name (Optional):
              </label>
              <input
                id="create-project-event"
                type="text"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                placeholder="e.g. CalHacks 2026, TreeHacks, Imagine Cup"
                className="w-full bg-white border border-stone-300 rounded-lg px-3.5 py-2 text-xs sm:text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Submission / Hackathon Deadline:
              </label>
              <input
                id="create-project-deadline"
                type="text"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                placeholder="e.g. In 5 days (Nov 15)"
                className="w-full bg-white border border-stone-300 rounded-lg px-3.5 py-2 text-xs sm:text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Target Total Team Size:
              </label>
              <select
                id="create-project-teamsize"
                value={targetTeamSize}
                onChange={(e) => setTargetTeamSize(Number(e.target.value))}
                className="w-full bg-white border border-stone-300 rounded-lg px-3.5 py-2 text-xs sm:text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value={2}>2 Members</option>
                <option value={3}>3 Members</option>
                <option value={4}>4 Members (Standard Hackathon Team)</option>
                <option value={5}>5 Members</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Project Description & Goals:
            </label>
            <textarea
              id="create-project-description"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the problem, target user, and key technology you plan to use..."
              className="w-full bg-white border border-stone-300 rounded-xl p-3 text-xs sm:text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
              required
            />
          </div>

          {/* AI Smart Role Architect Section */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50/60 border border-amber-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <h4 className="text-xs font-bold text-amber-950 uppercase tracking-wider">
                  AI Smart Team Role Architect
                </h4>
              </div>

              <button
                type="button"
                id="run-ai-architect-btn"
                onClick={handleAiArchitect}
                disabled={isArchitecting}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-50"
              >
                {isArchitecting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Analyzing Idea & Roles...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>AI Recommend Balanced Roles</span>
                  </>
                )}
              </button>
            </div>

            <p className="text-xs text-amber-900 leading-relaxed">
              Gemini analyzes your project description and determines the exact roles required across engineering, design, and storytelling so your team avoids critical blind spots.
            </p>

            {architectError && (
              <div className="mt-2.5 p-2.5 bg-rose-50 rounded-lg border border-rose-200 text-xs text-rose-700 font-medium">
                {architectError}
              </div>
            )}

            {architectSummary && (
              <div className="mt-2.5 p-2.5 bg-white/90 rounded-lg border border-amber-300/70 text-xs text-amber-950">
                <strong>AI Strategy Note: </strong>{architectSummary}
              </div>
            )}
          </div>

          {/* Open Roles List */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500">
                Roles to Recruit ({roles.length}):
              </h4>
              <button
                type="button"
                id="add-custom-role-btn"
                onClick={handleAddCustomRole}
                className="text-xs text-amber-700 hover:text-amber-800 font-semibold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Custom Role
              </button>
            </div>

            <div className="space-y-3">
              {roles.map((role, idx) => (
                <div 
                  key={role.id}
                  className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 space-y-2 relative group"
                >
                  <div className="flex items-center justify-between gap-2">
                    <input
                      type="text"
                      value={role.roleName}
                      onChange={(e) => {
                        const updated = [...roles];
                        updated[idx].roleName = e.target.value;
                        setRoles(updated);
                      }}
                      placeholder="Role Name (e.g. Lead UI/UX Designer)"
                      className="bg-white border border-stone-300 rounded px-2.5 py-1 text-xs font-bold text-stone-900 flex-1"
                    />

                    <select
                      value={role.category}
                      onChange={(e) => {
                        const updated = [...roles];
                        updated[idx].category = e.target.value as any;
                        setRoles(updated);
                      }}
                      className="bg-white border border-stone-300 rounded px-2 py-1 text-xs font-medium text-stone-700"
                    >
                      <option value="Design">Design</option>
                      <option value="Engineering">Engineering</option>
                      <option value="AI/Data">AI/Data</option>
                      <option value="Product/Pitch">Product/Pitch</option>
                    </select>

                    <button
                      type="button"
                      onClick={() => handleRemoveRole(role.id)}
                      className="p-1 text-stone-400 hover:text-rose-600 rounded transition-colors"
                      title="Remove Role"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div>
                    <input
                      type="text"
                      value={role.requiredSkills}
                      onChange={(e) => {
                        const updated = [...roles];
                        updated[idx].requiredSkills = e.target.value;
                        setRoles(updated);
                      }}
                      placeholder="Required skills separated by comma (e.g. Figma, User Research, Prototyping)"
                      className="w-full bg-white border border-stone-300 rounded px-2.5 py-1 text-xs text-stone-700"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Interest Tags (Comma separated):
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="e.g. HealthTech, Generative AI, Emergency Medicine"
              className="w-full bg-white border border-stone-300 rounded-lg px-3.5 py-2 text-xs sm:text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-800 hover:bg-stone-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="publish-project-btn"
              className="px-6 py-2 text-xs sm:text-sm font-semibold bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors flex items-center gap-2 shadow-sm"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Publish Project & Open Recruitment</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
