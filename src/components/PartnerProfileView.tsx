import React, { useState } from "react";
import { Heart, Brain, Sparkles, Check, ThumbsUp, ThumbsDown, Info } from "lucide-react";
import { PartnerInfo } from "../types";
import { MandarinDuckMascot } from "./MandarinDuckMascot";

interface PartnerProfileViewProps {
  partner: PartnerInfo;
  onSavePartner: (updated: PartnerInfo) => void;
  onClose?: () => void;
}

const MBTI_LIST = [
  "ENFP", "ENFJ", "ENTP", "ENTJ",
  "INFP", "INFJ", "INTP", "INTJ",
  "ESFP", "ESFJ", "ESTP", "ESTJ",
  "ISFP", "ISFJ", "ISTP", "ISTJ",
];

export const PartnerProfileView: React.FC<PartnerProfileViewProps> = ({
  partner,
  onSavePartner,
  onClose,
}) => {
  const [name, setName] = useState(partner.name || "");
  const [mbti, setMbti] = useState(partner.mbti || "ENFP");
  const [traits, setTraits] = useState(
    partner.traits || "다정하고 감성적이지만 서운한 게 있으면 혼자 삭히는 편이에요. 맛있는 디저트와 진심 어린 편지를 좋아합니다."
  );

  const [preferences, setPreferences] = useState({
    isIntrovert: partner.preferences?.isIntrovert ?? true,
    likesSurprise: partner.preferences?.likesSurprise ?? true,
    isMorningPerson: partner.preferences?.isMorningPerson ?? false,
    expressesDirectly: partner.preferences?.expressesDirectly ?? false,
    needsAloneTimeWhenUpset: partner.preferences?.needsAloneTimeWhenUpset ?? true,
  });

  const [isSavedToast, setIsSavedToast] = useState(false);

  const handleTogglePref = (key: keyof typeof preferences, value: boolean) => {
    setPreferences((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSavePartner({
      name: name.trim() || "연인",
      mbti: mbti.trim().toUpperCase(),
      traits: traits.trim(),
      preferences,
    });
    setIsSavedToast(true);
    setTimeout(() => {
      setIsSavedToast(false);
      if (onClose) onClose();
    }, 1200);
  };

  return (
    <div className="space-y-5 pb-28 max-w-xl mx-auto px-4 pt-2">
      {/* 1. Header with Cute Mascot (Image 24 style) */}
      <div className="text-center relative pt-2">
        <div className="relative inline-block">
          <MandarinDuckMascot variant="waving_mascot" size="lg" className="scale-105" />

          {/* Speech bubble "환영합니다! 👋" (Image 24) */}
          <div className="absolute -top-1 -right-4 px-3 py-1 bg-white border border-rose-200 rounded-2xl shadow-xs text-xs font-bold text-slate-800 flex items-center gap-1">
            <span>환영합니다! 👋</span>
          </div>
        </div>
      </div>

      {/* 2. Main Form Card: "연인에 대해 알려주세요" (Image 24 style) */}
      <div className="bg-white rounded-3xl p-6 border border-rose-100 shadow-xs space-y-4">
        <div className="text-center">
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            연인에 대해 알려주세요
          </h2>
          <div className="flex items-center justify-center gap-1 text-xs text-slate-500 mt-1">
            <Info className="w-3.5 h-3.5 text-slate-400" />
            <span>이 정보는 Gemini 맞춤형 상황을 만드는 데 사용됩니다.</span>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4 pt-2">
          {/* Lover's Name / Pet Name */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              연인의 이름 / 애칭
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-rose-400">
                <Heart className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="애칭이나 이름을 적어주세요 (예: 지민이, 콩이)"
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white border border-rose-200 text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-rose-500 focus:ring-2 focus:ring-rose-100 transition-all"
                required
              />
            </div>
          </div>

          {/* MBTI Selector */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-800">
                MBTI (선택)
              </label>
              <span className="text-[11px] text-purple-600 font-semibold">
                현재 선택: {mbti}
              </span>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-purple-400">
                <Brain className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={mbti}
                onChange={(e) => setMbti(e.target.value.toUpperCase())}
                placeholder="예: ENFP"
                maxLength={4}
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white border border-purple-200 text-sm font-bold text-purple-900 placeholder:text-slate-400 focus:outline-hidden focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all uppercase"
              />
            </div>

            {/* Quick MBTI Pill Selector */}
            <div className="mt-2 flex flex-wrap gap-1.5 max-h-20 overflow-y-auto no-scrollbar">
              {MBTI_LIST.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setMbti(type)}
                  className={`text-[11px] px-2.5 py-1 rounded-lg font-bold transition-all ${
                    mbti === type
                      ? "bg-purple-600 text-white shadow-2xs scale-105"
                      : "bg-slate-100 hover:bg-purple-50 text-slate-600"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Partner Traits / Personality */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              연인의 주요 특징
            </label>
            <textarea
              value={traits}
              onChange={(e) => setTraits(e.target.value)}
              placeholder="어떤 성격인가요? 무엇을 좋아하나요? 서운할 때 어떤 반응을 보이나요?"
              rows={3}
              className="w-full px-4 py-3 rounded-2xl bg-white border border-rose-200 text-xs sm:text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-rose-500 focus:ring-2 focus:ring-rose-100 transition-all resize-none leading-relaxed"
            />
          </div>

          {/* 3. "연인 성향 파악하기" Yes/No Quiz Cards (Image 12 style) */}
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <div className="text-center mb-2">
              <h3 className="text-base font-extrabold text-slate-800">
                연인 성향 파악하기
              </h3>
              <p className="text-xs text-slate-500">
                간단한 질문에 답하고 연인의 마음을 더 깊이 이해해 보세요.
              </p>
            </div>

            {/* Q1: 내향적? */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
              <p className="text-xs font-bold text-slate-800 mb-2">
                1. 연인은 내향적인 편인가요?
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleTogglePref("isIntrovert", true)}
                  className={`py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all ${
                    preferences.isIntrovert
                      ? "bg-white border-rose-400 text-rose-700 shadow-xs ring-1 ring-rose-200"
                      : "bg-white/60 border-slate-200 text-slate-600 hover:bg-white"
                  }`}
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                  <span>네</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleTogglePref("isIntrovert", false)}
                  className={`py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all ${
                    !preferences.isIntrovert
                      ? "bg-white border-rose-400 text-rose-700 shadow-xs ring-1 ring-rose-200"
                      : "bg-white/60 border-slate-200 text-slate-600 hover:bg-white"
                  }`}
                >
                  <ThumbsDown className="w-3.5 h-3.5" />
                  <span>아니오</span>
                </button>
              </div>
            </div>

            {/* Q2: 서프라이즈? */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
              <p className="text-xs font-bold text-slate-800 mb-2">
                2. 서프라이즈 이벤트를 좋아하나요?
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleTogglePref("likesSurprise", true)}
                  className={`py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all ${
                    preferences.likesSurprise
                      ? "bg-white border-rose-400 text-rose-700 shadow-xs ring-1 ring-rose-200"
                      : "bg-white/60 border-slate-200 text-slate-600 hover:bg-white"
                  }`}
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                  <span>네</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleTogglePref("likesSurprise", false)}
                  className={`py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all ${
                    !preferences.likesSurprise
                      ? "bg-white border-rose-400 text-rose-700 shadow-xs ring-1 ring-rose-200"
                      : "bg-white/60 border-slate-200 text-slate-600 hover:bg-white"
                  }`}
                >
                  <ThumbsDown className="w-3.5 h-3.5" />
                  <span>아니오</span>
                </button>
              </div>
            </div>

            {/* Q3: 아침형? */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
              <p className="text-xs font-bold text-slate-800 mb-2">
                3. 아침형 인간인가요?
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleTogglePref("isMorningPerson", true)}
                  className={`py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all ${
                    preferences.isMorningPerson
                      ? "bg-white border-rose-400 text-rose-700 shadow-xs ring-1 ring-rose-200"
                      : "bg-white/60 border-slate-200 text-slate-600 hover:bg-white"
                  }`}
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                  <span>네</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleTogglePref("isMorningPerson", false)}
                  className={`py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all ${
                    !preferences.isMorningPerson
                      ? "bg-white border-rose-400 text-rose-700 shadow-xs ring-1 ring-rose-200"
                      : "bg-white/60 border-slate-200 text-slate-600 hover:bg-white"
                  }`}
                >
                  <ThumbsDown className="w-3.5 h-3.5" />
                  <span>아니오</span>
                </button>
              </div>
            </div>

            {/* Q4: 혼자만의 시간? */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
              <p className="text-xs font-bold text-slate-800 mb-2">
                4. 화가 났을 때 혼자만의 시간이 필요한가요?
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleTogglePref("needsAloneTimeWhenUpset", true)}
                  className={`py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all ${
                    preferences.needsAloneTimeWhenUpset
                      ? "bg-white border-rose-400 text-rose-700 shadow-xs ring-1 ring-rose-200"
                      : "bg-white/60 border-slate-200 text-slate-600 hover:bg-white"
                  }`}
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                  <span>네</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleTogglePref("needsAloneTimeWhenUpset", false)}
                  className={`py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all ${
                    !preferences.needsAloneTimeWhenUpset
                      ? "bg-white border-rose-400 text-rose-700 shadow-xs ring-1 ring-rose-200"
                      : "bg-white/60 border-slate-200 text-slate-600 hover:bg-white"
                  }`}
                >
                  <ThumbsDown className="w-3.5 h-3.5" />
                  <span>아니오</span>
                </button>
              </div>
            </div>
          </div>

          {/* Submit Button (Image 24 Crimson Button) */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-4 bg-[#B10838] hover:bg-[#96062f] text-white font-bold text-base rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 active:scale-98"
            >
              {isSavedToast ? (
                <>
                  <Check className="w-5 h-5" />
                  <span>연인 정보 저장 완료!</span>
                </>
              ) : (
                <>
                  <span>저장하고 맞춤 훈련 시작하기 &gt;</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
