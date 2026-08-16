import { TitleGuideItem, Badge } from "../types";

export const TITLE_GUIDE: TitleGuideItem[] = [
  { level: 1, title: "소통 신생아", minXp: 0, description: "연인의 말에 귀를 기울이기 시작한 첫 걸음" },
  { level: 3, title: "공감 눈치꾼", minXp: 250, description: "상대의 기분 변화를 알아채고 맞춰주는 단계" },
  { level: 5, title: "리액션 꿈나무", minXp: 500, description: "따뜻한 맞장구와 긍정 에너지로 마음을 여는 단계" },
  { level: 7, title: "다정한 경청자", minXp: 750, description: "판단 없이 온 마음으로 들어주는 든든한 연인" },
  { level: 10, title: "마음 읽는 술사", minXp: 1200, description: "말하지 않아도 표정과 숨소리에서 감정을 읽는 경지" },
  { level: 12, title: "따뜻한 공감 왕", minXp: 1600, description: "어떤 갈등 상황에서도 사랑으로 품어내는 마스터" },
  { level: 15, title: "공감의 신 (Final Title)", minXp: 2200, description: "연인의 영혼의 안식처이자 최고의 소울메이트", isFinal: true },
];

export const createFreshBadges = (): Badge[] => [
  {
    id: "badge-first-chat",
    name: "첫 대화 시작",
    description: "첫 번째 공감 상황 질문에 멋진 답변을 완성했습니다.",
    iconName: "MessageCircle",
    unlocked: false,
  },
  {
    id: "badge-emotion-explorer",
    name: "감정 탐구자",
    description: "다양한 감정 카테고리의 문제를 해결했습니다.",
    iconName: "Compass",
    unlocked: false,
  },
  {
    id: "badge-conflict-solver",
    name: "갈등 해결사",
    description: "어려운 갈등 상황에서 90점 이상의 높은 공감 점수를 기록했습니다.",
    iconName: "ShieldHeart",
    unlocked: false,
  },
  {
    id: "badge-listen-master",
    name: "경청의 달인",
    description: "총 5회 이상의 공감 퀘스트를 성공적으로 수료했습니다.",
    iconName: "Headphones",
    unlocked: false,
  },
  {
    id: "badge-perfect-100",
    name: "백점 만점의 사랑",
    description: "Gemini AI 채점에서 100점 만점을 달성했습니다!",
    iconName: "Sparkles",
    unlocked: false,
  },
  {
    id: "badge-partner-expert",
    name: "연인 맞춤 분석가",
    description: "연인의 성향 설문 및 프로필을 꼼꼼하게 등록했습니다.",
    iconName: "HeartHandshake",
    unlocked: false,
  },
];

export const INITIAL_BADGES: Badge[] = createFreshBadges();
