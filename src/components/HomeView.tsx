import React from "react";
import { Sparkles, ArrowRight, Flame, Award, Heart, MessageCircle, RefreshCw, History } from "lucide-react";
import { UserProfile, PartnerInfo, Scenario } from "../types";
import { MandarinDuckMascot } from "./MandarinDuckMascot";

interface HomeViewProps {
  user: UserProfile;
  partner: PartnerInfo;
  currentScenario: Scenario;
  onStartLesson: (scenario?: Scenario) => void;
  onOpenPartnerEdit: () => void;
  onOpenTitleGuide: () => void;
  onOpenRecentAnswers: () => void;
  onGenerateCustomScenario: () => void;
  isGeneratingCustom: boolean;
  recentCount?: number;
}

export const HomeView: React.FC<HomeViewProps> = ({
  user,
  partner,
  currentScenario,
  onStartLesson,
  onOpenPartnerEdit,
  onOpenTitleGuide,
  onOpenRecentAnswers,
  onGenerateCustomScenario,
  isGeneratingCustom,
  recentCount = 0,
}) => {
  const xpPercentage = Math.min(
    100,
    Math.round((user.currentXp / Math.max(1, user.xpToNextLevel)) * 100)
  );

  return (
    <div className="space-y-5 pb-24 max-w-xl mx-auto px-4 pt-3">
      {/* Top Couple Artwork Hero Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-rose-50/80 via-white to-pink-50/40 border border-rose-100/90 shadow-sm p-6 text-center">
        <div className="flex justify-center mb-3">
          <MandarinDuckMascot variant="couple" size="lg" className="drop-shadow-sm" />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100/80 text-rose-800 text-xs font-semibold mb-2">
          <Sparkles className="w-3.5 h-3.5 text-rose-500" />
          <span>LOVE & EMPATHY COACHING</span>
        </div>

        <h1 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
          그대의 마음을 <span className="text-rose-900 font-extrabold">unlock</span>
        </h1>
        <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
          연인의 사소한 감정 한 조각도 놓치지 않는<br />
          Gemini AI 기반 1:1 맞춤형 공감 훈련
        </p>

        {/* Action Button: Start Practice & Recent Answers */}
        <div className="mt-5 flex flex-col sm:flex-row items-center justify-center gap-2.5">
          <button
            onClick={() => onStartLesson(currentScenario)}
            className="w-full sm:w-auto px-7 py-3.5 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white font-bold text-sm sm:text-base rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 active:scale-[0.98] cursor-pointer"
          >
            <span>오늘의 공감 연습 시작하기</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            id="btn-home-recent-answers"
            onClick={onOpenRecentAnswers}
            className="w-full sm:w-auto px-5 py-3.5 bg-white hover:bg-rose-50 border border-rose-200 text-slate-700 font-bold text-sm rounded-2xl shadow-xs transition-all flex items-center justify-center gap-2 active:scale-[0.98] cursor-pointer"
          >
            <History className="w-4 h-4 text-purple-600" />
            <span>최근 답변 20개 ({recentCount})</span>
          </button>
        </div>
      </div>

      {/* Partner Info Quick Banner */}
      <div className="bg-white rounded-2xl p-4 border border-rose-100 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
            <Heart className="w-5 h-5 fill-rose-500 text-rose-500" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-400 font-medium">연인 맞춤 모드</span>
              <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-pink-100 text-pink-700">
                {partner.mbti || "MBTI 미설정"}
              </span>
            </div>
            <p className="text-sm font-bold text-slate-800">
              {partner.name ? `${partner.name} 맞춤 코칭 중` : "연인 정보를 등록해주세요"}
            </p>
          </div>
        </div>
        <button
          onClick={onOpenPartnerEdit}
          className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-600 text-xs font-semibold transition-colors"
        >
          {partner.name ? "정보 수정" : "설정하기"}
        </button>
      </div>

      {/* Level & XP Progress Card (Matching Screenshot style) */}
      <div className="bg-white rounded-3xl p-5 border border-purple-100 shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              CURRENT LEVEL
            </span>
            <h3 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
              <span>{user.currentTitle}</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-rose-100 text-rose-600">
                Lv.{user.level}
              </span>
            </h3>
          </div>
          <div className="text-right">
            <span className="text-xs font-medium text-slate-400">Next: 다음 레벨</span>
            <p className="text-xs font-bold text-rose-600">
              {user.currentXp} / {user.xpToNextLevel} XP
            </p>
          </div>
        </div>

        {/* Progress Bar with ruby glow */}
        <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden p-0.5">
          <div
            className="h-full bg-gradient-to-r from-rose-500 to-pink-500 rounded-full transition-all duration-500"
            style={{ width: `${xpPercentage}%` }}
          />
        </div>

        <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
          <span>문제 해결 시 Gemini 점수에 따라 XP 획득!</span>
          <button
            onClick={onOpenTitleGuide}
            className="text-rose-600 font-semibold hover:underline"
          >
            타이틀 가이드 &gt;
          </button>
        </div>
      </div>

      {/* Stats Grid: Streak & Points */}
      <div className="grid grid-cols-2 gap-3">
        {/* Streak */}
        <div className="bg-emerald-50/90 rounded-3xl p-4 border border-emerald-200 shadow-xs flex flex-col items-center justify-center text-center">
          <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center mb-1 text-emerald-600">
            <Flame className="w-4 h-4 text-emerald-600 fill-emerald-600" />
          </div>
          <span className="text-xs font-bold text-emerald-800">오늘의 스트릭</span>
          <span className="text-xl font-extrabold text-emerald-900 mt-0.5">
            {user.streakDays}일
          </span>
        </div>

        {/* Total Points */}
        <div className="bg-amber-50/90 rounded-3xl p-4 border border-amber-200 shadow-xs flex flex-col items-center justify-center text-center">
          <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center mb-1 text-amber-600">
            <Award className="w-4 h-4 text-amber-600 fill-amber-600" />
          </div>
          <span className="text-xs font-bold text-amber-800">총 획득 점수</span>
          <span className="text-xl font-extrabold text-amber-900 mt-0.5">
            {user.totalPoints.toLocaleString()}P
          </span>
        </div>
      </div>

      {/* Custom AI Scenario Generator */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-3xl p-5 border border-purple-100 shadow-xs">
        <div className="flex items-start justify-between">
          <div>
            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-200 text-purple-800 text-[11px] font-bold mb-1">
              <Sparkles className="w-3 h-3 text-purple-600" />
              <span>Gemini AI 맞춤 생성</span>
            </div>
            <h4 className="text-base font-bold text-slate-800">
              {partner.name || "연인"} 맞춤 특별 상황 생성
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              등록된 연인의 MBTI({partner.mbti || "설정"})와 특징에 맞는 새로운 시나리오를 AI가 즉시 만듭니다.
            </p>
          </div>
        </div>

        <button
          onClick={onGenerateCustomScenario}
          disabled={isGeneratingCustom}
          className="mt-3.5 w-full py-2.5 bg-white hover:bg-purple-50 border border-purple-200 text-purple-700 font-bold text-sm rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isGeneratingCustom ? "animate-spin" : ""}`} />
          <span>{isGeneratingCustom ? "상황 생성 중..." : "새로운 맞춤 상황 생성하기"}</span>
        </button>
      </div>
    </div>
  );
};
