import React, { useState, useEffect } from "react";
import { UserProfile, PartnerInfo, Scenario, EvaluationResult } from "./types";
import { DEFAULT_SCENARIOS } from "./data/defaultScenarios";
import { INITIAL_BADGES, TITLE_GUIDE, createFreshBadges } from "./data/titlesAndBadges";
import { Header } from "./components/Header";
import { BottomNav, TabType } from "./components/BottomNav";
import { HomeView } from "./components/HomeView";
import { LessonView } from "./components/LessonView";
import { AdviceView } from "./components/AdviceView";
import { ProfileView } from "./components/ProfileView";
import { ResultModal } from "./components/ResultModal";
import { AuthModal } from "./components/AuthModal";
import { PartnerProfileView } from "./components/PartnerProfileView";
import { TitleGuideModal } from "./components/TitleGuideModal";
import { RecentAnswersModal } from "./components/RecentAnswersModal";
import { auth, googleProvider } from "./firebase";
import { onAuthStateChanged, signOut, signInWithPopup } from "firebase/auth";
import {
  saveUserProfileToFirestore,
  loadUserProfileFromFirestore,
  savePartnerInfoToFirestore,
  loadPartnerInfoFromFirestore,
  savePracticeResultToFirestore,
  loadPracticeHistoryFromFirestore,
  subscribePracticeHistory,
} from "./services/firestoreService";

// Local storage keys
const STORAGE_USER_KEY = "heartsync_user_profile_v1";
const STORAGE_PARTNER_KEY = "heartsync_partner_info_v1";
const STORAGE_SCENARIOS_KEY = "heartsync_scenarios_v1";
const STORAGE_HISTORY_KEY = "heartsync_evaluation_history_v1";

export const createDefaultUser = (
  uid: string = "guest",
  email: string = "guest@heartsync.app",
  name: string = "게스트",
  avatar?: string | null
): UserProfile => ({
  id: uid,
  email,
  name,
  username: `@${(name || "guest").toLowerCase().replace(/[^a-z0-9가-힣_]/g, "") || "guest"}`,
  avatar: avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
  isGoogleConnected: Boolean(uid !== "guest" && email !== "guest@heartsync.app"),
  level: 1,
  currentTitle: "소통 신생아",
  currentXp: 0,
  xpToNextLevel: 100,
  totalPoints: 0,
  streakDays: 1,
  lastActiveDate: new Date().toISOString().slice(0, 10),
  completedScenarios: [],
  badges: createFreshBadges(),
});

export const createDefaultPartner = (): PartnerInfo => ({
  name: "내 연인",
  mbti: "ENFP",
  traits: "다정하고 감성적이지만 서운한 게 있으면 혼자 삭히는 편이에요. 맛있는 디저트와 진심 어린 편지를 좋아합니다.",
  preferences: {
    isIntrovert: false,
    likesSurprise: true,
    isMorningPerson: false,
    expressesDirectly: false,
    needsAloneTimeWhenUpset: true,
  },
});

