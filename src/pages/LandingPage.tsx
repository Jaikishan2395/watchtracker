import React, { useEffect, useState } from 'react';
import { Button } from '../components/ui/button';
import { GraduationCap, Users, BookOpen, Award, Check, ChevronRight, Star, Plus, Minus, Mail, Instagram, Linkedin } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';

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
        backgroundColor: isOpen ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.8)',
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
        </div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div 
            className="text-center"
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
                  Start Learning Free
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                <Button variant="outline" className="px-8 py-6 text-lg font-medium rounded-xl border-2 border-gray-300 hover:border-blue-400 hover:bg-blue-50 text-gray-700 transition-all">
                  Explore Courses
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

          <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
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
                className="group relative"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <div className="absolute -inset-0.5 bg-gradient-to-r rounded-xl opacity-0 group-hover:opacity-100 blur transition duration-300 group-hover:duration-200" />
                <div className="relative h-full bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 group-hover:border-transparent">
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-r ${feature.color} shadow-lg mb-6`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                  <div className="mt-6">
                    <a 
                      href="#" 
                      className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700 group-hover:translate-x-1 transition-transform"
                    >
                      Learn more
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </a>
                  </div>
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
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3 text-lg font-medium rounded-xl shadow-lg hover:shadow-xl transition-all"
              size="lg"
            >
              Explore All Features
              <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
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
              Why We're Different
            </span>
            <h2 className="text-4xl font-bold text-gray-900 sm:text-5xl">
              The <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">Edubridge</span> Advantage
            </h2>
            <p className="mt-4 max-w-2xl text-xl text-gray-600 mx-auto">
              See how we stack up against traditional learning platforms
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
                <h3 className="text-2xl font-bold">Edubridge</h3>
                <p className="text-blue-100 mt-1">The Complete Package</p>
              </div>
              <div className="col-span-6 md:col-span-2 p-6 md:p-8 text-center border-l border-white/10">
                <h3 className="text-2xl font-bold text-gray-200">Others</h3>
                <p className="text-blue-100/80 mt-1">Limited Features</p>
              </div>
            </div>
            
            <div className="divide-y divide-gray-100">
              {[
                { 
                  feature: "Smart Playlists", 
                  description: "Create custom course playlists from any video or YouTube playlist",
                  edubridge: true, 
                  others: false 
                },
                { 
                  feature: "Learning Analytics", 
                  description: "Track sessions, progress, and break times with detailed insights",
                  edubridge: true, 
                  others: false 
                },
                { 
                  feature: "Pomodoro Timer", 
                  description: "Built-in timer for focused study sessions",
                  edubridge: true, 
                  others: false 
                },
                { 
                  feature: "AI Chat Assistant", 
                  description: "24/7 learning support and guidance",
                  edubridge: true, 
                  others: false 
                },
                { 
                  feature: "Group Study Rooms", 
                  description: "Collaborate with friends in real-time",
                  edubridge: true, 
                  others: false 
                },
                { 
                  feature: "Smart Notes", 
                  description: "Markdown support with video timestamps",
                  edubridge: true, 
                  others: false 
                },
                { 
                  feature: "Learning Ranks", 
                  description: "Earn ranks based on learning hours",
                  edubridge: true, 
                  others: false 
                },
                { 
                  feature: "Gamified Learning", 
                  description: "Earn coins and rewards for achievements",
                  edubridge: true, 
                  others: false 
                },
                { 
                  feature: "Self-paced Learning", 
                  description: "Learn at your own convenience",
                  edubridge: true, 
                  others: true 
                },
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
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100 text-green-600">
                      <Check className="h-5 w-5" />
                    </div>
                  </div>
                  <div className="col-span-6 md:col-span-2 p-5 md:p-6 flex items-center justify-center border-t md:border-t-0 border-l border-gray-100">
                    {item.others ? (
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-400">
                        <Check className="h-5 w-5" />
                      </div>
                    ) : (
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700">Limited</span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
            
            <div className="p-8 bg-gray-50/50 border-t border-gray-100">
              <div className="max-w-4xl mx-auto text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Ready to transform your career?</h3>
                <p className="text-gray-600 mb-6">Join thousands of learners who have accelerated their careers with Edubridge</p>
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
      <section id="how-it-works" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              How It Works
            </h2>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
              Get started with Edubridge in just a few simple steps
            </p>
          </div>

          <div className="mt-12">
            <div className="relative">
              {/* Progress line */}
              <div className="hidden md:block absolute top-0 left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-blue-200"></div>
              
              {/* Steps */}
              <div className="relative space-y-10 md:space-y-0 md:grid md:grid-cols-4 md:gap-8">
                {[
                  {
                    number: "01",
                    title: "Sign Up / Log In",
                    description: "Users create an account using their email or phone number. They can set up a profile with their interests, education level, and goals."
                  },
                  {
                    number: "02",
                    title: "Choose Your Path",
                    description: "Select from our range of courses"
                  },
                  {
                    number: "03",
                    title: "Start Learning",
                    description: "Begin your educational journey"
                  },
                  {
                    number: "04",
                    title: "Get Certified",
                    description: "Earn certificates and showcase your skills"
                  }
                ].map((step, index) => (
                  <div key={index} className="relative">
                    <div className="flex flex-col items-center text-center">
                      <div className="flex items-center justify-center h-16 w-16 rounded-full bg-blue-600 text-white text-xl font-bold mb-4 relative z-10">
                        {step.number}
                      </div>
                      <h3 className="text-lg font-medium text-gray-900">
                        {step.title}
                      </h3>
                      <p className="mt-2 text-base text-gray-500">
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-12 text-center">
            <Button className="bg-blue-600 hover:bg-blue-700 px-8 py-3 text-lg">
              Get Started Now <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              What Our Students Say
            </h2>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
              Don't just take our word for it - hear from our community
            </p>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {[
              {
                name: "Sarah Johnson",
                role: "Web Developer",
                content: "Edubridge transformed my career. The hands-on projects and mentor support were invaluable.",
                rating: 5,
                avatar: "SJ"
              },
              {
                name: "Mike Chen",
                role: "Data Scientist",
                content: "The quality of courses and the community support exceeded my expectations. Highly recommended!",
                rating: 5,
                avatar: "MC"
              },
              {
                name: "Emma Wilson",
                role: "UI/UX Designer",
                content: "The project-based learning approach helped me build a strong portfolio that got me hired.",
                rating: 4,
                avatar: "EW"
              }
            ].map((testimonial, index) => (
              <div key={index} className="bg-gray-50 p-8 rounded-lg">
                <div className="flex items-center mb-4">
                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg">
                    {testimonial.avatar}
                  </div>
                  <div className="ml-4">
                    <h4 className="text-lg font-medium text-gray-900">{testimonial.name}</h4>
                    <p className="text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-gray-600 italic">"{testimonial.content}"</p>
                <div className="flex mt-4">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`h-5 w-5 ${i < testimonial.rating ? 'text-yellow-400' : 'text-gray-300'} fill-current`} 
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">
              Read More Reviews
            </Button>
          </div>
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
                <a href="mailto:hello@edubridge.com" className="text-gray-400 hover:text-white">
                  <Mail className="h-6 w-6" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <Instagram className="h-6 w-6" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
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