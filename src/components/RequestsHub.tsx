import React, { useState } from 'react';
import { 
  Inbox, 
  Send, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  MessageSquare, 
  Users, 
  Award,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ApplicationRequest, TeamInvitation, ChatMessage, Project, StudentProfile } from '../types';

interface RequestsHubProps {
  applications: ApplicationRequest[];
  invitations: TeamInvitation[];
  projects: Project[];
  currentUser: StudentProfile | null;
  chatMessages: ChatMessage[];
  onAcceptApplication: (appId: string) => void;
  onDeclineApplication: (appId: string) => void;
  onAcceptInvitation: (invitationId: string) => void;
  onDeclineInvitation: (invitationId: string) => void;
  onSendMessage: (projectId: string, content: string) => void;
}

export const RequestsHub: React.FC<RequestsHubProps> = ({
  applications,
  invitations,
  projects,
  currentUser,
  chatMessages,
  onAcceptApplication,
  onDeclineApplication,
  onAcceptInvitation,
  onDeclineInvitation,
  onSendMessage,
}) => {
  const [activeHubTab, setActiveHubTab] = useState<'incoming' | 'outgoing' | 'chat'>('incoming');
  const [selectedChatProjectId, setSelectedChatProjectId] = useState<string>(
    projects[0]?.id || ''
  );
  const [newChatText, setNewChatText] = useState('');

  // Owned projects
  const ownedProjectIds = currentUser
    ? projects.filter((p) => p.ownerId === currentUser.id).map((p) => p.id)
    : [];

  // Incoming applications to projects owned by this user
  const incomingApplications = applications.filter((a) => ownedProjectIds.includes(a.projectId));

  // Outgoing applications submitted by this user
  const outgoingApplications = currentUser
    ? applications.filter((a) => a.applicantId === currentUser.id)
    : [];

  // Incoming invitations for this user
  const incomingInvitations = currentUser
    ? invitations.filter((inv) => inv.invitedUserId === currentUser.id)
    : [];

  // Filter messages for active chat project
  const currentProjectMessages = chatMessages.filter((m) => m.projectId === selectedChatProjectId);
  const activeChatProject = projects.find((p) => p.id === selectedChatProjectId) || projects[0];

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChatText.trim() || !selectedChatProjectId) return;
    onSendMessage(selectedChatProjectId, newChatText.trim());
    setNewChatText('');
  };

  const handleAcceptApp = (appId: string) => {
    onAcceptApplication(appId);
    try {
      confetti({ particleCount: 40, spread: 60 });
    } catch (e) {}
  };

  const handleAcceptInv = (invId: string) => {
    onAcceptInvitation(invId);
    try {
      confetti({ particleCount: 40, spread: 60 });
    } catch (e) {}
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Hub Tabs */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-stone-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2">
            <Inbox className="w-5 h-5 text-amber-600" />
            Collaboration Hub & Requests
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
            Manage project join requests, team invites, and coordination messages
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl">
          <button
            id="hub-tab-incoming"
            onClick={() => setActiveHubTab('incoming')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              activeHubTab === 'incoming'
                ? 'bg-white text-stone-900 shadow-sm'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <span>Review Requests</span>
            {(incomingApplications.length > 0 || incomingInvitations.length > 0) && (
              <span className="w-4 h-4 rounded-full bg-amber-600 text-white text-[10px] flex items-center justify-center font-bold">
                {incomingApplications.filter(a => a.status === 'pending').length + incomingInvitations.filter(i => i.status === 'pending').length}
              </span>
            )}
          </button>

          <button
            id="hub-tab-outgoing"
            onClick={() => setActiveHubTab('outgoing')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              activeHubTab === 'outgoing'
                ? 'bg-white text-stone-900 shadow-sm'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <span>My Applications</span>
            <span className="text-[11px] text-stone-500">
              ({outgoingApplications.length})
            </span>
          </button>

          <button
            id="hub-tab-chat"
            onClick={() => setActiveHubTab('chat')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              activeHubTab === 'chat'
                ? 'bg-white text-stone-900 shadow-sm'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Team Rooms</span>
          </button>
        </div>
      </div>

      {/* Tab: INCOMING REQUESTS & INVITATIONS */}
      {activeHubTab === 'incoming' && (
        <div className="space-y-6">
          
          {/* Section 1: Team Invitations sent to you */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-3 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-amber-600" />
              Project Invitations Received by You ({incomingInvitations.length})
            </h3>

            {incomingInvitations.length === 0 ? (
              <div className="p-6 bg-white rounded-2xl border border-stone-200 text-center text-xs text-stone-500">
                No pending project recruitment invites right now. Browse projects or make your profile discoverable!
              </div>
            ) : (
              <div className="space-y-3">
                {incomingInvitations.map((inv) => (
                  <div 
                    key={inv.id}
                    className="p-5 bg-white rounded-2xl border border-stone-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-3.5">
                      <img
                        src={inv.senderAvatar}
                        alt={inv.senderName}
                        className="w-11 h-11 rounded-full object-cover ring-2 ring-amber-100 flex-shrink-0"
                      />
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-bold text-stone-900">
                            {inv.senderName}
                          </span>
                          <span className="text-xs text-stone-500">
                            invited you to join
                          </span>
                          <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            {inv.projectTitle}
                          </span>
                        </div>
                        <div className="text-xs text-stone-700 font-semibold mt-1">
                          Role: {inv.targetRoleName}
                        </div>
                        <p className="text-xs text-stone-600 mt-1 italic bg-stone-50 p-2.5 rounded-lg border border-stone-100 max-w-xl">
                          "{inv.customNote}"
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                      {inv.status === 'pending' ? (
                        <>
                          <button
                            id={`decline-inv-${inv.id}`}
                            onClick={() => onDeclineInvitation(inv.id)}
                            className="px-3.5 py-1.5 text-xs font-semibold text-stone-600 hover:text-stone-800 hover:bg-stone-100 rounded-lg transition-colors"
                          >
                            Decline
                          </button>
                          <button
                            id={`accept-inv-${inv.id}`}
                            onClick={() => handleAcceptInv(inv.id)}
                            className="px-4 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Accept & Join Roster</span>
                          </button>
                        </>
                      ) : (
                        <span className={`text-xs font-bold px-3 py-1 rounded-lg ${
                          inv.status === 'accepted' ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-100 text-stone-600'
                        }`}>
                          {inv.status === 'accepted' ? '✓ Accepted' : 'Declined'}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 2: Incoming Applications to your projects */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-3 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-stone-600" />
              Applicant Pitches for Your Projects ({incomingApplications.length})
            </h3>

            {incomingApplications.length === 0 ? (
              <div className="p-6 bg-white rounded-2xl border border-stone-200 text-center text-xs text-stone-500">
                No applicant requests for your projects yet. Make sure your open roles have clear skill descriptions!
              </div>
            ) : (
              <div className="space-y-4">
                {incomingApplications.map((app) => (
                  <div 
                    key={app.id}
                    className="p-5 bg-white rounded-2xl border border-stone-200 shadow-sm space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={app.applicantAvatar}
                          alt={app.applicantName}
                          className="w-12 h-12 rounded-full object-cover ring-2 ring-stone-100"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-stone-900">
                              {app.applicantName}
                            </h4>
                            <span className="text-xs font-medium text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                              {app.applicantSpecialty}
                            </span>
                          </div>
                          <p className="text-xs text-stone-500">
                            {app.applicantUniversity} • Applied for: <strong className="text-stone-800">{app.targetRoleName}</strong> on <strong className="text-stone-800">{app.projectTitle}</strong>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            {app.matchScore}% Skill Fit
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Pitch Message */}
                    <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200/80 text-xs text-stone-700 leading-relaxed">
                      <span className="font-bold text-stone-900 block mb-1">
                        Applicant's Value Pitch:
                      </span>
                      "{app.pitchMessage}"
                    </div>

                    {/* Applicant skills */}
                    <div className="flex items-center justify-between flex-wrap gap-2 pt-1">
                      <div className="flex flex-wrap gap-1">
                        {app.applicantSkills.map((sk) => (
                          <span key={sk} className="text-[10px] bg-stone-100 text-stone-600 px-2 py-0.5 rounded font-medium">
                            {sk}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center gap-2">
                        {app.status === 'pending' ? (
                          <>
                            <button
                              id={`decline-app-${app.id}`}
                              onClick={() => onDeclineApplication(app.id)}
                              className="px-3 py-1.5 text-xs font-semibold text-stone-600 hover:text-stone-800 rounded-lg hover:bg-stone-100 transition-colors"
                            >
                              Decline
                            </button>
                            <button
                              id={`accept-app-${app.id}`}
                              onClick={() => handleAcceptApp(app.id)}
                              className="px-4 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Accept into Team</span>
                            </button>
                          </>
                        ) : (
                          <span className={`text-xs font-bold px-3 py-1 rounded-lg ${
                            app.status === 'accepted' ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-100 text-stone-600'
                          }`}>
                            {app.status === 'accepted' ? '✓ Accepted Teammate' : 'Declined'}
                          </span>
                        )}
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

      {/* Tab: OUTGOING APPLICATIONS */}
      {activeHubTab === 'outgoing' && (
        <div className="space-y-4">
          {outgoingApplications.length === 0 ? (
            <div className="p-12 bg-white rounded-2xl border border-stone-200 text-center space-y-2">
              <Sparkles className="w-8 h-8 text-stone-400 mx-auto" />
              <h4 className="text-sm font-bold text-stone-800">No applications sent yet</h4>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                Explore the project directory to find exciting hackathons and student research projects looking for your skills!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {outgoingApplications.map((app) => (
                <div 
                  key={app.id}
                  className="p-5 bg-white rounded-2xl border border-stone-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-stone-900">
                        {app.projectTitle}
                      </h4>
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        app.status === 'accepted' ? 'bg-emerald-100 text-emerald-800' :
                        app.status === 'declined' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {app.status === 'accepted' ? '✓ Accepted & Confirmed' :
                         app.status === 'declined' ? 'Not Selected' : 'Under Review'}
                      </span>
                    </div>

                    <p className="text-xs text-stone-600 mt-1">
                      Role applied for: <strong className="text-stone-800">{app.targetRoleName}</strong>
                    </p>
                    <p className="text-xs text-stone-500 mt-1 line-clamp-1 italic">
                      "{app.pitchMessage}"
                    </p>
                  </div>

                  <div className="text-xs text-stone-400">
                    Applied on {new Date(app.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: TEAM CHAT ROOMS */}
      {activeHubTab === 'chat' && (
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-3 min-h-[480px]">
          
          {/* Projects sidebar */}
          <div className="border-r border-stone-200 p-4 bg-stone-50/50 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">
              Select Team Channel:
            </h4>
            {projects.map((proj) => (
              <button
                key={proj.id}
                id={`chat-room-${proj.id}`}
                onClick={() => setSelectedChatProjectId(proj.id)}
                className={`w-full text-left p-3 rounded-xl transition-all ${
                  selectedChatProjectId === proj.id
                    ? 'bg-amber-500 text-white shadow-sm'
                    : 'bg-white hover:bg-stone-100 text-stone-800 border border-stone-200'
                }`}
              >
                <div className="text-xs font-bold truncate">{proj.title}</div>
                <div className={`text-[11px] mt-0.5 ${
                  selectedChatProjectId === proj.id ? 'text-amber-100' : 'text-stone-500'
                }`}>
                  {proj.members.length} teammates • {proj.category}
                </div>
              </button>
            ))}
          </div>

          {/* Chat conversation room */}
          <div className="md:col-span-2 flex flex-col justify-between h-full bg-white">
            
            {/* Room Header */}
            <div className="p-4 border-b border-stone-100 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-stone-900">
                  {activeChatProject?.title}
                </h4>
                <p className="text-[11px] text-stone-500">
                  Sprint room for {activeChatProject?.members.map(m => m.name.split(' ')[0]).join(', ')}
                </p>
              </div>
              <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                Live Channel
              </span>
            </div>

            {/* Messages feed */}
            <div className="p-4 space-y-3 overflow-y-auto flex-1 max-h-[360px]">
              {currentProjectMessages.length === 0 ? (
                <div className="py-12 text-center text-xs text-stone-400">
                  No messages yet in this team channel. Say hi and start coordinating deliverables!
                </div>
              ) : (
                currentProjectMessages.map((msg) => {
                  const isMine = currentUser ? msg.senderId === currentUser.id : false;
                  return (
                    <div 
                      key={msg.id}
                      className={`flex items-start gap-2.5 ${isMine ? 'flex-row-reverse' : ''}`}
                    >
                      <img
                        src={msg.senderAvatar}
                        alt={msg.senderName}
                        className="w-8 h-8 rounded-full object-cover flex-shrink-0 ring-1 ring-stone-200"
                      />
                      <div className={`max-w-md p-3 rounded-2xl text-xs ${
                        isMine 
                          ? 'bg-amber-600 text-white rounded-br-xs' 
                          : 'bg-stone-100 text-stone-800 rounded-bl-xs'
                      }`}>
                        <div className={`text-[10px] font-semibold mb-0.5 ${isMine ? 'text-amber-200' : 'text-stone-500'}`}>
                          {msg.senderName} • {msg.timestamp}
                        </div>
                        <p className="leading-relaxed">{msg.content}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Message input */}
            <form onSubmit={handleSendChat} className="p-3 border-t border-stone-100 flex items-center gap-2">
              <input
                id="team-chat-input"
                type="text"
                value={newChatText}
                onChange={(e) => setNewChatText(e.target.value)}
                placeholder={`Message teammates on ${activeChatProject?.title.slice(0, 24)}...`}
                className="flex-1 bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <button
                type="submit"
                id="send-team-chat-btn"
                className="px-4 py-2 bg-stone-900 hover:bg-amber-600 text-white rounded-xl text-xs font-semibold transition-colors flex items-center gap-1 shadow-sm"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send</span>
              </button>
            </form>

          </div>

        </div>
      )}

    </div>
  );
};
