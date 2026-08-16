import React from "react";
import { Home, BookOpen, MessageSquareHeart, User } from "lucide-react";

export type TabType = "home" | "lessons" | "advice" | "profile";

interface BottomNavProps {
  activeTab: TabType;
  onChangeTab: (tab: TabType) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onChangeTab }) => {
  const navItems = [
    { id: "home" as TabType, label: "Home", subLabel: "홈", icon: Home },
    { id: "lessons" as TabType, label: "Lessons", subLabel: "레슨", icon: BookOpen },
    { id: "advice" as TabType, label: "AI Advice", subLabel: "AI 조언", icon: MessageSquareHeart },
    { id: "profile" as TabType, label: "Profile", subLabel: "프로필", icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-rose-100/80 shadow-[0_-4px_20px_rgba(0,0,0,0.03)] py-1.5 px-4">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onChangeTab(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all duration-200 ${
                isActive
                  ? item.id === "profile"
                    ? "bg-emerald-100/90 text-emerald-800 font-bold shadow-xs scale-105"
                    : "bg-purple-100/90 text-purple-900 font-bold shadow-xs scale-105"
                  : "text-slate-500 hover:text-slate-800 font-medium"
              }`}
            >
              <Icon
                className={`w-5 h-5 mb-0.5 transition-transform ${
                  isActive ? "scale-110" : "scale-100"
                }`}
              />
              <span className="text-[11px] leading-tight font-medium">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
