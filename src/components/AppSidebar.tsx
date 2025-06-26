import { Home, User, Code, LogIn, Library, Settings, ListChecks, CheckSquare, Crown, School } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';
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
        <div className="flex flex-col items-center w-full">
          <div className="bg-white rounded-full p-2 shadow-md mb-2">
            <img src={logo} alt="EduBridge Logo" className="w-14 h-14 object-contain rounded-full" />
          </div>
        </div>
        <div className="w-3/4 h-0.5 bg-gray-200 mt-4 mb-2 rounded-full" />
      </SidebarHeader>
      <SidebarContent className="bg-white rounded-none shadow-xl flex-1 px-2 py-4 border-r border-gray-200">
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
                        "flex items-center gap-4 w-full h-14 px-6 text-lg font-semibold transition-all duration-200 rounded-md",
                        isActive
                          ? "bg-gray-900 text-white border-l-4 border-black shadow-sm"
                          : "text-black hover:bg-gray-100 hover:text-black",
                        "group"
                      )}
                      iconOnly={false}
                    >
                      <item.icon className={cn(
                        "w-6 h-6 transition-all duration-200",
                        isActive
                          ? "text-white"
                          : "text-black group-hover:text-black"
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
      <SidebarFooter className="bg-white rounded-none shadow-xl px-2 py-4 border-t border-gray-200 flex flex-col items-center">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => navigate('/settings')}
                  className={cn(
                    "flex items-center gap-4 w-full h-14 px-6 text-lg font-semibold transition-all duration-200 rounded-md text-black hover:bg-gray-100 hover:text-black group"
                  )}
                  tooltip="Settings"
                  iconOnly={false}
                >
                  <Settings className="w-6 h-6 text-black group-hover:text-black transition-all duration-200" />
                  <span>Settings</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => navigate('/login')}
                  className={cn(
                    "flex items-center gap-4 w-full h-14 px-6 text-lg font-semibold transition-all duration-200 rounded-md bg-black text-white shadow-lg hover:bg-gray-900 hover:text-white group"
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
