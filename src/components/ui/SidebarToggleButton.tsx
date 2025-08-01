import { PanelLeft } from 'lucide-react';
import { useSidebar } from './sidebar';

export function SidebarToggleButton() {
  const { toggleSidebar } = useSidebar();
  return (
    <button
      onClick={toggleSidebar}
      aria-label="Open sidebar"
      style={{ position: 'fixed', top: 16, left: 16, zIndex: 10000 }}
      className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg shadow-lg focus:outline-none"
    >
      <PanelLeft className="h-7 w-7" />
    </button>
  );
}