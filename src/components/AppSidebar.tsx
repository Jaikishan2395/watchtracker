import { useTheme } from "next-themes";
import { Home, User, Library, Settings, CheckSquare, School, Sparkles, ChevronLeft, ChevronRight, LogOut, Moon, Sun } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import logo from '../assets/logo.png';
import bridgelabLogo from '../assets/bridgelab_logo.png';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';

const menuItems = [
  {
    title: 'Dashboard',
    url: '/dashboard',
    icon: Home,
    gradient: 'from-blue-500 to-cyan-500',
    bgGradient: 'from-blue-500/5 to-cyan-500/5',
    hoverGradient: 'from-blue-500/10 to-cyan-500/10',
    glow: 'shadow-blue-500/20',
  },
  {
    title: 'Library',
    url: '/library',
    icon: Library,
    gradient: 'from-purple-500 to-fuchsia-500',
    bgGradient: 'from-purple-500/5 to-fuchsia-500/5',
    hoverGradient: 'from-purple-500/10 to-fuchsia-500/10',
    glow: 'shadow-purple-500/20',
  },
  {
    title: 'Classroom',
    url: '/classroom',
    icon: School,
    gradient: 'from-emerald-500 to-teal-500',
    bgGradient: 'from-emerald-500/5 to-teal-500/5',
    hoverGradient: 'from-emerald-500/10 to-teal-500/10',
    glow: 'shadow-emerald-500/20',
  },
  {
    title: 'BridgeLab',
    url: '/bridgelab',
    icon: Sparkles,
    gradient: 'from-amber-400 to-orange-500',
    bgGradient: 'from-amber-400/5 to-orange-500/5',
    hoverGradient: 'from-amber-400/10 to-orange-500/10',
    glow: 'shadow-amber-400/20',
    customIcon: bridgelabLogo,
  },
  {
    title: 'To-Do',
    url: '/todo',
    icon: CheckSquare,
    gradient: 'from-rose-500 to-pink-500',
    bgGradient: 'from-rose-500/5 to-pink-500/5',
    hoverGradient: 'from-rose-500/10 to-pink-500/10',
    glow: 'shadow-rose-500/20',
  },
  {
    title: 'Profile',
    url: '/profile',
    icon: User,
    gradient: 'from-violet-500 to-indigo-500',
    bgGradient: 'from-violet-500/5 to-indigo-500/5',
    hoverGradient: 'from-violet-500/10 to-indigo-500/10',
    glow: 'shadow-violet-500/20',
  },
];

