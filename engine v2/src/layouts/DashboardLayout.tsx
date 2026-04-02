import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, UserCircle, FileText, Compass, Sparkles, Loader2, RefreshCw, GraduationCap, Award, ClipboardList, MessageSquare, Landmark, Map, Gift, ShieldCheck, LogOut } from 'lucide-react';
import { useDashboard } from '../contexts/DashboardContext';
import { auth, signOut } from '../firebase';

export const DashboardLayout: React.FC = () => {
  const { profile, loading, triggerRefresh } = useDashboard();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen space-y-4 bg-surface">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="text-on-surface-variant font-medium">Loading Career Engine...</p>
      </div>
    );
  }

  const navGroups = [
    {
      title: 'Core',
      items: [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard, path: '/dashboard' },
        { id: 'roadmap', label: 'Roadmap', icon: Map, path: '/dashboard/roadmap' },
        { id: 'guidance', label: 'Guidance', icon: Compass, path: '/dashboard/guidance' },
        { id: 'analysis', label: 'Mark Sheets', icon: FileText, path: '/dashboard/analysis' },
      ]
    },
    {
      title: 'Career Prep',
      items: [
        { id: 'resume', label: 'Resume', icon: GraduationCap, path: '/dashboard/resume' },
        { id: 'interview', label: 'Interview Coach', icon: MessageSquare, path: '/dashboard/interview' },
        { id: 'mocktest', label: 'Mock Test', icon: ClipboardList, path: '/dashboard/mocktest' },
      ]
    },
    {
      title: 'Opportunities',
      items: [
        { id: 'scholarships', label: 'Scholarships', icon: Award, path: '/dashboard/scholarships' },
        { id: 'exams', label: 'Exams', icon: ClipboardList, path: '/dashboard/exams' },
        { id: 'govt', label: 'Govt Jobs', icon: Landmark, path: '/dashboard/govt' },
      ]
    },
    {
      title: 'Gamification',
      items: [
        { id: 'rewards', label: 'Rewards', icon: Gift, path: '/dashboard/rewards' },
        { id: 'verification', label: 'Verification', icon: ShieldCheck, path: '/dashboard/verification' },
      ]
    }
  ];

  return (
    <div className="flex h-screen bg-surface overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-surface-container-lowest border-r border-outline-variant/20 flex flex-col h-full overflow-y-auto custom-scrollbar">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
              <Sparkles className="w-6 h-6 text-on-primary" />
            </div>
            <span className="font-headline font-extrabold text-xl tracking-tight text-on-surface">Margdarshak</span>
          </div>

          {profile && (
            <div className="mb-8 p-4 bg-surface-container-low rounded-2xl border border-surface-container-high">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
                  <UserCircle className="w-6 h-6" />
                </div>
                <div className="overflow-hidden">
                  <p className="font-headline font-bold text-on-surface truncate">{profile.displayName || 'Aspirant'}</p>
                  <p className="text-xs text-on-surface-variant truncate">{profile.ambition || 'Setting Goals'}</p>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs font-label font-bold uppercase tracking-widest text-primary">
                <span>Lvl {profile.level || 1}</span>
                <span>{profile.points || 0} pts</span>
              </div>
            </div>
          )}

          <nav className="space-y-8">
            {navGroups.map((group, idx) => (
              <div key={idx}>
                <h4 className="text-[10px] font-label font-bold uppercase tracking-[0.2em] text-outline mb-3 px-2">{group.title}</h4>
                <div className="space-y-1">
                  {group.items.map(item => (
                    <NavLink
                      key={item.id}
                      to={item.path}
                      end={item.path === '/dashboard'}
                      className={({ isActive }) => 
                        `flex items-center gap-3 px-3 py-2.5 rounded-xl font-label font-bold text-sm transition-all ${
                          isActive 
                            ? 'bg-primary text-on-primary shadow-md shadow-primary/10' 
                            : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
                        }`
                      }
                    >
                      <item.icon className="w-4 h-4" />
                      {item.label}
                    </NavLink>
                  ))}
                </div>
              </div>
            ))}
          </nav>
        </div>
        
        <div className="mt-auto p-6 border-t border-outline-variant/20 space-y-2">
          <NavLink
            to="/dashboard/profile"
            className={({ isActive }) => 
              `flex items-center gap-3 px-3 py-2.5 rounded-xl font-label font-bold text-sm transition-all ${
                isActive 
                  ? 'bg-primary text-on-primary shadow-md shadow-primary/10' 
                  : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
              }`
            }
          >
            <UserCircle className="w-4 h-4" />
            Profile Settings
          </NavLink>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-label font-bold text-sm text-error hover:bg-error/10 transition-all"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 h-full overflow-y-auto bg-surface relative">
        <div className="absolute top-6 right-6 z-10">
          <button 
            onClick={triggerRefresh}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-container-lowest border border-outline-variant/20 text-on-surface-variant font-label font-bold text-xs uppercase tracking-wider hover:bg-surface-container-low transition-all shadow-sm"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
        <div className="p-8 md:p-12 max-w-6xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
