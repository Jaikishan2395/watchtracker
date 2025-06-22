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
    <div className="min-h-screen flex items-center justify-center bg-white">
      <img 
        src={logo} 
        alt="Watch Logo" 
        className="w-28 h-28 object-contain animate-fade-in-splash"
        style={{ filter: 'drop-shadow(0 4px 24px rgba(0,0,0,0.08))' }}
      />
      <style>{`
        @keyframes fadeInSplash {
          0% { opacity: 0; transform: scale(0.92); }
          100% { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in-splash {
          animation: fadeInSplash 1.2s cubic-bezier(0.22, 1, 0.36, 1);
        }
      `}</style>
    </div>
  );
};

export default Splash; 