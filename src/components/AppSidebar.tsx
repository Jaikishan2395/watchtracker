import { Home, User, Code, LogIn, Library, Settings, ListChecks, CheckSquare, Crown, School, Sparkles } from 'lucide-react';
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
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';

const menuItems = [
  {
    title: 'Dashboard',
    url: '/dashboard',
    icon: Home,
    gradient: 'from-blue-600 to-blue-800',
    bgGradient: 'from-blue-50/80 to-white/80',
    hoverGradient: 'from-blue-100/90 to-blue-50/90',
    glow: 'shadow-blue-500/20',
  },
  {
    title: 'Library',
    url: '/library',
    icon: Library,
    gradient: 'from-blue-600 to-blue-800',
    bgGradient: 'from-blue-50/80 to-white/80',
    hoverGradient: 'from-blue-100/90 to-blue-50/90',
    glow: 'shadow-blue-500/20',
  },
  {
    title: 'Classroom',
    url: '/classroom',
    icon: School,
    gradient: 'from-blue-600 to-blue-800',
    bgGradient: 'from-blue-50/80 to-white/80',
    hoverGradient: 'from-blue-100/90 to-blue-50/90',
    glow: 'shadow-blue-500/20',
  },
  {
    title: 'BridgeLab',
    url: '/bridgelab',
    icon: Sparkles,
    gradient: 'from-blue-600 to-blue-800',
    bgGradient: 'from-blue-50/80 to-white/80',
    hoverGradient: 'from-blue-100/90 to-blue-50/90',
    glow: 'shadow-blue-500/20',
    customIcon: bridgelabLogo,
  },
  {
    title: 'To-Do',
    url: '/todo',
    icon: CheckSquare,
    gradient: 'from-blue-600 to-blue-800',
    bgGradient: 'from-blue-50/80 to-white/80',
    hoverGradient: 'from-blue-100/90 to-blue-50/90',
    glow: 'shadow-blue-500/20',
  },
  {
    title: 'Profile',
    url: '/profile',
    icon: User,
    gradient: 'from-blue-600 to-blue-800',
    bgGradient: 'from-blue-50/80 to-white/80',
    hoverGradient: 'from-blue-100/90 to-blue-50/90',
    glow: 'shadow-blue-500/20',
  },
];

export function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <Sidebar className="modern-sidebar bg-gradient-to-b from-white/95 to-gray-50/95 border-r border-gray-200/40 shadow-2xl backdrop-blur-xl">
      <SidebarHeader className="modern-sidebar-header flex flex-col items-center justify-center w-full pt-1 pb-1">
        <div className="flex flex-col items-center w-full">
          <div className="relative rounded-2xl p-3 mb-2">
            <img src={logo} alt="EduBridge Logo" className="w-16 h-16 object-contain rounded-xl" />
          </div>
        </div>
        <div className="w-4/5 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent mt-1 mb-2" />
      </SidebarHeader>
      
      <SidebarContent className="flex-1 px-3 py-1">
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
                        "modern-sidebar-menu-item group relative overflow-hidden transition-all duration-300 ease-out",
                        "flex items-center gap-3 w-full h-12 px-3 text-sm font-medium rounded-xl",
                        isActive
                          ? [
                              "bg-black text-white border border-black shadow-lg",
                              "font-semibold",
                            ]
                          : [
                              "bg-white text-black border border-transparent hover:border-black",
                              "hover:bg-gray-100",
                              "hover:shadow-md",
                            ]
                      )}
                      iconOnly={false}
                    >
                      <div className={cn(
                        "icon-container relative flex items-center justify-center w-6 h-6 rounded-lg transition-all duration-300",
                        isActive
                          ? [
                              "bg-black text-white",
                            ]
                          : [
                              "bg-white text-black",
                              "group-hover:bg-gray-100 group-hover:text-black"
                            ]
                      )}>
                        {item.customIcon ? (
                          <img src={item.customIcon} alt={item.title} className="w-4 h-4 object-contain" />
                        ) : (
                          <item.icon className="w-4 h-4" />
                        )}
                      </div>
                      <span className="relative z-10 pl-1">{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="px-3 py-4 border-t border-gray-200/40 bg-gradient-to-t from-gray-50/50 to-transparent backdrop-blur-sm">
        <div className="w-4/5 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent my-2 mx-auto" />
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => navigate('/settings')}
                  className={cn(
                    "modern-sidebar-menu-item group relative overflow-hidden transition-all duration-300 ease-out",
                    "flex items-center gap-3 w-full h-12 px-3 text-sm font-medium rounded-xl",
                    "bg-white text-black border border-transparent hover:border-black hover:bg-gray-100 hover:shadow-md"
                  )}
                  tooltip="Settings"
                  iconOnly={false}
                >
                  <div className="icon-container relative flex items-center justify-center w-6 h-6 rounded-lg transition-all duration-300 bg-white text-black group-hover:bg-gray-100 group-hover:text-black group-hover:scale-110">
                    <Settings className="w-4 h-4" />
                  </div>
                  <span className="pl-1">Settings</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => navigate('/login')}
                  className={cn(
                    "modern-sidebar-menu-item group relative overflow-hidden transition-all duration-300 ease-out",
                    "flex items-center gap-3 w-full h-12 px-3 text-sm font-semibold rounded-xl",
                    "bg-black text-white border border-black hover:bg-gray-900 hover:shadow-lg"
                  )}
                  iconOnly={false}
                >
                  <div className="icon-container relative flex items-center justify-center w-6 h-6 rounded-lg transition-all duration-300 bg-black text-white group-hover:bg-gray-900 group-hover:text-white group-hover:scale-110">
                    <LogIn className="w-4 h-4" />
                  </div>
                  <span className="pl-1">Login</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarFooter>
    </Sidebar>
  );
}
