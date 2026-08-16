import React, { useState } from "react";
import { ArrowLeft, Sparkles, Send, Heart, User, Bot, RefreshCw } from "lucide-react";
import { EvaluationResult, PartnerInfo, Scenario, ChatMessage } from "../types";
import { MandarinDuckMascot } from "./MandarinDuckMascot";

interface AdviceViewProps {
  result: EvaluationResult | null;
  partner: PartnerInfo;
  currentScenario: Scenario;
  onBack: () => void;
  onNext: () => void;
}

export const AdviceView: React.FC<AdviceViewProps> = ({
  result,
  partner,
  currentScenario,
  onBack,
  onNext,
}) => {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "bot-welcome",
      role: "model",
      text: `안녕하세요! 원앙 AI 연애 코치입니다. 연인 '${partner.name || "연인"}'(${partner.mbti || "성향 맞춤"})님과의 대화에서 더 궁금한 점이나 다른 상황에서의 멘트가 고민되시면 언제든 물어보세요! 💕`,
      timestamp: Date.now(),
    },
  ]);
  const [inputMsg, setInputMsg] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);

  // Default values if opened without evaluation
  const userAns =
    result?.userResponse || "오늘 하루 정말 고생 많았어, 맛있는 거 먹으러 가자!";
  const aiAnal =
    result?.aiAnalysis ||
    "정말 좋은 공감이에요! 상대방의 지친 마음을 인정해주셨습니다. 조금 더 구체적으로 상대의 노력을 칭찬하고 감싸주면 최고의 답변이 됩니다.";
  const recAns =
    result?.recommendedResponse ||
    `"오늘 하루 정말 고생 많았어. 네가 얼마나 열심히 했는지 내가 다 아는데 속상하다. 이따가 내가 제일 맛있는 거 사줄게!"`;

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim() || isChatLoading) return;

    const userText = inputMsg.trim();
    setInputMsg("");
    const newMsg: ChatMessage = {
      id: "msg-" + Date.now(),
      role: "user",
      text: userText,
      timestamp: Date.now(),
    };

    setChatMessages((prev) => [...prev, newMsg]);
    setIsChatLoading(true);

    try {
      const res = await fetch("/api/chat-advice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userText,
          history: chatMessages.slice(-6).map((m) => ({ role: m.role, text: m.text })),
          partnerInfo: partner,
          currentScenario,
        }),
      });
      const data = await res.json();

      setChatMessages((prev) => [
        ...prev,
        {
          id: "bot-" + Date.now(),
          role: "model",
          text: data.reply || "연인의 마음에 귀를 기울여보세요! 💕",
          timestamp: Date.now(),
        },
      ]);
    } catch {
      setChatMessages((prev) => [
        ...prev,
        {
          id: "bot-" + Date.now(),
          role: "model",
          text: `연인 '${partner.name || "연인"}'님에게는 "네 편이야"라는 확신을 주는 말이 가장 큰 위로가 됩니다. 조금 더 다정하고 부드러운 어조로 진심을 전해보세요!`,
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const sampleQuestions = [
    "애교 섞인 버전으로 추천해줘",
    `내 연인(${partner.mbti || "MBTI"})이 심쿵할 포인트는?`,
    "이럴 때 선물이나 서프라이즈 팁은?",
  ];

  return (
    <div className="space-y-4 pb-28 max-w-xl mx-auto px-4 pt-2">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between py-1">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-slate-600 hover:text-slate-900 font-bold text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>그대의 마음을 unlock</span>
        </button>
      </div>

      {/* Avatar Circle with Pinkish Glow (Image 3 style) */}
      <div className="text-center pt-2">
        <div className="relative inline-block">
          <div className="w-32 h-32 mx-auto rounded-full bg-white p-2 shadow-sm border border-rose-100 flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-pink-200/40 to-rose-100/40 rounded-full" />
            <MandarinDuckMascot variant="couple" size="md" className="scale-90 relative z-10" />
          </div>
          <div className="absolute -bottom-1 right-2 w-7 h-7 rounded-full bg-rose-500 text-white flex items-center justify-center text-xs shadow-xs">
            <Heart className="w-4 h-4 fill-white" />
          </div>
        </div>

        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight mt-3">
          AI의 따뜻한 조언
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          당신의 마음에 한 걸음 더 다가가봐요.
        </p>
      </div>

      {/* 1. 나의 답변 Card (Image 3 White Card) */}
      <div className="bg-white rounded-2xl p-4.5 border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 mb-2">
          <User className="w-3.5 h-3.5 text-slate-400" />
          <span>나의 답변</span>
        </div>
        <p className="text-sm sm:text-base font-semibold text-slate-800 italic">
          "{userAns}"
        </p>
      </div>

      {/* 2. AI 분석 Card (Image 3 Lavender Card) */}
      <div className="bg-[#EDE9FE] rounded-2xl p-4.5 border border-purple-200/70 shadow-xs">
        <div className="flex items-center gap-1.5 text-xs font-bold text-purple-900 mb-2">
          <Sparkles className="w-3.5 h-3.5 text-purple-700" />
          <span>AI 분석</span>
          {result?.score && (
            <span className="ml-auto px-2 py-0.5 rounded-full bg-purple-200/80 text-purple-900 text-[11px] font-extrabold">
              공감도 {result.score}점
            </span>
          )}
        </div>
        <p className="text-sm sm:text-base font-medium text-purple-950 leading-relaxed">
          {aiAnal}
        </p>
      </div>

      {/* 3. 추천 답변 Card (Image 3 Rose Card) */}
      <div className="bg-[#FFE4E6] rounded-2xl p-4.5 border border-rose-200/70 shadow-xs">
        <div className="flex items-center gap-1.5 text-xs font-bold text-rose-900 mb-2">
          <Heart className="w-3.5 h-3.5 fill-rose-600 text-rose-600" />
          <span>추천 답변</span>
          {partner.name && (
            <span className="text-[11px] text-rose-700 font-normal">
              ({partner.name} 맞춤)
            </span>
          )}
        </div>
        <p className="text-sm sm:text-base font-bold text-rose-950 leading-relaxed">
          {recAns}
        </p>
      </div>

      {/* Next Button (Image 3 Style Pink Button) */}
      <div className="pt-2">
        <button
          onClick={onNext}
          className="w-full py-3.5 bg-[#F472B6] hover:bg-[#ec4899] text-white font-bold text-base rounded-full shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-2 active:scale-98"
        >
          <span>다음으로 &gt;</span>
        </button>
      </div>

      {/* 4. Interactive Gemini Relationship Chatbot Section */}
      <div className="mt-6 pt-5 border-t border-slate-200/80 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Bot className="w-4 h-4 text-purple-600" />
            <h3 className="text-sm font-bold text-slate-800">
              Gemini 연애 멘토와 실시간 대화
            </h3>
          </div>
          <span className="text-[11px] text-slate-400">1:1 코칭 중</span>
        </div>

        {/* Chat History Box */}
        <div className="bg-white rounded-3xl p-4 border border-slate-200 max-h-72 overflow-y-auto space-y-3">
          {chatMessages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-2.5 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "model" && (
                <div className="w-7 h-7 rounded-full bg-purple-100 flex items-center justify-center shrink-0 text-xs">
                  <span>🦆</span>
                </div>
              )}
              <div
                className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-rose-600 text-white rounded-tr-xs"
                    : "bg-slate-100 text-slate-800 rounded-tl-xs"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {isChatLoading && (
            <div className="flex gap-2.5 items-center text-xs text-slate-400">
              <div className="w-7 h-7 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-purple-600" />
              </div>
              <span>Gemini 코치가 답변을 작성 중입니다...</span>
            </div>
          )}
        </div>

        {/* Quick Prompts */}
        <div className="flex flex-wrap gap-1.5">
          {sampleQuestions.map((q, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setInputMsg(q)}
              className="text-[11px] px-2.5 py-1 rounded-full bg-purple-50 hover:bg-purple-100 text-purple-700 font-medium transition-colors"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Chat Input */}
        <form onSubmit={handleSendChat} className="flex gap-2">
          <input
            type="text"
            value={inputMsg}
            onChange={(e) => setInputMsg(e.target.value)}
            placeholder="연인에 대해 궁금한 점을 질문해보세요..."
            className="flex-1 px-4 py-2.5 rounded-2xl bg-white border border-slate-300 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-rose-400 focus:ring-1 focus:ring-rose-200"
          />
          <button
            type="submit"
            disabled={!inputMsg.trim() || isChatLoading}
            className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 disabled:bg-slate-200 text-white disabled:text-slate-400 rounded-2xl text-xs font-bold transition-colors flex items-center justify-center shadow-xs"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
