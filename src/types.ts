export interface UserProfile {
  id: string;
  email: string;
  name: string;
  username: string;
  avatar: string;
  isGoogleConnected: boolean;
  level: number;
  currentTitle: string;
  currentXp: number;
  xpToNextLevel: number;
  totalPoints: number;
  streakDays: number;
  lastActiveDate: string;
  completedScenarios: string[];
  badges: Badge[];
}

export interface PartnerInfo {
  name: string;
  mbti: string;
  traits: string;
  preferences: {
    isIntrovert?: boolean;
    likesSurprise?: boolean;
    isMorningPerson?: boolean;
    expressesDirectly?: boolean;
    needsAloneTimeWhenUpset?: boolean;
    likesPhysicalAffection?: boolean;
  };
}

export interface Scenario {
  id: string;
  title: string;
  category: "공감 연습" | "갈등 해결" | "기념일 & 서프라이즈" | "일상 속 배려" | "서운함 풀기" | "맞춤 생성";
  step: string;
  description: string;
  partnerDialogue: string;
  partnerEmotion: string;
  hint: string;
  tags: string[];
  difficulty: "쉬움" | "보통" | "어려움";
}

export interface EvaluationResult {
  score: number;
  headline: string;
  oneLinerFeedback: string;
  aiAnalysis: string;
  recommendedResponse: string;
  partnerReactionComment: string;
  empathyKeywords: string[];
  xpEarned: number;
  userResponse: string;
  scenarioId?: string;
  timestamp?: number;
  rubricBreakdown?: {
    empathyScore: number;
    solutionPacingScore: number;
    personalizationScore: number;
    warmthScore: number;
    deductionReason?: string;
  };
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  iconName: string;
  unlocked: boolean;
  unlockedAt?: string;
}

export interface TitleGuideItem {
  level: number;
  title: string;
  minXp: number;
  description: string;
  isFinal?: boolean;
}

export interface ChatMessage {
  id: string;
  role: "user" | "model";
  text: string;
  timestamp: number;
}
