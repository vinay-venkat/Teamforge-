import React from 'react';
import { 
  Users, 
  ArrowRight, 
  Clock
} from 'lucide-react';
import { Project, StudentProfile } from '../types';

interface ProjectCardProps {
  project: Project;
  currentUser: StudentProfile | null;
  onViewDetails: (project: Project) => void;
  onOpenApply: (project: Project) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  currentUser,
  onViewDetails,
  onOpenApply,
}) => {
  const isMember = currentUser ? project.members.some((m) => m.userId === currentUser.id) : false;
  const openRolesCount = project.openRoles.filter((r) => r.status === 'open').length;
  
  // Calculate if the current user matches any open role
  const matchingOpenRole = currentUser ? project.openRoles.find((role) => {
    if (role.status !== 'open') return false;
    const userSpecialty = currentUser.specialty.toLowerCase();
    const roleCat = role.category.toLowerCase();
    if (roleCat.includes('design') && userSpecialty.includes('design')) return true;
    if (roleCat.includes('ai') && userSpecialty.includes('ai')) return true;
    if (roleCat.includes('pitch') && (userSpecialty.includes('pitch') || userSpecialty.includes('product'))) return true;
    if (roleCat.includes('eng') && userSpecialty.includes('eng')) return true;
    
    // Check keyword skills
    const userSkillNames = currentUser.skills.map((s) => s.name.toLowerCase());
    return role.requiredSkills.some((req) => 
      userSkillNames.some((uSkill) => uSkill.includes(req.toLowerCase()) || req.toLowerCase().includes(uSkill))
    );
  }) : null;

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'Hackathon': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Competition': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Research': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Startup': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default: return 'bg-stone-50 text-stone-700 border-stone-200';
    }
  };

  const getRoleBadgeColor = (cat: string) => {
    switch (cat) {
      case 'Design': return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'AI/Data': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Product/Pitch': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Engineering': return 'bg-sky-50 text-sky-700 border-sky-200';
      default: return 'bg-stone-100 text-stone-700 border-stone-200';
    }
  };

  const balanceScore = project.balanceBreakdown?.overallScore || 50;

  return (
    <div className="bg-white rounded-2xl border border-stone-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group">
      <div className="p-5 sm:p-6">
        
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2 flex-wrap mb-3.5">
          <div className="flex items-center gap-2">
            <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${getCategoryColor(project.category)}`}>
              {project.category}
            </span>
            {project.eventName && (
              <span className="text-[11px] text-stone-600 font-medium truncate max-w-[200px]">
                {project.eventName}
              </span>
            )}
          </div>
          
          {project.deadline && (
            <span className="text-[11px] text-stone-500 font-medium bg-stone-50 px-2 py-0.5 rounded border border-stone-200/60">
              {project.deadline}
            </span>
          )}
        </div>

        {/* Title & Tagline */}
        <div className="mb-3">
          <h3 
            onClick={() => onViewDetails(project)}
            className="text-base sm:text-lg font-bold text-stone-900 group-hover:text-amber-700 transition-colors cursor-pointer leading-snug"
          >
            {project.title}
          </h3>
          <p className="text-xs sm:text-sm text-stone-600 mt-1.5 line-clamp-2 leading-relaxed">
            {project.tagline || project.description}
          </p>
        </div>

        {/* Missing Roles Needed (The Core problem statement) */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">
            <span>Missing Roles:</span>
            <span className="text-[11px] font-normal lowercase text-stone-400">
              {openRolesCount} open slot{openRolesCount !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {project.openRoles.filter((r) => r.status === 'open').map((role) => (
              <span
                key={role.id}
                className={`text-xs px-2.5 py-1 rounded-lg border font-medium flex items-center gap-1 ${getRoleBadgeColor(role.category)}`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-current opacity-75" />
                {role.roleName}
              </span>
            ))}
            {openRolesCount === 0 && (
              <span className="text-xs text-stone-500 italic bg-stone-50 px-2 py-1 rounded">
                Team is currently full
              </span>
            )}
          </div>
        </div>

        {/* Team Balance Gauge */}
        <div className="bg-stone-50 rounded-xl p-3 border border-stone-200/80 mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium text-stone-600">
              Team Balance:
            </span>
            <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${
              balanceScore >= 75 ? 'text-emerald-700 bg-emerald-50' :
              balanceScore >= 50 ? 'text-amber-700 bg-amber-50' : 'text-rose-700 bg-rose-50'
            }`}>
              {balanceScore}%
            </span>
          </div>

          {/* Mini progress bar */}
          <div className="w-full h-1.5 bg-stone-200 rounded-full overflow-hidden flex">
            <div 
              className={`h-full transition-all ${
                balanceScore >= 75 ? 'bg-emerald-500' :
                balanceScore >= 50 ? 'bg-amber-500' : 'bg-rose-500'
              }`}
              style={{ width: `${balanceScore}%` }}
            />
          </div>

          {project.balanceBreakdown?.keyGapAlerts?.[0] && (
            <p className="text-[11px] text-stone-500 mt-1.5 truncate">
              {project.balanceBreakdown.keyGapAlerts[0]}
            </p>
          )}
        </div>

        {/* Current Roster & Lead */}
        <div className="flex items-center justify-between pt-2 border-t border-stone-100">
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2 overflow-hidden">
              {project.members.map((m) => (
                <img
                  key={m.userId}
                  src={m.avatar}
                  alt={m.name}
                  title={`${m.name} (${m.role})`}
                  className="inline-block h-7 w-7 rounded-full ring-2 ring-white object-cover"
                />
              ))}
              {Array.from({ length: Math.max(0, project.targetTeamSize - project.members.length) }).map((_, i) => (
                <div
                  key={i}
                  title="Open Teammate Slot"
                  className="inline-flex h-7 w-7 rounded-full bg-stone-100 border border-dashed border-stone-300 items-center justify-center text-[10px] font-bold text-stone-400"
                >
                  +
                </div>
              ))}
            </div>
            <span className="text-xs text-stone-500 font-medium">
              {project.members.length}/{project.targetTeamSize} members
            </span>
          </div>

          <div className="text-right">
            <span className="text-[11px] text-stone-500 block truncate max-w-[130px]">
              by {project.ownerName}
            </span>
          </div>
        </div>

      </div>

      {/* Action Footer */}
      <div className="px-5 py-3 bg-stone-50/70 border-t border-stone-100 flex items-center justify-between gap-2">
        <button
          id={`view-project-${project.id}`}
          onClick={() => onViewDetails(project)}
          className="text-xs font-semibold text-stone-700 hover:text-stone-900 transition-colors py-1.5 px-3 rounded-lg hover:bg-stone-100"
        >
          View Team & Gaps
        </button>

        {isMember ? (
          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
            ✓ You are on this team
          </span>
        ) : openRolesCount > 0 ? (
          <button
            id={`apply-project-${project.id}`}
            onClick={() => onOpenApply(project)}
            className="text-xs font-semibold bg-stone-900 hover:bg-amber-600 text-white px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
          >
            <span>Apply for Role</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        ) : (
          <span className="text-xs text-stone-400 font-medium py-1.5 px-2">
            Team Full
          </span>
        )}
      </div>
    </div>
  );
};
