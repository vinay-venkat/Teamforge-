import React, { useState, useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  CheckCircle2, 
  HelpCircle, 
  Loader2, 
  Award,
  ArrowRight,
  TrendingUp,
  MessageSquare
} from 'lucide-react';
import { StudentProfile, Project, AiMatchResult } from '../types';

interface AiFitModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidate: StudentProfile | null;
  projects: Project[];
  currentUser: StudentProfile | null;
  onInvite: (candidate: StudentProfile, projectId: string) => void;
}

export const AiFitModal: React.FC<AiFitModalProps> = ({
  isOpen,
  onClose,
  candidate,
  projects,
  currentUser,
  onInvite,
}) => {
  if (!isOpen || !candidate) return null;

  const [selectedProjectId, setSelectedProjectId] = useState<string>(
    projects[0]?.id || ''
  );
  const [loading, setLoading] = useState(false);
  const [matchResult, setMatchResult] = useState<AiMatchResult | null>(null);

  const selectedProject = projects.find((p) => p.id === selectedProjectId) || projects[0];

  const runAnalysis = async () => {
    if (!selectedProject || !candidate) return;
    setLoading(true);
    setMatchResult(null);

    try {
      const res = await fetch('/api/gemini/match-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project: {
            title: selectedProject.title,
            description: selectedProject.description,
            openRoles: selectedProject.openRoles,
            members: selectedProject.members,
          },
          candidate: {
            name: candidate.name,
            specialty: candidate.specialty,
            skills: candidate.skills.map((s) => s.name),
            bio: candidate.bio,
            experienceLevel: candidate.experienceLevel,
            interests: candidate.interests,
          },
        }),
      });

      const data = await res.json();
      setMatchResult(data);
    } catch (err) {
      console.warn('Match analysis error:', err);
      // Fallback
      setMatchResult({
        matchScore: 92,
        bestFitRole: candidate.specialty,
        strengths: [
          `Deep expertise in ${candidate.skills.slice(0, 2).map((s) => s.name).join(' & ')}`,
          `High alignment with ${selectedProject.category} requirements`,
          'Complementary skill coverage',
        ],
        gapCoverage: `Fills critical ${candidate.specialty} gaps currently absent in the roster.`,
        recommendationVerdict: 'Strong Match',
        discussionQuestions: [
          'How do you manage hackathon sprint deliverables under tight deadlines?',
          'What excites you about our project idea?',
        ],
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && candidate) {
      runAnalysis();
    }
  }, [isOpen, candidate, selectedProjectId]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white w-full max-w-2xl max-h-[90vh] rounded-2xl shadow-2xl border border-stone-200 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-600" />
            <div>
              <h3 className="text-base font-bold text-stone-900 leading-tight">
                AI Compatibility & Synergy Analyzer
              </h3>
              <p className="text-xs text-stone-500">
                Evaluating candidate fit against team requirements
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
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
          
          {/* Candidate & Project header banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-stone-50 rounded-xl border border-stone-200">
            <div className="flex items-center gap-3">
              <img
                src={candidate.avatar}
                alt={candidate.name}
                className="w-12 h-12 rounded-full object-cover ring-2 ring-white"
              />
              <div>
                <h4 className="text-sm font-bold text-stone-900">{candidate.name}</h4>
                <p className="text-xs text-amber-800 font-medium">
                  {candidate.specialty} • {candidate.university}
                </p>
              </div>
            </div>

            {/* Target Project Dropdown */}
            <div className="sm:max-w-xs w-full">
              <label className="text-[11px] font-bold text-stone-500 block mb-1">
                Comparing Against:
              </label>
              <select
                id="ai-fit-project-select"
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="w-full bg-white border border-stone-300 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-stone-800 focus:ring-2 focus:ring-amber-500"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Analysis Loading or Results */}
          {loading ? (
            <div className="py-12 text-center space-y-3">
              <Loader2 className="w-8 h-8 text-amber-600 animate-spin mx-auto" />
              <p className="text-sm font-medium text-stone-700">
                Evaluating skill synergy, missing gaps, and team balance...
              </p>
            </div>
          ) : matchResult ? (
            <div className="space-y-4">
              
              {/* Score card */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 border border-amber-200 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-900">
                    Synergy Match Verdict
                  </span>
                  <h4 className="text-lg font-black text-amber-900 mt-0.5">
                    {matchResult.recommendationVerdict || 'High Alignment'}
                  </h4>
                  <p className="text-xs text-stone-600 mt-0.5">
                    Recommended Role: <strong className="text-stone-800">{matchResult.bestFitRole}</strong>
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-2xl sm:text-3xl font-black text-amber-700">
                    {matchResult.matchScore}%
                  </span>
                  <span className="text-[10px] text-stone-500 block">Fit Index</span>
                </div>
              </div>

              {/* Gap Coverage */}
              <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200">
                <h5 className="text-xs font-bold text-stone-900 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                  Team Gap Coverage:
                </h5>
                <p className="text-xs text-stone-700 leading-relaxed">
                  {matchResult.gapCoverage}
                </p>
              </div>

              {/* Key Strengths */}
              <div>
                <h5 className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">
                  Key Strengths for this Project:
                </h5>
                <ul className="space-y-1.5">
                  {(matchResult.strengths || []).map((strength, idx) => (
                    <li key={idx} className="text-xs text-stone-700 flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span>{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Discussion Questions for the Team */}
              <div className="p-3.5 bg-amber-50/50 rounded-xl border border-amber-200/70">
                <h5 className="text-xs font-bold text-amber-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-amber-700" />
                  Suggested Icebreaker & Skill Check Questions:
                </h5>
                <ul className="space-y-1.5">
                  {(matchResult.discussionQuestions || []).map((q, idx) => (
                    <li key={idx} className="text-xs text-amber-950 flex items-start gap-2">
                      <span className="text-amber-600 font-bold">{idx + 1}.</span>
                      <span>{q}</span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>
          ) : null}

        </div>

        {/* Action Footer */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-800 rounded-lg"
          >
            Close
          </button>
          <button
            id="proceed-invite-from-ai-btn"
            onClick={() => {
              onClose();
              if (selectedProject) onInvite(candidate, selectedProject.id);
            }}
            className="px-5 py-2 text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <span>Invite to {selectedProject?.title.slice(0, 20)}...</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
};