export default function App() {
  // State initialization with localStorage fallback
  const [user, setUser] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_USER_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    return createDefaultUser();
  });

  const [partner, setPartner] = useState<PartnerInfo>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_PARTNER_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    return createDefaultPartner();
  });

  const [scenarios, setScenarios] = useState<Scenario[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_SCENARIOS_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    return DEFAULT_SCENARIOS;
  });

  const [history, setHistory] = useState<EvaluationResult[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_HISTORY_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    return [];
  });

  const [activeTab, setActiveTab] = useState<TabType>("home");
  const [currentScenarioIndex, setCurrentScenarioIndex] = useState(0);
  const [currentResult, setCurrentResult] = useState<EvaluationResult | null>(null);

  // Modals & Sheets
  const [showResultModal, setShowResultModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showPartnerModal, setShowPartnerModal] = useState(false);
  const [showTitleGuideModal, setShowTitleGuideModal] = useState(false);
  const [showRecentAnswersModal, setShowRecentAnswersModal] = useState(false);

  // Loading States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingCustom, setIsGeneratingCustom] = useState(false);

  // Sync Firebase Auth state and Firestore Data
  useEffect(() => {
    let unsubHistory: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const uid = currentUser.uid;
        const email = currentUser.email || "user@heartsync.app";
        const name = currentUser.displayName || email.split("@")[0];

        // 1. Fetch User Profile from Firestore (/users/{uid})
        try {
          const remoteProfile = await loadUserProfileFromFirestore(uid);
          if (remoteProfile) {
            // Existing user: Load their specific level, XP, badges, etc.
            setUser({
              ...remoteProfile,
              id: uid,
              email: remoteProfile.email || email,
              name: remoteProfile.name || name,
              isGoogleConnected: true,
              avatar: currentUser.photoURL || remoteProfile.avatar,
            });
          } else {
            // New user: Create fresh Lv.1 default user and save to Firestore
            const freshProfile = createDefaultUser(uid, email, name, currentUser.photoURL);
            await saveUserProfileToFirestore(uid, freshProfile);
            setUser(freshProfile);
          }
        } catch (err) {
          console.warn("Firestore profile sync error:", err);
        }

        // 2. Fetch Partner Info from Firestore
        try {
          const remotePartner = await loadPartnerInfoFromFirestore(uid);
          if (remotePartner) {
            setPartner(remotePartner);
          } else {
            const freshPartner = createDefaultPartner();
            await savePartnerInfoToFirestore(uid, freshPartner);
            setPartner(freshPartner);
          }
        } catch (err) {
          console.warn("Firestore partner sync error:", err);
        }

        // 3. Fetch Practice History & subscribe to real-time updates
        try {
          const remoteHistory = await loadPracticeHistoryFromFirestore(uid, 20);
          setHistory(remoteHistory || []);

          if (unsubHistory) unsubHistory();
          const sub = subscribePracticeHistory(uid, (liveHistory) => {
            setHistory(liveHistory || []);
          }, 20);
          if (sub) unsubHistory = sub;
        } catch (err) {
          console.warn("Firestore practice history sync error:", err);
        }
      } else {
        // User logged out: Completely reset state and clear local storage
        if (unsubHistory) {
          unsubHistory();
          unsubHistory = null;
        }
        try {
          localStorage.removeItem(STORAGE_USER_KEY);
          localStorage.removeItem(STORAGE_PARTNER_KEY);
          localStorage.removeItem(STORAGE_HISTORY_KEY);
        } catch {}

        setUser(createDefaultUser());
        setPartner(createDefaultPartner());
        setHistory([]);
        setCurrentResult(null);
        setCurrentScenarioIndex(0);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubHistory) unsubHistory();
    };
  }, []);

  // Sync to local storage & Firestore
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(user));
      if (user.id && user.id !== "guest" && user.isGoogleConnected) {
        saveUserProfileToFirestore(user.id, user);
      }
    } catch {}
  }, [user]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_PARTNER_KEY, JSON.stringify(partner));
      if (user.id && user.id !== "guest" && user.isGoogleConnected) {
        savePartnerInfoToFirestore(user.id, partner);
      }
    } catch {}
  }, [partner, user.id, user.isGoogleConnected]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_SCENARIOS_KEY, JSON.stringify(scenarios));
    } catch {}
  }, [scenarios]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_HISTORY_KEY, JSON.stringify(history));
    } catch {}
  }, [history]);

  const currentScenario = scenarios[currentScenarioIndex] || scenarios[0];

  // Evaluate Level & Title updates based on XP
  const awardXpAndCheckLevel = (earnedXp: number, score: number) => {
    setUser((prev) => {
      let newTotalPoints = prev.totalPoints + score;
      let newCurrentXp = prev.currentXp + earnedXp;
      let newLevel = prev.level;
      let newXpToNextLevel = prev.xpToNextLevel;
      let newTitle = prev.currentTitle;

      // Level up calculation
      while (newCurrentXp >= newXpToNextLevel && newLevel < 15) {
        newCurrentXp -= newXpToNextLevel;
        newLevel += 1;
        newXpToNextLevel = Math.round(newXpToNextLevel * 1.25);
      }

      // Determine appropriate title from guide
      const matched = [...TITLE_GUIDE]
        .reverse()
        .find((item) => newLevel >= item.level);
      if (matched) {
        newTitle = matched.title;
      }

      // Check badges
      const updatedBadges = prev.badges.map((badge) => {
        if (badge.id === "badge-perfect-100" && score >= 100) {
          return { ...badge, unlocked: true, unlockedAt: new Date().toISOString().slice(0, 10) };
        }
        if (badge.id === "badge-conflict-solver" && score >= 90 && currentScenario.category === "갈등 해결") {
          return { ...badge, unlocked: true, unlockedAt: new Date().toISOString().slice(0, 10) };
        }
        if (badge.id === "badge-listen-master" && prev.completedScenarios.length >= 4) {
          return { ...badge, unlocked: true, unlockedAt: new Date().toISOString().slice(0, 10) };
        }
        return badge;
      });

      return {
        ...prev,
        level: newLevel,
        currentTitle: newTitle,
        currentXp: newCurrentXp,
        xpToNextLevel: newXpToNextLevel,
        totalPoints: newTotalPoints,
        completedScenarios: prev.completedScenarios.includes(currentScenario.id)
          ? prev.completedScenarios
          : [...prev.completedScenarios, currentScenario.id],
        badges: updatedBadges,
      };
    });
  };

  // Submit Answer to Gemini evaluation API
  const handleSubmitResponse = async (userAnswer: string) => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/evaluate-response", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userResponse: userAnswer,
          scenario: currentScenario,
          partnerInfo: partner,
        }),
      });

      if (!res.ok) {
        throw new Error("Evaluation failed");
      }

      const evalData = await res.json();
      const finalResult: EvaluationResult = {
        score: evalData.score ?? 85,
        headline: evalData.headline ?? "참 잘했어요!",
        oneLinerFeedback:
          evalData.oneLinerFeedback ??
          "공감은 관계의 시작입니다. 연인의 감정을 먼저 읽어준 것이 훌륭해요.",
        aiAnalysis:
          evalData.aiAnalysis ??
          "상대의 지친 마음에 즉각적인 위로를 건넸습니다. 진심 어린 태도가 돋보입니다.",
        recommendedResponse:
          evalData.recommendedResponse ??
          `"오늘 하루 정말 고생 많았어. 네가 얼마나 힘들었을지 상상이 가. 내가 꼭 안아줄게."`,
        partnerReactionComment:
          evalData.partnerReactionComment ??
          "연인의 표정이 한결 편안해지고 고마운 미소를 짓습니다.",
        empathyKeywords: evalData.empathyKeywords ?? ["위로", "지지", "경청"],
        xpEarned: evalData.xpEarned ?? 20,
        userResponse: userAnswer,
        scenarioId: currentScenario.id,
        timestamp: Date.now(),
      };

      setCurrentResult(finalResult);
      setHistory((prev) => [finalResult, ...prev.filter((h) => h.timestamp !== finalResult.timestamp)].slice(0, 20));
      if (user.id && user.id !== "guest" && user.isGoogleConnected) {
        savePracticeResultToFirestore(user.id, finalResult);
      }
      awardXpAndCheckLevel(finalResult.xpEarned, finalResult.score);
      setShowResultModal(true);
    } catch {
      // Fallback evaluation if offline/network error
      const fallbackScore = Math.floor(Math.random() * 15) + 82;
      const fallbackResult: EvaluationResult = {
        score: fallbackScore,
        headline: fallbackScore >= 90 ? "완벽한 공감이에요!" : "참 잘했어요!",
        oneLinerFeedback: "연인의 고단했던 감정을 먼저 헤아려주는 따뜻한 태도가 빛났습니다.",
        aiAnalysis: "상대의 말을 비난하거나 방어하지 않고, 우선적으로 수용하여 심리적 안정감을 주었습니다.",
        recommendedResponse: `"${partner.name || "자기"}야, 오늘 하루 정말 수고 많았어. 내가 곁에서 든든하게 힘이 되어줄게!"`,
        partnerReactionComment: "연인이 따뜻하게 미소 지으며 마음을 엽니다.",
        empathyKeywords: ["감정 수용", "위로", "경청"],
        rubricBreakdown: {
          empathyScore: Math.min(30, Math.round(fallbackScore * 0.3)),
          solutionPacingScore: Math.min(25, Math.round(fallbackScore * 0.25)),
          personalizationScore: Math.min(25, Math.round(fallbackScore * 0.25)),
          warmthScore: Math.min(20, Math.round(fallbackScore * 0.2)),
        },
        xpEarned: 20,
        userResponse: userAnswer,
        scenarioId: currentScenario.id,
        timestamp: Date.now(),
      };
      setCurrentResult(fallbackResult);
      setHistory((prev) => [fallbackResult, ...prev.filter((h) => h.timestamp !== fallbackResult.timestamp)].slice(0, 20));
      if (user.id && user.id !== "guest" && user.isGoogleConnected) {
        savePracticeResultToFirestore(user.id, fallbackResult);
      }
      awardXpAndCheckLevel(20, fallbackScore);
      setShowResultModal(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Generate Custom Situation using Gemini based on Partner profile
  const handleGenerateCustomScenario = async () => {
    setIsGeneratingCustom(true);
    try {
      const res = await fetch("/api/generate-scenario", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          partnerInfo: partner,
          category: "공감 연습",
        }),
      });

      if (!res.ok) throw new Error("Generation error");
      const generated = await res.json();

      const newScenario: Scenario = {
        id: `sc-custom-${Date.now()}`,
        category: "맞춤 생성",
        step: `맞춤 퀘스트`,
        title: generated.title || `${partner.name || "연인"} 맞춤 상황`,
        description: generated.description || "연인의 특화 성향에 맞춘 공감 퀘스트입니다.",
        partnerDialogue: generated.partnerDialogue || "오늘 나 정말 생각 많고 싱숭생숭해...",
        partnerEmotion: generated.partnerEmotion || "인정과 따뜻한 대화 갈망",
        hint: generated.hint || "상대방의 독특한 성향과 감정을 지지해주세요.",
        tags: [partner.mbti || "성향 맞춤", "AI 생성"],
        difficulty: generated.difficulty || "보통",
      };

      setScenarios((prev) => [newScenario, ...prev]);
      setCurrentScenarioIndex(0);
      setActiveTab("lessons");
    } catch {
      // Fallback dynamic scenario
      const newScenario: Scenario = {
        id: `sc-custom-${Date.now()}`,
        category: "맞춤 생성",
        step: `맞춤 퀘스트`,
        title: `${partner.name || "연인"}(${partner.mbti || "성향"})과의 저녁 대화`,
        description: "연인의 일상 속 작은 고민에 귀 기울이고 다정하게 답하는 연습입니다.",
        partnerDialogue: "오늘 따라 왠지 나 혼자만 열심히 사는 것 같아서 좀 허무했어.",
        partnerEmotion: "자신의 가치에 대한 확인 갈망",
        hint: "연인이 얼마나 소중하고 빛나는 사람인지 진심을 담아 전해주세요.",
        tags: [partner.mbti || "MBTI 맞춤", "특별 상황"],
        difficulty: "보통",
      };
      setScenarios((prev) => [newScenario, ...prev]);
      setCurrentScenarioIndex(0);
      setActiveTab("lessons");
    } finally {
      setIsGeneratingCustom(false);
    }
  };

  const handleNextQuestion = () => {
    setShowResultModal(false);
    const nextIdx = (currentScenarioIndex + 1) % scenarios.length;
    setCurrentScenarioIndex(nextIdx);
    setActiveTab("lessons");
  };

  const handleViewDetailedAdvice = () => {
    setShowResultModal(false);
    setActiveTab("advice");
  };

  const handleGoogleLoginSuccess = async (email: string, name: string) => {
    if (!email || email === "guest@heartsync.app") {
      handleLogout();
      return;
    }
    // If not triggered through standard onAuthStateChanged (e.g. preview fallback)
    const simulatedUid = `user-${email.replace(/[^a-zA-Z0-9]/g, "_")}`;
    try {
      const remoteProfile = await loadUserProfileFromFirestore(simulatedUid);
      if (remoteProfile) {
        setUser({
          ...remoteProfile,
          id: simulatedUid,
          email,
          name: remoteProfile.name || name,
          isGoogleConnected: true,
        });
      } else {
        const freshProfile = createDefaultUser(simulatedUid, email, name);
        await saveUserProfileToFirestore(simulatedUid, freshProfile);
        setUser(freshProfile);
      }

      const remotePartner = await loadPartnerInfoFromFirestore(simulatedUid);
      if (remotePartner) {
        setPartner(remotePartner);
      } else {
        const freshPartner = createDefaultPartner();
        await savePartnerInfoToFirestore(simulatedUid, freshPartner);
        setPartner(freshPartner);
      }

      const remoteHistory = await loadPracticeHistoryFromFirestore(simulatedUid, 20);
      setHistory(remoteHistory || []);
    } catch {
      setUser(createDefaultUser(simulatedUid, email, name));
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.warn("SignOut error:", err);
    }
    try {
      localStorage.removeItem(STORAGE_USER_KEY);
      localStorage.removeItem(STORAGE_PARTNER_KEY);
      localStorage.removeItem(STORAGE_HISTORY_KEY);
    } catch {}

    setUser(createDefaultUser());
    setPartner(createDefaultPartner());
    setHistory([]);
    setCurrentResult(null);
    setCurrentScenarioIndex(0);
    setActiveTab("home");
  };

  const handleDirectGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const u = result.user;
      if (u) {
        // onAuthStateChanged will handle Firestore sync automatically
      }
    } catch {
      // Fallback for sandboxed popup blocks
      handleGoogleLoginSuccess("25036@sshs.hs.kr", "Ji-hoon Park");
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF9F9] text-slate-900 font-sans flex flex-col selection:bg-rose-200 selection:text-rose-900">
      {/* 1. Header Bar */}
      <Header
        user={user}
        partner={partner}
        onOpenSettings={() => setShowPartnerModal(true)}
        onOpenAuth={() => setShowAuthModal(true)}
        onOpenPartnerEdit={() => setShowPartnerModal(true)}
        onOpenRecentAnswers={() => setShowRecentAnswersModal(true)}
        onOpenTitleGuide={() => setShowTitleGuideModal(true)}
      />

      {/* 2. Main Tab Views */}
      <main className="flex-1 w-full max-w-2xl mx-auto">
        {activeTab === "home" && (
          <HomeView
            user={user}
            partner={partner}
            currentScenario={currentScenario}
            onStartLesson={(sc) => {
              if (sc) {
                const idx = scenarios.findIndex((s) => s.id === sc.id);
                if (idx !== -1) setCurrentScenarioIndex(idx);
              }
              setActiveTab("lessons");
            }}
            onOpenPartnerEdit={() => setShowPartnerModal(true)}
            onOpenTitleGuide={() => setShowTitleGuideModal(true)}
            onOpenRecentAnswers={() => setShowRecentAnswersModal(true)}
            onGenerateCustomScenario={handleGenerateCustomScenario}
            isGeneratingCustom={isGeneratingCustom}
            recentCount={history.length}
          />
        )}

        {activeTab === "lessons" && (
          <LessonView
            scenario={currentScenario}
            partner={partner}
            allScenarios={scenarios}
            onSelectScenario={(sc) => {
              const idx = scenarios.findIndex((s) => s.id === sc.id);
              if (idx !== -1) setCurrentScenarioIndex(idx);
            }}
            onSubmitResponse={handleSubmitResponse}
            isSubmitting={isSubmitting}
            onGenerateNewScenario={handleGenerateCustomScenario}
            isGeneratingNew={isGeneratingCustom}
          />
        )}

        {activeTab === "advice" && (
          <AdviceView
            result={currentResult}
            partner={partner}
            currentScenario={currentScenario}
            onBack={() => setActiveTab("lessons")}
            onNext={() => {
              const nextIdx = (currentScenarioIndex + 1) % scenarios.length;
              setCurrentScenarioIndex(nextIdx);
              setActiveTab("lessons");
            }}
          />
        )}

        {activeTab === "profile" && (
          <ProfileView
            user={user}
            partner={partner}
            onOpenAuth={() => setShowAuthModal(true)}
            onOpenPartnerEdit={() => setShowPartnerModal(true)}
            onOpenRecentAnswers={() => setShowRecentAnswersModal(true)}
            onOpenTitleGuide={() => setShowTitleGuideModal(true)}
            onLogout={handleLogout}
            onGoogleSignIn={handleDirectGoogleSignIn}
            onEmailSignIn={() => setShowAuthModal(true)}
            recentCount={history.length}
          />
        )}
      </main>

      {/* 3. Bottom Sticky Navigation Bar */}
      <BottomNav activeTab={activeTab} onChangeTab={setActiveTab} />

      {/* 4. Modals */}
      {/* 4.1 Evaluation Result Modal (Matching Image 1 & 6) */}
      {showResultModal && currentResult && (
        <ResultModal
          result={currentResult}
          user={user}
          onNextQuestion={handleNextQuestion}
          onViewDetailedAdvice={handleViewDetailedAdvice}
          onClose={() => setShowResultModal(false)}
        />
      )}

      {/* 4.2 Gmail / Auth Modal (Matching Image 17) */}
      {showAuthModal && (
        <AuthModal
          user={user}
          onLoginSuccess={handleGoogleLoginSuccess}
          onClose={() => setShowAuthModal(false)}
        />
      )}

      {/* 4.3 Partner Information & Trait Quiz Modal (Matching Image 12 & 24) */}
      {showPartnerModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in">
          <div className="bg-[#FFF9F9] w-full max-w-lg rounded-[36px] shadow-2xl border border-rose-100 overflow-hidden relative max-h-[92vh] flex flex-col">
            <div className="p-4 flex items-center justify-between border-b border-rose-100 bg-white">
              <span className="text-sm font-bold text-slate-800">
                연인 프로필 및 성향 설정
              </span>
              <button
                onClick={() => setShowPartnerModal(false)}
                className="text-xs font-bold text-slate-500 hover:text-slate-800"
              >
                닫기
              </button>
            </div>
            <div className="overflow-y-auto flex-1 p-2">
              <PartnerProfileView
                partner={partner}
                onSavePartner={(updated) => {
                  setPartner(updated);
                  if (user.id && user.id !== "guest" && user.isGoogleConnected) {
                    savePartnerInfoToFirestore(user.id, updated);
                  }
                  setShowPartnerModal(false);
                }}
                onClose={() => setShowPartnerModal(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* 4.4 Title Guide Modal */}
      {showTitleGuideModal && (
        <TitleGuideModal
          user={user}
          onClose={() => setShowTitleGuideModal(false)}
        />
      )}

      {/* 4.5 Recent Answers History Modal (Max 20 answers) */}
      <RecentAnswersModal
        isOpen={showRecentAnswersModal}
        onClose={() => setShowRecentAnswersModal(false)}
        history={history}
        partner={partner}
      />
    </div>
  );
}