export function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { state, toggleSidebar, open } = useSidebar();
  const isOpen = state === 'expanded';
  const { theme, setTheme } = useTheme();
  const darkMode = theme === 'dark';
  const [isHovered, setIsHovered] = useState(false);
  const [activeHover, setActiveHover] = useState<string | null>(null);

  return (
    <div className="h-screen flex flex-col">
      <Sidebar 
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex flex-col transition-all duration-300 ease-in-out",
          "bg-sidebar text-sidebar-foreground border-r border-sidebar-border shadow-lg",
          isOpen ? 'w-64' : 'w-16 hover:w-20',
          "overflow-y-auto overflow-x-hidden scrollbar-hide"
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <SidebarHeader className="flex flex-col items-center w-full pt-8 pb-5 px-5 relative group/header">
          <div className="relative flex items-center w-full">
            <motion.div 
              className={cn(
                "relative group/logo transition-all duration-300 flex-shrink-0",
                isOpen ? 'scale-100' : 'scale-90'
              )}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div 
                className={cn(
                  "absolute inset-0 rounded-2xl opacity-0 group-hover/logo:opacity-100",
                  "bg-gradient-to-br from-primary/30 via-info/30 to-primary/30",
                  isOpen ? 'w-[4.5rem] h-[4.5rem]' : 'w-14 h-14',
                  "transition-all duration-500 ease-out"
                )}
                animate={{
                  rotate: isHovered ? 360 : 0,
                }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              />
              <div className={cn(
                "relative rounded-2xl p-2.5 transition-all duration-300 backdrop-blur-sm",
                "bg-sidebar-accent/80 border border-sidebar-border/40 hover:border-sidebar-ring/60",
                isOpen ? 'w-[4.5rem] h-[4.5rem]' : 'w-14 h-14',
                "shadow-lg hover:shadow-xl hover:shadow-primary/10"
              )}>
                <img 
                  src={logo} 
                  alt="EduBridge Logo" 
                  className={cn(
                    "w-full h-full object-contain transition-all duration-500",
                    "group-hover/logo:scale-110 group-hover/logo:rotate-3",
                    "dark:invert"
                  )} 
                />
              </div>
            </motion.div>

            <AnimatePresence>
              {isOpen && (
                <motion.div 
                  className="absolute left-24 flex flex-col"
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -15 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                >
                  <motion.h2 
                    className={cn(
                      "text-2xl font-extrabold tracking-tight bg-clip-text text-transparent",
                      "bg-gradient-to-r from-primary via-info to-primary bg-[length:200%] animate-gradient-shift",
                      "drop-shadow-sm"
                    )}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.4 }}
                  >
                    EduBridge
                  </motion.h2>
                  <motion.p 
                    className={cn(
                      "text-xs font-semibold tracking-wider mt-1.5",
                      "bg-gradient-to-r from-foreground/70 to-foreground/60 bg-clip-text text-transparent",
                      "relative inline-flex items-center gap-1.5 before:content-[''] before:block before:w-1.5 before:h-0.5 before:bg-primary before:rounded-full"
                    )}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.4 }}
                  >
                    <span className="tracking-widest">LEARNING PLATFORM</span>
                  </motion.p>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button 
              onClick={toggleSidebar}
              className={cn(
                "absolute -right-3 top-8 rounded-full p-1.5 shadow-lg transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2",
                "bg-sidebar-accent border border-sidebar-border hover:border-primary/50 hover:shadow-primary/20 focus:ring-primary/30",
                "flex items-center justify-center"
              )}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              {isOpen ? (
                <ChevronLeft className="w-4 h-4 text-sidebar-foreground/80" />
              ) : (
                <ChevronRight className="w-4 h-4 text-sidebar-foreground/80" />
              )}
            </motion.button>
          </div>

          <div className={cn(
            "w-4/5 h-px bg-gradient-to-r my-4",
            "from-transparent via-sidebar-border/50 to-transparent"
          )} />
        </SidebarHeader>
        
        <SidebarContent className="flex-1 px-2 py-4 overflow-y-auto custom-scrollbar">
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1.5">
                {menuItems.map((item) => {
                  const isActive = location.pathname === item.url;
                  const isHovering = activeHover === item.title;
                  
                  return (
                    <SidebarMenuItem key={item.title}>
                      <motion.div
                        className="relative"
                        onHoverStart={() => setActiveHover(item.title)}
                        onHoverEnd={() => setActiveHover(null)}
                        whileHover={{ x: 5 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                      >
                        <SidebarMenuButton
                          isActive={isActive}
                          onClick={() => navigate(item.url)}
                          className={cn(
                            "group relative overflow-hidden transition-all duration-300 ease-out",
                            "flex items-center w-full h-12 px-3 text-sm font-medium rounded-xl",
                            isActive
                              ? [
                                  "bg-gradient-to-r from-primary to-info text-primary-foreground",
                                  "shadow-lg border border-primary/20",
                                  "font-semibold"
                                ]
                              : [
                                  "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground",
                                  "hover:border border-sidebar-border/50",
                                  "hover:shadow-sm"
                                ]
                          )}
                          iconOnly={!isOpen}
                        >
                          <AnimatePresence>
                            {isActive && (
                              <motion.span 
                                className="absolute left-0 w-1 h-6 bg-primary-foreground rounded-r-lg"
                                initial={{ opacity: 0, scaleY: 0 }}
                                animate={{ opacity: 1, scaleY: 1 }}
                                exit={{ opacity: 0, scaleY: 0 }}
                                transition={{ duration: 0.2 }}
                              />
                            )}
                          </AnimatePresence>
                          
                          <div className={cn(
                            "flex items-center justify-center rounded-xl transition-all duration-300",
                            "w-9 h-9 flex-shrink-0",
                            isActive
                              ? [
                                  "bg-primary-foreground text-primary",
                                  "shadow-md"
                                ]
                              : [
                                  "bg-sidebar-accent text-sidebar-foreground/80",
                                  "group-hover:scale-105 group-hover:text-sidebar-foreground",
                                  "shadow-sm"
                                ]
                          )}>
                            {item.customIcon ? (
                              <img 
                                src={item.customIcon} 
                                alt={item.title} 
                                className={cn(
                                  "w-4 h-4 object-contain transition-opacity",
                                  isActive ? 'opacity-100' : 'opacity-80 group-hover:opacity-100',
                                  isActive && 'invert dark:invert-0'
                                )} 
                              />
                            ) : (
                              <item.icon className={cn(
                                "w-4 h-4 transition-colors",
                                isActive ? 'text-primary-foreground' : 'text-current'
                              )} />
                            )}
                          </div>
                          
                          <AnimatePresence>
                            {isOpen && (
                              <motion.span 
                                className={cn(
                                  "ml-3 transition-all duration-200",
                                  isActive 
                                    ? 'text-primary-foreground' 
                                    : 'text-sidebar-foreground/80 group-hover:text-sidebar-foreground'
                                )}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                transition={{ duration: 0.2 }}
                              >
                                {item.title}
                              </motion.span>
                            )}
                          </AnimatePresence>
                          
                          {isActive && isOpen && (
                            <motion.span 
                              className="absolute right-3 w-2 h-2 bg-primary-foreground rounded-full"
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                            />
                          )}
                        </SidebarMenuButton>
                        
                        {/* Hover effect */}
                        {isHovering && !isActive && (
                          <motion.div 
                            className="absolute inset-0 -z-10 rounded-xl bg-gradient-to-r from-white/5 to-white/0"
                            layoutId="hoverBackground"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.15 }}
                          />
                        )}
                      </motion.div>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        
        <SidebarFooter className={cn(
          "px-3 py-4 border-t border-sidebar-border/50 bg-sidebar/80 backdrop-blur-sm"
        )}>
          <div className={cn(
            "w-4/5 h-px bg-gradient-to-r my-3 mx-auto",
            !isOpen && 'w-1/2',
            "from-transparent via-sidebar-border/50 to-transparent"
          )} />
          
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-2">
                {/* Theme Toggle */}
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    className={cn(
                      "group relative overflow-hidden transition-all duration-300 ease-out",
                      "flex items-center w-full h-12 px-3 text-sm font-medium rounded-xl",
                      "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                    )}
                    iconOnly={!isOpen}
                  >
                    <div className={cn(
                      "flex items-center justify-center rounded-xl w-9 h-9 flex-shrink-0 transition-colors",
                      "bg-sidebar-accent text-sidebar-foreground/80",
                      "group-hover:bg-sidebar-accent/80 group-hover:text-sidebar-foreground"
                    )}>
                      {darkMode ? (
                        <Sun className="w-4 h-4 text-amber-400" />
                      ) : (
                        <Moon className="w-4 h-4 text-indigo-600" />
                      )}
                    </div>
                    {isOpen && (
                      <span className="ml-3 transition-all duration-200">
                        {darkMode ? 'Light Mode' : 'Dark Mode'}
                      </span>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
                
                {/* Settings */}
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() => navigate('/settings')}
                    className={cn(
                      "group relative overflow-hidden transition-all duration-300 ease-out",
                      "flex items-center w-full h-12 px-3 text-sm font-medium rounded-xl",
                      location.pathname === '/settings' 
                        ? [
                            "bg-gradient-to-r from-blue-500/10 to-cyan-500/10 text-white",
                            "border border-white/5",
                            "shadow-lg",
                            "font-semibold"
                          ]
                        : [
                            darkMode 
                              ? "text-gray-300 hover:bg-white/5 hover:text-white"
                              : "text-gray-600 hover:bg-gray-100/80 hover:text-gray-900",
                            `hover:border ${darkMode ? 'border-white/5' : 'border-gray-100'}`,
                            "hover:shadow-md"
                          ]
                    )}
                    iconOnly={!isOpen}
                  >
                    <div className={cn(
                      "flex items-center justify-center rounded-xl w-9 h-9 flex-shrink-0 transition-colors",
                      "bg-sidebar-accent text-sidebar-foreground/80",
                      "group-hover:bg-sidebar-accent/80 group-hover:text-sidebar-foreground"
                    )}>
                      <Settings className={cn(
                        "w-4 h-4 transition-colors",
                        location.pathname === '/settings' 
                          ? 'text-primary-foreground' 
                          : 'text-current'
                      )} />
                    </div>
                    {isOpen && (
                      <span className={cn(
                        "ml-3 transition-all duration-200",
                        location.pathname === '/settings'
                          ? 'text-primary-foreground'
                          : 'text-sidebar-foreground/80 group-hover:text-sidebar-foreground'
                      )}>
                        Settings
                      </span>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
                
                {/* Logout */}
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() => {}}
                    className={cn(
                      "group relative overflow-hidden transition-all duration-300 ease-out",
                      "flex items-center w-full h-12 px-3 text-sm font-medium rounded-xl",
                      "text-red-400 hover:bg-red-500/10 hover:text-red-400"
                    )}
                    iconOnly={!isOpen}
                  >
                    <div className={cn(
                      "flex items-center justify-center rounded-xl w-9 h-9 flex-shrink-0 transition-colors",
                      darkMode 
                        ? "bg-red-500/10 group-hover:bg-red-500/20"
                        : "bg-red-100/80 group-hover:bg-red-200/60"
                    )}>
                      <LogOut className={cn("w-4 h-4", darkMode ? "text-red-400" : "text-red-500")} />
                    </div>
                    {isOpen && (
                      <span className={cn(
                        "ml-3 transition-all duration-200",
                        darkMode 
                          ? "text-red-400 group-hover:text-red-300"
                          : "text-red-500 group-hover:text-red-600"
                      )}>
                        Logout
                      </span>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarFooter>
      </Sidebar>
    </div>
  );
}
