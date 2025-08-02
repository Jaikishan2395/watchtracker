import React, { useEffect, useState } from 'react';
import { Button } from '../components/ui/button';
import { GraduationCap, Users, BookOpen, Award, Check, ChevronRight, Star, Plus, Minus, Instagram, Linkedin, MessageCircle, PanelLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';

interface CountdownItemProps {
  value: 'days' | 'hours' | 'minutes' | 'seconds';
}

const CountdownItem = ({ value }: CountdownItemProps) => {
  // Set launch date to 30 days from now
  const [timeLeft, setTimeLeft] = useState({
    days: '00',
    hours: '00',
    minutes: '00',
    seconds: '00'
  });

  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [orbPositions] = useState(() => ({
    x: Math.random() * 60 - 30,
    y: Math.random() * 40 - 20,
    scale: 0.8 + Math.random() * 0.4
  }));
  
  // Orb animation variants
  const orbVariants = {
    initial: {
      scale: 1,
      opacity: 0.2
    },
    animate: (i: number) => ({
      scale: [1, 1.1, 1],
      x: [0, Math.sin(i) * 30, 0],
      y: [0, Math.cos(i) * 20, 0],
      opacity: [0.2, 0.3, 0.2],
      transition: {
        duration: 15 + Math.random() * 10,
        repeat: Infinity,
        ease: 'easeInOut'
      }
    })
  };

  useEffect(() => {
    // Set the launch date to 30 days from now
    const launchDate = new Date();
    launchDate.setDate(launchDate.getDate() + 30);
    
    const calculateTimeLeft = () => {
      const difference = +launchDate - +new Date();
      
      if (difference > 0) {
        setTimeLeft(prev => {
          const newTime = {
            days: Math.floor(difference / (1000 * 60 * 60 * 24)).toString().padStart(2, '0'),
            hours: Math.floor((difference / (1000 * 60 * 60)) % 24).toString().padStart(2, '0'),
            minutes: Math.floor((difference / 1000 / 60) % 60).toString().padStart(2, '0'),
            seconds: Math.floor((difference / 1000) % 60).toString().padStart(2, '0')
          };
          
          // Trigger animation when any digit changes
          if (prev[value] !== newTime[value]) {
            setIsVisible(false);
            setTimeout(() => setIsVisible(true), 10);
          }
          
          return newTime;
        });
      }
    };
    
    // Update every second
    const timer = setInterval(calculateTimeLeft, 1000);
    calculateTimeLeft(); // Initial call
    setIsVisible(true);
    
    return () => clearInterval(timer);
  }, [value]);

  const getLabel = () => {
    switch (value) {
      case 'days': return 'Days';
      case 'hours': return 'Hours';
      case 'minutes': return 'Mins';
      case 'seconds': return 'Secs';
      default: return '';
    }
  };

  // Color schemes for each time unit
  const colorSchemes = {
    days: {
      gradient: 'from-amber-500 via-orange-500 to-amber-600',
      glow: 'shadow-[0_0_30px_rgba(245,158,11,0.6)]',
      text: 'text-amber-400',
      bg: 'bg-amber-500/20',
      border: 'border-amber-500/30',
      orb: 'bg-amber-400/20'
    },
    hours: {
      gradient: 'from-blue-500 via-indigo-500 to-blue-600',
      glow: 'shadow-[0_0_30px_rgba(59,130,246,0.6)]',
      text: 'text-blue-400',
      bg: 'bg-blue-500/20',
      border: 'border-blue-500/30',
      orb: 'bg-blue-400/20'
    },
    minutes: {
      gradient: 'from-purple-500 via-pink-500 to-purple-600',
      glow: 'shadow-[0_0_30px_rgba(168,85,247,0.6)]',
      text: 'text-purple-400',
      bg: 'bg-purple-500/20',
      border: 'border-purple-500/30',
      orb: 'bg-purple-400/20'
    },
    seconds: {
      gradient: 'from-emerald-500 via-teal-500 to-emerald-600',
      glow: 'shadow-[0_0_30px_rgba(16,185,129,0.6)]',
      text: 'text-emerald-400',
      bg: 'bg-emerald-500/20',
      border: 'border-emerald-500/30',
      orb: 'bg-emerald-400/20'
    }
  };
  
  const colors = colorSchemes[value];

  return (
    <motion.div 
      className="flex flex-col items-center relative group z-10 px-2"
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ 
        scale: isVisible ? 1 : 0.9, 
        opacity: isVisible ? 1 : 0.8,
        y: isHovered ? -8 : 0,
      }}
      transition={{ 
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1],
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      {/* Multiple animated orbs */}
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className={`absolute -z-10 rounded-full w-32 h-32 blur-xl ${colors.orb}`}
          custom={i}
          variants={orbVariants}
          initial="initial"
          animate="animate"
        />
      ))}
      
      <div className="relative">
        {/* Glassmorphism card */}
        <motion.div 
          className={`relative w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 backdrop-blur-xl rounded-2xl flex flex-col items-center justify-center mb-2 overflow-hidden 
            transition-all duration-500 group-hover:scale-105 ${colors.bg} ${colors.border} border`}
          style={{
            background: 'rgba(15, 23, 42, 0.5)',
            boxShadow: 'inset 0 1px 0 0 rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)'
          }}
          animate={{
            boxShadow: isHovered 
              ? [`inset 0 1px 0 0 rgba(255, 255, 255, 0.05)`, `0 0 0 1px ${colors.border.split('/')[0]}/20`, `0 0 30px ${colors.orb}`]
              : ['inset 0 1px 0 0 rgba(255, 255, 255, 0.05)', '0 0 0 1px rgba(255, 255, 255, 0.05)'],
            transform: isHovered ? 'translateY(-4px)' : 'none'
          }}
          transition={{
            duration: 0.4,
            ease: 'easeOut',
            boxShadow: { duration: 0.3 }
          }}
        >
          {/* Glow effect */}
          <div className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${colors.glow.replace('shadow-', '')}`} />
          
          {/* Inner shine */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          {/* Animated number */}
          <motion.span 
            key={timeLeft[value]}
            className={`relative z-10 text-3xl sm:text-4xl md:text-5xl font-bold tracking-tighter ${colors.text}`}
            initial={{ y: -10, opacity: 0, textShadow: 'none' }}
            animate={{ 
              y: 0, 
              opacity: 1,
              textShadow: isHovered ? `0 0 15px ${colors.text}` : 'none',
              scale: isHovered ? 1.05 : 1
            }}
            exit={{ y: 10, opacity: 0 }}
            transition={{ 
              y: { duration: 0.3, ease: 'easeOut' },
              textShadow: { duration: 0.4 },
              scale: { duration: 0.3 }
            }}
          >
            {timeLeft[value]}
          </motion.span>
          
          {/* Reflection effect */}
          <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
        </motion.div>
      </div>
      
      {/* Label */}
      <motion.span 
        className={`text-xs sm:text-sm font-medium uppercase tracking-wider mt-3 relative ${isHovered ? colors.text : 'text-white/60'}`}
        animate={{
          textShadow: isHovered ? `0 0 10px ${colors.text}` : 'none',
          letterSpacing: isHovered ? '0.15em' : '0.1em'
        }}
        transition={{ 
          duration: 0.3,
          ease: 'easeOut'
        }}
      >
        {getLabel()}
      </motion.span>
    </motion.div>
  );
};
import { useSidebar } from '../components/ui/sidebar';

interface FAQItemProps {
  question: string;
  answer: string;
}

const FAQItem: React.FC<FAQItemProps> = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div 
      className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-gray-100"
      initial={false}
      animate={{ 
        backgroundColor: isOpen ? 'rgba(0, 0, 0, 0.9)' : 'rgba(255, 255, 255, 0.8)',
        scale: isOpen ? 1.02 : 1
      }}
    >
      <button
        className="w-full px-6 py-5 text-left flex justify-between items-center focus:outline-none group"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-lg font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
          {question}
        </span>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          className="text-blue-500"
        >
          {isOpen ? (
            <Minus className="h-5 w-5" />
          ) : (
            <Plus className="h-5 w-5" />
          )}
        </motion.span>
      </button>
      <motion.div
        initial={false}
        animate={isOpen ? 'open' : 'collapsed'}
        variants={{
          open: { opacity: 1, height: 'auto', paddingTop: 0, paddingBottom: '1.5rem' },
          collapsed: { opacity: 0, height: 0, paddingTop: 0, paddingBottom: 0 }
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="px-6 overflow-hidden"
      >
        <p className="text-gray-600">{answer}</p>
      </motion.div>
    </motion.div>
  );
};

const LandingPage = () => {
  const [scrolled, setScrolled] = useState(false);
 

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Navigation */}
      <motion.nav 
        className={cn(
          "fixed w-full z-50 transition-all duration-300",
          scrolled 
            ? "bg-white/90 backdrop-blur-md shadow-md py-2" 
            : "bg-transparent py-4"
        )}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            
            <motion.div 
              className="flex items-center"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="p-2 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <span className="ml-3 text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                EduBridge
              </span>
            </motion.div>
            <div className="hidden md:flex items-center space-x-8">
              {[
                { name: 'Features', href: '#features' },
                { name: 'How It Works', href: '#how-it-works' },
                { name: 'Testimonials', href: '#testimonials' },
                { name: 'FAQ', href: '#faq' },
              ].map((item) => (
                <motion.a
                  key={item.name}
                  href={item.href}
                  className="text-gray-700 hover:text-blue-600 font-medium transition-colors relative group"
                  whileHover={{ y: -2 }}
                >
                  {item.name}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all group-hover:w-full"></span>
                </motion.a>
              ))}
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all">
                  Get Started
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-r from-blue-100/40 to-indigo-100/40 rounded-full blur-3xl"></div>
          <div className="absolute top-1/4 -right-1/4 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 -left-1/4 w-96 h-96 bg-indigo-200/30 rounded-full blur-3xl"></div>
          <div 
            className="absolute inset-0"
            style={{
              backgroundImage: 'url(/src/assets/landinglogo.png)',
              backgroundSize: '50%',
              backgroundPosition: 'right center',
              backgroundRepeat: 'no-repeat',
              backgroundAttachment: 'fixed',
              mixBlendMode: 'normal',
              opacity: 1,
              right: '5%',
              left: 'auto',
              width: '50%',
              maxWidth: '800px',
              filter: 'drop-shadow(0 15px 30px rgba(30, 64, 175, 0.3)) drop-shadow(0 8px 16px rgba(0, 0, 0, 0.2)) brightness(1.1) contrast(1.05)',
              transform: 'translateZ(0)',
              willChange: 'transform, filter'
            }}
          />
        </div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div 
            className="text-left max-w-2xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div 
              className="inline-block px-4 py-2 mb-6 rounded-full bg-blue-100 text-blue-700 text-sm font-medium"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              🚀 Join 50,000+ successful learners
            </motion.div>
            
            <motion.h1 
              className="text-4xl font-bold text-gray-900 sm:text-6xl md:text-7xl leading-tight max-w-4xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                Transform
              </span> Your Learning Journey
            </motion.h1>
            
            <motion.p 
              className="mt-6 text-xl text-gray-600 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              Master in-demand skills with our interactive courses and join a community of passionate learners worldwide.
            </motion.p>
            
            <motion.div 
              className="mt-10 flex flex-col sm:flex-row justify-center gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-6 text-lg font-medium rounded-xl shadow-lg hover:shadow-xl transition-all">
                  Organize Learning
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                <Button variant="outline" className="px-8 py-6 text-lg font-medium rounded-xl border-2 border-gray-300 hover:border-blue-400 hover:bg-blue-50 text-gray-700 transition-all">
                  Track Progress
                </Button>
              </motion.div>
            </motion.div>
            
            <motion.div 
              className="mt-12 flex items-center justify-center space-x-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              <div className="flex -space-x-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div 
                    key={i}
                    className="h-10 w-10 rounded-full border-2 border-white bg-gradient-to-br from-blue-500 to-indigo-600 shadow-md"
                    style={{ zIndex: 5 - i }}
                  />
                ))}
              </div>
              <div className="text-left">
                <div className="flex items-center">
                  <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                  <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                  <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                  <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                  <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                </div>
                <p className="text-sm text-gray-600">Rated 4.9/5 by 10,000+ learners</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-1/2 -right-1/4 w-full h-full bg-gradient-to-br from-blue-50 to-indigo-50 rounded-full opacity-70 blur-3xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block px-4 py-2 text-sm font-medium text-blue-700 bg-blue-100 rounded-full mb-4">
              Why Choose Us
            </span>
            <h2 className="text-4xl font-bold text-gray-900 sm:text-5xl">
              What Edubridge <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">Offers</span>
            </h2>
            <p className="mt-4 max-w-2xl text-xl text-gray-600 mx-auto">
              Comprehensive learning experience designed to help you succeed in your career
            </p>
          </motion.div>

          <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-4 px-4">
            {[
              {
                icon: <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>,
                title: "Smart Playlists",
                description: "Create custom course playlists by adding videos or entire YouTube playlists with just a link",
                color: "from-blue-500 to-blue-600"
              },
              {
                icon: <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>,
                title: "Learning Analytics",
                description: "Track your learning sessions, progress, and break times with detailed analytics",
                color: "from-indigo-500 to-indigo-600"
              },
              {
                icon: <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>,
                title: "Pomodoro Timer",
                description: "Built-in Pomodoro timer to enhance focus and productivity during study sessions",
                color: "from-purple-500 to-purple-600"
              },
              {
                icon: <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>,
                title: "AI Chat Assistant",
                description: "Get instant help from our AI chatbot for any learning-related questions",
                color: "from-pink-500 to-pink-600"
              },
              {
                icon: <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                </svg>,
                title: "Group Study Rooms",
                description: "Create or join study rooms to learn and collaborate with friends in real-time",
                color: "from-green-500 to-green-600"
              },
              {
                icon: <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>,
                title: "Smart Notes",
                description: "Take and organize notes with markdown support and video timestamps",
                color: "from-yellow-500 to-yellow-600"
              },
              {
                icon: <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>,
                title: "Learning Ranks",
                description: "Earn ranks and badges based on your learning hours and achievements",
                color: "from-red-500 to-red-600"
              },
              {
                icon: <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>,
                title: "Gamified Learning",
                description: "Earn coins and rewards for completing lessons and achieving milestones",
                color: "from-amber-500 to-amber-600"
              }
            ].map((feature, index) => (
              <motion.div 
                key={index}
                className="group relative h-full"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1, ease: [0.4, 0, 0.2, 1] }}
                whileHover={{ y: -5 }}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 rounded-xl transition-opacity duration-300`}></div>
                <div className="relative h-full bg-white/80 backdrop-blur-sm rounded-xl p-8 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 group-hover:border-transparent overflow-hidden">
                  <div className="relative z-10">
                    <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-r ${feature.color} shadow-lg mb-6 transform transition-transform duration-300 group-hover:scale-110`}>
                      {React.cloneElement(feature.icon, { className: 'h-6 w-6 text-white' })}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-indigo-600 transition-all duration-300">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 text-base leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                  {/* Decorative elements */}
                  <div className="absolute -right-4 -bottom-4 w-24 h-24 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="absolute -left-2 -top-2 w-16 h-16 rounded-full bg-gradient-to-br from-blue-50 to-indigo-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </div>
              </motion.div>
            ))}
          </div>
          
          {/* Countdown Timer */}
          <motion.section 
            className="relative py-24 md:py-32 overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            {/* Animated background */}
            <div className="absolute inset-0 -z-10 overflow-hidden">
              {/* Grid pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPjxkZWZzPjxwYXR0ZXJuIGlkPSJwYXR0ZXJuIiB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgcGF0dGVyblRyYW5zZm9ybT0icm90YXRlKDQ1KSI+PHJlY3Qgd2lkdGg9IjUwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ3aGl0ZSIgb3BhY2l0eT0iMC4wMiIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNwYXR0ZXJuKSIvPjwvc3ZnPg==')]"></div>
              </div>
              
              {/* Floating gradient orbs */}
              {[1, 2, 3, 4, 5].map((i) => {
                const size = Math.random() * 300 + 200;
                const delay = Math.random() * 5;
                const duration = 20 + Math.random() * 20;
                const colors = [
                  'from-blue-500/10 via-indigo-500/5 to-transparent',
                  'from-purple-500/10 via-pink-500/5 to-transparent',
                  'from-emerald-500/10 via-teal-500/5 to-transparent'
                ];
                
                return (
                  <motion.div
                    key={i}
                    className={`absolute rounded-full bg-gradient-to-br ${colors[i % colors.length]} blur-3xl`}
                    style={{
                      width: `${size}px`,
                      height: `${size}px`,
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                    }}
                    animate={{
                      x: [0, Math.sin(i) * 100, 0],
                      y: [0, Math.cos(i) * 50, 0],
                      opacity: [0.1, 0.2, 0.1],
                    }}
                    transition={{
                      duration: duration,
                      delay: delay,
                      repeat: Infinity,
                      repeatType: 'reverse',
                      ease: 'easeInOut',
                    }}
                  />
                );
              })}
              
              {/* Gradient overlays */}
              <div className="absolute top-0 left-0 w-full h-1/3 bg-gradient-to-b from-blue-500/5 to-transparent"></div>
              <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-purple-500/5 to-transparent"></div>
            </div>
            
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div 
                className="text-center mb-16"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                <motion.div 
                  className="inline-flex items-center px-5 py-2 rounded-full bg-white/5 backdrop-blur-md border border-white/10 mb-6 shadow-lg"
                  initial={{ scale: 0.9, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                >
                  <span className="text-sm font-semibold bg-clip-text text-transparent bg-gradient-to-r from-amber-300 to-orange-400 tracking-widest">🚀 LAUNCHING SOON</span>
                </motion.div>
                
                <motion.h2 
                  className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3, duration: 0.8 }}
                >
                  The Future of <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-400">Education</span> 
                  <br className="hidden md:block" /> Starts in
                </motion.h2>
                
                <motion.p 
                  className="text-lg md:text-xl text-white/80 max-w-3xl mx-auto leading-relaxed"
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                >
                  Join thousands of early adopters and be the first to experience our revolutionary learning platform.
                </motion.p>
              </motion.div>
              
              {/* Countdown timer */}
              <motion.div 
                className="relative z-10"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
              >
                <div className="relative">
                  {/* Glow effect behind numbers */}
                  <div className="absolute inset-0 -z-10 flex justify-center">
                    <div className="w-full max-w-4xl h-40 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-cyan-500/10 rounded-full blur-3xl"></div>
                  </div>
                  
                  {/* Countdown numbers */}
                  <div className="flex flex-wrap justify-center gap-1 sm:gap-2 md:gap-4 lg:gap-6">
                    <CountdownItem value="days" />
                    <div className="flex items-center justify-center -mx-1 md:-mx-2 text-white/30 font-bold text-3xl md:text-4xl">:</div>
                    <CountdownItem value="hours" />
                    <div className="flex items-center justify-center -mx-1 md:-mx-2 text-white/30 font-bold text-3xl md:text-4xl">:</div>
                    <CountdownItem value="minutes" />
                    <div className="flex items-center justify-center -mx-1 md:-mx-2 text-white/30 font-bold text-3xl md:text-4xl">:</div>
                    <CountdownItem value="seconds" />
                  </div>
                </div>
                
                {/* Progress bar */}
                <motion.div 
                  className="mt-12 max-w-3xl mx-auto h-1.5 bg-white/5 rounded-full overflow-hidden backdrop-blur-sm"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.7, duration: 0.8 }}
                >
                  <motion.div 
                    className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 rounded-full relative overflow-hidden"
                    initial={{ width: '0%' }}
                    whileInView={{ width: '75%' }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.8, duration: 1.5, ease: "easeOut" }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                  </motion.div>
                </motion.div>
                
                <div className="flex justify-between mt-2 text-sm text-white/50 max-w-3xl mx-auto font-medium">
                  <span>Launch Progress</span>
                  <span className="font-semibold text-white/70">75% Complete</span>
                </div>
              </motion.div>
              
              {/* CTA Buttons */}
              <motion.div 
                className="mt-16 flex flex-col sm:flex-row justify-center gap-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.9, duration: 0.6 }}
              >
                <Button 
                  className="group relative overflow-hidden px-8 py-4 text-base font-medium bg-gradient-to-r from-blue-600 to-cyan-500 text-white hover:from-blue-500 hover:to-cyan-400 rounded-xl transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-500/20 border-0"
                  size="lg"
                >
                  <span className="relative z-10 flex items-center">
                    <span>Get Early Access</span>
                    <svg className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                    </svg>
                  </span>
                  <span className="absolute inset-0 bg-gradient-to-r from-blue-700 to-cyan-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></span>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="px-8 py-4 text-base font-medium text-white border-white/20 hover:bg-white/5 hover:border-white/30 rounded-xl transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-lg group bg-white/5 backdrop-blur-sm"
                  size="lg"
                >
                  <span className="relative z-10 flex items-center">
                    <span>Watch Demo</span>
                    <svg className="w-4 h-4 ml-2 opacity-70 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </span>
                </Button>
              </motion.div>
              
              {/* Stats */}
              <motion.div 
                className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 1, duration: 0.6 }}
              >
                {[
                  { number: '1.5K+', label: 'Early Signups' },
                  { number: '99.9%', label: 'Uptime' },
                  { number: '24/7', label: 'Support' },
                  { number: '50+', label: 'Features' }
                ].map((stat, index) => (
                  <div key={index} className="text-center group">
                    <div className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300 mb-2 transition-all duration-300 group-hover:scale-105 inline-block">
                      {stat.number}
                    </div>
                    <div className="text-sm text-white/60 uppercase tracking-wider transition-colors duration-300 group-hover:text-white/80">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </motion.div>
            </div>
            
            {/* Bottom gradient fade */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-950 to-transparent -z-10"></div>
          </motion.section>
        </div>
      </section>

      {/* Comparison Section */}
      <section id="comparison" className="py-20 bg-gradient-to-br from-slate-50 to-blue-50 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-1/2 -left-1/4 w-full h-full bg-gradient-to-br from-blue-100/40 to-indigo-100/40 rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block px-4 py-2 text-sm font-medium text-blue-700 bg-blue-100 rounded-full mb-4">
              Why Choose Us
            </span>
            <h2 className="text-4xl font-bold text-gray-900 sm:text-5xl">
              EduBridge vs. <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">Paid LMS Platforms</span>
            </h2>
            <p className="mt-4 max-w-2xl text-xl text-gray-600 mx-auto">
              Premium features without the premium price tag - see how we compare
            </p>
          </motion.div>

          <motion.div 
            className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-gray-100"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="grid grid-cols-12 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
              <div className="col-span-12 md:col-span-7 p-6 md:p-8">
                <h3 className="text-2xl font-bold">Features</h3>
              </div>
              <div className="col-span-6 md:col-span-3 p-6 md:p-8 text-center border-l border-white/10">
                <h3 className="text-2xl font-bold">EduBridge</h3>
                <p className="text-blue-100 mt-1">Free & Powerful</p>
              </div>
              <div className="col-span-6 md:col-span-2 p-6 md:p-8 text-center border-l border-white/10">
                <h3 className="text-2xl font-bold text-blue-100">Paid LMS</h3>
                <p className="text-blue-100/80 mt-1">Expensive & Limited</p>
              </div>
            </div>
            
            <div className="divide-y divide-gray-100">
              {[
                { 
                  feature: "Custom Course Creation", 
                  description: "Create courses from any video or YouTube content",
                  edubridge: true,
                  paidLMS: false,
                  paidLMSCrossed: true
                },
                { 
                  feature: "AI-Powered Learning Assistant", 
                  description: "24/7 personalized learning support",
                  edubridge: true,
                  paidLMS: false
                },
                { 
                  feature: "Pomodoro & Focus Tools", 
                  description: "Built-in timer and focus-enhancing features",
                  edubridge: true,
                  paidLMS: false
                },
                { 
                  feature: "Real-time Collaboration", 
                  description: "Group study rooms and peer learning",
                  edubridge: true,
                  paidLMS: false,
                  paidLMSCrossed: true
                },
                { 
                  feature: "Advanced Analytics", 
                  description: "Detailed learning insights and progress tracking",
                  edubridge: true,
                  paidLMS: true
                },
                { 
                  feature: "Gamification", 
                  description: "Earn ranks, badges, and rewards",
                  edubridge: true,
                  paidLMS: false
                },
                { 
                  feature: "Smart Notes with Timestamps", 
                  description: "Take notes linked to specific video moments",
                  edubridge: true,
                  paidLMS: false
                },
                { 
                  feature: "Price", 
                  description: "Cost for full feature access",
                  edubridge: "Free",
                  paidLMS: "$15-50/user/month"
                },
                { 
                  feature: "No User Limits", 
                  description: "Unlimited users and courses",
                  edubridge: true,
                  paidLMS: false
                }
              ].map((item, index) => (
                <motion.div 
                  key={index}
                  className="grid grid-cols-12 hover:bg-blue-50/50 transition-colors duration-200"
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                >
                  <div className="col-span-12 md:col-span-7 p-5 md:p-6">
                    <h4 className="font-semibold text-gray-900">{item.feature}</h4>
                    <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                  </div>
                  <div className="col-span-6 md:col-span-3 p-5 md:p-6 flex items-center justify-center border-t md:border-t-0 border-l border-gray-100">
                    {typeof item.edubridge === 'boolean' ? (
                      item.edubridge ? (
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100 text-green-600">
                          <Check className="h-5 w-5" />
                        </div>
                      ) : (
                        <span className="text-red-500">✕</span>
                      )
                    ) : (
                      <span className="font-medium text-gray-900">{item.edubridge}</span>
                    )}
                  </div>
                  <div className="col-span-6 md:col-span-2 p-5 md:p-6 flex items-center justify-center border-t md:border-t-0 border-l border-gray-100">
                    {typeof item.paidLMS === 'boolean' ? (
                      item.paidLMS ? (
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-400">
                          <Check className="h-5 w-5" />
                        </div>
                      ) : (
                        <span className="text-red-500">
                          {item.paidLMSCrossed ? (
                            <span className="relative">
                              <span className="absolute top-1/2 left-0 w-full h-0.5 bg-red-500 transform -translate-y-1/2"></span>
                              ✓
                            </span>
                          ) : (
                            "✕"
                          )}
                        </span>
                      )
                    ) : (
                      <span className="font-medium text-gray-900">{item.paidLMS}</span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
            
            <div className="p-8 bg-gray-50/50 border-t border-gray-100">
              <div className="max-w-4xl mx-auto text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Ready to experience the future of learning?</h3>
                <p className="text-gray-600 mb-6">Join thousands of learners who have accelerated their careers with EduBridge</p>
                <motion.div 
                  className="flex flex-col sm:flex-row justify-center gap-4"
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                >
                  <Button 
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3 text-lg font-medium rounded-xl shadow-lg hover:shadow-xl transition-all"
                    size="lg"
                  >
                    Start Learning Free
                  </Button>
                  <Button 
                    variant="outline" 
                    className="px-8 py-3 text-lg font-medium rounded-xl border-2 border-gray-300 hover:border-blue-400 hover:bg-blue-50 text-gray-700 transition-all"
                    size="lg"
                  >
                    Talk to an Advisor
                  </Button>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="relative py-24 md:py-32 overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        {/* Animated background */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          {/* Grid pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPjxkZWZzPjxwYXR0ZXJuIGlkPSJwYXR0ZXJuIiB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgcGF0dGVyblRyYW5zZm9ybT0icm90YXRlKDQ1KSI+PHJlY3Qgd2lkdGg9IjUwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ3aGl0ZSIgb3BhY2l0eT0iMC4wMiIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNwYXR0ZXJuKSIvPjwvc3ZnPg==')]"></div>
          </div>
          
          {/* Floating gradient orbs */}
          {[1, 2, 3, 4, 5].map((i) => {
            const size = Math.random() * 300 + 200;
            const delay = Math.random() * 5;
            const duration = 20 + Math.random() * 20;
            const colors = [
              'from-blue-500/10 via-indigo-500/5 to-transparent',
              'from-purple-500/10 via-pink-500/5 to-transparent',
              'from-emerald-500/10 via-teal-500/5 to-transparent'
            ];
            
            return (
              <motion.div
                key={i}
                className={`absolute rounded-full bg-gradient-to-br ${colors[i % colors.length]} blur-3xl`}
                style={{
                  width: `${size}px`,
                  height: `${size}px`,
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  x: [0, Math.sin(i) * 100, 0],
                  y: [0, Math.cos(i) * 50, 0],
                  opacity: [0.1, 0.2, 0.1],
                }}
                transition={{
                  duration: duration,
                  delay: delay,
                  repeat: Infinity,
                  repeatType: 'reverse',
                  ease: 'easeInOut',
                }}
              />
            );
          })}
          
          {/* Gradient overlays */}
          <div className="absolute top-0 left-0 w-full h-1/3 bg-gradient-to-b from-blue-500/5 to-transparent"></div>
          <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-purple-500/5 to-transparent"></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <motion.div 
              className="inline-flex items-center px-5 py-2 rounded-full bg-white/5 backdrop-blur-md border border-white/10 mb-6 shadow-lg"
              initial={{ scale: 0.9, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <span className="text-sm font-semibold bg-clip-text text-transparent bg-gradient-to-r from-amber-300 to-orange-400 tracking-widest">GET STARTED</span>
            </motion.div>
            
            <motion.h2 
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              How <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-400">EduBridge</span> Works
            </motion.h2>
            
            <motion.p 
              className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              Start your learning journey in just three simple steps
            </motion.p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {[
              {
                number: '01',
                title: 'Create Account',
                description: 'Sign up with your email or social accounts to get started with your personalized learning experience.',
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                ),
                color: 'from-blue-500 to-cyan-500',
                bg: 'bg-blue-500/20',
                border: 'border-blue-500/30',
                orb: 'bg-blue-400/20'
              },
              {
                number: '02',
                title: 'Sign In',
                description: 'Access your personalized dashboard and track your learning progress across all your devices.',
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                ),
                color: 'from-purple-500 to-pink-500',
                bg: 'bg-purple-500/20',
                border: 'border-purple-500/30',
                orb: 'bg-purple-400/20'
              },
              {
                number: '03',
                title: 'Create Playlist',
                description: 'Add videos or entire YouTube playlists with a single link to build your custom learning path.',
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                ),
                color: 'from-indigo-500 to-blue-500',
                bg: 'bg-indigo-500/20',
                border: 'border-indigo-500/30',
                orb: 'bg-indigo-400/20'
              }
            ].map((step, index) => (
              <motion.div
                key={index}
                className={`relative rounded-2xl p-8 backdrop-blur-xl border ${step.border} ${step.bg} transition-all duration-500 hover:shadow-xl group overflow-hidden`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                style={{
                  background: 'rgba(15, 23, 42, 0.5)',
                  boxShadow: 'inset 0 1px 0 0 rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)'
                }}
              >
                {/* Animated orbs */}
                {[1, 2, 3].map((i) => (
                  <motion.div
                    key={i}
                    className={`absolute -z-10 rounded-full ${step.orb} blur-xl`}
                    style={{
                      width: `${100 + Math.random() * 100}px`,
                      height: `${100 + Math.random() * 100}px`,
                      left: `${Math.random() * 60}%`,
                      top: `${Math.random() * 60}%`,
                    }}
                    animate={{
                      x: [0, Math.sin(i) * 30, 0],
                      y: [0, Math.cos(i) * 20, 0],
                      opacity: [0.1, 0.2, 0.1],
                    }}
                    transition={{
                      duration: 15 + Math.random() * 10,
                      delay: Math.random() * 5,
                      repeat: Infinity,
                      repeatType: 'reverse',
                      ease: 'easeInOut',
                    }}
                  />
                ))}
                
                <div className="relative z-10">
                  <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-6 bg-gradient-to-r ${step.color} shadow-lg`}>
                    {step.icon}
                  </div>
                  <span className="text-5xl font-bold text-white/10 absolute top-4 right-6 -z-10">{step.number}</span>
                  <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                  <p className="text-white/70">{step.description}</p>
                </div>
                
                {/* Glow effect on hover */}
                <div className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br ${step.color.replace('to-', 'via-').replace('from-', 'via-')} mix-blend-overlay`}></div>
              </motion.div>
            ))}
          </div>

          <motion.div 
            className="mt-16 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <Button 
              className="group relative overflow-hidden px-8 py-4 text-base font-medium bg-gradient-to-r from-blue-600 to-cyan-500 text-white hover:from-blue-500 hover:to-cyan-400 rounded-xl transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-500/20 border-0"
              size="lg"
            >
              <span className="relative z-10 flex items-center">
                <span>Get Started for Free</span>
                <ChevronRight className="ml-2 h-5 w-5 transform group-hover:translate-x-1 transition-transform" />
              </span>
              <span className="absolute inset-0 bg-gradient-to-r from-blue-700 to-cyan-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></span>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-gradient-to-br from-white to-blue-50 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-1/2 -left-1/4 w-full h-full bg-gradient-to-br from-blue-50/40 to-indigo-50/40 rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium text-blue-700 bg-blue-100/80 backdrop-blur-sm mb-4 border border-blue-200/50">
              <Star className="w-4 h-4 mr-2 fill-current" />
              Learner Stories
            </span>
            <h2 className="text-4xl font-bold text-gray-900 sm:text-5xl">
              Loved by <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">Students</span>
            </h2>
            <p className="mt-4 max-w-2xl text-xl text-gray-600/90 mx-auto">
              See how EduBridge is transforming learning experiences
            </p>
          </motion.div>

          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                name: "Alex Johnson",
                role: "Computer Science Student",
                content: "The Smart Playlist feature completely changed how I organize my study materials. I can now create custom learning paths by simply adding YouTube links, and the built-in Pomodoro timer keeps me focused.",
                avatar: "AJ",
                feature: "Smart Playlists",
                rating: 5,
                color: "from-blue-500 to-blue-600"
              },
              {
                name: "Priya Patel",
                role: "Online Learner",
                content: "The Learning Analytics dashboard is a game-changer! I can track my progress, see my study patterns, and the AI chat assistant helps me whenever I'm stuck. It's like having a personal tutor 24/7.",
                avatar: "PP",
                feature: "Learning Analytics",
                rating: 5,
                color: "from-purple-500 to-purple-600"
              },
              {
                name: "Marcus Chen",
                role: "Bootcamp Graduate",
                content: "Group Study Rooms made remote learning so much better. I regularly study with my classmates, and the Smart Notes feature with video timestamps helps me revisit key concepts easily. The gamification keeps me motivated!",
                avatar: "MC",
                feature: "Group Study",
                rating: 5,
                color: "from-indigo-500 to-indigo-600"
              }
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                className="group relative"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="absolute -inset-0.5 bg-gradient-to-r rounded-2xl opacity-0 group-hover:opacity-100 blur transition duration-300 group-hover:duration-200" />
                <div className="relative h-full bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 group-hover:border-transparent">
                  <div className="flex items-start mb-6">
                    <div className={`flex-shrink-0 h-14 w-14 rounded-2xl flex items-center justify-center text-white font-bold text-xl bg-gradient-to-r ${testimonial.color} shadow-lg`}>
                      {testimonial.avatar}
                    </div>
                    <div className="ml-4">
                      <h4 className="text-lg font-semibold text-gray-900">{testimonial.name}</h4>
                      <p className="text-sm text-gray-500">{testimonial.role}</p>
                      <div className="mt-1 flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i}
                            className={`h-4 w-4 ${i < testimonial.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                          />
                        ))}
                        <span className="ml-2 text-xs font-medium text-gray-500">
                          {testimonial.feature}
                        </span>
                      </div>
                    </div>
                  </div>
                  <blockquote className="relative">
                    <div className="absolute -top-3 -left-3 text-6xl text-gray-100 font-serif leading-none">"</div>
                    <p className="relative text-gray-700 pl-2">
                      {testimonial.content}
                    </p>
                  </blockquote>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div 
            className="mt-16 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <Button 
              className="group relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3.5 text-lg font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              size="lg"
            >
              <span className="relative z-10 flex items-center">
                Share Your Experience
                <ChevronRight className="ml-2 h-5 w-5 transform group-hover:translate-x-1 transition-transform" />
              </span>
              <span className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-16 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Frequently Asked Questions
            </h2>
            <p className="mt-4 text-xl text-gray-500">
              Everything you need to know about Edubridge
            </p>
          </div>

          <div className="mt-12 space-y-4">
            {[
              {
                question: "Do I need any prior experience to start?",
                answer: "No, we offer courses for all skill levels, from beginners to advanced learners. Our platform is designed to help you learn at your own pace, regardless of your starting point."
              },
              {
                question: "Can I learn at my own pace?",
                answer: "Yes, all our courses are self-paced with lifetime access to course materials. You can learn whenever it's convenient for you and revisit the content as needed."
              },
              {
                question: "What kind of support can I expect?",
                answer: "You'll have access to mentor support, community forums, and dedicated teaching assistants. Our team is committed to helping you succeed in your learning journey."
              },
              {
                question: "Are the certificates recognized?",
                answer: "Yes, our certificates are recognized by industry partners and can be shared on LinkedIn. They demonstrate your skills and commitment to professional development."
              },
              {
                question: "What payment methods do you accept?",
                answer: "We accept all major credit cards, PayPal, and bank transfers. We also offer flexible payment plans for many of our programs."
              },
              {
                question: "Can I get a refund if I'm not satisfied?",
                answer: "Yes, we offer a 30-day money-back guarantee for all our courses. If you're not satisfied with your purchase, simply contact our support team for a full refund."
              }
            ].map((faq, index) => (
              <FAQItem key={index} question={faq.question} answer={faq.answer} />
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-gray-600">Still have questions?</p>
            <Button variant="link" className="text-blue-600 hover:underline">
              Contact our support team <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center">
                <GraduationCap className="h-8 w-8 text-blue-400" />
                <span className="ml-2 text-xl font-bold">EduBridge</span>
              </div>
              <p className="mt-4 text-gray-400">Empowering learners with accessible, high-quality education.</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-300 uppercase">Quick Links</h3>
              <ul className="mt-4 space-y-2">
                <li><a href="#features" className="text-gray-400 hover:text-white">Features</a></li>
                <li><a href="#how-it-works" className="text-gray-400 hover:text-white">How It Works</a></li>
                <li><a href="#testimonials" className="text-gray-400 hover:text-white">Testimonials</a></li>
                <li><a href="#faq" className="text-gray-400 hover:text-white">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-300 uppercase">Connect With Us</h3>
              <div className="mt-4 flex space-x-4">
                <a href="https://chat.whatsapp.com/KEq2re9ChPi4lDIJWWZI7u?mode=ac_t" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white" title="Join our WhatsApp group">
                  <MessageCircle className="h-6 w-6" />
                </a>
                <a href="https://www.instagram.com/edubridge2099/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">
                  <Instagram className="h-6 w-6" />
                </a>
                <a href="https://www.linkedin.com/in/shivanshu-pal-377a971b7/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white" title="Connect on LinkedIn">
                  <Linkedin className="h-6 w-6" />
                </a>
              </div>
              <p className="mt-4 text-sm text-gray-400">
                &copy; {new Date().getFullYear()} EduBridge. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;