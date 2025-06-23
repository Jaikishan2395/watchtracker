import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';

const Splash = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/profile');
    }, 12000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-200 via-white to-purple-300 relative overflow-hidden">
      {/* Animated Gradient Overlay */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="w-full h-full animate-gradient-move bg-gradient-to-tr from-purple-200 via-blue-100 to-pink-200 opacity-60 mix-blend-lighten"></div>
      </div>
      {/* Animated Sparkles */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        {Array.from({ length: 18 }).map((_, i) => (
          <span
            key={i}
            className={`absolute sparkle animate-sparkle${(i % 3) + 1}`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
            }}
          />
        ))}
      </div>
      {/* Floating Branches of Study Logos - Randomized Floating */}
      <div className="absolute inset-0 w-full h-full pointer-events-none z-0">
        {[
          // icon SVGs and their JSX as objects
          { jsx: (<svg aria-hidden="true" width="44" height="44" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="3" fill="#6366f1"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06A1.65 1.65 0 0 0 15 19.4a1.65 1.65 0 0 0-1.5 1.6V22a2 2 0 1 1-4 0v-.14A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82-.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.6-1.5H2a2 2 0 1 1 0-4h.14A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1.5-1.6V2a2 2 0 1 1 4 0v.14A1.65 1.65 0 0 0 15 4.6a1.65 1.65 0 0 0 1.82.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9c.36.36.57.86.6 1.4H22a2 2 0 1 1 0 4h-.14a1.65 1.65 0 0 0-1.46 1.6z" stroke="#6366f1" strokeWidth="1.5" fill="none"/></svg>), key: 'engineering' },
          { jsx: (<svg aria-hidden="true" width="44" height="44" viewBox="0 0 24 24" fill="none"><path d="M12 2v20m0 0c-2.5 0-4.5-2-4.5-4.5S9.5 13 12 13s4.5 2 4.5 4.5S14.5 22 12 22zm0-20c2.5 0 4.5 2 4.5 4.5S14.5 11 12 11s-4.5-2-4.5-4.5S9.5 2 12 2z" stroke="#f87171" strokeWidth="1.5"/><circle cx="12" cy="6.5" r="1.5" fill="#f87171"/></svg>), key: 'medicine' },
          { jsx: (<svg aria-hidden="true" width="44" height="44" viewBox="0 0 24 24" fill="none"><path d="M12 3v18m0 0c-2.5 0-4.5-2-4.5-4.5S9.5 12 12 12s4.5 2 4.5 4.5S14.5 21 12 21zm-7-7h14" stroke="#fbbf24" strokeWidth="1.5"/><circle cx="7" cy="17" r="2" fill="#fbbf24"/><circle cx="17" cy="17" r="2" fill="#fbbf24"/></svg>), key: 'law' },
          { jsx: (<svg aria-hidden="true" width="44" height="44" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="2.5" fill="#34d399"/><ellipse cx="12" cy="12" rx="9" ry="3.5" stroke="#34d399" strokeWidth="1.5" fill="none"/><ellipse cx="12" cy="12" rx="3.5" ry="9" stroke="#34d399" strokeWidth="1.5" fill="none"/></svg>), key: 'science' },
          { jsx: (<svg aria-hidden="true" width="44" height="44" viewBox="0 0 24 24" fill="none"><path d="M12 2C6.48 2 2 6.48 2 12c0 3.87 3.13 7 7 7h1a2 2 0 0 0 2-2v-1a2 2 0 0 1 2-2h1a2 2 0 0 0 2-2v-1c0-3.87-3.13-7-7-7z" fill="#a78bfa"/><circle cx="8" cy="10" r="1" fill="#fbbf24"/><circle cx="16" cy="14" r="1" fill="#f87171"/><circle cx="10" cy="16" r="1" fill="#34d399"/></svg>), key: 'arts' },
          { jsx: (<svg aria-hidden="true" width="44" height="44" viewBox="0 0 24 24" fill="none"><rect x="4" y="14" width="3" height="6" fill="#fbbf24"/><rect x="9" y="10" width="3" height="10" fill="#6366f1"/><rect x="14" y="6" width="3" height="14" fill="#34d399"/></svg>), key: 'commerce' },
          { jsx: (<svg aria-hidden="true" width="44" height="44" viewBox="0 0 24 24" fill="none"><rect x="4" y="6" width="16" height="10" rx="2" fill="#60a5fa"/><rect x="2" y="18" width="20" height="2" rx="1" fill="#1e293b"/></svg>), key: 'cs' },
          { jsx: (<svg aria-hidden="true" width="44" height="44" viewBox="0 0 24 24" fill="none"><text x="6" y="32" fontSize="32" fontWeight="bold" fill="#f59e42">π</text></svg>), key: 'math' },
          { jsx: (<svg aria-hidden="true" width="44" height="44" viewBox="0 0 24 24" fill="none"><path d="M2 6a2 2 0 0 1 2-2h7v16H4a2 2 0 0 1-2-2V6zm18-2a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-7V4h7z" fill="#fbbf24"/><path d="M13 6h5v12h-5" fill="#fff"/></svg>), key: 'literature' },
          { jsx: (<svg aria-hidden="true" width="44" height="44" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="6" r="2" fill="#a3e635"/><path d="M12 8v10m0 0l-4 4m4-4l4 4" stroke="#a3e635" strokeWidth="1.5"/><path d="M8 18l-3-8m11 8l3-8" stroke="#a3e635" strokeWidth="1.5"/></svg>), key: 'architecture' },
          { jsx: (<svg aria-hidden="true" width="44" height="44" viewBox="0 0 24 24" fill="none"><path d="M12 22V12m0 0c-4 0-7-3-7-7 4 0 7 3 7 7zm0 0c4 0 7-3 7-7-4 0-7 3-7 7z" stroke="#22c55e" strokeWidth="1.5"/><circle cx="12" cy="12" r="2" fill="#22c55e"/></svg>), key: 'agriculture' },
          { jsx: (<svg aria-hidden="true" width="44" height="44" viewBox="0 0 24 24" fill="none"><rect x="7" y="2" width="10" height="6" rx="2" fill="#fbbf24"/><path d="M7 8v2a5 5 0 0 0 10 0V8" stroke="#fbbf24" strokeWidth="1.5"/><rect x="9" y="18" width="6" height="2" rx="1" fill="#1e293b"/></svg>), key: 'sports' },
          { jsx: (<svg aria-hidden="true" width="44" height="44" viewBox="0 0 24 24" fill="none"><ellipse cx="8" cy="18" rx="2" ry="2.5" fill="#818cf8"/><rect x="10" y="6" width="2" height="12" fill="#818cf8"/><ellipse cx="16" cy="16" rx="2" ry="2.5" fill="#818cf8"/><rect x="18" y="4" width="2" height="14" fill="#818cf8"/></svg>), key: 'music' },
          { jsx: (<svg aria-hidden="true" width="44" height="44" viewBox="0 0 24 24" fill="none"><ellipse cx="12" cy="12" rx="7" ry="6" fill="#fbbf24"/><path d="M9 10c0-1.5 2-1.5 2 0m2 0c0-1.5 2-1.5 2 0m-6 2c0 1.5 2 1.5 2 0m2 0c0 1.5 2 1.5 2 0" stroke="#f59e42" strokeWidth="1.2"/></svg>), key: 'psychology' },
          { jsx: (<svg aria-hidden="true" width="44" height="44" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" fill="#60a5fa"/><path d="M12 3v18M3 12h18" stroke="#2563eb" strokeWidth="1.2"/><ellipse cx="12" cy="12" rx="6" ry="9" stroke="#2563eb" strokeWidth="1.2" fill="none"/></svg>), key: 'geography' },
          { jsx: (<svg aria-hidden="true" width="44" height="44" viewBox="0 0 24 24" fill="none"><rect x="10" y="2" width="4" height="10" rx="2" fill="#a78bfa"/><path d="M8 12h8l-2 8H10l-2-8z" fill="#818cf8"/><circle cx="12" cy="18" r="1.5" fill="#fbbf24"/></svg>), key: 'chemistry' },
          { jsx: (<svg aria-hidden="true" width="44" height="44" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="2.5" fill="#34d399"/><ellipse cx="12" cy="12" rx="9" ry="3.5" stroke="#34d399" strokeWidth="1.5" fill="none"/><ellipse cx="12" cy="12" rx="3.5" ry="9" stroke="#34d399" strokeWidth="1.5" fill="none"/><circle cx="19" cy="12" r="1" fill="#fbbf24"/><circle cx="5" cy="12" r="1" fill="#fbbf24"/></svg>), key: 'physics' },
          { jsx: (<svg aria-hidden="true" width="44" height="44" viewBox="0 0 24 24" fill="none"><rect x="6" y="6" width="12" height="10" rx="2" fill="#fca5a5"/><rect x="8" y="8" width="8" height="6" rx="1" fill="#fff"/><rect x="10" y="10" width="4" height="2" rx="1" fill="#fbbf24"/></svg>), key: 'history' },
          { jsx: (<svg aria-hidden="true" width="44" height="44" viewBox="0 0 24 24" fill="none"><polygon points="12,4 22,9 12,14 2,9 12,4" fill="#6366f1"/><rect x="9" y="14" width="6" height="2" rx="1" fill="#6366f1"/><rect x="11" y="16" width="2" height="4" rx="1" fill="#6366f1"/></svg>), key: 'education' },
          { jsx: (<svg aria-hidden="true" width="44" height="44" viewBox="0 0 24 24" fill="none"><rect x="4" y="8" width="16" height="10" rx="2" fill="#f59e42"/><rect x="8" y="6" width="8" height="4" rx="1" fill="#fde68a"/><rect x="10" y="14" width="4" height="2" rx="1" fill="#fde68a"/></svg>), key: 'business' },
          { jsx: (<svg aria-hidden="true" width="44" height="44" viewBox="0 0 24 24" fill="none"><rect x="10" y="4" width="4" height="10" rx="2" fill="#818cf8"/><rect x="8" y="14" width="8" height="2" rx="1" fill="#818cf8"/><rect x="11" y="16" width="2" height="4" rx="1" fill="#818cf8"/></svg>), key: 'media' },
          { jsx: (<svg aria-hidden="true" width="44" height="44" viewBox="0 0 24 24" fill="none"><path d="M12 2C7 7 2 12 12 22c10-10 5-15 0-20z" fill="#22c55e"/><path d="M12 2v20" stroke="#16a34a" strokeWidth="1.2"/></svg>), key: 'environment' },
          { jsx: (<svg aria-hidden="true" width="44" height="44" viewBox="0 0 24 24" fill="none"><ellipse cx="12" cy="16" rx="6" ry="4" fill="#a78bfa"/><circle cx="9" cy="14" r="1.2" fill="#fff"/><circle cx="15" cy="14" r="1.2" fill="#fff"/><ellipse cx="12" cy="12" rx="3" ry="2" fill="#fff"/></svg>), key: 'philosophy' },
        ].map((icon, i) => {
          // Randomize start/end positions and animation
          const sides = ['top', 'bottom', 'left', 'right'];
          const startSide = sides[Math.floor(Math.random() * sides.length)];
          let start = {}, end = {};
          if (startSide === 'top') {
            start = { top: '-10%', left: `${Math.random() * 90}%` };
            end = { top: '110%', left: `${Math.random() * 90}%` };
          } else if (startSide === 'bottom') {
            start = { top: '110%', left: `${Math.random() * 90}%` };
            end = { top: '-10%', left: `${Math.random() * 90}%` };
          } else if (startSide === 'left') {
            start = { left: '-10%', top: `${Math.random() * 90}%` };
            end = { left: '110%', top: `${Math.random() * 90}%` };
          } else {
            start = { left: '110%', top: `${Math.random() * 90}%` };
            end = { left: '-10%', top: `${Math.random() * 90}%` };
          }
          const duration = `${18 + Math.random() * 14}s`;
          const delay = `${Math.random() * 10}s`;
          const rotate = Math.random() > 0.5;
          const scale = 0.9 + Math.random() * 0.4;
          return (
            <div
              key={icon.key}
              style={{
                position: 'absolute',
                ...start,
                animation: `float-random-${i} ${duration} linear ${delay} forwards`,
                zIndex: 1,
                pointerEvents: 'none',
                transform: `scale(${scale})${rotate ? ' rotate(360deg)' : ''}`,
                opacity: 0.38,
              }}
            >
              {icon.jsx}
              <style>{`
                @keyframes float-random-${i} {
                  0% { ${Object.entries(start).map(([k, v]) => `${k}: ${v};`).join(' ')} opacity: 0.38; }
                  10% { transform: scale(${scale})${rotate ? ' rotate(0deg)' : ''}; }
                  50% { transform: scale(${scale * 1.08})${rotate ? ' rotate(180deg)' : ''}; }
                  90% { transform: scale(${scale})${rotate ? ' rotate(350deg)' : ''}; }
                  100% { ${Object.entries(end).map(([k, v]) => `${k}: ${v};`).join(' ')} opacity: 0.38; }
                }
              `}</style>
            </div>
          );
        })}
      </div>
      {/* Glassmorphism Card Behind Logo */}
      <div className="absolute z-20 rounded-3xl shadow-xl backdrop-blur-md bg-white/40 border border-white/30 px-12 py-10 flex items-center justify-center" style={{boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.18)'}}>
        <img 
          src={logo} 
          alt="Watch Logo" 
          className="w-40 h-45 object-contain animate-fade-in-splash relative z-10"
          style={{ filter: 'drop-shadow(0 4px 24px rgba(0,0,0,0.08))' }}
        />
      </div>
      <style>{`
        @keyframes fadeInSplash {
          0% { opacity: 0; transform: scale(0.92); }
          100% { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in-splash {
          animation: fadeInSplash 1.2s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .edu-icon {
          position: absolute;
          opacity: 0.45;
          z-index: 1;
          transition: opacity 0.3s;
        }
        /* Flowing Animations */
        .flow-horizontal {
          animation: flow-horizontal 18s linear infinite;
        }
        .flow-horizontal-reverse {
          animation: flow-horizontal-reverse 22s linear infinite;
        }
        .flow-vertical {
          animation: flow-vertical 20s linear infinite;
        }
        .flow-vertical-reverse {
          animation: flow-vertical-reverse 24s linear infinite;
        }
        .flow-diagonal {
          animation: flow-diagonal 26s linear infinite;
        }
        .flow-diagonal-reverse {
          animation: flow-diagonal-reverse 28s linear infinite;
        }
        @keyframes flow-horizontal {
          0% { left: -8%; }
          100% { left: 108%; }
        }
        @keyframes flow-horizontal-reverse {
          0% { left: 108%; }
          100% { left: -8%; }
        }
        @keyframes flow-vertical {
          0% { top: 110%; }
          100% { top: -12%; }
        }
        @keyframes flow-vertical-reverse {
          0% { top: -12%; }
          100% { top: 110%; }
        }
        @keyframes flow-diagonal {
          0% { left: -10%; top: 90%; }
          100% { left: 110%; top: -10%; }
        }
        @keyframes flow-diagonal-reverse {
          0% { left: 110%; top: -10%; }
          100% { left: -10%; top: 90%; }
        }
        /* Sparkle Animations */
        .sparkle {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: radial-gradient(circle, #fff 60%, #a5b4fc 100%);
          opacity: 0.7;
          pointer-events: none;
        }
        .animate-sparkle1 { animation: sparkle1 2.5s linear infinite; }
        .animate-sparkle2 { animation: sparkle2 3.2s linear infinite; }
        .animate-sparkle3 { animation: sparkle3 4.1s linear infinite; }
        @keyframes sparkle1 { 0%,100%{ opacity:0.7; transform:scale(1);} 50%{ opacity:0.2; transform:scale(1.5);} }
        @keyframes sparkle2 { 0%,100%{ opacity:0.7; transform:scale(1);} 50%{ opacity:0.1; transform:scale(1.8);} }
        @keyframes sparkle3 { 0%,100%{ opacity:0.7; transform:scale(1);} 50%{ opacity:0.3; transform:scale(1.3);} }
        @media (max-width: 640px) {
          .edu-icon { opacity: 0.18; }
        }
        .floating-char {
          position: absolute;
          font-weight: 800;
          z-index: 1;
          pointer-events: none;
          user-select: none;
          text-shadow: 0 4px 24px #6366f1aa;
          will-change: transform, opacity;
        }
        .floating-rotate {
          animation-name: floating-rotate, inherit;
          animation-duration: 18s, inherit;
          animation-iteration-count: infinite, inherit;
          animation-timing-function: linear, inherit;
        }
        @keyframes floating-rotate {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .floating-pulse {
          animation-name: floating-pulse, inherit;
          animation-duration: 4.5s, inherit;
          animation-iteration-count: infinite, inherit;
          animation-timing-function: ease-in-out, inherit;
        }
        @keyframes floating-pulse {
          0%, 100% { filter: brightness(1) scale(1); }
          50% { filter: brightness(1.2) scale(1.08); }
        }
        .float-wobble-horizontal {
          animation-name: float-horizontal-wobble;
        }
        .float-wobble-horizontal-reverse {
          animation-name: float-horizontal-wobble-reverse;
        }
        .float-wobble-vertical {
          animation-name: float-vertical-wobble;
        }
        .float-wobble-vertical-reverse {
          animation-name: float-vertical-wobble-reverse;
        }
        .float-wobble-diagonal {
          animation-name: float-diagonal-wobble;
        }
        .float-wobble-diagonal-reverse {
          animation-name: float-diagonal-wobble-reverse;
        }
        @keyframes float-horizontal-wobble {
          0% { left: -12%; transform: translateY(0); }
          20% { transform: translateY(-12px) scale(1.04); }
          40% { transform: translateY(10px) scale(0.98); }
          60% { transform: translateY(-8px) scale(1.02); }
          80% { transform: translateY(6px) scale(1.01); }
          100% { left: 112%; transform: translateY(0); }
        }
        @keyframes float-horizontal-wobble-reverse {
          0% { left: 112%; transform: translateY(0); }
          20% { transform: translateY(10px) scale(1.03); }
          40% { transform: translateY(-8px) scale(1.01); }
          60% { transform: translateY(12px) scale(0.97); }
          80% { transform: translateY(-6px) scale(1.02); }
          100% { left: -12%; transform: translateY(0); }
        }
        @keyframes float-vertical-wobble {
          0% { top: 115%; transform: translateX(0); }
          20% { transform: translateX(-10px) scale(1.04); }
          40% { transform: translateX(8px) scale(0.98); }
          60% { transform: translateX(-12px) scale(1.02); }
          80% { transform: translateX(6px) scale(1.01); }
          100% { top: -15%; transform: translateX(0); }
        }
        @keyframes float-vertical-wobble-reverse {
          0% { top: -15%; transform: translateX(0); }
          20% { transform: translateX(8px) scale(1.03); }
          40% { transform: translateX(-6px) scale(1.01); }
          60% { transform: translateX(10px) scale(0.97); }
          80% { transform: translateX(-12px) scale(1.02); }
          100% { top: 115%; transform: translateX(0); }
        }
        @keyframes float-diagonal-wobble {
          0% { left: -15%; top: 80%; transform: scale(1); }
          20% { transform: scale(1.04) rotate(-6deg); }
          40% { transform: scale(0.98) rotate(4deg); }
          60% { transform: scale(1.02) rotate(-3deg); }
          80% { transform: scale(1.01) rotate(2deg); }
          100% { left: 120%; top: -12%; transform: scale(1); }
        }
        @keyframes float-diagonal-wobble-reverse {
          0% { left: 120%; top: -12%; transform: scale(1); }
          20% { transform: scale(1.03) rotate(5deg); }
          40% { transform: scale(1.01) rotate(-3deg); }
          60% { transform: scale(0.97) rotate(7deg); }
          80% { transform: scale(1.02) rotate(-2deg); }
          100% { left: -15%; top: 80%; transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

export default Splash; 