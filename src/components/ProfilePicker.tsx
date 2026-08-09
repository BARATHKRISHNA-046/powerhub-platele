import React, { useState } from 'react';
import { UserProfile, Domain, Role, uploadImageToSupabaseStorage, upsertProfileInSupabase } from '../lib/supabase';
import { Plus, UserPlus, Upload, Check, Sparkles, X, Shield, BookOpen } from 'lucide-react';

interface ProfilePickerProps {
  profiles: UserProfile[];
  onSelectProfile: (profile: UserProfile) => void;
  onRefreshProfiles: () => void;
}

const DOMAINS: Domain[] = [
  'Fullstack',
  'UI/UX',
  'AI',
  'Edge AI',
  'Embedded IoT',
  'Automotive'
];

export const ProfilePicker: React.FC<ProfilePickerProps> = ({
  profiles,
  onSelectProfile,
  onRefreshProfiles,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [domain, setDomain] = useState<Domain>('Fullstack');
  const [isMentor, setIsMentor] = useState(false);
  const [isStudent, setIsStudent] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      // Local preview ONLY for instantaneous UI feedback while uploading (Architecture Rule 2 requires Supabase Storage URL for saved record)
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleCreateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      alert('Please fill out Name and Email');
      return;
    }

    const roles: Role[] = [];
    if (isStudent) roles.push('student');
    if (isMentor) roles.push('mentor');
    if (roles.length === 0) roles.push('student');

    setUploading(true);
    try {
      let finalAvatarUrl = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=300';
      
      // Upload to Supabase Storage if a file is selected
      if (selectedFile) {
        finalAvatarUrl = await uploadImageToSupabaseStorage(selectedFile, 'avatars');
      }

      const newProfile: UserProfile = {
        id: `usr-${Date.now()}`,
        name: name.trim(),
        email: email.trim(),
        profile_pic_url: finalAvatarUrl,
        roles,
        domain,
        batch: 'Cohort 2026',
        bio: `${domain} enthusiast on Powerhub.`
      };

      await upsertProfileInSupabase(newProfile);
      setShowAddModal(false);
      setName('');
      setEmail('');
      setSelectedFile(null);
      setAvatarPreview(null);
      onRefreshProfiles();
      onSelectProfile(newProfile);
    } catch (err: any) {
      alert(`Failed to save profile: ${err.message || err}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Animated Orbs */}
      <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-brand-blue/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-5xl text-center">
        <h1 className="text-4xl md:text-5xl font-heading font-extrabold tracking-tight mb-3">
          Who's Learning on Powerhub?
        </h1>
        <p className="text-slate-400 text-base max-w-xl mx-auto mb-12">
          Select your profile card below to access your custom Student or Mentor workspace.
        </p>

        {/* Disney+ Hotstar style Horizontal Row of Avatar Cards */}
        <div className="flex flex-wrap justify-center gap-8 items-stretch max-w-4xl mx-auto">
          {profiles.map((profile) => {
            const isDualRole = profile.roles.includes('student') && profile.roles.includes('mentor');
            
            return (
              <button
                key={profile.id}
                onClick={() => onSelectProfile(profile)}
                className="group relative flex flex-col items-center w-40 p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 hover:border-brand-blue hover:bg-slate-800 hover:scale-105 transition-all duration-300 shadow-lg text-center cursor-pointer"
              >
                {/* Circular Avatar Container with Hover Glow */}
                <div className="relative w-28 h-28 mb-3 rounded-full p-1 bg-gradient-to-tr from-brand-blue to-cyan-400 group-hover:from-blue-400 group-hover:to-indigo-500 transition-all shadow-md">
                  <img
                    src={profile.profile_pic_url}
                    alt={profile.name}
                    className="w-full h-full rounded-full object-cover border-2 border-slate-900"
                  />
                  {isDualRole && (
                    <span className="absolute -top-1 -right-1 bg-amber-500 text-slate-950 font-bold text-[10px] px-2 py-0.5 rounded-full shadow-md">
                      DUAL
                    </span>
                  )}
                </div>

                {/* Profile Name & Badge */}
                <h3 className="font-heading font-bold text-base text-slate-100 group-hover:text-white line-clamp-1 mb-1">
                  {profile.name}
                </h3>

                {/* Domain Pill Tag */}
                <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-slate-700/70 text-cyan-300 border border-cyan-500/20 mb-1.5">
                  {profile.domain}
                </span>

                {/* Role Indicator */}
                <div className="text-xs text-slate-400 font-medium flex items-center justify-center gap-1">
                  {profile.roles.includes('mentor') ? (
                    <span className="text-amber-400 flex items-center gap-1">
                      <Shield className="w-3 h-3" /> Mentor
                    </span>
                  ) : (
                    <span className="text-blue-300 flex items-center gap-1">
                      <BookOpen className="w-3 h-3" /> Student
                    </span>
                  )}
                </div>
              </button>
            );
          })}

          {/* Add Profile Card */}
          <button
            onClick={() => setShowAddModal(true)}
            className="group flex flex-col items-center justify-center w-40 p-4 rounded-2xl bg-slate-800/30 border-2 border-dashed border-slate-700 hover:border-brand-blue hover:bg-slate-800/60 hover:scale-105 transition-all duration-300 cursor-pointer"
          >
            <div className="w-24 h-24 mb-3 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 group-hover:text-brand-blue group-hover:border-brand-blue/50 transition-all">
              <Plus className="w-10 h-10" />
            </div>
            <span className="font-heading font-semibold text-sm text-slate-300 group-hover:text-white">
              Add Profile
            </span>
            <span className="text-[11px] text-slate-500">Create new user</span>
          </button>
        </div>
      </div>

      {/* Add Profile Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-slate-800 border border-slate-700 text-white rounded-2xl w-full max-w-lg p-6 shadow-2xl relative">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-2xl font-heading font-bold mb-1 flex items-center gap-2 text-white">
              <UserPlus className="w-6 h-6 text-brand-blue" />
              Create Profile
            </h2>
            <p className="text-xs text-slate-400 mb-6">
              Add a new Student or Mentor profile. Picture will be stored in Supabase Storage.
            </p>

            <form onSubmit={handleCreateProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Maya Lin"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-blue"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="maya.lin@powerhub.edu"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-blue"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  Domain Track
                </label>
                <select
                  value={domain}
                  onChange={(e) => setDomain(e.target.value as Domain)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-blue"
                >
                  {DOMAINS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-2">
                  Role Capabilities
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer bg-slate-900 px-4 py-2 rounded-xl border border-slate-700">
                    <input
                      type="checkbox"
                      checked={isStudent}
                      onChange={(e) => setIsStudent(e.target.checked)}
                      className="accent-brand-blue"
                    />
                    <span className="text-sm font-medium">Student</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer bg-slate-900 px-4 py-2 rounded-xl border border-slate-700">
                    <input
                      type="checkbox"
                      checked={isMentor}
                      onChange={(e) => setIsMentor(e.target.checked)}
                      className="accent-brand-blue"
                    />
                    <span className="text-sm font-medium">Mentor</span>
                  </label>
                </div>
                {isStudent && isMentor && (
                  <p className="text-[11px] text-amber-400 mt-1">
                    ✨ Dual-Role enabled! You will get a View Switcher in the top navigation header.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  Profile Picture (Uploaded to Supabase Storage)
                </label>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-slate-900 border border-slate-700 overflow-hidden flex items-center justify-center">
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <Upload className="w-5 h-5 text-slate-500" />
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="text-xs text-slate-400 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-brand-blue file:text-white hover:file:bg-blue-700 cursor-pointer"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-700">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-700 text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-6 py-2.5 rounded-xl bg-brand-blue hover:bg-blue-700 text-white text-sm font-medium shadow-lg disabled:opacity-50 flex items-center gap-2"
                >
                  {uploading ? 'Uploading to Supabase...' : 'Save Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
