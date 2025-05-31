import { useState } from 'react';
import { Users, Share2, User, Mail } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Playlist } from '@/types/playlist';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  playlist: Playlist;
  onInvite: (updatedPlaylist: Playlist) => void;
}

const InviteModal = ({ isOpen, onClose, playlist, onInvite }: InviteModalProps) => {
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteUsername, setInviteUsername] = useState('');
  const [isPublic, setIsPublic] = useState(playlist.isPublic || false);
  const [activeTab, setActiveTab] = useState<'username' | 'email'>('username');

  const handleInviteUser = () => {
    if (activeTab === 'email') {
      if (!inviteEmail.trim()) {
        toast.error('Please enter an email address');
        return;
      }

      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(inviteEmail)) {
        toast.error('Please enter a valid email address');
        return;
      }

      // Check if user is already invited
      const isAlreadyInvited = playlist.invitedUsers?.some(user => user.email === inviteEmail);
      if (isAlreadyInvited) {
        toast.error('User is already invited');
        return;
      }

      // Ensure all existing invited users have the username field
      const existingInvitedUsers = (playlist.invitedUsers || []).map(user => ({
        ...user,
        username: user.username || user.email.split('@')[0] // Fallback to email username if missing
      }));

      const updatedPlaylist: Playlist = {
        ...playlist,
        invitedUsers: [
          ...existingInvitedUsers,
          {
            email: inviteEmail,
            username: inviteEmail.split('@')[0], // Use email username as default
            status: 'pending' as const,
            invitedAt: new Date().toISOString()
          }
        ]
      };

      onInvite(updatedPlaylist);
      setInviteEmail('');
    } else {
      if (!inviteUsername.trim()) {
        toast.error('Please enter a username');
        return;
      }

      // Username validation (alphanumeric and underscore only)
      const usernameRegex = /^[a-zA-Z0-9_]+$/;
      if (!usernameRegex.test(inviteUsername)) {
        toast.error('Username can only contain letters, numbers, and underscores');
        return;
      }

      // Check if user is already invited
      const isAlreadyInvited = playlist.invitedUsers?.some(user => user.username === inviteUsername);
      if (isAlreadyInvited) {
        toast.error('User is already invited');
        return;
      }

      // Ensure all existing invited users have the username field
      const existingInvitedUsers = (playlist.invitedUsers || []).map(user => ({
        ...user,
        username: user.username || user.email.split('@')[0] // Fallback to email username if missing
      }));

      const updatedPlaylist: Playlist = {
        ...playlist,
        invitedUsers: [
          ...existingInvitedUsers,
          {
            email: `${inviteUsername}@placeholder.com`, // Placeholder email for username-only invites
            username: inviteUsername,
            status: 'pending' as const,
            invitedAt: new Date().toISOString()
          }
        ]
      };

      onInvite(updatedPlaylist);
      setInviteUsername('');
    }
    onClose();
    toast.success('Invitation sent successfully');
  };

  const togglePublicAccess = () => {
    const updatedPlaylist: Playlist = {
      ...playlist,
      isPublic: !isPublic
    };

    onInvite(updatedPlaylist);
    setIsPublic(!isPublic);
    toast.success(updatedPlaylist.isPublic ? 'Playlist is now public' : 'Playlist is now private');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Invite to Playlist</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Tabs defaultValue="username" value={activeTab} onValueChange={(value) => setActiveTab(value as 'username' | 'email')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="username" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Username
              </TabsTrigger>
              <TabsTrigger value="email" className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email
              </TabsTrigger>
            </TabsList>
            <TabsContent value="username" className="mt-4">
              <div className="grid gap-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  placeholder="Enter username"
                  value={inviteUsername}
                  onChange={(e) => setInviteUsername(e.target.value)}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Username can only contain letters, numbers, and underscores
                </p>
              </div>
            </TabsContent>
            <TabsContent value="email" className="mt-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter email address"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                />
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex items-center justify-between">
            <Label htmlFor="public-access" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Public Access
            </Label>
            <Switch
              id="public-access"
              checked={isPublic}
              onCheckedChange={togglePublicAccess}
            />
          </div>

          {playlist.invitedUsers && playlist.invitedUsers.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium mb-2">Invited Users</h4>
              <div className="space-y-2">
                {playlist.invitedUsers.map((user, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <div className="flex flex-col">
                      <span className="text-gray-800 dark:text-gray-200 font-medium">{user.username}</span>
                      {user.email !== `${user.username}@placeholder.com` && (
                        <span className="text-gray-600 dark:text-gray-400 text-xs">{user.email}</span>
                      )}
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      user.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      user.status === 'accepted' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {user.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleInviteUser}>
            Send Invitation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default InviteModal; 