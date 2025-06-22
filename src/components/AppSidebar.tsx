import { Home, User, Code, LogIn, Library, Settings, ListChecks, CheckSquare, Crown, School } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';
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
  },
  {
    title: 'Library',
    url: '/library',
    icon: Library,
  },
  {
    title: 'Classroom',
    url: '/classroom',
    icon: School,
  },
  {
    title: 'To-Do',
    url: '/todo',
    icon: CheckSquare,
  },
  {
    title: 'Premium',
    url: '/premium',
    icon: Crown,
  },
  {
    title: 'Profile',
    url: '/profile',
    icon: User,
  },
];

export function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <Sidebar>
      <SidebarHeader className="flex flex-col items-center justify-center w-full pt-8 pb-4">
        <span className="text-3xl font-extrabold text-blue-900 tracking-wide">EduBridge</span>
        <div className="w-3/4 h-0.5 bg-gray-200 mt-4 mb-2 rounded-full" />
      </SidebarHeader>
      <SidebarContent className="bg-white rounded-br-3xl shadow-xl flex-1 px-2 py-4 border-r border-gray-100">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const isActive = location.pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      isActive={isActive}
                      onClick={() => navigate(item.url)}
                      className={cn(
                        "flex items-center gap-4 w-full h-14 px-6 text-lg font-semibold transition-all duration-200",
                        "rounded-xl",
                        isActive
                          ? "bg-blue-50 text-blue-700 border-l-4 border-blue-500 shadow-sm"
                          : "text-gray-500 hover:bg-gray-100 hover:text-blue-700",
                        "group"
                      )}
                      iconOnly={false}
                    >
                      <item.icon className={cn(
                        "w-6 h-6 transition-all duration-200",
                        isActive
                          ? "text-blue-600"
                          : "text-gray-400 group-hover:text-blue-600"
                      )} />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="bg-white rounded-br-3xl shadow-xl px-2 py-4 border-t border-gray-100">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => navigate('/settings')}
                  className={cn(
                    "flex items-center gap-4 w-full h-14 px-6 text-lg font-semibold transition-all duration-200",
                    "rounded-xl text-gray-500 hover:bg-gray-100 hover:text-blue-700 group"
                  )}
                  tooltip="Settings"
                  iconOnly={false}
                >
                  <Settings className="w-6 h-6 text-gray-400 group-hover:text-blue-600 transition-all duration-200" />
                  <span>Settings</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => navigate('/login')}
                  className={cn(
                    "flex items-center gap-4 w-full h-14 px-6 text-lg font-semibold transition-all duration-200",
                    "rounded-xl bg-blue-600 text-white shadow-md hover:bg-blue-700 group"
                  )}
                  iconOnly={false}
                >
                  <LogIn className="w-6 h-6 text-white transition-all duration-200" />
                  <span>Login</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarFooter>
    </Sidebar>
  );
}
