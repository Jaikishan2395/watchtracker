import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AppSidebar } from "@/components/AppSidebar";
import Index from "./pages/Index";
import PlaylistDetail from "./pages/PlaylistDetail";
import VideoPlayer from "./pages/VideoPlayer";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import Splash from "./pages/Splash";

const queryClient = new QueryClient();

const AppContent = () => {
  const location = useLocation();
  const isSplashPage = location.pathname === '/';

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        {!isSplashPage && <AppSidebar />}
        <main className={`flex-1 ${!isSplashPage ? '' : 'w-full'}`}>
          {!isSplashPage && (
            <div className="p-2">
              <SidebarTrigger />
            </div>
          )}
          <Routes>
            <Route path="/" element={<Splash />} />
            <Route path="/dashboard" element={<Index />} />
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
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
