import React from "react";
import { X, Trophy, Heart, Sparkles, CheckCircle2, Lock, ArrowUpRight } from "lucide-react";
import { TITLE_GUIDE } from "../data/titlesAndBadges";
import { UserProfile } from "../types";

interface TitleGuideModalProps {
  user: UserProfile;
  onClose: () => void;
}

export const TitleGuideModal: React.FC<TitleGuideModalProps> = ({ user, onClose }) => {
  const currentLevel = user.level || 1;
  const currentXp = user.currentXp || 0;
  const xpToNextLevel = user.xpToNextLevel || 100;
  const progressPercent = Math.min(100, Math.round((currentXp / Math.max(1, xpToNextLevel)) * 100));

  // Determine highest unlocked title level for user
  const highestUnlockedLevel = Math.max(
    ...TITLE_GUIDE.filter((t) => currentLevel >= t.level).map((t) => t.level),
    1
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white w-full max-w-lg rounded-[36px] shadow-2xl border border-rose-100 overflow-hidden relative p-6 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-rose-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-500 flex items-center justify-center text-white shadow-xs">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                공감 칭호 & 레벨 가이드
              </h3>
              <p className="text-xs text-slate-500">
                실제 유저 레벨에 따라 칭호가 자동으로 해금 및 적용됩니다
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="닫기"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Current User Status Banner */}
        <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-rose-50 via-pink-50 to-amber-50 border border-rose-200 shadow-2xs shrink-0">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-xl bg-[#B10838] text-white text-xs font-black shadow-xs">
                내 현재 Lv.{currentLevel}
              </span>
              <span className="text-sm font-extrabold text-slate-900 flex items-center gap-1">
                <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                {user.currentTitle || "소통 신생아"}
              </span>
            </div>
            <span className="text-xs font-bold text-rose-700">
              {currentXp} / {xpToNextLevel} XP
            </span>
          </div>

          {/* XP Progress Bar */}
          <div className="w-full h-2.5 bg-rose-200/50 rounded-full overflow-hidden p-0.5">
            <div
              className="h-full bg-gradient-to-r from-rose-600 to-pink-500 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex justify-between items-center mt-1.5 text-[11px] text-slate-500 font-medium">
            <span>다음 레벨(Lv.{currentLevel + 1})까지 {Math.max(0, xpToNextLevel - currentXp)} XP 남음</span>
            <span className="font-bold text-rose-600">{progressPercent}%</span>
          </div>
        </div>

        {/* Scrollable List of Titles */}
        <div className="py-4 space-y-3 overflow-y-auto flex-1 pr-1">
          {TITLE_GUIDE.map((item) => {
            const isCurrent = item.level === highestUnlockedLevel;
            const isUnlocked = currentLevel >= item.level;
            const isLocked = !isUnlocked;

            return (
              <div
                key={item.level}
                className={`p-4 rounded-2xl border transition-all ${
                  isCurrent
                    ? "bg-rose-50/90 border-rose-300 ring-2 ring-rose-300/60 shadow-xs"
                    : isUnlocked
                    ? "bg-emerald-50/40 border-emerald-200/80"
                    : "bg-slate-50/70 border-dashed border-slate-200 opacity-65"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-black px-2.5 py-0.5 rounded-lg ${
                        isCurrent
                          ? "bg-rose-500 text-white shadow-2xs"
                          : isUnlocked
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      Lv.{item.level}
                    </span>
                    <h4
                      className={`text-sm font-extrabold ${
                        isCurrent
                          ? "text-rose-950 font-black"
                          : isUnlocked
                          ? "text-slate-900"
                          : "text-slate-500"
                      }`}
                    >
                      {item.title}
                    </h4>
                  </div>

                  {/* Status Badge */}
                  {isCurrent ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-rose-700 bg-rose-200/80 px-2.5 py-0.5 rounded-full shadow-2xs">
                      <Sparkles className="w-3 h-3 text-rose-600" />
                      현재 적용 중
                    </span>
                  ) : isUnlocked ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      획득 완료
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 bg-slate-200/80 px-2 py-0.5 rounded-full">
                      <Lock className="w-3 h-3 text-slate-400" />
                      Lv.{item.level} 달성 시 해금
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-600 leading-snug pl-0.5">
                  {item.description}
                </p>

                {isLocked && (
                  <div className="mt-2 text-[10px] text-slate-400 font-medium flex items-center justify-between border-t border-slate-200/50 pt-1.5">
                    <span>잠김 상태</span>
                    <span>필요 레벨: Lv.{item.level} (기준: {item.minXp} XP)</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-100 shrink-0">
          <button
            onClick={onClose}
            className="w-full py-3 bg-[#B10838] hover:bg-[#96062f] text-white font-bold text-sm rounded-2xl transition-all shadow-md active:scale-98 cursor-pointer"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
};
