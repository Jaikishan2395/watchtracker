import { Home, User, Code, LogIn, Library, Settings, ListChecks, CheckSquare, Crown, School, Sparkles, PanelLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';
import bridgelabLogo from '../assets/bridgelab_logo.png';
import avatar from '../assets/edu.png';
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
    gradient: 'from-blue-500 to-blue-600',
    bgGradient: 'from-blue-50 to-white',
    hoverGradient: 'from-blue-50 to-blue-100',
    glow: 'shadow-blue-500/30',
  },
  {
    title: 'Library',
    url: '/library',
    icon: Library,
    gradient: 'from-purple-500 to-purple-600',
    bgGradient: 'from-purple-50 to-white',
    hoverGradient: 'from-purple-50 to-purple-100',
    glow: 'shadow-purple-500/30',
  },
  {
    title: 'Classroom',
    url: '/classroom',
    icon: School,
    gradient: 'from-emerald-500 to-emerald-600',
    bgGradient: 'from-emerald-50 to-white',
    hoverGradient: 'from-emerald-50 to-emerald-100',
    glow: 'shadow-emerald-500/30',
  },
  {
    title: 'BridgeLab',
    url: '/bridgelab',
    icon: Sparkles,
    gradient: 'from-amber-500 to-amber-600',
    bgGradient: 'from-amber-50 to-white',
    hoverGradient: 'from-amber-50 to-amber-100',
    glow: 'shadow-amber-500/30',
    customIcon: bridgelabLogo,
  },
  {
    title: 'To-Do',
    url: '/todo',
    icon: CheckSquare,
    gradient: 'from-rose-500 to-rose-600',
    bgGradient: 'from-rose-50 to-white',
    hoverGradient: 'from-rose-50 to-rose-100',
    glow: 'shadow-rose-500/30',
  },
  {
    title: 'Profile',
    url: '/profile',
    icon: User,
    gradient: 'from-indigo-500 to-indigo-600',
    bgGradient: 'from-indigo-50 to-white',
    hoverGradient: 'from-indigo-50 to-indigo-100',
    glow: 'shadow-indigo-500/30',
  },
];

