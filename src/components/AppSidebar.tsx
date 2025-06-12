import { Home, User, Code, LogIn, Library, Settings, ListChecks, CheckSquare, Crown } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
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
    title: 'All Questions',
    url: '/all-questions',
    icon: ListChecks,
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
      <SidebarHeader className="p-4">
        <div className="flex items-center justify-center">
          <div className="p-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600">
            <Code className="w-5 h-5 text-white" />
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    isActive={location.pathname === item.url}
                    onClick={() => navigate(item.url)}
                    className={cn(
                      "flex items-center justify-center w-14 h-14",
                      "transition-all duration-300 ease-in-out",
                      "hover:scale-105 hover:shadow-xl",
                      "active:scale-95",
                      location.pathname === item.url 
                        ? "bg-gradient-to-br from-blue-500/30 via-purple-500/20 to-blue-500/30 shadow-lg ring-2 ring-blue-500/20" 
                        : "bg-gradient-to-br from-transparent to-transparent",
                      "hover:bg-gradient-to-br hover:from-blue-500/20 hover:via-purple-500/10 hover:to-blue-500/20",
                      "border border-transparent hover:border-blue-500/30",
                      "rounded-2xl",
                      "backdrop-blur-sm",
                      "group",
                      "p-0"
                    )}
                    iconOnly={true}
                  >
                    <div className="flex items-center justify-center w-full h-full">
                      <item.icon className={cn(
                        "w-5 h-5 transition-all duration-300",
                        "group-hover:scale-110 group-hover:rotate-3",
                        "group-active:scale-95 group-active:rotate-0",
                        location.pathname === item.url 
                          ? "text-blue-600 dark:text-blue-400" 
                          : "text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400"
                      )} />
                    </div>
                    <span className="sr-only">{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => navigate('/settings')}
                  className={cn(
                    "flex items-center justify-center w-14 h-14",
                    "transition-all duration-300 ease-in-out",
                    "hover:scale-105 hover:shadow-xl",
                    "active:scale-95",
                    "bg-gradient-to-br from-transparent to-transparent",
                    "hover:bg-gradient-to-br hover:from-gray-500/20 hover:via-gray-600/10 hover:to-gray-500/20",
                    "border border-transparent hover:border-gray-500/30",
                    "rounded-2xl",
                    "backdrop-blur-sm",
                    "group",
                    "p-0"
                  )}
                  tooltip="Settings"
                  iconOnly={true}
                >
                  <div className="flex items-center justify-center w-full h-full">
                    <Settings className={cn(
                      "w-5 h-5 transition-all duration-300",
                      "group-hover:scale-110 group-hover:rotate-3",
                      "group-active:scale-95 group-active:rotate-0",
                      "text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400"
                    )} />
                  </div>
                  <span className="sr-only">Settings</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => navigate('/login')}
                  className={cn(
                    "flex items-center justify-center w-14 h-14",
                    "transition-all duration-300 ease-in-out",
                    "hover:scale-105 hover:shadow-xl",
                    "active:scale-95",
                    "bg-gradient-to-br from-blue-600 via-purple-600 to-blue-600",
                    "hover:from-blue-700 hover:via-purple-700 hover:to-blue-700",
                    "border border-transparent hover:border-blue-500/30",
                    "rounded-2xl",
                    "shadow-lg hover:shadow-xl",
                    "group",
                    "p-0"
                  )}
                  iconOnly={true}
                >
                  <div className="flex items-center justify-center w-full h-full">
                    <LogIn className={cn(
                      "w-5 h-5 transition-all duration-300",
                      "group-hover:scale-110 group-hover:rotate-3",
                      "group-active:scale-95 group-active:rotate-0",
                      "text-white"
                    )} />
                  </div>
                  <span className="sr-only">Login</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarFooter>
    </Sidebar>
  );
}
