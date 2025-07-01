# Line-by-Line Explanation: src/App.tsx

---

```tsx
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route, useLocation, useParams, useNavigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AppSidebar } from "@/components/AppSidebar";
import Index from "./pages/Index";
import PlaylistDetail from "./pages/PlaylistDetail";
import PlaylistDetailCoding from "./pages/PlaylistDetailCoding";
import VideoPlayer from "./pages/VideoPlayer";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import Splash from "./pages/Splash";
import Login from "./pages/Login";
import CreateAccount from "./pages/CreateAccount";
import Library from "./pages/Library";
import { SettingsPage } from "./pages/SettingsPage";
import Todo from "./pages/Todo";
import Pomodoro from "./pages/Pomodoro";
import Premium from "./pages/Premium";
import Classroom from "./pages/Classroom";
import Clubs from "./pages/Clubs";
import BridgeLab from "./pages/BridgeLab";
import AcceleratorLibrary from "./pages/AcceleratorLibrary";
import ViewCreate from './pages/viewCreate';
import FindCoFounder from './pages/FindCoFounder';
import { useState, useEffect } from "react";
import { Playlist } from '@/types/playlist';
import { loadQuestionsFromFile } from './utils/loadQuestions';
import { PlaylistProvider } from '@/context/PlaylistContext';
import { Button } from "@/components/ui/button";
import Shorts from "./pages/Shorts";
import LearningTrack from "./pages/learningtrack";
```
**Explanation:**
- These lines import all the required components, hooks, types, and utilities used in this file. This includes UI components, routing utilities, context providers, and page components.

---

```tsx
const queryClient = new QueryClient();
```
**Explanation:**
- Initializes a new instance of React Query's `QueryClient` for managing server state and caching.

---

```tsx
function SidebarDoubleClickCloser({ children }: { children: React.ReactNode }) {
  const { open, setOpen, openMobile, setOpenMobile } = useSidebar();
  return (
    <div
      style={{ height: '100%' }}
      onDoubleClick={() => {
        setOpen(!open);
        setOpenMobile(!openMobile);
      }}
    >
      {children}
    </div>
  );
}
```
**Explanation:**
- Defines a utility component that wraps its children and toggles the sidebar's open state (both desktop and mobile) when double-clicked.
- Uses the `useSidebar` hook for sidebar state management.

---

```tsx
const AppContent = () => {
  const location = useLocation();
  const isAuthPage = ['/', '/login', '/create-account'].includes(location.pathname);

  useEffect(() => {
    // Load questions when the app starts
    loadQuestionsFromFile().catch(error => {
      console.error('Failed to load questions:', error);
    });
  }, []);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        {!isAuthPage && <AppSidebar />}
        <main className={`flex-1 ${!isAuthPage ? '' : 'w-full'}`}>
          <SidebarDoubleClickCloser>
            <Routes>
              <Route path="/" element={<Splash />} />
              <Route path="/login" element={<Login />} />
              <Route path="/create-account" element={<CreateAccount />} />
              <Route path="/dashboard" element={<Index />} />
              <Route path="/library" element={<Library />} />
              <Route path="/classroom" element={<Classroom />} />
              <Route path="/clubs" element={<Clubs />} />
              <Route path="/todo" element={<Todo />} />
              <Route path="/pomodoro" element={<Pomodoro />} />
              <Route path="/premium" element={<Premium />} />
              <Route path="/bridgelab" element={<BridgeLab />} />
              <Route path="/acceleratorlibrary" element={<AcceleratorLibrary />} />
              <Route path="/view-create" element={<ViewCreate />} />
              <Route path="/shorts" element={<Shorts />} />
              <Route path="/learningtrack" element={<LearningTrack />} />
              <Route path="/find-cofounder" element={<FindCoFounder />} />
              <Route 
                path="/playlist/:playlistId" 
                element={<PlaylistDetailWrapper />} 
              />
              <Route path="/playlist/:playlistId/play" element={<VideoPlayer />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </SidebarDoubleClickCloser>
        </main>
      </div>
    </SidebarProvider>
  );
};
```
**Explanation:**
- `AppContent` is the main layout and routing component.
- Uses `useLocation` to determine the current route.
- Checks if the current page is an authentication page to conditionally render the sidebar.
- Loads questions from file on mount using `useEffect`.
- Wraps the main content in `SidebarProvider` for sidebar state.
- Renders the sidebar unless on an auth page.
- Uses `SidebarDoubleClickCloser` to allow toggling the sidebar by double-clicking.
- Defines all main routes using `Routes` and `Route` from `react-router-dom`.

---

```tsx
const PlaylistDetailWrapper = () => {
  const { playlistId } = useParams();
  const [playlistType, setPlaylistType] = useState<'video' | 'coding' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    console.log('PlaylistDetailWrapper: Starting playlist lookup for ID:', playlistId);
    const savedPlaylists = localStorage.getItem('youtubePlaylists');
    
    if (!savedPlaylists) {
      const errorMsg = 'No playlists found in localStorage';
      console.error('PlaylistDetailWrapper:', errorMsg);
      setError(errorMsg);
      return;
    }

    try {
      const playlists: Playlist[] = JSON.parse(savedPlaylists);
      console.log('PlaylistDetailWrapper: Successfully parsed playlists from localStorage:', playlists);
      
      if (!Array.isArray(playlists)) {
        throw new Error('Playlists data is not an array');
      }

      const playlist = playlists.find(p => p.id === playlistId);
      console.log('PlaylistDetailWrapper: Found playlist:', playlist);
      
      if (!playlist) {
        const errorMsg = `No playlist found with ID: ${playlistId}`;
        console.error('PlaylistDetailWrapper:', errorMsg);
        console.log('PlaylistDetailWrapper: Available playlist IDs:', playlists.map(p => p.id));
        setError(errorMsg);
        return;
      }

      if (!playlist.type) {
        const errorMsg = `Playlist ${playlistId} has no type specified`;
        console.error('PlaylistDetailWrapper:', errorMsg);
        setError(errorMsg);
        return;
      }

      console.log('PlaylistDetailWrapper: Setting playlist type to:', playlist.type);
      setPlaylistType(playlist.type);
      setError(null);
    } catch (error) {
      const errorMsg = `Error parsing playlists from localStorage: ${error}`;
      console.error('PlaylistDetailWrapper:', errorMsg);
      setError(errorMsg);
    }
  }, [playlistId]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <Button onClick={() => navigate('/library')} className="mt-4">
            Back to Library
          </Button>
        </div>
      </div>
    );
  }

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
```
**Explanation:**
- Handles dynamic routing for playlist detail pages.
- Uses `useParams` to get the playlist ID from the URL.
- Uses state to track the playlist type and any error.
- On mount or when the playlist ID changes, attempts to load playlists from localStorage and find the correct playlist.
- Handles errors (missing playlists, wrong type, etc.) and displays a message with a button to return to the library.
- Shows a loading message while determining the playlist type.
- Renders the correct detail component based on the playlist type.

---

```tsx
const App = () => (
  <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
    <PlaylistProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Router>
            <AppContent />
          </Router>
        </TooltipProvider>
      </QueryClientProvider>
    </PlaylistProvider>
  </ThemeProvider>
);

export default App;
```
**Explanation:**
- The root component for the app.
- Wraps the entire application in several providers for theme, playlist context, query client, and tooltips.
- Sets up notification systems (`Toaster`, `Sonner`).
- Uses `Router` to enable client-side routing and renders `AppContent` as the main content.
- Exports the `App` component as the default export. 