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
    console.log('PlaylistDetailWrapper: Starting playlist lookup for ID:', playlistId);
    const savedPlaylists = localStorage.getItem('youtubePlaylists');
    if (savedPlaylists) {
      try {
        const playlists: Playlist[] = JSON.parse(savedPlaylists);
        console.log('PlaylistDetailWrapper: Successfully parsed playlists from localStorage:', playlists);
        const playlist = playlists.find(p => p.id === playlistId);
        console.log('PlaylistDetailWrapper: Found playlist:', playlist);
        if (playlist) {
          console.log('PlaylistDetailWrapper: Setting playlist type to:', playlist.type);
          setPlaylistType(playlist.type);
        } else {
          console.error('PlaylistDetailWrapper: No playlist found with ID:', playlistId);
          console.log('PlaylistDetailWrapper: Available playlist IDs:', playlists.map(p => p.id));
        }
      } catch (error) {
        console.error('PlaylistDetailWrapper: Error parsing playlists from localStorage:', error);
      }
    } else {
      console.error('PlaylistDetailWrapper: No playlists found in localStorage');
    }
  }, [playlistId]);

  if (!playlistType) {
    console.log('PlaylistDetailWrapper: Still loading playlist type...');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-300">Loading playlist...</p>
        </div>
      </div>
    );
  }

  console.log('PlaylistDetailWrapper: Rendering component for playlist type:', playlistType);
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
