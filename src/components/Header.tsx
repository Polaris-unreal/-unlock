import React from "react";
import { Settings, Sparkles, CheckCircle2, Heart, History } from "lucide-react";
import { UserProfile, PartnerInfo } from "../types";

interface HeaderProps {
  user: UserProfile;
  partner: PartnerInfo;
  onOpenSettings: () => void;
  onOpenAuth: () => void;
  onOpenPartnerEdit: () => void;
  onOpenRecentAnswers: () => void;
  onOpenTitleGuide?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  partner,
  onOpenSettings,
  onOpenAuth,
  onOpenPartnerEdit,
  onOpenRecentAnswers,
  onOpenTitleGuide,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-rose-100 shadow-xs px-4 py-3">
      <div className="max-w-3xl mx-auto flex items-center justify-between">
        {/* Left: App Title / Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-rose-400 via-pink-400 to-amber-300 p-0.5 shadow-sm flex items-center justify-center">
            <div className="w-full h-full bg-white rounded-full flex items-center justify-center">
              <span className="text-base font-bold text-rose-500">🦆</span>
            </div>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-medium text-slate-700 tracking-tight">그대의 마음을</span>
              <span className="text-sm font-bold text-rose-900 tracking-tight lowercase">unlock</span>
            </div>
            {partner.name && (
              <button
                onClick={onOpenPartnerEdit}
                className="text-[11px] text-rose-500/90 font-medium flex items-center gap-1 hover:underline text-left"
              >
                <Heart className="w-2.5 h-2.5 fill-rose-400 text-rose-400" />
                <span>{partner.name} ({partner.mbti || "성향 맞춤"}) 코칭 중</span>
              </button>
            )}
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* Recent Answers 20 History Button */}
          <button
            id="btn-header-recent-answers"
            onClick={onOpenRecentAnswers}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 text-xs font-bold transition-all shadow-2xs cursor-pointer"
            title="최근 답변 기록 (최대 20개)"
          >
            <History className="w-3.5 h-3.5 text-purple-600" />
            <span className="hidden sm:inline">최근 답변</span>
          </button>

          {/* Gmail Connect Badge */}
          {user.isGoogleConnected ? (
            <button
              onClick={onOpenAuth}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium hover:bg-emerald-100 transition-colors"
              title={`연동된 계정: ${user.email}`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span className="max-w-[110px] truncate">{user.email.split("@")[0]}</span>
            </button>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-600 text-xs font-semibold hover:bg-rose-100 transition-colors"
            >
              <Sparkles className="w-3 h-3 text-rose-500" />
              <span>Gmail 연동</span>
            </button>
          )}

          {/* Level Pill - Clickable to open Title Guide */}
          <button
            onClick={onOpenTitleGuide}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 text-slate-800 text-xs font-bold transition-all cursor-pointer"
            title="공감 칭호 & 레벨 가이드 보기"
          >
            <span className="text-[#B10838] font-extrabold">Lv.{user.level}</span>
            <span className="text-slate-600 font-medium hidden md:inline">{user.currentTitle}</span>
          </button>

          {/* Settings button */}
          <button
            onClick={onOpenSettings}
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors"
            aria-label="설정"
          >
            <Settings className="w-4 h-4 text-slate-600" />
          </button>
        </div>
      </div>
    </header>
  );
};
