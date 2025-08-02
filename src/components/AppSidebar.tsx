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
      <Sidebar className={`modern-sidebar bg-white/95 border-r border-gray-100 shadow-xl backdrop-blur-lg transition-all duration-300 ease-in-out ${isOpen ? 'w-64' : 'w-20'}`} defaultOpen={true}>
        <SidebarHeader className="modern-sidebar-header flex flex-col items-center justify-center w-full pt-5 pb-3 relative group/header">
          <div className="flex flex-col items-center w-full relative">
            {/* Logo with animated border */}
            <div className={`relative group/logo transition-all duration-300 ${isOpen ? 'scale-100' : 'scale-90'}`}>
              <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 opacity-0 group-hover/logo:opacity-100 transition-opacity duration-300 blur-md -z-10 ${isOpen ? 'w-16 h-16' : 'w-14 h-14'}`}></div>
              <div className={`relative rounded-2xl p-2 bg-white/90 backdrop-blur-sm border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 ${isOpen ? 'w-16 h-16' : 'w-14 h-14'}`}>
                <img 
                  src={logo} 
                  alt="EduBridge Logo" 
                  className="w-full h-full object-contain transition-transform duration-300 group-hover/logo:scale-105" 
                />
              </div>
            </div>
            
            {/* App Name with fade-in animation */}
            <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-20 mt-3' : 'max-h-0 mt-0'}`}>
              <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                EduBridge
              </h2>
              {isOpen && (
                <p className="text-xs text-gray-500 mt-0.5 font-medium">Learning Platform</p>
              )}
            </div>
          </div>
          <button 
            onClick={toggleSidebar}
            className="absolute -right-3 top-8 bg-white border border-gray-200 rounded-full p-1 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {isOpen ? (
              <ChevronLeft className="w-4 h-4 text-gray-600" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-600" />
            )}
          </button>
          <div className={`w-4/5 h-[1px] bg-gradient-to-r from-transparent via-gray-200 to-transparent my-3 transition-all duration-500 ${isOpen ? 'opacity-100' : 'opacity-0'}`} />
        </SidebarHeader>
        
        <SidebarContent className="flex-1 px-3 py-1 overflow-y-auto custom-scrollbar">
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1.5">
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
                                `bg-gradient-to-r ${item.gradient} text-white`,
                                "shadow-lg hover:shadow-xl",
                                "font-semibold",
                              ]
                            : [
                                `bg-white text-gray-700 hover:bg-gray-50`,
                                "hover:shadow-md hover:scale-[1.02]"
                              ]
                        )}
                        iconOnly={!isOpen}
                      >
                        <div className={cn(
                          "icon-container flex items-center justify-center rounded-lg transition-all duration-200",
                          isActive
                            ? [
                                "bg-white/20 p-1.5 text-white"
                              ]
                            : [
                                `bg-${item.gradient.split(' ')[0].replace('from-', '')}-100 p-1.5`,
                                `text-${item.gradient.split(' ')[0].replace('from-', '')}-600`,
                                "group-hover:scale-110"
                              ]
                        )}>
                          {item.customIcon ? (
                            <img 
                              src={item.customIcon} 
                              alt={item.title} 
                              className={`w-4 h-4 object-contain ${isActive ? 'invert' : ''}`} 
                            />
                          ) : (
                            <item.icon className="w-4 h-4" />
                          )}
                        </div>
                        {isOpen && (
                          <span className={`ml-3 transition-opacity duration-200 ${isActive ? 'text-white' : 'text-gray-700'}`}>
                            {item.title}
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
        
        <SidebarFooter className="px-3 py-3 border-t border-gray-100 bg-white/50 backdrop-blur-md">
          <div className={`w-4/5 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent my-2 mx-auto ${!isOpen ? 'w-1/2' : ''}`} />
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1.5">
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() => navigate('/settings')}
                    className={cn(
                      "group relative overflow-hidden transition-all duration-200 ease-out",
                      "flex items-center w-full h-12 px-3 text-sm font-medium rounded-lg",
                      "bg-white text-gray-700 hover:bg-gray-50 hover:shadow-md"
                    )}
                    tooltip={!isOpen ? "Settings" : undefined}
                    iconOnly={!isOpen}
                  >
                    <div className="icon-container flex items-center justify-center rounded-lg bg-gray-100 p-1.5 text-gray-600 transition-all duration-200 group-hover:scale-110">
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
                      "bg-gradient-to-r from-blue-500 to-blue-600 text-white",
                      "hover:shadow-md hover:from-blue-600 hover:to-blue-700"
                    )}
                    tooltip={!isOpen ? "Login" : undefined}
                    iconOnly={!isOpen}
                  >
                    <div className="icon-container flex items-center justify-center rounded-lg bg-white/20 p-1.5 text-white transition-all duration-200 group-hover:scale-110">
                      <LogIn className="w-4 h-4" />
                    </div>
                    {isOpen && <span className="ml-3">Login</span>}
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
