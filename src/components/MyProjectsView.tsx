import React from 'react';
import { 
  FolderPlus, 
  Users, 
  Sparkles, 
  Plus, 
  ArrowRight, 
  Briefcase,
  Layers,
  Award
} from 'lucide-react';
import { Project, StudentProfile } from '../types';

interface MyProjectsViewProps {
  projects: Project[];
  currentUser: StudentProfile | null;
  onCreateProjectClick: () => void;
  onViewProjectDetails: (project: Project) => void;
  onOpenTeamBalanceStudio: (projectId: string) => void;
}

export const MyProjectsView: React.FC<MyProjectsViewProps> = ({
  projects,
  currentUser,
  onCreateProjectClick,
  onViewProjectDetails,
  onOpenTeamBalanceStudio,
}) => {
  // Projects where user is owner or member
  const myProjects = currentUser
    ? projects.filter(
        (p) => p.ownerId === currentUser.id || p.members.some((m) => m.userId === currentUser.id)
      )
    : [];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-stone-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2">
            <Layers className="w-5 h-5 text-amber-600" />
            My Teams & Active Projects ({myProjects.length})
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
            Monitor rosters, unfilled roles, and team health for your initiatives
          </p>
        </div>

        <button
          id="post-new-project-btn"
          onClick={onCreateProjectClick}
          className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs sm:text-sm font-semibold transition-colors flex items-center gap-2 shadow-sm self-start sm:self-auto active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Post New Project</span>
        </button>
      </div>

      {myProjects.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
            <FolderPlus className="w-7 h-7" />
          </div>
          <div className="max-w-md mx-auto">
            <h3 className="text-base font-bold text-stone-900">
              You haven't formed or joined any teams yet
            </h3>
            <p className="text-xs text-stone-500 mt-1">
              Start by posting your own hackathon idea or browse open projects looking for your skill profile.
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={onCreateProjectClick}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg shadow-sm"
            >
              Post a Project
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {myProjects.map((project) => {
            const isOwner = currentUser ? project.ownerId === currentUser.id : false;
            const openRoles = project.openRoles.filter((r) => r.status === 'open');
            const score = project.balanceBreakdown?.overallScore || 50;

            return (
              <div 
                key={project.id}
                className="bg-white rounded-2xl border border-stone-200 shadow-sm p-5 sm:p-6 flex flex-col justify-between"
              >
                <div>
                  {/* Top tags */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                      {project.category}
                    </span>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                      isOwner ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-700'
                    }`}>
                      {isOwner ? 'Team Lead' : 'Collaborator'}
                    </span>
                  </div>

                  <h3 
                    onClick={() => onViewProjectDetails(project)}
                    className="text-lg font-bold text-stone-900 hover:text-amber-700 transition-colors cursor-pointer"
                  >
                    {project.title}
                  </h3>
                  <p className="text-xs text-stone-600 mt-1 line-clamp-2 leading-relaxed">
                    {project.tagline || project.description}
                  </p>

                  {/* Team Balance quick banner */}
                  <div className="mt-4 p-3 rounded-xl bg-stone-50 border border-stone-200/80 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-stone-500 block">Team Balance Score</span>
                      <span className="text-sm font-black text-stone-900">
                        {score}% • {project.balanceBreakdown?.healthStatus?.split(' ')[0] || 'Good'}
                      </span>
                    </div>

                    <button
                      id={`open-studio-${project.id}`}
                      onClick={() => onOpenTeamBalanceStudio(project.id)}
                      className="text-xs font-semibold text-amber-700 hover:text-amber-900 bg-amber-100/70 hover:bg-amber-100 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      <span>Balance Studio</span>
                    </button>
                  </div>

                  {/* Open roles needed */}
                  <div className="mt-4">
                    <div className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-2">
                      Needed Roles ({openRoles.length}):
                    </div>
                    {openRoles.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {openRoles.map((role) => (
                          <span 
                            key={role.id}
                            className="text-xs bg-amber-50 text-amber-900 border border-amber-200 px-2 py-0.5 rounded font-medium"
                          >
                            {role.roleName}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-stone-400 italic">
                        All target slots filled!
                      </span>
                    )}
                  </div>

                  {/* Current Roster Avatars */}
                  <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-2">
                        {project.members.map((m) => (
                          <img
                            key={m.userId}
                            src={m.avatar}
                            alt={m.name}
                            title={`${m.name} (${m.role})`}
                            className="w-7 h-7 rounded-full ring-2 ring-white object-cover"
                          />
                        ))}
                      </div>
                      <span className="text-xs text-stone-500 font-medium">
                        {project.members.length}/{project.targetTeamSize} confirmed
                      </span>
                    </div>

                    {project.deadline && (
                      <span className="text-xs text-stone-500">
                        Target: {project.deadline}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-5 pt-3 border-t border-stone-100 flex items-center justify-between">
                  <button
                    onClick={() => onViewProjectDetails(project)}
                    className="text-xs font-semibold text-stone-700 hover:text-stone-900 py-1.5 px-3 rounded-lg hover:bg-stone-100 transition-colors"
                  >
                    View Project Details
                  </button>

                  <button
                    onClick={() => onOpenTeamBalanceStudio(project.id)}
                    className="text-xs font-semibold bg-stone-900 hover:bg-amber-600 text-white py-1.5 px-3.5 rounded-lg transition-colors flex items-center gap-1 shadow-sm"
                  >
                    <span>Inspect Synergy</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
