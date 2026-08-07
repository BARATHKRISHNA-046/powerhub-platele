import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Users, CheckSquare, MessageSquare, Award, ShieldCheck, 
  Plus, ExternalLink, Github, Sparkles, Search, Video, FolderGit2,
  BookOpen, CheckCircle2, Save, Trash2, Image as ImageIcon
} from 'lucide-react';

export default function MentorDashboard() {
  const { 
    currentUser, users, teams, submissions, announcements, auditLogs, 
    aiTeamAvatars, googleMeetConfig, googleDriveUrl, googleClassroomUrl, 
    updateGoogleSuiteConfig, reviewSubmission, createTeam, deleteTeam, 
    postAnnouncement, deleteAnnouncement, overrideScore 
  } = useApp();

  const [activeSection, setActiveSection] = useState('gsuite');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Google Suite Mentor Inputs
  const [meetTopic, setMeetTopic] = useState(googleMeetConfig.topic);
  const [meetTiming, setMeetTiming] = useState(googleMeetConfig.timing);
  const [meetUrl, setMeetUrl] = useState(googleMeetConfig.meetUrl);
  const [driveUrl, setDriveUrl] = useState(googleDriveUrl);
  const [classroomUrl, setClassroomUrl] = useState(googleClassroomUrl);
  const [gsuiteSuccess, setGsuiteSuccess] = useState('');

  // Review Queue Selection
  const [selectedSubId, setSelectedSubId] = useState(null);
  const [skillRatingsInput, setSkillRatingsInput] = useState({
    Frontend: 4.5,
    Backend: 4.0,
    DevOps: 3.5,
    DSA: 4.0,
    Teamwork: 5.0
  });

  // New Team Form Modal State
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [selectedAiAvatar, setSelectedAiAvatar] = useState(aiTeamAvatars[0].avatarUrl);
  const [teamLeadId, setTeamLeadId] = useState(users[0]?.id || '');
  const [selectedMemberIds, setSelectedMemberIds] = useState([users[0]?.id || '', users[1]?.id || '']);

  // New Announcement Modal State
  const [showAnnModal, setShowAnnModal] = useState(false);
  const [annTitle, setAnnTitle] = useState('');
  const [annMessage, setAnnMessage] = useState('');

  // Score Override Modal State
  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const [overrideStudentId, setOverrideStudentId] = useState(users[0]?.id || '');
  const [overrideReason, setOverrideReason] = useState('');

  const pendingQueue = submissions.filter(s => s.status === 'pending');

  const handleSaveGsuite = (e) => {
    e.preventDefault();
    updateGoogleSuiteConfig({
      topic: meetTopic,
      timing: meetTiming,
      meetUrl,
      driveUrl,
      classroomUrl
    });
    setGsuiteSuccess('Google Meet, Google Drive & Google Classroom details updated live across all student dashboards!');
    setTimeout(() => setGsuiteSuccess(''), 4000);
  };

  const handleReviewSubmit = (e, status) => {
    e.preventDefault();
    if (!selectedSubId) return;

    reviewSubmission(selectedSubId, {
      status,
      skillRatingsObj: skillRatingsInput,
      reviewNotes: 'Reviewed by mentor',
      isProject: true,
      isFirstSubmitter: false
    });

    setSelectedSubId(null);
  };

  const handleCreateTeamSubmit = (e) => {
    e.preventDefault();
    if (!teamName || !teamLeadId) return;
    const members = Array.from(new Set([teamLeadId, ...selectedMemberIds]));
    createTeam({
      name: teamName,
      teamAvatarUrl: selectedAiAvatar,
      leadStudentId: teamLeadId,
      memberIds: members
    });
    setShowTeamModal(false);
    setTeamName('');
  };

  const handlePostAnnSubmit = (e) => {
    e.preventDefault();
    if (!annTitle || !annMessage) return;
    postAnnouncement({ title: annTitle, message: annMessage, bootcampId: 'bootcamp-1' });
    setShowAnnModal(false);
    setAnnTitle('');
    setAnnMessage('');
  };

  const handleOverrideSubmit = (e) => {
    e.preventDefault();
    if (!overrideReason) return;
    overrideScore({
      studentId: overrideStudentId,
      fieldChanged: 'Manual Override',
      oldValue: '-15 pts',
      newValue: '0 pts (Excused)',
      reason: overrideReason
    });
    setShowOverrideModal(false);
    setOverrideReason('');
  };

  const toggleMemberSelection = (id) => {
    if (selectedMemberIds.includes(id)) {
      setSelectedMemberIds(selectedMemberIds.filter(m => m !== id));
    } else {
      setSelectedMemberIds([...selectedMemberIds, id]);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      
      {/* MENTOR NAVIGATION TABS */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.75rem', flexWrap: 'wrap' }}>
        <button
          onClick={() => setActiveSection('gsuite')}
          className={activeSection === 'gsuite' ? 'btn-primary' : 'btn-outline'}
          style={{ fontSize: '0.85rem' }}
        >
          <Video size={16} /> Google Suite & Live Sessions
        </button>

        <button
          onClick={() => setActiveSection('queue')}
          className={activeSection === 'queue' ? 'btn-primary' : 'btn-outline'}
          style={{ fontSize: '0.85rem' }}
        >
          <CheckSquare size={16} /> Submission Queue ({pendingQueue.length})
        </button>

        <button
          onClick={() => setActiveSection('teams')}
          className={activeSection === 'teams' ? 'btn-primary' : 'btn-outline'}
          style={{ fontSize: '0.85rem' }}
        >
          <Users size={16} /> Team Allocation
        </button>


        <button
          onClick={() => setActiveSection('announcements')}
          className={activeSection === 'announcements' ? 'btn-primary' : 'btn-outline'}
          style={{ fontSize: '0.85rem' }}
        >
          <MessageSquare size={16} /> Announcements Feed ({announcements.length})
        </button>

        <button
          onClick={() => setActiveSection('audit')}
          className={activeSection === 'audit' ? 'btn-primary' : 'btn-outline'}
          style={{ fontSize: '0.85rem' }}
        >
          <ShieldCheck size={16} /> Score Audit Log
        </button>
      </div>

      {/* GOOGLE SUITE & LIVE MEETINGS MANAGER */}
      {activeSection === 'gsuite' && (
        <div className="card" style={{ borderColor: '#10b981', borderWidth: '1.5px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
            <Video size={24} style={{ color: '#059669' }} />
            <div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: '800' }}>Google Meet, Drive & Classroom Management</h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Configure live meeting topics, timings, Google Meet URLs, Google Drive slide folders, and Google Classroom links for all students.
              </p>
            </div>
          </div>

          <form onSubmit={handleSaveGsuite} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '800', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                  Google Meet Topic
                </label>
                <input 
                  type="text" 
                  value={meetTopic} 
                  onChange={e => setMeetTopic(e.target.value)} 
                  placeholder="e.g. Daily Mentorship & Live Code Review" 
                  required
                  style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-medium)', fontSize: '0.88rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '800', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                  Live Session Timing (IST)
                </label>
                <input 
                  type="text" 
                  value={meetTiming} 
                  onChange={e => setMeetTiming(e.target.value)} 
                  placeholder="e.g. 8:00 PM - 9:30 PM IST" 
                  required
                  style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-medium)', fontSize: '0.88rem' }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '800', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                Google Meet Join URL
              </label>
              <input 
                type="url" 
                value={meetUrl} 
                onChange={e => setMeetUrl(e.target.value)} 
                placeholder="https://meet.google.com/abc-defg-hij" 
                required
                style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-medium)', fontSize: '0.88rem' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '800', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                  Google Drive Resource Folder URL
                </label>
                <input 
                  type="url" 
                  value={driveUrl} 
                  onChange={e => setDriveUrl(e.target.value)} 
                  placeholder="https://drive.google.com/drive/folders/..." 
                  required
                  style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-medium)', fontSize: '0.88rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '800', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                  Google Classroom URL
                </label>
                <input 
                  type="url" 
                  value={classroomUrl} 
                  onChange={e => setClassroomUrl(e.target.value)} 
                  placeholder="https://classroom.google.com/c/..." 
                  required
                  style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-medium)', fontSize: '0.88rem' }}
                />
              </div>
            </div>

            {gsuiteSuccess && (
              <div style={{ padding: '0.75rem', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 'var(--radius-sm)', color: '#166534', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={16} /> {gsuiteSuccess}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" className="btn-primary" style={{ backgroundColor: '#059669' }}>
                <Save size={16} /> Save & Broadcast Google Links to Students
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TEAM ALLOCATION (Assign & Delete across students) */}
      {activeSection === 'teams' && (
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div>
              <span className="section-label">TEAM ALLOCATION</span>
              <h2 style={{ fontSize: '1.3rem', fontWeight: '700' }}>Team Allocation & Assignments (Delete & Reassign Supported)</h2>
            </div>

            <button onClick={() => setShowTeamModal(true)} className="btn-primary" style={{ fontSize: '0.85rem' }}>
              <Plus size={16} /> Create New Team Allocation
            </button>
          </div>


          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
            {teams.map(team => {
              const leadStudent = users.find(u => u.id === team.leadStudentId);
              const members = users.filter(u => team.memberIds.includes(u.id));

              return (
                <div key={team.id} style={{ padding: '1.25rem', background: '#ffffff', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-md)', position: 'relative' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                      <img 
                        src={team.teamAvatarUrl} 
                        alt={team.name} 
                        style={{ width: '48px', height: '48px', borderRadius: '10px', objectFit: 'cover', border: '2px solid #2752dd' }} 
                      />
                      <div>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: '800' }}>{team.name}</h3>
                        <span className="tag-pill pill-yellow" style={{ fontSize: '0.72rem' }}>
                          Lead: {leadStudent ? leadStudent.name : 'None'} (+15 pts)
                        </span>
                      </div>
                    </div>

                    {/* Delete Team Button */}
                    <button
                      onClick={() => deleteTeam(team.id)}
                      style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '0.4rem', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}
                      title="Delete Team"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <h5 style={{ fontSize: '0.78rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                    Roster ({members.length} Members)
                  </h5>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                    {members.map(m => (
                      <span key={m.id} className="tag-pill pill-blue" style={{ fontSize: '0.75rem' }}>
                        {m.name} {m.id === team.leadStudentId && '👑'}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ANNOUNCEMENTS FEED WITH DELETION SUPPORT */}
      {activeSection === 'announcements' && (
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div>
              <span className="section-label">COMMUNICATION</span>
              <h2 style={{ fontSize: '1.3rem', fontWeight: '700' }}>Mentor Announcements (Delete Supported)</h2>
            </div>

            <button onClick={() => setShowAnnModal(true)} className="btn-primary" style={{ fontSize: '0.85rem' }}>
              <Plus size={16} /> Post New Announcement
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {announcements.map(ann => (
              <div key={ann.id} style={{ padding: '1rem', background: '#f8fafc', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '0.35rem' }}>📌 {ann.title}</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.45', marginBottom: '0.5rem' }}>{ann.message}</p>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-light)' }}>Posted by {ann.authorName} • {new Date(ann.createdAt).toLocaleDateString()}</span>
                </div>

                {/* Delete Announcement Button */}
                <button
                  onClick={() => deleteAnnouncement(ann.id)}
                  style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '0.4rem 0.6rem', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.3rem', whiteSpace: 'nowrap' }}
                >
                  <Trash2 size={14} /> Delete Notice
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUBMISSION REVIEW QUEUE */}
      {activeSection === 'queue' && (
        <div className="card">
          <span className="section-label">REVIEW QUEUE</span>
          <h2 style={{ fontSize: '1.3rem', fontWeight: '700', marginBottom: '1rem' }}>
            Pending Deliverables ({pendingQueue.length})
          </h2>

          {pendingQueue.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
              <CheckSquare size={40} style={{ margin: '0 auto 0.75rem', opacity: 0.5 }} />
              <p style={{ fontWeight: '600' }}>All clear! No pending submissions requiring review.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {pendingQueue.map((sub) => {
                const student = users.find(u => u.id === sub.studentId);
                return (
                  <div key={sub.id} style={{ padding: '1rem', background: '#f8fafc', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)' }}>
                    <span style={{ fontWeight: '700' }}>{student?.name}</span>
                    <a href={sub.githubUrl} target="_blank" rel="noreferrer" style={{ marginLeft: '1rem', color: 'var(--primary-blue)' }}>{sub.githubUrl}</a>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* STUDENT ROSTER */}
      {activeSection === 'roster' && (
        <div className="card">
          <h2 style={{ fontSize: '1.3rem', fontWeight: '700', marginBottom: '1rem' }}>Enrolled Student Roster</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-light)', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '0.75rem' }}>Student</th>
                  <th style={{ padding: '0.75rem' }}>Domain</th>
                </tr>
              </thead>
              <tbody>
                {users.map(student => (
                  <tr key={student.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '0.85rem 0.75rem', fontWeight: '700' }}>{student.name}</td>
                    <td style={{ padding: '0.85rem 0.75rem' }}><span className="tag-pill pill-blue">{student.domain}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* AUDIT LOG */}
      {activeSection === 'audit' && (
        <div className="card">
          <h2 style={{ fontSize: '1.3rem', fontWeight: '700', marginBottom: '1rem' }}>Score Audit Trail</h2>
          {auditLogs.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>No audit logs recorded yet.</p> : null}
        </div>
      )}

      {/* CREATE TEAM MODAL WITH HUMAN AI AVATAR PICKER */}
      {showTeamModal && (
        <div className="modal-overlay" onClick={() => setShowTeamModal(false)}>
          <div className="card" onClick={e => e.stopPropagation()} style={{ maxWidth: '520px', width: '100%' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '1rem' }}>Form New Human AI Team</h3>
            
            <form onSubmit={handleCreateTeamSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', marginBottom: '0.3rem' }}>Team Name</label>
                <input 
                  type="text" 
                  value={teamName} 
                  onChange={e => setTeamName(e.target.value)} 
                  placeholder="e.g. TitanLions AI" 
                  required 
                  style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-medium)' }} 
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', marginBottom: '0.3rem' }}>Select Human AI Team Picture</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
                  {aiTeamAvatars.map(avatar => (
                    <div
                      key={avatar.id}
                      onClick={() => setSelectedAiAvatar(avatar.avatarUrl)}
                      style={{
                        cursor: 'pointer',
                        borderRadius: '8px',
                        border: selectedAiAvatar === avatar.avatarUrl ? '3px solid #2752dd' : '1px solid var(--border-medium)',
                        overflow: 'hidden'
                      }}
                    >
                      <img src={avatar.avatarUrl} alt={avatar.name} style={{ width: '100%', height: '60px', objectFit: 'cover' }} />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', marginBottom: '0.3rem' }}>Assign Team Lead (+15 pts)</label>
                <select value={teamLeadId} onChange={e => setTeamLeadId(e.target.value)} style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-medium)' }}>
                  {users.map(u => (<option key={u.id} value={u.id}>{u.name} ({u.domain})</option>))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', marginBottom: '0.3rem' }}>Select Team Members (Across Students)</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', maxHeight: '140px', overflowY: 'auto' }}>
                  {users.map(u => (
                    <label key={u.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                      <input 
                        type="checkbox" 
                        checked={selectedMemberIds.includes(u.id)} 
                        onChange={() => toggleMemberSelection(u.id)} 
                      />
                      {u.name} ({u.domain})
                    </label>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button type="button" onClick={() => setShowTeamModal(false)} className="btn-outline">Cancel</button>
                <button type="submit" className="btn-primary">Create Team</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ANNOUNCEMENT MODAL */}
      {showAnnModal && (
        <div className="modal-overlay" onClick={() => setShowAnnModal(false)}>
          <div className="card" onClick={e => e.stopPropagation()} style={{ maxWidth: '480px', width: '100%' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '1rem' }}>Post Announcement</h3>
            <form onSubmit={handlePostAnnSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', marginBottom: '0.3rem' }}>Title</label>
                <input type="text" value={annTitle} onChange={e => setAnnTitle(e.target.value)} placeholder="Title..." required style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-medium)' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', marginBottom: '0.3rem' }}>Message</label>
                <textarea rows="4" value={annMessage} onChange={e => setAnnMessage(e.target.value)} placeholder="Message..." required style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-medium)' }} />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowAnnModal(false)} className="btn-outline">Cancel</button>
                <button type="submit" className="btn-primary">Publish</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
