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
          <div className="relative bg-gradient-to-br from-white/90 to-gray-50/90 rounded-2xl p-3 shadow-xl mb-2 border border-gray-200/30 backdrop-blur-sm">
            <div className="absolute inset-0 bg-gradient-to-br from-gray-500/10 to-black/10 rounded-2xl"></div>
            <img src={logo} alt="EduBridge Logo" className="relative w-16 h-16 object-contain rounded-xl" />
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
                        "border border-transparent hover:border-slate-200/50",
                        "transform hover:scale-[1.02] active:scale-[0.98]",
                        "backdrop-blur-sm",
                        isActive
                          ? [
                              `bg-gradient-to-r ${item.bgGradient}`,
                              "border-gray-300/50 shadow-lg shadow-gray-200/50",
                              "text-gray-900 font-semibold",
                              "before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/30 before:to-transparent before:rounded-xl",
                              `after:absolute after:left-0 after:top-1/2 after:-translate-y-1/2 after:w-1 after:h-6 after:bg-gradient-to-b ${item.gradient} after:rounded-r-full`,
                              item.glow
                            ]
                          : [
                              "text-gray-600 hover:text-gray-900",
                              `hover:bg-gradient-to-r ${item.hoverGradient}`,
                              "hover:shadow-md hover:shadow-gray-200/30"
                            ]
                      )}
                      iconOnly={false}
                    >
                      <div className={cn(
                        "icon-container relative flex items-center justify-center w-6 h-6 rounded-lg transition-all duration-300",
                        "group-hover:scale-110",
                        isActive
                          ? [
                              `bg-gradient-to-br ${item.gradient}`,
                              "shadow-lg shadow-gray-300/50",
                              "text-white"
                            ]
                          : [
                              "bg-gray-100/80 text-gray-500 backdrop-blur-sm",
                              "group-hover:bg-gray-200/90 group-hover:text-gray-700"
                            ]
                      )}>
                        {item.customIcon ? (
                          <img src={item.customIcon} alt={item.title} className="w-4 h-4 object-contain" />
                        ) : (
                          <item.icon className="w-4 h-4" />
                        )}
                        {isActive && (
                          <div className="absolute inset-0 bg-white/20 rounded-lg animate-pulse"></div>
                        )}
                      </div>
                      <span className="relative z-10 pl-1">{item.title}</span>
                      
                      {/* Enhanced hover effect overlay */}
                      {!isActive && (
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
                      )}
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
                    "border border-gray-200/30 hover:border-gray-300/50",
                    "text-gray-600 hover:text-gray-900",
                    "hover:bg-gradient-to-r hover:from-gray-50/90 hover:via-white/90 hover:to-gray-100/90",
                    "hover:shadow-md hover:shadow-gray-200/30",
                    "transform hover:scale-[1.02] active:scale-[0.98]",
                    "backdrop-blur-sm"
                  )}
                  tooltip="Settings"
                  iconOnly={false}
                >
                  <div className="icon-container relative flex items-center justify-center w-6 h-6 rounded-lg transition-all duration-300 bg-gray-100/80 text-gray-500 group-hover:bg-gray-200/90 group-hover:text-gray-700 group-hover:scale-110 backdrop-blur-sm">
                    <Settings className="w-4 h-4" />
                  </div>
                  <span className="pl-1">Settings</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => navigate('/login')}
                  className={cn(
                    "modern-sidebar-menu-item group relative overflow-hidden transition-all duration-300 ease-out",
                    "flex items-center gap-3 w-full h-12 px-3 text-sm font-semibold rounded-xl",
                    "bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 text-white",
                    "border border-blue-700/50 hover:border-blue-600/50",
                    "shadow-lg shadow-blue-900/20 hover:shadow-xl hover:shadow-blue-900/30",
                    "hover:bg-gradient-to-r hover:from-blue-500 hover:via-blue-600 hover:to-blue-700",
                    "transform hover:scale-[1.02] active:scale-[0.98]",
                    "before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/10 before:to-transparent before:opacity-0 before:group-hover:opacity-100 before:transition-opacity before:duration-300 before:rounded-xl",
                    "backdrop-blur-sm"
                  )}
                  iconOnly={false}
                >
                  <div className="icon-container relative flex items-center justify-center w-6 h-6 rounded-lg transition-all duration-300 bg-white/20 text-white group-hover:bg-white/30 group-hover:scale-110">
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
