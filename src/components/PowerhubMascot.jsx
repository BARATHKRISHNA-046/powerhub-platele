import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { X, Sparkles } from 'lucide-react';

export default function PowerhubMascot() {
  const { announcements, submissions, currentUser, getISTDateDetails } = useApp();
  
  const [hint, setHint] = useState(null);
  const [isPoppedUp, setIsPoppedUp] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const lastShownTimeRef = useRef(0);
  const prevAnnCountRef = useRef(announcements ? announcements.length : 0);
  const prevSubCountRef = useRef(submissions ? submissions.length : 0);

  // Helper to trigger hint with 60-second rate-limiting cooldown
  const triggerHint = (message, force = false) => {
    const now = Date.now();
    if (!force && now - lastShownTimeRef.current < 60000) {
      return; // Respect 1-minute throttling cooldown
    }
    lastShownTimeRef.current = now;
    setHint(message);
    setIsPoppedUp(true);
  };

  // Auto-dismiss hint after 5.5 seconds
  useEffect(() => {
    if (hint && isPoppedUp) {
      const timer = setTimeout(() => {
        setIsPoppedUp(false);
        setTimeout(() => setHint(null), 400); // Clear after slide down
      }, 5500);
      return () => clearTimeout(timer);
    }
  }, [hint, isPoppedUp]);

  // Event 1: Listen for new announcements
  useEffect(() => {
    if (announcements) {
      if (announcements.length > prevAnnCountRef.current && prevAnnCountRef.current > 0) {
        triggerHint("📌 New announcement from your mentor!");
      }
      prevAnnCountRef.current = announcements.length;
    }
  }, [announcements]);

  // Event 2: Listen for new submission uploaded
  useEffect(() => {
    if (submissions) {
      if (submissions.length > prevSubCountRef.current && prevSubCountRef.current > 0) {
        triggerHint("🎉 Nice work! Submission received.");
      }
      prevSubCountRef.current = submissions.length;
    }
  }, [submissions]);

  // Event 3: Check 30-min IST cutoff deadline warning
  useEffect(() => {
    const checkDeadline = () => {
      if (!currentUser || currentUser.roles?.includes('mentor')) return;
      
      const ist = getISTDateDetails ? getISTDateDetails() : { secondsTo11PM: 3600, todayStr: '' };
      const todayStr = ist.todayStr;
      
      // Check if student has submitted today
      const hasSubmittedToday = (submissions || []).some(
        s => s.studentId === currentUser.id && (s.date === todayStr || (s.submittedAt && s.submittedAt.startsWith(todayStr)))
      );

      // If within 30 mins of 11:00 PM IST (0 to 1800 seconds) and not submitted yet
      if (!hasSubmittedToday && ist.secondsTo11PM > 0 && ist.secondsTo11PM <= 1800) {
        triggerHint("⏳ Don't forget to submit today's work before 11:00 PM!");
      }
    };

    checkDeadline();
    const interval = setInterval(checkDeadline, 120000); // Check every 2 mins
    return () => clearInterval(interval);
  }, [currentUser, submissions, getISTDateDetails]);

  // Handle clicking mascot manually
  const handleMascotClick = () => {
    if (isPoppedUp && hint) {
      setIsPoppedUp(false);
      setTimeout(() => setHint(null), 300);
    } else {
      const randomTips = [
        "👋 Hey! Keep up the great daily habit streak!",
        "💡 Pro-tip: Mentor code reviews update live in your feed.",
        "⭐ Check out the Global Leaderboard for current cohort ranks!",
        "🚀 Keep building awesome projects for your portfolio!"
      ];
      const pick = randomTips[Math.floor(Math.random() * randomTips.length)];
      triggerHint(pick, true);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        right: '28px',
        zIndex: 999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        pointerEvents: 'none', // Wrapper allows click-through except on mascot & bubble
        fontFamily: 'var(--font-body, sans-serif)'
      }}
    >
      {/* SPEECH BUBBLE HINT */}
      {hint && (
        <div
          style={{
            pointerEvents: 'auto',
            marginBottom: '8px',
            marginRight: '6px',
            background: '#ffffff',
            border: '1.5px solid #cbd5e1',
            borderRadius: '16px',
            padding: '0.75rem 1rem',
            maxWidth: '240px',
            boxShadow: '0 10px 25px rgba(15, 23, 42, 0.12), 0 2px 6px rgba(15, 23, 42, 0.04)',
            opacity: isPoppedUp ? 1 : 0,
            transform: isPoppedUp ? 'translateY(0) scale(1)' : 'translateY(12px) scale(0.9)',
            transition: 'opacity 0.3s ease, transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
            position: 'relative',
            cursor: 'pointer'
          }}
          onClick={() => {
            setIsPoppedUp(false);
            setTimeout(() => setHint(null), 300);
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
            <div style={{ fontSize: '0.82rem', fontWeight: '800', color: '#0f172a', lineHeight: '1.45' }}>
              {hint}
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsPoppedUp(false);
                setTimeout(() => setHint(null), 300);
              }}
              style={{
                border: 'none',
                background: 'transparent',
                color: '#94a3b8',
                cursor: 'pointer',
                padding: '0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: '-2px'
              }}
            >
              <X size={14} />
            </button>
          </div>

          {/* SPEECH BUBBLE TAIL POINTER */}
          <div
            style={{
              position: 'absolute',
              bottom: '-8px',
              right: '24px',
              width: 0,
              height: 0,
              borderLeft: '7px solid transparent',
              borderRight: '7px solid transparent',
              borderTop: '8px solid #ffffff',
              filter: 'drop-shadow(0 2px 1px rgba(0,0,0,0.05))'
            }}
          />
        </div>
      )}

      {/* CUTE ORIGINAL FOREST SQUIRREL MASCOT SVG */}
      <div
        onClick={handleMascotClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        title="Hubby — Powerhub Mascot (Click for tips!)"
        style={{
          pointerEvents: 'auto',
          cursor: 'pointer',
          transform: isPoppedUp ? 'translateY(0px)' : (isHovered ? 'translateY(52px)' : 'translateY(66px)'),
          transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
          width: '74px',
          height: '74px',
          position: 'relative'
        }}
      >
        <svg
          width="74"
          height="74"
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ filter: 'drop-shadow(0 4px 10px rgba(15, 23, 42, 0.15))' }}
        >
          {/* FLUFFY TAIL (Warm Orange/Amber) */}
          <path
            d="M75 60 C 95 40, 90 10, 65 15 C 55 18, 55 30, 65 40 C 72 47, 75 52, 75 60 Z"
            fill="#d97706"
          />
          <path
            d="M72 55 C 88 38, 83 16, 65 20 C 58 22, 59 30, 66 38 C 70 43, 72 49, 72 55 Z"
            fill="#f59e0b"
          />

          {/* LEFT & RIGHT EARS */}
          <ellipse cx="28" cy="22" rx="11" ry="16" fill="#b45309" transform="rotate(-12 28 22)" />
          <ellipse cx="28" cy="22" rx="6" ry="10" fill="#fde68a" transform="rotate(-12 28 22)" />

          <ellipse cx="64" cy="22" rx="11" ry="16" fill="#b45309" transform="rotate(12 64 22)" />
          <ellipse cx="64" cy="22" rx="6" ry="10" fill="#fde68a" transform="rotate(12 64 22)" />

          {/* MAIN HEAD (Warm Amber Brown) */}
          <ellipse cx="46" cy="46" rx="32" ry="29" fill="#d97706" />

          {/* FACE MUZZLE (Soft Cream/Tan) */}
          <ellipse cx="46" cy="54" rx="22" ry="18" fill="#fffbeb" />

          {/* BIG EXPRESSIVE EYES */}
          {/* Left Eye */}
          <circle cx="34" cy="42" r="6.5" fill="#0f172a" />
          <circle cx="36" cy="40" r="2.5" fill="#ffffff" />
          <circle cx="32.5" cy="44" r="1" fill="#ffffff" />

          {/* Right Eye */}
          <circle cx="58" cy="42" r="6.5" fill="#0f172a" />
          <circle cx="60" cy="40" r="2.5" fill="#ffffff" />
          <circle cx="56.5" cy="44" r="1" fill="#ffffff" />

          {/* ROSY CHEEKS */}
          <ellipse cx="26" cy="49" rx="4.5" ry="3" fill="#f472b6" opacity="0.6" />
          <ellipse cx="66" cy="49" rx="4.5" ry="3" fill="#f472b6" opacity="0.6" />

          {/* CUTE NOSE */}
          <polygon points="46,50 42,46 50,46" fill="#7c2d12" />
          
          {/* CUTE SMILE */}
          <path d="M 42 54 Q 46 57 50 54" stroke="#7c2d12" strokeWidth="1.8" strokeLinecap="round" fill="none" />

          {/* CHEST CHEVRON ACCENT */}
          <path d="M 38 68 Q 46 72 54 68" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" fill="none" />

          {/* TINY FRONT PAWS RESTING ON BOTTOM EDGE */}
          <ellipse cx="36" cy="74" rx="6" ry="4" fill="#fde68a" stroke="#b45309" strokeWidth="1" />
          <ellipse cx="56" cy="74" rx="6" ry="4" fill="#fde68a" stroke="#b45309" strokeWidth="1" />
        </svg>
      </div>
    </div>
  );
}
