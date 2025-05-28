import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, useParams } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AppSidebar } from "@/components/AppSidebar";
import Index from "./pages/Index";
import PlaylistDetail from "./pages/PlaylistDetail";
import PlaylistDetailCoding from "./pages/PlaylistDetailCoding";
import CodingProblemSolver from "./pages/CodingProblemSolver";
import VideoPlayer from "./pages/VideoPlayer";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import Splash from "./pages/Splash";
import Login from "./pages/Login";
import CreateAccount from "./pages/CreateAccount";
import Library from "./pages/Library";
import { SettingsPage } from "./pages/SettingsPage";
import AllQuestions from "./pages/AllQuestions";
import { useState, useEffect } from "react";
import { Playlist } from '@/types/playlist';

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
            <Route path="/all-questions" element={<AllQuestions />} />
            <Route 
              path="/playlist/:playlistId" 
              element={<PlaylistDetailWrapper />} 
            />
            <Route path="/playlist/:playlistId/question/:questionId" element={<CodingProblemSolver />} />
            <Route path="/playlist/:playlistId/play" element={<VideoPlayer />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
    </SidebarProvider>
  );
};

// New component to handle playlist type routing
const PlaylistDetailWrapper = () => {
  const { playlistId } = useParams();
  const [playlistType, setPlaylistType] = useState<'video' | 'coding' | null>(null);

  useEffect(() => {
    const savedPlaylists = localStorage.getItem('youtubePlaylists');
    if (savedPlaylists) {
      const playlists: Playlist[] = JSON.parse(savedPlaylists);
      const playlist = playlists.find(p => p.id === playlistId);
      if (playlist) {
        setPlaylistType(playlist.type);
      }
    }
  }, [playlistId]);

  if (!playlistType) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-300">Loading playlist...</p>
        </div>
      </div>
    );
  }

  return playlistType === 'coding' ? <PlaylistDetailCoding /> : <PlaylistDetail />;
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
