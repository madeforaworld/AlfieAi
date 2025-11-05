import { Building2, LayoutDashboard, TrendingUp, Bell, User } from 'lucide-react';
import { Button } from './ui/button';

interface NavigationProps {
  currentView: string;
  onViewChange: (view: string) => void;
}

export function Navigation({ currentView, onViewChange }: NavigationProps) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'insights', label: 'Insights', icon: TrendingUp },
    { id: 'alerts', label: 'Alerts', icon: Bell },
    { id: 'compare', label: 'Compare', icon: Building2 },
  ];

  return (
    <nav className="border-b border-gray-200 bg-white">
      <div className="max-w-[1600px] mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <button 
            onClick={() => onViewChange('dashboard')}
            className="flex items-center gap-2"
          >
            <Building2 className="w-6 h-6 text-[#007AFF]" />
            <span className="tracking-tight">AlfieAI</span>
          </button>
          
          <div className="flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onViewChange(item.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    isActive 
                      ? 'bg-gray-100 text-black' 
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <Button variant="ghost" size="icon" onClick={() => onViewChange('account')}>
          <User className="w-5 h-5" />
        </Button>
      </div>
    </nav>
  );
}
