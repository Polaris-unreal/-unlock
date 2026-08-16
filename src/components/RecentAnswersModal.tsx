import React from "react";
import { X, History, Calendar, CheckCircle, AlertTriangle, XCircle, Heart, User, Sparkles } from "lucide-react";
import { EvaluationResult, PartnerInfo } from "../types";

interface RecentAnswersModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: EvaluationResult[];
  partner: PartnerInfo;
}

export const RecentAnswersModal: React.FC<RecentAnswersModalProps> = ({
  isOpen,
  onClose,
  history,
  partner,
}) => {
  if (!isOpen) return null;

  // Display up to 20 most recent answers
  const recent20 = history.slice(0, 20);

  const getScoreBadge = (score: number) => {
    if (score >= 90) {
      return (
        <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-xs flex items-center gap-1">
          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
          {score}점
        </span>
      );
    }
    if (score >= 75) {
      return (
        <span className="px-2.5 py-1 rounded-full bg-purple-100 text-purple-800 font-extrabold text-xs flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-purple-600" />
          {score}점
        </span>
      );
    }
    if (score >= 50) {
      return (
        <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 font-extrabold text-xs flex items-center gap-1">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
          {score}점
        </span>
      );
    }
    return (
      <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 font-extrabold text-xs flex items-center gap-1">
        <XCircle className="w-3.5 h-3.5 text-rose-600" />
        {score}점
      </span>
    );
  };

  const formatDate = (timestamp?: number) => {
    if (!timestamp) return "최근 기록";
    const date = new Date(timestamp);
    return date.toLocaleDateString("ko-KR", {
      month: "numeric",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div
      id="recent-answers-modal-overlay"
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
    >
      <div
        id="recent-answers-modal-content"
        className="bg-white rounded-3xl max-w-xl w-full max-h-[88vh] flex flex-col shadow-2xl border border-rose-100 overflow-hidden"
      >
        {/* Header */}
        <div className="p-5 border-b border-rose-100 flex items-center justify-between bg-gradient-to-r from-rose-50 via-pink-50 to-purple-50">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500 to-purple-600 text-white flex items-center justify-center shadow-xs">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <span>최근 답변 기록</span>
                <span className="text-xs font-bold text-rose-600 bg-rose-100/90 px-2.5 py-0.5 rounded-full">
                  최근 {recent20.length}개 / 최대 20개
                </span>
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                '{partner.name || "연인"}'님과의 공감 훈련 답변 및 AI 피드백 내역
              </p>
            </div>
          </div>

          <button
            id="btn-close-recent-answers"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/80 hover:bg-white text-slate-600 border border-slate-200 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 divide-y divide-slate-100">
          {recent20.length === 0 ? (
            <div className="py-16 text-center text-slate-400 space-y-3">
              <History className="w-12 h-12 mx-auto text-slate-300 stroke-1" />
              <p className="text-sm font-semibold">아직 제출한 답변 기록이 없습니다.</p>
              <p className="text-xs text-slate-400">
                홈 화면이나 레슨 탭에서 오늘의 공감 훈련을 진행해보세요!
              </p>
            </div>
          ) : (
            recent20.map((item, idx) => (
              <div
                key={item.timestamp || idx}
                id={`recent-answer-item-${idx}`}
                className="pt-4 first:pt-0 space-y-2.5"
              >
                {/* Top Row: Situation Title, Date & Score Badge */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-xs font-bold text-slate-400 shrink-0">
                      #{recent20.length - idx}
                    </span>
                    <span className="text-xs sm:text-sm font-extrabold text-slate-800 truncate">
                      {item.headline || "공감 훈련"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] text-slate-400 hidden sm:inline">
                      {formatDate(item.timestamp)}
                    </span>
                    {getScoreBadge(item.score)}
                  </div>
                </div>

                {/* User's actual Answer Bubble */}
                <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 text-xs sm:text-sm text-slate-800 font-medium leading-relaxed">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <User className="w-3 h-3 text-slate-500" />
                    <span>나의 답변</span>
                  </div>
                  <p className="whitespace-pre-wrap">"{item.userResponse}"</p>
                </div>

                {/* AI Coach Feedback Box */}
                <div className="bg-rose-50/60 border border-rose-100 rounded-2xl p-3 text-xs leading-relaxed space-y-1.5">
                  <div className="flex items-center gap-1 text-[11px] font-bold text-rose-700">
                    <Sparkles className="w-3 h-3 text-rose-500" />
                    <span>원앙 코치 총평</span>
                  </div>
                  <p className="text-slate-700 font-medium">{item.oneLinerFeedback}</p>

                  {item.rubricBreakdown && (
                    <div className="pt-2 border-t border-rose-100/70 grid grid-cols-4 gap-1 text-center text-[10px]">
                      <div className="bg-white/80 rounded-lg p-1">
                        <span className="text-slate-400 block">감정 수용</span>
                        <span className="font-bold text-slate-800">{item.rubricBreakdown.empathyScore}/30</span>
                      </div>
                      <div className="bg-white/80 rounded-lg p-1">
                        <span className="text-slate-400 block">조언 자제</span>
                        <span className="font-bold text-slate-800">{item.rubricBreakdown.solutionPacingScore}/25</span>
                      </div>
                      <div className="bg-white/80 rounded-lg p-1">
                        <span className="text-slate-400 block">연인 맞춤</span>
                        <span className="font-bold text-slate-800">{item.rubricBreakdown.personalizationScore}/25</span>
                      </div>
                      <div className="bg-white/80 rounded-lg p-1">
                        <span className="text-slate-400 block">온도감</span>
                        <span className="font-bold text-slate-800">{item.rubricBreakdown.warmthScore}/20</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-medium">
            총 {history.length}개의 훈련 완료
          </span>
          <button
            id="btn-confirm-recent-answers"
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all cursor-pointer shadow-sm"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
