import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { 
  UserPlus, Sparkles, ArrowLeft, Shield, ChevronLeft, ChevronRight, 
  ArrowRight, Check, User
} from 'lucide-react';

export default function ProfilePicker() {
  const { users, selectProfile, createProfile, setAuthScreen } = useApp();
  const [activeIndex, setActiveIndex] = useState(0);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New Profile Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [domain, setDomain] = useState('Fullstack Development');
  const [isStudent, setIsStudent] = useState(true);
  const [isMentor, setIsMentor] = useState(false);
  const [avatarBg, setAvatarBg] = useState('#2752dd');

  // Drag / Touch Swipe State
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const sliderRef = useRef(null);

  // Gradient themes assigned per student index for vibrant vertical column styling
  const columnGradients = [
    { bg: 'linear-gradient(180deg, #0284c7 0%, #1e40af 100%)', text: '#ffffff', tag: '#e0f2fe', tagText: '#0369a1' },
    { bg: 'linear-gradient(180deg, #ec4899 0%, #be185d 100%)', text: '#ffffff', tag: '#fce7f3', tagText: '#be185d' },
    { bg: 'linear-gradient(180deg, #f97316 0%, #c2410c 100%)', text: '#ffffff', tag: '#ffedd5', tagText: '#c2410c' },
    { bg: 'linear-gradient(180deg, #8b5cf6 0%, #6d28d9 100%)', text: '#ffffff', tag: '#f3e8ff', tagText: '#6d28d9' },
    { bg: 'linear-gradient(180deg, #eab308 0%, #a16207 100%)', text: '#ffffff', tag: '#fef9c3', tagText: '#854d0e' },
    { bg: 'linear-gradient(180deg, #ef4444 0%, #b91c1c 100%)', text: '#ffffff', tag: '#fee2e2', tagText: '#b91c1c' },
    { bg: 'linear-gradient(180deg, #10b981 0%, #047857 100%)', text: '#ffffff', tag: '#d1fae5', tagText: '#047857' },
    { bg: 'linear-gradient(180deg, #6366f1 0%, #4338ca 100%)', text: '#ffffff', tag: '#e0e7ff', tagText: '#3730a3' }
  ];

  // Combine real users + 1 Add Profile card so no student is missed
  const allItems = [
    ...users.map(u => ({ type: 'user', data: u })),
    { type: 'add', data: { id: 'add-new', name: 'New Profile' } }
  ];

  const totalItems = allItems.length;

  const handleNext = () => {
    setActiveIndex(prev => (prev + 1) % totalItems);
  };

  const handlePrev = () => {
    setActiveIndex(prev => (prev - 1 + totalItems) % totalItems);
  };

  // Keyboard Arrow Navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [totalItems]);

  // Touch & Mouse Drag handlers
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.clientX);
    setDragOffset(0);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const diff = e.clientX - startX;
    setDragOffset(diff);
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
    if (dragOffset < -50) handleNext();
    else if (dragOffset > 50) handlePrev();
    setDragOffset(0);
  };

  const handleTouchStart = (e) => {
    setIsDragging(true);
    setStartX(e.touches[0].clientX);
    setDragOffset(0);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    const diff = e.touches[0].clientX - startX;
    setDragOffset(diff);
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    if (dragOffset < -50) handleNext();
    else if (dragOffset > 50) handlePrev();
    setDragOffset(0);
  };

  const handleCreate = (e) => {
    e.preventDefault();
    if (!name || !email) return;

    const roles = [];
    if (isStudent) roles.push('student');
    if (isMentor) roles.push('mentor');
    if (roles.length === 0) roles.push('student');

    createProfile({ name, email, avatarBg, roles, domain });
    setShowCreateModal(false);
  };

  const bgColors = ['#2752dd', '#f59e0b', '#ec4899', '#8b5cf6', '#10b981', '#06b6d4', '#6366f1'];

  return (
    <div style={{ 
      minHeight: '100vh', 
      width: '100vw',
      background: 'linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%)', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'space-between', 
      padding: '1.5rem', 
      position: 'relative',
      overflow: 'hidden',
      userSelect: 'none'
    }}>
      
      {/* BRAND TOP HEADER BAR */}
      <div style={{ 
        width: '100%', 
        maxWidth: '1200px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        zIndex: 20 
      }}>
        {/* Back to Login Button */}
        <button 
          onClick={() => setAuthScreen('login')}
          style={{
            background: '#ffffff',
            border: '1.5px solid #cbd5e1',
            borderRadius: '9999px',
            padding: '0.5rem 1.1rem',
            fontSize: '0.85rem',
            fontWeight: '700',
            color: '#334155',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            transition: 'all 0.2s ease'
          }}
        >
          <ArrowLeft size={16} /> Back to Sign in
        </button>

        {/* Title Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Sparkles size={24} style={{ color: '#2563eb' }} />
          <h1 style={{ fontSize: '1.6rem', fontWeight: '900', fontFamily: 'var(--font-heading)', color: '#0f172a', letterSpacing: '-0.02em' }}>
            Who's Learning on <span style={{ color: '#2563eb' }}>Powerhub?</span>
          </h1>
        </div>

        {/* Add Profile Quick Button */}
        <button
          onClick={() => setShowCreateModal(true)}
          style={{
            background: 'linear-gradient(135deg, #1e293b, #0f172a)',
            color: '#ffffff',
            border: 'none',
            borderRadius: '9999px',
            padding: '0.55rem 1.25rem',
            fontSize: '0.85rem',
            fontWeight: '800',
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(15,23,42,0.25)',
            transition: 'all 0.2s ease'
          }}
        >
          <UserPlus size={16} /> Add Profile
        </button>
      </div>

      {/* MOVABLE 3D VERTICAL COLUMN SLIDER CONTAINER */}
      <div 
        ref={sliderRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          width: '100%',
          maxWidth: '1300px',
          height: '620px',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          perspective: '1200px',
          cursor: isDragging ? 'grabbing' : 'grab',
          margin: '1.5rem 0'
        }}
      >
        {/* LEFT CHEVRON NAV BUTTON */}
        <button
          onClick={(e) => { e.stopPropagation(); handlePrev(); }}
          aria-label="Previous Student"
          style={{
            position: 'absolute',
            left: '1rem',
            zIndex: 30,
            width: '52px',
            height: '52px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
            border: '1.5px solid #cbd5e1',
            color: '#0f172a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 8px 20px rgba(0,0,0,0.12)',
            transition: 'all 0.25s ease'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.1)'; e.currentTarget.style.background = '#ffffff'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.background = 'rgba(255, 255, 255, 0.9)'; }}
        >
          <ChevronLeft size={30} />
        </button>

        {/* RIGHT CHEVRON NAV BUTTON */}
        <button
          onClick={(e) => { e.stopPropagation(); handleNext(); }}
          aria-label="Next Student"
          style={{
            position: 'absolute',
            right: '1rem',
            zIndex: 30,
            width: '52px',
            height: '52px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
            border: '1.5px solid #cbd5e1',
            color: '#0f172a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 8px 20px rgba(0,0,0,0.12)',
            transition: 'all 0.25s ease'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.1)'; e.currentTarget.style.background = '#ffffff'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.background = 'rgba(255, 255, 255, 0.9)'; }}
        >
          <ChevronRight size={30} />
        </button>

        {/* MOVABLE COLUMNS STACK */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          width: '100%',
          position: 'relative'
        }}>
          {allItems.map((item, idx) => {
            // Compute relative offset index from activeIndex
            let offset = idx - activeIndex;
            if (offset < -Math.floor(totalItems / 2)) offset += totalItems;
            if (offset > Math.floor(totalItems / 2)) offset -= totalItems;

            const isActive = offset === 0;
            const styleTheme = columnGradients[idx % columnGradients.length];

            // 3D positioning math for smooth vertical column slider matching reference image
            const translateX = offset * 220 + (isDragging ? dragOffset * 0.5 : 0);
            const scale = isActive ? 1.08 : Math.max(0.78, 1 - Math.abs(offset) * 0.12);
            const opacity = Math.max(0, 1 - Math.abs(offset) * 0.35);
            const zIndex = 20 - Math.abs(offset);

            if (Math.abs(offset) > 3) return null; // Hide far offscreen items

            if (item.type === 'user') {
              const user = item.data;
              const isDualRole = user.roles.includes('student') && user.roles.includes('mentor');

              return (
                <div
                  key={user.id}
                  onClick={() => {
                    if (isActive) {
                      selectProfile(user.id);
                    } else {
                      setActiveIndex(idx);
                    }
                  }}
                  style={{
                    position: 'absolute',
                    width: '240px',
                    height: '560px',
                    borderRadius: '24px',
                    background: styleTheme.bg,
                    transform: `translateX(${translateX}px) scale(${scale})`,
                    opacity: opacity,
                    zIndex: zIndex,
                    transition: isDragging ? 'none' : 'all 0.45s cubic-bezier(0.34, 1.4, 0.64, 1)',
                    boxShadow: isActive 
                      ? '0 30px 60px -15px rgba(0, 0, 0, 0.35), 0 0 0 4px rgba(255,255,255,0.8)' 
                      : '0 15px 30px -10px rgba(0,0,0,0.2)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '2.5rem 1.25rem 2rem',
                    cursor: 'pointer',
                    overflow: 'hidden'
                  }}
                >
                  {/* Subtle Top Header Tag */}
                  <div style={{ textAlign: 'center' }}>
                    <span style={{ 
                      fontSize: '0.72rem', 
                      fontWeight: '900', 
                      letterSpacing: '0.1em', 
                      textTransform: 'uppercase', 
                      color: 'rgba(255,255,255,0.8)',
                      display: 'block'
                    }}>
                      {user.domain || 'POWERHUB TRACK'}
                    </span>
                  </div>

                  {/* 3D CIRCULAR AVATAR IN CENTER */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
                    <div 
                      style={{
                        width: isActive ? '140px' : '110px',
                        height: isActive ? '140px' : '110px',
                        borderRadius: '50%',
                        backgroundColor: user.avatarBg || '#2563eb',
                        border: '4px solid #ffffff',
                        boxShadow: isActive ? '0 12px 30px rgba(0,0,0,0.3)' : '0 6px 16px rgba(0,0,0,0.15)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#ffffff',
                        fontSize: isActive ? '3.2rem' : '2.5rem',
                        fontWeight: '900',
                        position: 'relative',
                        overflow: 'hidden',
                        transition: 'all 0.35s ease'
                      }}
                    >
                      {user.profilePicUrl || user.profilePic || user.avatarUrl ? (
                        <img 
                          src={user.profilePicUrl || user.profilePic || user.avatarUrl} 
                          alt={user.name} 
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.name)}`;
                          }}
                          style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} 
                        />
                      ) : (
                        user.initials
                      )}

                    </div>

                    {isDualRole && (
                      <div 
                        title="Dual Role: Student & Mentor"
                        style={{
                          position: 'absolute',
                          bottom: '-8px',
                          background: '#f59e0b',
                          color: '#ffffff',
                          borderRadius: '9999px',
                          padding: '0.25rem 0.65rem',
                          fontSize: '0.68rem',
                          fontWeight: '900',
                          boxShadow: '0 4px 10px rgba(0,0,0,0.25)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem'
                        }}
                      >
                        <Shield size={12} /> MENTOR
                      </div>
                    )}
                  </div>

                  {/* STUDENT NAME & ENTER DASHBOARD BUTTON */}
                  <div style={{ textAlign: 'center', width: '100%' }}>
                    <h2 style={{ 
                      fontSize: isActive ? '1.35rem' : '1.1rem', 
                      fontWeight: '900', 
                      color: styleTheme.text,
                      lineHeight: '1.25',
                      marginBottom: '0.5rem',
                      fontFamily: 'var(--font-heading)'
                    }}>
                      {user.name}
                    </h2>

                    <span style={{ 
                      background: styleTheme.tag, 
                      color: styleTheme.tagText, 
                      padding: '0.3rem 0.75rem', 
                      borderRadius: '9999px', 
                      fontSize: '0.75rem', 
                      fontWeight: '800',
                      display: 'inline-block',
                      marginBottom: '1rem'
                    }}>
                      {isDualRole ? 'Student & Mentor' : (user.roles[0].toUpperCase())}
                    </span>

                    {/* Active Enter Dashboard Button */}
                    {isActive && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          selectProfile(user.id);
                        }}
                        style={{
                          width: '100%',
                          padding: '0.75rem 1rem',
                          borderRadius: '14px',
                          background: '#ffffff',
                          color: styleTheme.tagText,
                          border: 'none',
                          fontSize: '0.9rem',
                          fontWeight: '900',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.4rem',
                          cursor: 'pointer',
                          boxShadow: '0 8px 20px rgba(0,0,0,0.2)',
                          animation: 'pulse 2s infinite'
                        }}
                      >
                        Enter Dashboard <ArrowRight size={16} />
                      </button>
                    )}
                  </div>
                </div>
              );
            } else {
              // Add Profile Card Column
              return (
                <div
                  key="add-card"
                  onClick={() => setShowCreateModal(true)}
                  style={{
                    position: 'absolute',
                    width: '240px',
                    height: '560px',
                    borderRadius: '24px',
                    background: 'linear-gradient(180deg, #64748b 0%, #334155 100%)',
                    transform: `translateX(${translateX}px) scale(${scale})`,
                    opacity: opacity,
                    zIndex: zIndex,
                    transition: isDragging ? 'none' : 'all 0.45s cubic-bezier(0.34, 1.4, 0.64, 1)',
                    boxShadow: isActive ? '0 30px 60px -15px rgba(0, 0, 0, 0.35)' : '0 15px 30px -10px rgba(0,0,0,0.2)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '2.5rem 1.25rem 2rem',
                    cursor: 'pointer',
                    border: '2px dashed rgba(255,255,255,0.4)'
                  }}
                >
                  <span style={{ fontSize: '0.72rem', fontWeight: '900', color: 'rgba(255,255,255,0.8)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                    SETUP NEW PROFILE
                  </span>

                  <div 
                    style={{
                      width: '110px',
                      height: '110px',
                      borderRadius: '50%',
                      background: 'rgba(255, 255, 255, 0.15)',
                      border: '2px dashed #ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#ffffff'
                    }}
                  >
                    <UserPlus size={44} />
                  </div>

                  <div style={{ textAlign: 'center', width: '100%' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: '900', color: '#ffffff', marginBottom: '0.75rem' }}>
                      Add New Student
                    </h2>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowCreateModal(true);
                      }}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        borderRadius: '14px',
                        background: '#ffffff',
                        color: '#0f172a',
                        border: 'none',
                        fontSize: '0.88rem',
                        fontWeight: '900',
                        cursor: 'pointer'
                      }}
                    >
                      + Create Profile
                    </button>
                  </div>
                </div>
              );
            }
          })}
        </div>
      </div>

      {/* BOTTOM CAROUSEL DOTS & HINT */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', zIndex: 20 }}>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {allItems.map((_, dotIdx) => (
            <div
              key={dotIdx}
              onClick={() => setActiveIndex(dotIdx)}
              style={{
                width: activeIndex === dotIdx ? '28px' : '9px',
                height: '9px',
                borderRadius: '9999px',
                background: activeIndex === dotIdx ? '#2563eb' : '#cbd5e1',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            />
          ))}
        </div>
        <p style={{ fontSize: '0.82rem', fontWeight: '700', color: '#64748b', margin: 0 }}>
          💡 Drag horizontally or use Left / Right Arrow keys to switch students
        </p>
      </div>

      {/* CREATE NEW PROFILE MODAL */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div 
            className="card" 
            onClick={e => e.stopPropagation()}
            style={{ maxWidth: '480px', width: '100%', padding: '2rem' }}
          >
            <h2 style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}>Set Up New Powerhub Profile</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '1.5rem' }}>
              Configure student display name, role, and domain track.
            </p>

            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.35rem' }}>
                  Full Name
                </label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  placeholder="e.g. Alex Rivera"
                  required
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-medium)'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.35rem' }}>
                  Email Address
                </label>
                <input 
                  type="email" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  placeholder="alex@powerhub.dev"
                  required
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-medium)'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.35rem' }}>
                  Primary Learning Track / Domain
                </label>
                <select
                  value={domain}
                  onChange={e => setDomain(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-medium)'
                  }}
                >
                  <option value="Fullstack Development">Fullstack Development</option>
                  <option value="UI/UX Design">UI/UX Design</option>
                  <option value="AI (Machine Learning)">AI (Machine Learning)</option>
                  <option value="Edge AI">Edge AI</option>
                  <option value="Embedded IoT">Embedded IoT</option>
                  <option value="Automotive Track">Automotive Track</option>
                  <option value="VLSI Design">VLSI Design</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.35rem' }}>
                  Role(s)
                </label>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.25rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={isStudent} 
                      onChange={e => setIsStudent(e.target.checked)} 
                    /> Student
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={isMentor} 
                      onChange={e => setIsMentor(e.target.checked)} 
                    /> Mentor
                  </label>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.35rem' }}>
                  Avatar Color
                </label>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {bgColors.map(c => (
                    <div
                      key={c}
                      onClick={() => setAvatarBg(c)}
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        backgroundColor: c,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: avatarBg === c ? '3px solid var(--text-main)' : 'none'
                      }}
                    >
                      {avatarBg === c && <Check size={16} style={{ color: '#fff' }} />}
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button type="button" onClick={() => setShowCreateModal(false)} className="btn-outline">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
