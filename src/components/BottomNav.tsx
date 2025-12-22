import { LucideIcon } from 'lucide-react';

interface Tab {
  id: string;
  label: string;
  icon?: LucideIcon;
  customContent?: React.ReactNode;
  badgeCount?: number;
  isActive?: boolean;
}

interface BottomNavProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function BottomNav({ tabs, activeTab, onTabChange }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-transparent border-t border-emerald-100/30 z-50">
      <div className="max-w-2xl mx-auto px-8">
        <div className="flex justify-around items-center h-20">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = tab.isActive !== undefined ? tab.isActive : activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`relative flex flex-col items-center justify-center gap-1 flex-1 h-full transition-all duration-300 ${
                  isActive ? 'text-emerald-600' : 'text-gray-400'
                }`}
              >
                {isActive && (
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-2xl mx-2" />
                )}
                <div className={`relative z-10 transition-all duration-300 ${isActive ? 'scale-110' : 'scale-100'}`}>
                  <div className={`p-2 rounded-2xl transition-all duration-300 ${ isActive ? 'bg-gradient-to-br from-emerald-600 to-teal-600 shadow-lg shadow-emerald-500/30' : ''
                  }`}>
                    {tab.customContent ? (
                      <div className={`w-8 h-8 flex items-center justify-center ${isActive ? 'text-white' : ''}`}>
                        {tab.customContent}
                      </div>
                    ) : Icon ? (
                      <Icon className={`w-8 h-8 ${isActive ? 'text-white' : ''}`} />
                    ) : null}
                  </div>
                  {tab.badgeCount !== undefined && tab.badgeCount > 0 && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full flex items-center justify-center text-white text-xs shadow-lg">
                      {tab.badgeCount}
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}