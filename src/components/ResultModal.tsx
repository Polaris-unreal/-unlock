import React, { useEffect } from "react";
import { X, ArrowRight, Lightbulb, Star, MessageSquareHeart } from "lucide-react";
import confetti from "canvas-confetti";
import { EvaluationResult, UserProfile } from "../types";
import { MandarinDuckMascot } from "./MandarinDuckMascot";

interface ResultModalProps {
  result: EvaluationResult;
  user: UserProfile;
  onNextQuestion: () => void;
  onViewDetailedAdvice: () => void;
  onClose: () => void;
}

export const ResultModal: React.FC<ResultModalProps> = ({
  result,
  user,
  onNextQuestion,
  onViewDetailedAdvice,
  onClose,
}) => {
  // Fire confetti if high score
  useEffect(() => {
    if (result.score >= 75) {
      try {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 },
          colors: ["#FDA4AF", "#F43F5E", "#BE123C", "#FBBF24", "#34D399"],
        });
      } catch {
        // Safe fallback
      }
    }
  }, [result.score]);

  const xpPercentage = Math.min(
    100,
    Math.round((user.currentXp / Math.max(1, user.xpToNextLevel)) * 100)
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-[#F8FAFC] w-full max-w-md rounded-[36px] shadow-2xl border border-rose-100 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top bar with X button and Step Progress */}
        <div className="px-6 pt-5 pb-2 flex items-center justify-between">
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
            aria-label="닫기"
          >
            <X className="w-5 h-5 text-slate-600" />
          </button>

          {/* Progress capsule */}
          <div className="w-36 h-2.5 bg-emerald-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-400 rounded-full transition-all duration-700"
              style={{ width: `${Math.max(50, result.score)}%` }}
            />
          </div>

          <div className="w-9" />
        </div>

        {/* Scrollable Content */}
        <div className="p-6 pt-2 space-y-4 overflow-y-auto flex-1 text-center">
          {/* 1. Mascot Couple Frame (Image 1 / Image 21 style) */}
          <div className="relative mx-auto w-48 h-48 sm:w-52 sm:h-52 bg-gradient-to-b from-teal-50/40 via-amber-50/30 to-rose-50/50 rounded-3xl p-3 border border-rose-100/80 shadow-xs flex flex-col items-center justify-center">
            <MandarinDuckMascot variant="couple" size="md" className="scale-110" />

            <div className="mt-1">
              <span className="text-sm font-extrabold text-slate-700 tracking-wider">
                LOVE
              </span>
              <div className="flex items-center justify-center gap-1 text-xs font-bold text-emerald-600">
                <span>✔</span>
                <span>{result.score >= 80 ? "CORRECT!" : `${result.score}점`}</span>
              </div>
            </div>

            {/* Score Pill overlay */}
            <div className="absolute -top-2 -right-2 px-2.5 py-1 bg-rose-600 text-white rounded-full text-xs font-black shadow-md">
              {result.score}점
            </div>
          </div>

          {/* 2. Big Encouraging Headline Pill (Image 1 & 21: "참 잘했어요!") */}
          <div className="inline-block px-8 py-2.5 rounded-full border-2 border-rose-200/90 bg-white shadow-xs">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#A50A36] tracking-tight font-display">
              {result.headline}
            </h2>
          </div>

          {/* 3. Points Badge (+20 Points) */}
          <div>
            <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-emerald-300/80 text-emerald-950 font-extrabold text-sm shadow-xs">
              <Star className="w-4 h-4 fill-emerald-800 text-emerald-800" />
              <span>+{result.xpEarned || 20} Points</span>
            </div>
          </div>

          {/* 4. Quote Box with Red Lightbulb Icon (Image 1 style) */}
          <div className="relative mt-2 p-4 pt-5 rounded-3xl bg-white border border-rose-200/80 shadow-xs text-left">
            {/* Red circle with lightbulb */}
            <div className="absolute -top-3 left-4 w-7 h-7 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-xs">
              <Lightbulb className="w-4 h-4 text-white" />
            </div>

            <p className="text-sm sm:text-base font-medium text-slate-800 leading-relaxed">
              "{result.oneLinerFeedback}"
            </p>

            {result.partnerReactionComment && (
              <p className="mt-2 text-xs text-rose-500 font-semibold flex items-center gap-1">
                <span>💕 {result.partnerReactionComment}</span>
              </p>
            )}
          </div>

          {/* 5. Level Progress Card (Image 1 style) */}
          <div className="p-4 rounded-3xl bg-indigo-50/70 border border-indigo-100 text-left">
            <div className="flex items-center justify-between mb-2">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  CURRENT LEVEL
                </span>
                <h4 className="text-base font-extrabold text-slate-800">
                  {user.currentTitle}
                </h4>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold text-slate-500">Next: 다음 레벨</span>
                <p className="text-xs font-extrabold text-rose-600">
                  {user.currentXp} / {user.xpToNextLevel} XP
                </p>
              </div>
            </div>

            {/* Ruby progress bar */}
            <div className="w-full h-3 bg-slate-200/80 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-rose-600 to-pink-500 rounded-full transition-all duration-700"
                style={{ width: `${xpPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="p-5 pt-2 bg-[#F8FAFC] border-t border-slate-100 space-y-2">
          {/* Main Next Question button (Image 1 Crimson button) */}
          <button
            onClick={onNextQuestion}
            className="w-full py-4 bg-[#B10838] hover:bg-[#96062f] text-white font-bold text-base rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
          >
            <span>다음 문제로</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* Secondary AI Detailed Advice button */}
          <button
            onClick={onViewDetailedAdvice}
            className="w-full py-3 bg-white hover:bg-rose-50 border border-rose-200 text-rose-700 font-bold text-sm rounded-2xl transition-colors flex items-center justify-center gap-1.5"
          >
            <MessageSquareHeart className="w-4 h-4 text-rose-600" />
            <span>AI 맞춤 분석 및 추천 답변 보기</span>
          </button>
        </div>
      </div>
    </div>
  );
};
