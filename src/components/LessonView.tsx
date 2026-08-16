import React, { useState } from "react";
import { Send, Lightbulb, Sparkles, ChevronRight, Mic, MicOff, RefreshCw, Heart } from "lucide-react";
import { Scenario, PartnerInfo } from "../types";

interface LessonViewProps {
  scenario: Scenario;
  partner: PartnerInfo;
  allScenarios: Scenario[];
  onSelectScenario: (scenario: Scenario) => void;
  onSubmitResponse: (userAnswer: string) => Promise<void>;
  isSubmitting: boolean;
  onGenerateNewScenario: () => void;
  isGeneratingNew: boolean;
}

export const LessonView: React.FC<LessonViewProps> = ({
  scenario,
  partner,
  allScenarios,
  onSelectScenario,
  onSubmitResponse,
  isSubmitting,
  onGenerateNewScenario,
  isGeneratingNew,
}) => {
  const [response, setResponse] = useState("");
  const [showHint, setShowHint] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!response.trim() || isSubmitting) return;
    await onSubmitResponse(response.trim());
  };

  // Quick preset template phrases to help inspiration
  const quickTemplates = [
    "오늘 하루 정말 고생 많았어, 내 마음이 다 속상하다.",
    "많이 힘들었지? 내가 곁에서 든든하게 들어줄게.",
    "속상했겠다 ㅠㅠ 맛있는 거 먹으면서 다 털어내자!",
  ];

  // Speech to Text support
  const handleVoiceToggle = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("현재 브라우저에서는 음성 인식을 지원하지 않습니다. 텍스트로 입력해주세요.");
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = "ko-KR";
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setResponse((prev) => (prev ? `${prev} ${transcript}` : transcript));
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  // Replace partner placeholder in dialogue with actual partner name if any
  const displayedDialogue = scenario.partnerDialogue.replace(/연인/g, partner.name || "자기");

  return (
    <div className="space-y-4 pb-28 max-w-xl mx-auto px-4 pt-2">
      {/* 1. Main Situation Description Card (Image 6 Top Card) */}
      <div className="bg-white rounded-3xl p-5 border-2 border-slate-900 shadow-xs">
        <div className="flex items-center gap-2 mb-3">
          <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-800 text-xs font-bold">
            {scenario.category}
          </span>
          <span className="text-xs font-medium text-slate-500">{scenario.step}</span>
        </div>

        <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight mb-2">
          {scenario.title}
        </h2>
        <p className="text-sm text-slate-600 leading-relaxed">
          {scenario.description}
        </p>
      </div>

      {/* 2. Partner Dialogue Bubble Card (Image 6 Middle Card) */}
      <div className="bg-slate-100/90 rounded-3xl p-5 border border-slate-200 shadow-xs">
        <div className="flex items-start gap-3.5">
          {/* Partner Avatar */}
          <div className="relative shrink-0">
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-pink-200 to-rose-200 border-2 border-white shadow-xs flex items-center justify-center text-lg">
              <span>{partner.name ? "💑" : "🧑‍💼"}</span>
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center text-[10px]">
              <Heart className="w-3 h-3 fill-white" />
            </div>
          </div>

          {/* Dialogue Speech Bubble */}
          <div className="flex-1 bg-white rounded-2xl p-4 shadow-xs border border-slate-100 relative">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-slate-700">
                {partner.name || "연인"}
              </span>
              <span className="text-[10px] text-slate-400">방금 전</span>
            </div>
            <p className="text-sm sm:text-base font-semibold text-slate-800 leading-snug">
              "{displayedDialogue}"
            </p>
          </div>
        </div>
      </div>

      {/* 3. User Empathy Answer Input Area (Image 6 Bottom Input) */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="bg-white rounded-3xl p-4 border border-purple-100 shadow-xs focus-within:border-purple-300 focus-within:ring-2 focus-within:ring-purple-100 transition-all">
          <div className="relative">
            <textarea
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              placeholder="공감하는 대답을 직접 입력해 보세요"
              rows={3}
              className="w-full resize-none bg-transparent outline-hidden text-sm sm:text-base text-slate-800 placeholder:text-slate-400 placeholder:font-normal font-medium leading-relaxed pr-14"
            />

            {/* Circular Send / Submit Button (Image 6 style) */}
            <div className="absolute bottom-1 right-1 flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleVoiceToggle}
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
                  isListening ? "bg-red-500 text-white animate-pulse" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                }`}
                title="음성으로 입력하기"
              >
                {isListening ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
              </button>

              <button
                type="submit"
                disabled={!response.trim() || isSubmitting}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-md active:scale-95 ${
                  response.trim() && !isSubmitting
                    ? "bg-[#883d5a] hover:bg-[#6f2e46] text-white"
                    : "bg-slate-200 text-slate-400 cursor-not-allowed"
                }`}
                aria-label="답변 제출"
              >
                {isSubmitting ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5 fill-current ml-0.5" />
                )}
              </button>
            </div>
          </div>

          {/* Subtext and Hint trigger */}
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>진심이 담긴 짧은 문장도 좋아요.</span>
            <button
              type="button"
              onClick={() => setShowHint(!showHint)}
              className="text-rose-600 font-semibold flex items-center gap-1 hover:underline"
            >
              <Lightbulb className="w-3.5 h-3.5 text-rose-500" />
              <span>{showHint ? "힌트 닫기" : "힌트 보기"}</span>
            </button>
          </div>

          {/* Expandable Hint */}
          {showHint && (
            <div className="mt-2.5 p-3 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 leading-relaxed animate-in fade-in slide-in-from-top-1">
              <div className="font-bold flex items-center gap-1 mb-1">
                <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
                <span>Gemini 코치의 공감 팁</span>
              </div>
              <p>{scenario.hint}</p>
              {partner.mbti && (
                <p className="mt-1 text-amber-700 font-medium">
                  👉 연인({partner.name || "연인"})의 MBTI가 <span className="font-bold">{partner.mbti}</span>이므로 정서적 공감과 진정성 있는 인정을 특히 좋아합니다.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Quick Suggestion Chips */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-bold text-slate-400 px-1">추천 공감 예시 (터치하여 입력)</span>
          <div className="flex flex-wrap gap-1.5">
            {quickTemplates.map((tpl, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setResponse(tpl)}
                className="text-xs px-3 py-1.5 rounded-full bg-white border border-rose-100 hover:border-rose-300 hover:bg-rose-50 text-slate-700 font-medium transition-all shadow-2xs text-left"
              >
                "{tpl}"
              </button>
            ))}
          </div>
        </div>
      </form>

      {/* 4. Scenario Selector Carousel / List */}
      <div className="pt-3 border-t border-slate-200/80">
        <div className="flex items-center justify-between mb-2.5 px-1">
          <span className="text-xs font-bold text-slate-700">다른 상황 퀘스트</span>
          <button
            onClick={onGenerateNewScenario}
            disabled={isGeneratingNew}
            className="text-xs text-rose-600 font-bold flex items-center gap-1 hover:underline disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isGeneratingNew ? "생성 중..." : "AI 새 상황 생성"}</span>
          </button>
        </div>

        <div className="space-y-2">
          {allScenarios.map((sc) => {
            const isSelected = sc.id === scenario.id;
            return (
              <button
                key={sc.id}
                onClick={() => onSelectScenario(sc)}
                className={`w-full text-left p-3 rounded-2xl border transition-all flex items-center justify-between ${
                  isSelected
                    ? "bg-rose-50/90 border-rose-300 shadow-xs ring-1 ring-rose-200"
                    : "bg-white border-slate-200 hover:border-rose-200"
                }`}
              >
                <div className="flex-1 pr-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {sc.category}
                    </span>
                    <span className="text-xs font-bold text-slate-800 truncate">
                      {sc.title}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">
                    "{sc.partnerDialogue}"
                  </p>
                </div>
                <ChevronRight className={`w-4 h-4 shrink-0 ${isSelected ? "text-rose-600" : "text-slate-400"}`} />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
