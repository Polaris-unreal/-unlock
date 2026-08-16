import React, { useState } from "react";
import {
  Trophy,
  CheckCircle2,
  Heart,
  Flame,
  Star,
  Lock,
  MessageCircle,
  Compass,
  ShieldAlert,
  Headphones,
  Sparkles,
  LogOut,
  Mail,
  ShieldCheck,
  UserCheck,
  History,
  Database,
} from "lucide-react";
import { UserProfile, PartnerInfo, Badge } from "../types";
import { TITLE_GUIDE } from "../data/titlesAndBadges";

interface ProfileViewProps {
  user: UserProfile;
  partner: PartnerInfo;
  onOpenAuth: () => void;
  onOpenPartnerEdit: () => void;
  onOpenRecentAnswers: () => void;
  onOpenTitleGuide?: () => void;
  onLogout?: () => void;
  onGoogleSignIn?: () => void;
  onEmailSignIn?: () => void;
  recentCount?: number;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  user,
  partner,
  onOpenAuth,
  onOpenPartnerEdit,
  onOpenRecentAnswers,
  onOpenTitleGuide,
  onLogout,
  onGoogleSignIn,
  onEmailSignIn,
  recentCount = 0,
}) => {
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);

  const isLoggedIn = Boolean(user.isGoogleConnected && user.email && user.email !== "guest@heartsync.app");
  const currentLevel = user.level || 1;

  // Calculate highest unlocked title level based on current level
  const highestUnlockedLevel = Math.max(
    ...TITLE_GUIDE.filter((t) => currentLevel >= t.level).map((t) => t.level),
    1
  );

  const getBadgeIcon = (iconName: string, unlocked: boolean) => {
    if (!unlocked) {
      return <Lock className="w-5 h-5 text-slate-400" />;
    }
    switch (iconName) {
      case "MessageCircle":
        return <MessageCircle className="w-5 h-5 text-rose-500" />;
      case "Compass":
        return <Compass className="w-5 h-5 text-teal-600" />;
      case "ShieldHeart":
        return <ShieldCheck className="w-5 h-5 text-purple-600" />;
      case "Headphones":
        return <Headphones className="w-5 h-5 text-amber-500" />;
      case "Sparkles":
        return <Sparkles className="w-5 h-5 text-amber-500" />;
      default:
        return <Heart className="w-5 h-5 text-rose-500" />;
    }
  };

  const finalGoalPercentage = Math.min(100, Math.round((user.level / 15) * 100));

  return (
    <div className="space-y-4 pb-28 max-w-xl mx-auto px-4 pt-2">
      {/* 0. Login Status & Direct Auth Actions Banner (Image 17 style) */}
      {!isLoggedIn ? (
        <div className="bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 rounded-3xl p-5 border-2 border-rose-200 shadow-sm text-center space-y-3 animate-in fade-in">
          <div className="flex items-center justify-center gap-2">
            <div className="w-9 h-9 rounded-2xl bg-rose-500 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="text-left">
              <h3 className="text-sm font-extrabold text-slate-900">
                로그인하고 공감 훈련 기록을 저장하세요
              </h3>
              <p className="text-[11px] text-slate-500">
                Firebase 계정을 연동하면 스트릭과 배지가 안전하게 동기화됩니다.
              </p>
            </div>
          </div>

          {/* Action Buttons: Google Login & Email Signup */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            <button
              id="btn-profile-google-login"
              onClick={onGoogleSignIn || onOpenAuth}
              className="py-3 px-4 rounded-2xl border-2 border-rose-200 hover:border-rose-300 bg-white hover:bg-rose-50 text-slate-800 font-bold text-xs sm:text-sm transition-all shadow-xs flex items-center justify-center gap-2.5 active:scale-98 cursor-pointer"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Google 로그인</span>
            </button>

            <button
              id="btn-profile-email-signup"
              onClick={onEmailSignIn || onOpenAuth}
              className="py-3 px-4 rounded-2xl bg-[#B10838] hover:bg-[#96062f] text-white font-bold text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
            >
              <Mail className="w-4 h-4" />
              <span>이메일 회원가입</span>
            </button>
          </div>
        </div>
      ) : (
        /* Logged in notification banner with clear Logout button */
        <div className="bg-emerald-50/80 rounded-2xl p-3.5 border border-emerald-200 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-xs">
              <UserCheck className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-xs font-extrabold text-emerald-900 block truncate">
                {user.email} 연동 중
              </span>
              <div className="flex items-center gap-1 text-[10px] text-emerald-700 font-medium">
                <Database className="w-3 h-3 text-emerald-600 shrink-0" />
                <span>Firestore DB 실시간 저장 & 동기화 활성화</span>
              </div>
            </div>
          </div>

          <button
            id="btn-profile-top-logout"
            onClick={onLogout}
            className="px-3 py-1.5 rounded-xl bg-white hover:bg-rose-50 border border-emerald-300 text-rose-700 hover:text-rose-800 text-xs font-bold transition-colors flex items-center gap-1 shadow-2xs cursor-pointer shrink-0"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>로그아웃</span>
          </button>
        </div>
      )}

      {/* 1. User Profile Header Card (Image 10 & 19 style) */}
      <div className="text-center pt-2">
        <div className="relative inline-block">
          {/* User Photo */}
          <div className="w-24 h-24 sm:w-28 sm:h-28 mx-auto rounded-full bg-gradient-to-tr from-rose-200 to-teal-200 p-1 shadow-md">
            <img
              src={user.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80"}
              alt={user.name}
              className="w-full h-full object-cover rounded-full bg-white"
              referrerPolicy="no-referrer"
            />
          </div>
          {/* Verified green checkmark badge */}
          <div className="absolute bottom-0 right-1 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xs border-2 border-white">
            <CheckCircle2 className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* User Name & Handle */}
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight mt-2.5">
          {user.name}
        </h2>
        <p className="text-xs text-slate-500 font-medium">
          {user.username}
        </p>

        {/* Current Title Pill (Image 10 & 19) */}
        <button
          onClick={onOpenTitleGuide}
          className="mt-2.5 inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-rose-200 bg-rose-50/90 hover:bg-rose-100/90 text-slate-800 text-xs font-bold shadow-2xs transition-all cursor-pointer group"
          title="공감 칭호 & 레벨 가이드 열기"
        >
          <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500 group-hover:scale-110 transition-transform" />
          <span>Lv {currentLevel}. {user.currentTitle || "소통 신생아"}</span>
          <span className="text-[10px] text-rose-600 font-extrabold underline ml-0.5">가이드</span>
        </button>

        {/* Gmail Sync Status */}
        <div className="mt-2 flex items-center justify-center gap-1.5 text-xs text-slate-600">
          <Mail className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-medium text-slate-600">{user.email}</span>
          {isLoggedIn ? (
            <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700">
              구글 연동됨
            </span>
          ) : (
            <button
              onClick={onOpenAuth}
              className="text-rose-600 font-bold hover:underline cursor-pointer"
            >
              연동하기
            </button>
          )}
        </div>
      </div>

      {/* 2. Final Goal / Next Title Progress Card (Image 19 style) */}
      <div className="bg-white rounded-3xl p-5 border border-rose-100 shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              FINAL GOAL
            </span>
            <h3 className="text-lg font-extrabold text-slate-900">
              Lv 15. 공감의 신
            </h3>
          </div>
          <div className="flex items-center gap-1 text-xs font-extrabold text-rose-600">
            <Flame className="w-4 h-4 text-rose-500 fill-rose-500" />
            <span>{finalGoalPercentage}%</span>
          </div>
        </div>

        {/* Crimson Progress Bar */}
        <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden p-0.5 mb-2">
          <div
            className="h-full bg-gradient-to-r from-rose-600 to-pink-500 rounded-full transition-all duration-700"
            style={{ width: `${finalGoalPercentage}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>{currentLevel >= 15 ? "최고 레벨에 도달했습니다!" : `최종 목표까지 ${Math.max(0, 15 - currentLevel)} 레벨 남음`}</span>
          <span className="font-semibold text-rose-600">{user.currentXp || 0} / {user.xpToNextLevel || 100} XP</span>
        </div>
      </div>

      {/* 3. Title Guide (Image 19 style) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-base font-extrabold text-slate-900">
            타이틀 가이드
          </h3>
          {onOpenTitleGuide && (
            <button
              onClick={onOpenTitleGuide}
              className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-0.5 cursor-pointer"
            >
              <span>상세 가이드</span>
              <Sparkles className="w-3 h-3 text-rose-500" />
            </button>
          )}
        </div>

        <div className="bg-white rounded-3xl p-4 border border-rose-100 shadow-xs space-y-2">
          {TITLE_GUIDE.map((item) => {
            const isCurrent = item.level === highestUnlockedLevel;
            const isUnlocked = currentLevel >= item.level;
            const isLocked = !isUnlocked;

            return (
              <div
                key={item.level}
                onClick={onOpenTitleGuide}
                className={`py-2.5 px-3 rounded-2xl flex items-center justify-between transition-all cursor-pointer ${
                  isCurrent
                    ? "bg-rose-50/95 border border-rose-300 ring-1 ring-rose-200 shadow-2xs"
                    : isUnlocked
                    ? "bg-emerald-50/40 border border-emerald-100"
                    : "bg-slate-50/60 opacity-60 border border-dashed border-slate-200"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[11px] font-black px-2 py-0.5 rounded-md ${
                      isCurrent
                        ? "bg-rose-500 text-white"
                        : isUnlocked
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    Lv {item.level}
                  </span>

                  <span
                    className={`text-xs font-extrabold ${
                      item.isFinal
                        ? "text-amber-800 font-black"
                        : isCurrent
                        ? "text-[#B10838]"
                        : isUnlocked
                        ? "text-slate-800"
                        : "text-slate-500"
                    }`}
                  >
                    {item.title}
                  </span>
                </div>

                {isCurrent ? (
                  <span className="text-[10px] font-extrabold text-rose-700 bg-rose-200/80 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Heart className="w-2.5 h-2.5 fill-rose-600 text-rose-600" />
                    현재 칭호
                  </span>
                ) : isUnlocked ? (
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                    <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                    획득 완료
                  </span>
                ) : (
                  <span className="text-[10px] font-semibold text-slate-400 flex items-center gap-1">
                    <Lock className="w-2.5 h-2.5" />
                    Lv.{item.level} 필요
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Stats Grid: Streak & Score (Image 10 & 19) */}
      <div className="grid grid-cols-2 gap-3">
        {/* Streak card (Green) */}
        <div className="bg-[#5EEAD4]/30 rounded-3xl p-4 border-2 border-slate-900 shadow-xs flex flex-col items-center justify-center text-center">
          <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center mb-1 text-emerald-800">
            <Flame className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold text-slate-800">오늘의 스트릭</span>
          <span className="text-2xl font-extrabold text-slate-900 mt-0.5">
            {user.streakDays}일
          </span>
        </div>

        {/* Score card (Amber) */}
        <div className="bg-[#FDE68A]/40 rounded-3xl p-4 border-2 border-slate-900 shadow-xs flex flex-col items-center justify-center text-center">
          <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center mb-1 text-amber-800">
            <Star className="w-4 h-4 fill-amber-600 text-amber-600" />
          </div>
          <span className="text-xs font-bold text-slate-800">총 획득 점수</span>
          <span className="text-2xl font-extrabold text-slate-900 mt-0.5">
            {user.totalPoints.toLocaleString()}P
          </span>
        </div>
      </div>

      {/* 5. Badge Collection (Image 10 & 19) */}
      <div className="space-y-2">
        <h3 className="text-base font-extrabold text-slate-900 px-1">
          배지 컬렉션
        </h3>

        <div className="grid grid-cols-3 gap-2.5">
          {user.badges.map((badge) => (
            <button
              key={badge.id}
              onClick={() => setSelectedBadge(badge)}
              className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center ${
                badge.unlocked
                  ? "bg-white border-rose-200 shadow-xs hover:scale-105 active:scale-95"
                  : "bg-slate-50/80 border-dashed border-slate-300 opacity-60"
              }`}
            >
              <div
                className={`w-11 h-11 rounded-2xl flex items-center justify-center mb-1.5 ${
                  badge.unlocked ? "bg-rose-50" : "bg-slate-200"
                }`}
              >
                {getBadgeIcon(badge.iconName, badge.unlocked)}
              </div>
              <span className="text-[11px] font-bold text-slate-800 leading-tight">
                {badge.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Badge Details Dialog */}
      {selectedBadge && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full text-center shadow-xl border border-rose-100 animate-in fade-in zoom-in-95">
            <div className="w-16 h-16 mx-auto rounded-3xl bg-rose-50 border border-rose-100 flex items-center justify-center mb-3">
              {getBadgeIcon(selectedBadge.iconName, selectedBadge.unlocked)}
            </div>
            <h4 className="text-lg font-extrabold text-slate-900">
              {selectedBadge.name}
            </h4>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              {selectedBadge.description}
            </p>
            <div className="mt-3">
              {selectedBadge.unlocked ? (
                <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full">
                  달성 완료 ✔
                </span>
              ) : (
                <span className="inline-block px-3 py-1 bg-slate-100 text-slate-500 text-xs font-bold rounded-full">
                  잠금 상태 (문제를 해결하여 획득)
                </span>
              )}
            </div>
            <button
              onClick={() => setSelectedBadge(null)}
              className="mt-5 w-full py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold"
            >
              닫기
            </button>
          </div>
        </div>
      )}

      {/* Quick Settings, Recent Answers & Partner edit triggers */}
      <div className="pt-2 space-y-2">
        <button
          id="btn-profile-recent-answers"
          onClick={onOpenRecentAnswers}
          className="w-full py-3.5 bg-gradient-to-r from-purple-50 via-pink-50 to-rose-50 hover:from-purple-100 hover:to-rose-100 border border-purple-200 text-purple-900 font-extrabold text-xs sm:text-sm rounded-2xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
        >
          <History className="w-4 h-4 text-purple-600" />
          <span>최근 제출한 답변 20개 내역 확인하기 ({recentCount})</span>
        </button>

        <button
          onClick={onOpenPartnerEdit}
          className="w-full py-3 bg-white hover:bg-rose-50 border border-rose-200 text-rose-700 font-bold text-xs rounded-2xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
          <span>연인 정보 & 성향 설문 다시 수정하기</span>
        </button>

        {isLoggedIn && (
          <button
            id="btn-profile-bottom-logout"
            onClick={onLogout}
            className="w-full py-3 bg-slate-50 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 text-slate-600 hover:text-rose-700 font-bold text-xs rounded-2xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-slate-500" />
            <span>계정 로그아웃 ({user.email})</span>
          </button>
        )}
      </div>
    </div>
  );
};
