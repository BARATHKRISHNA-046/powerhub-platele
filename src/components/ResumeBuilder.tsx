import React, { useState } from 'react';
import { UserProfile, Submission, Team } from '../lib/supabase';
import { Download, FileText, Sparkles, Check, RefreshCw, Eye, EyeOff, Edit3 } from 'lucide-react';

interface ResumeBuilderProps {
  profile: UserProfile;
  submissions: Submission[];
  teams: Team[];
  totalScore: number;
  leaderboardRank: number;
  skills: Record<string, number>;
}

export const ResumeBuilder: React.FC<ResumeBuilderProps> = ({
  profile,
  submissions,
  teams,
  totalScore,
  leaderboardRank,
  skills,
}) => {
  // Extract top skills with rating >= 3
  const autoSkills = Object.entries(skills)
    .filter(([_, rating]) => rating >= 3)
    .map(([skill]) => skill);

  if (autoSkills.length === 0) {
    autoSkills.push(profile.domain, 'React', 'TypeScript', 'Git', 'Problem Solving');
  }

  // Extract approved projects from submissions
  const approvedProjects = submissions
    .filter((s) => s.is_project || s.status === 'approved')
    .map((s) => ({
      title: s.round_name || s.github_url.split('/').pop() || 'Powerhub Project',
      githubUrl: s.github_url,
      description: `Developed as part of Powerhub ${profile.domain} track. Evaluated and approved by mentor team.`,
      tags: Object.keys(s.skills_rated || {}).length > 0 ? Object.keys(s.skills_rated || {}) : ['React', 'Postgres']
    }));

  // Extract team experience
  const myTeams = teams.filter((t) => t.member_ids.includes(profile.id));

  // State for editable draft
  const [fullName, setFullName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  const [summary, setSummary] = useState(
    profile.bio || `${profile.domain} Engineer with hands-on project experience in cohort sprint deliverables, automated score tracking, and team collaboration.`
  );
  const [skillList, setSkillList] = useState(autoSkills.join(', '));
  const [showAchievements, setShowAchievements] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  const handleExportPDF = () => {
    setIsExporting(true);
    const element = document.getElementById('resume-pdf-content');
    if (!element) return;

    // Use html2pdf.js dynamically if available, or trigger browser print dialog
    const opt = {
      margin: 0.5,
      filename: `${fullName.toLowerCase().replace(/\s+/g, '_')}_resume.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    // @ts-ignore
    if (window.html2pdf) {
      // @ts-ignore
      window.html2pdf().set(opt).from(element).save().then(() => setIsExporting(false));
    } else {
      window.print();
      setIsExporting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
      {/* Header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-xl font-heading font-bold text-brand-slate flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-brand-blue" />
            Automatic Resume Builder
          </h3>
          <p className="text-xs text-slate-500">
            Auto-generated directly from your verified Supabase submissions, skills, and team contributions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAchievements(!showAchievements)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
          >
            {showAchievements ? <Eye className="w-4 h-4 text-emerald-600" /> : <EyeOff className="w-4 h-4 text-slate-400" />}
            {showAchievements ? 'Highlights Visible' : 'Highlights Hidden'}
          </button>

          <button
            onClick={handleExportPDF}
            disabled={isExporting}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-blue hover:bg-blue-700 text-white font-medium text-xs shadow-md transition-all"
          >
            <Download className="w-4 h-4" />
            {isExporting ? 'Generating PDF...' : 'Export to PDF'}
          </button>
        </div>
      </div>

      {/* Editable Fields Control Bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
        <div>
          <label className="font-semibold text-slate-700 block mb-1">Full Name</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-slate-800"
          />
        </div>

        <div>
          <label className="font-semibold text-slate-700 block mb-1">Contact Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-slate-800"
          />
        </div>

        <div className="md:col-span-2">
          <label className="font-semibold text-slate-700 block mb-1">Professional Summary</label>
          <textarea
            rows={2}
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-slate-800"
          />
        </div>

        <div className="md:col-span-2">
          <label className="font-semibold text-slate-700 block mb-1">Validated Skills (Comma separated)</label>
          <input
            type="text"
            value={skillList}
            onChange={(e) => setSkillList(e.target.value)}
            className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-slate-800"
          />
        </div>
      </div>

      {/* Live Resume Document Preview (Target element for PDF export) */}
      <div
        id="resume-pdf-content"
        className="bg-white border border-slate-300 rounded-xl p-8 shadow-inner font-sans text-slate-800 space-y-6"
      >
        {/* Document Header */}
        <div className="flex justify-between items-start border-b border-slate-200 pb-6">
          <div>
            <h1 className="text-3xl font-heading font-extrabold text-slate-900 mb-1">
              {fullName}
            </h1>
            <div className="text-sm font-semibold text-brand-blue uppercase tracking-wide">
              {profile.domain} Engineer • {profile.batch}
            </div>
            <div className="text-xs text-slate-500 mt-1">{email}</div>
          </div>

          <img
            src={profile.profile_pic_url}
            alt={fullName}
            className="w-20 h-20 rounded-full object-cover border-2 border-brand-blue"
          />
        </div>

        {/* Optional Achievement Highlights */}
        {showAchievements && (
          <div className="flex gap-4 p-3 bg-blue-50/60 rounded-xl border border-blue-100 text-xs">
            <div className="flex-1">
              <span className="text-slate-500 font-medium block">Leaderboard Rank</span>
              <span className="font-bold text-brand-blue text-sm">#{leaderboardRank || 1} Global</span>
            </div>
            <div className="flex-1">
              <span className="text-slate-500 font-medium block">Total Verified Score</span>
              <span className="font-bold text-emerald-600 text-sm">{totalScore} Points</span>
            </div>
            <div className="flex-1">
              <span className="text-slate-500 font-medium block">Track</span>
              <span className="font-bold text-slate-800 text-sm">{profile.domain}</span>
            </div>
          </div>
        )}

        {/* Executive Summary */}
        <div>
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            Summary
          </h4>
          <p className="text-sm text-slate-700 leading-relaxed">{summary}</p>
        </div>

        {/* Skills Section */}
        <div>
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            Technical Competencies
          </h4>
          <div className="flex flex-wrap gap-2">
            {skillList.split(',').map((skill, idx) => (
              <span
                key={idx}
                className="px-3 py-1 bg-slate-100 text-slate-800 text-xs font-semibold rounded-lg border border-slate-200"
              >
                {skill.trim()}
              </span>
            ))}
          </div>
        </div>

        {/* Projects Section */}
        <div>
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
            Verified Projects & Deliverables
          </h4>
          <div className="space-y-4">
            {approvedProjects.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No approved submissions yet.</p>
            ) : (
              approvedProjects.map((proj, idx) => (
                <div key={idx} className="border-l-2 border-brand-blue pl-4 py-1">
                  <div className="flex justify-between items-center">
                    <h5 className="font-bold text-sm text-slate-900">{proj.title}</h5>
                    <a
                      href={proj.githubUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-brand-blue font-medium underline"
                    >
                      GitHub Repo ↗
                    </a>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">{proj.description}</p>
                  <div className="flex gap-1.5 mt-2">
                    {proj.tags.map((tag, tIdx) => (
                      <span
                        key={tIdx}
                        className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Team Collaboration */}
        <div>
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
            Team Collaboration & Leadership
          </h4>
          {myTeams.length === 0 ? (
            <p className="text-xs text-slate-400 italic">Not assigned to a team yet.</p>
          ) : (
            myTeams.map((team) => (
              <div key={team.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <div className="font-bold text-slate-900 flex items-center gap-2">
                  <span>{team.emoji_combo}</span>
                  <span>{team.name}</span>
                  <span className="px-2 py-0.5 rounded bg-brand-blue/10 text-brand-blue text-[10px] font-semibold">
                    {team.lead_student_id === profile.id ? 'Team Lead' : 'Team Member'}
                  </span>
                </div>
                <div className="text-slate-500 mt-1">
                  Shared Repository: {team.github_url || 'Assigned Project'}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