export function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { state, toggleSidebar, open } = useSidebar();
  const isOpen = state === 'expanded';

  return (
    <>
      <Sidebar className={`modern-sidebar bg-black/95 border-r border-gray-900 shadow-2xl backdrop-blur-lg transition-all duration-300 ease-in-out ${isOpen ? 'w-72' : 'w-20'}`}>
        <SidebarHeader className="modern-sidebar-header flex flex-col items-center justify-center w-full pt-6 pb-4 relative group/header">
          <div className="flex flex-col items-center w-full relative">
            {/* Logo with subtle glow */}
            <div className={`relative group/logo transition-all duration-300 ${isOpen ? 'scale-100' : 'scale-90'}`}>
              <div className={`absolute inset-0 rounded-xl bg-white/5 group-hover/logo:bg-white/10 transition-all duration-300 ${isOpen ? 'w-14 h-14' : 'w-12 h-12'}`}></div>
              <div className={`relative rounded-xl p-2 bg-black border border-gray-800 hover:border-gray-700 transition-all duration-300 ${isOpen ? 'w-14 h-14' : 'w-12 h-12'}`}>
                <img 
                  src={logo} 
                  alt="EduBridge Logo" 
                  className="w-full h-full object-contain transition-transform duration-300 group-hover/logo:scale-105 invert" 
                />
              </div>
            </div>
            
            {/* App Name with fade-in animation */}
            <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-20 mt-4' : 'max-h-0 mt-0'}`}>
              <h2 className="text-xl font-bold text-white">
                EduBridge
              </h2>
              {isOpen && (
                <p className="text-xs text-gray-400 mt-1 font-medium tracking-wider">LEARNING PLATFORM</p>
              )}
            </div>
          </div>
          <button 
            onClick={toggleSidebar}
            className="absolute -right-3 top-8 bg-black border border-gray-800 hover:border-gray-700 rounded-full p-1.5 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-white/20"
          >
            {isOpen ? (
              <ChevronLeft className="w-4 h-4 text-gray-300" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-300" />
            )}
          </button>
          <div className="w-4/5 h-[1px] bg-gradient-to-r from-transparent via-gray-800 to-transparent my-4" />
        </SidebarHeader>
        
        <SidebarContent className="flex-1 px-3 py-1 overflow-y-auto custom-scrollbar">
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-2">
                {menuItems.map((item) => {
                  const isActive = location.pathname === item.url;
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        isActive={isActive}
                        onClick={() => navigate(item.url)}
                        className={cn(
                          "group relative overflow-hidden transition-all duration-200 ease-out",
                          "flex items-center w-full h-12 px-3 text-sm font-medium rounded-lg",
                          isActive
                            ? [
                                "bg-white/10 text-white",
                                "border border-white/10",
                                "backdrop-blur-sm",
                                "font-semibold"
                              ]
                            : [
                                "text-gray-300 hover:bg-white/5 hover:text-white",
                                "hover:border hover:border-white/5",
                                "hover:backdrop-blur-sm"
                              ]
                        )}
                        iconOnly={!isOpen}
                      >
                        <div className={cn(
                          "flex items-center justify-center rounded-lg transition-all duration-200",
                          "w-8 h-8 flex-shrink-0",
                          isActive
                            ? [
                                "bg-white text-black"
                              ]
                            : [
                                "bg-black/30 text-gray-300 group-hover:text-white",
                                "group-hover:scale-110"
                              ]
                        )}>
                          {item.customIcon ? (
                            <img 
                              src={item.customIcon} 
                              alt={item.title} 
                              className={`w-4 h-4 object-contain ${isActive ? 'invert' : 'opacity-80 group-hover:opacity-100'}`} 
                            />
                          ) : (
                            <item.icon className={`w-4 h-4 ${isActive ? 'text-black' : 'text-current'}`} />
                          )}
                        </div>
                        {isOpen && (
                          <span className={`ml-3 transition-all duration-200 ${isActive ? 'text-white' : 'text-gray-300 group-hover:text-white'}`}>
                            {item.title}
                            {isActive && (
                              <span className="absolute right-3 w-1.5 h-1.5 bg-white rounded-full"></span>
                            )}
                          </span>
                        )}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        
        <SidebarFooter className="px-3 py-3 border-t border-gray-800 bg-black/50 backdrop-blur-md">
          <div className={`w-4/5 h-px bg-gradient-to-r from-transparent via-gray-800 to-transparent my-3 mx-auto ${!isOpen ? 'w-1/2' : ''}`} />
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-2">
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() => navigate('/settings')}
                    className={cn(
                      "group relative overflow-hidden transition-all duration-200 ease-out",
                      "flex items-center w-full h-12 px-3 text-sm font-medium rounded-lg",
                      "text-gray-300 hover:bg-white/5 hover:text-white"
                    )}
                    tooltip={!isOpen ? "Settings" : undefined}
                    iconOnly={!isOpen}
                  >
                    <div className="flex items-center justify-center rounded-lg w-8 h-8 bg-black/30 text-gray-300 transition-all duration-200 group-hover:bg-white/10 group-hover:text-white">
                      <Settings className="w-4 h-4" />
                    </div>
                    {isOpen && <span className="ml-3">Settings</span>}
                  </SidebarMenuButton>
                </SidebarMenuItem>
                
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() => navigate('/login')}
                    className={cn(
                      "group relative overflow-hidden transition-all duration-200 ease-out",
                      "flex items-center w-full h-12 px-3 text-sm font-medium rounded-lg",
                      "bg-white text-black hover:bg-white/90",
                      "hover:shadow-lg hover:scale-[1.02]"
                    )}
                    tooltip={!isOpen ? "Login" : undefined}
                    iconOnly={!isOpen}
                  >
                    <div className="flex items-center justify-center rounded-lg w-8 h-8 bg-black text-white transition-all duration-200 group-hover:scale-110">
                      <LogIn className="w-4 h-4" />
                    </div>
                    {isOpen && <span className="ml-3 font-medium">Login</span>}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarFooter>
      </Sidebar>
    </>
  );
}
