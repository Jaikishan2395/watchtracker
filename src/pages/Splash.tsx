import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';

const Splash = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/profile');
    }, 4000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-gray-100 to-gray-200 relative overflow-hidden">
      {/* Animated Gradient Overlay */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="w-full h-full animate-gradient-move bg-gradient-to-tr from-gray-100 via-white to-gray-200 opacity-60 mix-blend-lighten"></div>
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
              background: 'radial-gradient(circle, #fff 60%, #aaa 100%)',
            }}
          />
        ))}
      </div>
      {/* Floating Monochrome Shapes - Randomized Floating */}
      <div className="absolute inset-0 w-full h-full pointer-events-none z-0">
        {Array.from({ length: 8 }).map((_, i) => {
          // Use simple monochrome SVGs (circle, square, triangle, line)
          const shapes = [
            <svg width="44" height="44" viewBox="0 0 44 44" fill="none" key="circle"><circle cx="22" cy="22" r="16" fill="#fff" fillOpacity="0.08" stroke="#fff" strokeWidth="2" /></svg>,
            <svg width="44" height="44" viewBox="0 0 44 44" fill="none" key="square"><rect x="8" y="8" width="28" height="28" fill="#fff" fillOpacity="0.08" stroke="#fff" strokeWidth="2" /></svg>,
            <svg width="44" height="44" viewBox="0 0 44 44" fill="none" key="triangle"><polygon points="22,8 36,36 8,36" fill="#fff" fillOpacity="0.08" stroke="#fff" strokeWidth="2" /></svg>,
            <svg width="44" height="44" viewBox="0 0 44 44" fill="none" key="line"><line x1="8" y1="36" x2="36" y2="8" stroke="#fff" strokeWidth="2" strokeOpacity="0.08" /></svg>,
          ];
          const icon = shapes[i % shapes.length];
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
              key={i}
              style={{
                position: 'absolute',
                ...start,
                animation: `float-random-${i} ${duration} linear ${delay} forwards`,
                zIndex: 1,
                pointerEvents: 'none',
                transform: `scale(${scale})${rotate ? ' rotate(360deg)' : ''}`,
                opacity: 0.18,
              }}
            >
              {icon}
              <style>{`
                @keyframes float-random-${i} {
                  0% { ${Object.entries(start).map(([k, v]) => `${k}: ${v};`).join(' ')} opacity: 0.18; }
                  10% { transform: scale(${scale})${rotate ? ' rotate(0deg)' : ''}; }
                  50% { transform: scale(${scale * 1.08})${rotate ? ' rotate(180deg)' : ''}; }
                  90% { transform: scale(${scale})${rotate ? ' rotate(350deg)' : ''}; }
                  100% { ${Object.entries(end).map(([k, v]) => `${k}: ${v};`).join(' ')} opacity: 0.18; }
                }
              `}</style>
            </div>
          );
        })}
      </div>
      {/* Glassmorphism Card Behind Logo */}
      <div className="absolute z-20 rounded-3xl shadow-xl backdrop-blur-md bg-white/10 border border-white/20 px-12 py-10 flex items-center justify-center" style={{boxShadow: '0 8px 32px 0 rgba(255,255,255,0.08)'}}>
        <img 
          src={logo} 
          alt="Watch Logo" 
          className="w-40 h-45 object-contain animate-fade-in-splash relative z-10"
        />
      </div>
      <style>{`
        @keyframes fadeInSplash {
          0% {
            opacity: 0;
            transform: scale(0.85);
            filter: drop-shadow(0 2px 8px rgba(0,0,0,0.12));
          }
          60% {
            opacity: 1;
            transform: scale(1.12);
            filter: drop-shadow(0 16px 48px rgba(0,0,0,0.32));
          }
          100% {
            opacity: 1;
            transform: scale(1.22);
            filter: drop-shadow(0 32px 96px rgba(0,0,0,0.55));
          }
        }
        .animate-fade-in-splash {
          animation: fadeInSplash 1.4s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        .sparkle {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: radial-gradient(circle, #fff 60%, #aaa 100%);
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
      `}</style>
    </div>
  );
};

export default Splash; 