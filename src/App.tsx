import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AppSidebar } from "@/components/AppSidebar";
import Index from "./pages/Index";
import PlaylistDetail from "./pages/PlaylistDetail";
import VideoPlayer from "./pages/VideoPlayer";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import Splash from "./pages/Splash";
import Login from "./pages/Login";
import CreateAccount from "./pages/CreateAccount";
import Library from "./pages/Library";

const queryClient = new QueryClient();

const AppContent = () => {
  const location = useLocation();
  const isAuthPage = ['/', '/login', '/create-account'].includes(location.pathname);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        {!isAuthPage && <AppSidebar />}
        <main className={`flex-1 ${!isAuthPage ? '' : 'w-full'}`}>
          {!isAuthPage && (
            <div className="p-2">
              <SidebarTrigger />
            </div>
          )}
          <Routes>
            <Route path="/" element={<Splash />} />
            <Route path="/login" element={<Login />} />
            <Route path="/create-account" element={<CreateAccount />} />
            <Route path="/dashboard" element={<Index />} />
            <Route path="/library" element={<Library />} />
            <Route path="/playlist/:id" element={<PlaylistDetail />} />
            <Route path="/playlist/:id/play" element={<VideoPlayer />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
    </SidebarProvider>
  );
};

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
