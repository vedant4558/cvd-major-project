import { Outlet, useNavigate, useLocation } from 'react-router';
import { Button } from './ui/button';
import {
  LayoutDashboard,
  Upload,
  User,
  Microscope,
  Brain,
  Eye,
  Menu,
  X,
  Sun,
  Moon,
} from 'lucide-react';
import { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';

export default function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { resolvedTheme, toggleTheme } = useTheme();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/app/dashboard' },
    { icon: Upload, label: 'Upload Image', path: '/app/upload' },
    { icon: User, label: 'Patient Details', path: '/app/patient-details' },
    { icon: Microscope, label: 'Image Analysis', path: '/app/image-analysis' },
    { icon: Brain, label: 'Explainable AI', path: '/app/explainability' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-[#f7f8ff] dark:bg-[#0c1121]">
      {/* Top Header */}
      <header className="bg-white dark:bg-[#141d30] border-b border-[rgba(99,120,210,0.13)] dark:border-[rgba(148,163,220,0.12)] sticky top-0 z-40 shadow-sm dark:shadow-[0_1px_3px_rgba(0,0,0,0.4)]">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X /> : <Menu />}
            </Button>
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-teal-400 rounded-xl flex items-center justify-center shadow-md">
                <Eye className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-semibold text-gray-900 dark:text-white">CardioVision AI</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="text-gray-600 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-white/10 rounded-xl"
              title="Toggle theme"
            >
              {resolvedTheme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/')}
              className="border-[rgba(99,120,210,0.2)] dark:border-[rgba(148,163,220,0.2)] text-gray-700 dark:text-gray-300 dark:hover:bg-white/10"
            >
              Exit
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`
            fixed lg:sticky top-[73px] left-0 h-[calc(100vh-73px)] w-64
            bg-[#edf0ff] dark:bg-[#0f1829]
            border-r border-[rgba(99,120,210,0.15)] dark:border-[rgba(148,163,220,0.1)]
            transition-transform duration-300 z-30 flex flex-col
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          `}
        >
          <nav className="p-4 space-y-1 flex-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.path}
                  variant={isActive(item.path) ? 'default' : 'ghost'}
                  className={`w-full justify-start rounded-xl ${
                    isActive(item.path)
                      ? 'bg-gradient-to-r from-blue-500 to-teal-400 text-white shadow-md hover:shadow-lg'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-[#dde3ff] dark:hover:bg-white/10'
                  }`}
                  onClick={() => {
                    navigate(item.path);
                    setSidebarOpen(false);
                  }}
                >
                  <Icon className="w-5 h-5 mr-3 flex-shrink-0" />
                  {item.label}
                </Button>
              );
            })}
          </nav>

          {/* Workflow hint at bottom of sidebar */}
          <div className="p-4">
            <div className="p-3 bg-white/60 dark:bg-white/5 rounded-xl border border-[rgba(99,120,210,0.12)] dark:border-white/10">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-500 uppercase tracking-wide mb-2">Workflow</p>
              <div className="space-y-1 text-xs text-gray-500 dark:text-gray-500">
                {['Patient Details', 'Upload Image', 'Image Analysis', 'Explainable AI', 'Download Report'].map((s, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                      {i + 1}
                    </span>
                    <span>{s}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-20 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 p-6 lg:p-8 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
