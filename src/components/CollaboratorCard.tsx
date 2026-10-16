import React from 'react';
import { 
  UserPlus, 
  MapPin, 
  Clock, 
  ExternalLink,
  Github,
  Linkedin,
  Camera
} from 'lucide-react';
import { StudentProfile } from '../types';

interface CollaboratorCardProps {
  student: StudentProfile;
  currentUser: StudentProfile | null;
  onInvite: (student: StudentProfile) => void;
  onAnalyzeFit: (student: StudentProfile) => void;
  onOpenChangePhoto?: () => void;
}

export const CollaboratorCard: React.FC<CollaboratorCardProps> = ({
  student,
  currentUser,
  onInvite,
  onAnalyzeFit,
  onOpenChangePhoto,
}) => {
  const isSelf = currentUser ? student.id === currentUser.id : false;

  const getSpecialtyBadgeStyle = (spec: string) => {
    switch (spec) {
      case 'UI/UX Design':
        return 'bg-rose-50 text-rose-800 border-rose-200';
      case 'AI / ML':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'Product & Pitch':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'Engineering':
        return 'bg-sky-50 text-sky-800 border-sky-200';
      case 'Mobile & IoT':
        return 'bg-indigo-50 text-indigo-800 border-indigo-200';
      case 'Data Science':
        return 'bg-teal-50 text-teal-800 border-teal-200';
      default:
        return 'bg-stone-50 text-stone-800 border-stone-200';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden">
      <div className="p-5 sm:p-6">
        
        {/* Header: Avatar, Name, Specialty, Availability */}
        <div className="flex items-start gap-3.5 mb-3.5">
          <div className="relative group flex-shrink-0">
            <img
              src={student.avatar}
              alt={student.name}
              className="w-14 h-14 rounded-2xl object-cover ring-2 ring-stone-100 shadow-inner"
            />
            {isSelf && onOpenChangePhoto && (
              <button
                type="button"
                id={`card-camera-btn-${student.id}`}
                onClick={onOpenChangePhoto}
                title="Change Profile Photo"
                className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-600 hover:bg-amber-700 text-white flex items-center justify-center shadow-md transition-transform hover:scale-110 cursor-pointer"
              >
                <Camera className="w-3 h-3" />
              </button>
            )}
            <span 
              className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                student.availability === 'Actively Looking' ? 'bg-emerald-500' :
                student.availability === 'Open to Offers' ? 'bg-amber-500' : 'bg-stone-400'
              }`}
              title={student.availability}
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-1">
              <h3 className="text-base font-bold text-stone-900 truncate">
                {student.name}
              </h3>
              {isSelf && (
                <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded">
                  You
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${getSpecialtyBadgeStyle(student.specialty)}`}>
                {student.specialty}
              </span>
            </div>

            <p className="text-xs text-stone-500 mt-1 truncate">
              {student.university}
            </p>
          </div>
        </div>

        {/* Major & Details */}
        <div className="text-xs text-stone-600 mb-3 flex items-center justify-between bg-stone-50 p-2 rounded-lg border border-stone-100">
          <span className="truncate">{student.major}</span>
          <span className="text-stone-400 text-[11px] whitespace-nowrap pl-1 font-medium">
            {student.year.split(' ')[0]}
          </span>
        </div>

        {/* Bio */}
        <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed mb-3.5">
          {student.bio}
        </p>

        {/* Skills Tag Cloud */}
        <div className="mb-3.5">
          <div className="flex flex-wrap gap-1.5">
            {student.skills.slice(0, 5).map((skill) => (
              <span
                key={skill.name}
                className="text-[11px] font-medium bg-stone-100 text-stone-700 px-2 py-0.5 rounded-md"
              >
                {skill.name}
              </span>
            ))}
            {student.skills.length > 5 && (
              <span className="text-[11px] text-stone-400 px-1.5 py-0.5">
                +{student.skills.length - 5}
              </span>
            )}
          </div>
        </div>

        {/* Badges & Accomplishments */}
        {student.badges && student.badges.length > 0 && (
          <div className="mb-3.5 flex flex-wrap gap-1">
            {student.badges.slice(0, 2).map((badge) => (
              <span
                key={badge}
                className="text-[10px] font-medium bg-stone-100 text-stone-700 border border-stone-200 px-2 py-0.5 rounded"
              >
                <span className="truncate max-w-[170px]">{badge}</span>
              </span>
            ))}
          </div>
        )}

        {/* Commitment & stats */}
        <div className="flex items-center justify-between text-[11px] text-stone-500 pt-2 border-t border-stone-100">
          <span>{student.hoursPerWeek} hrs/week</span>
          <span>
            {student.hackathonsAttended} competitions • {student.pastProjectsCount} projects
          </span>
        </div>

      </div>

      {/* Card Action Buttons */}
      <div className="px-5 py-3 bg-stone-50/70 border-t border-stone-100 flex items-center justify-between gap-2">
        <button
          id={`analyze-fit-${student.id}`}
          onClick={() => onAnalyzeFit(student)}
          className="text-xs font-semibold text-stone-700 hover:text-stone-900 hover:bg-stone-100 py-1.5 px-2.5 rounded-lg transition-colors"
        >
          <span>Team Fit</span>
        </button>

        {!isSelf ? (
          <button
            id={`invite-student-${student.id}`}
            onClick={() => onInvite(student)}
            className="text-xs font-semibold bg-stone-900 hover:bg-amber-600 text-white px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm active:scale-95"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Invite to Team</span>
          </button>
        ) : (
          <button
            id={`change-photo-${student.id}`}
            type="button"
            onClick={onOpenChangePhoto}
            className="text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Change Photo</span>
          </button>
        )}
      </div>
    </div>
  );
};
