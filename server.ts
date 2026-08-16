import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialize Gemini AI client
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    try {
      aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    } catch {
      aiClient = null;
    }
  }
  return aiClient;
}

// Empathy strict 4-rubric evaluation engine with WIDE standard deviation (100-point total)
// High contrast: Excellent (90~100) vs Poor/Dismissive (10~30) => Difference > 60 points!
function evaluateEmpathyStrictRuleEngine(
  userAns: string,
  partnerName: string,
  partnerMbti: string,
  partnerTraits: string,
  partnerPrefs: any,
  scenarioTitle: string,
  partnerDialogue: string,
  partnerEmotion: string
) {
  const text = (userAns || "").trim();
  const len = text.length;

  // 1. Empathy & Listening (30 max)
  // Base starts lower (8) to enforce wide variance. Max reward for rich empathy, severe penalty for dismissiveness.
  let empathyScore = 8;
  const empathyKeywords = [
    "속상", "힘들", "고생", "수고", "마음", "아프", "지치", "괴로", "외로", "불안", "미안",
    "기다리", "서운", "슬프", "어려", "답답", "혼자", "애썼", "고마", "다정", "이해", "토닥",
    "많이", "정말", "얼마나", "괜찮", "걱정"
  ];
  const dismissiveKeywords = [
    "별거", "오버", "그걸로", "왜 그래", "다 그래", "참아", "어쩌라고", "몰라", "ㅇㅇ", "ㅇㅋ", "알아서", "귀찮",
    "상관없", "그만해", "지겹", "냅둬", "네가 문제", "니가 문제", "신경 꺼", "어쩌라고"
  ];

  let matchedEmpathy = 0;
  for (const kw of empathyKeywords) {
    if (text.includes(kw)) matchedEmpathy++;
  }
  empathyScore += Math.min(22, matchedEmpathy * 6);

  let hasDismissive = false;
  for (const dw of dismissiveKeywords) {
    if (text.includes(dw)) {
      empathyScore = 0; // Immediate zeroing for dismissive speech
      hasDismissive = true;
      break;
    }
  }
  if (len < 5) empathyScore = Math.min(3, empathyScore);
  else if (len >= 20 && matchedEmpathy >= 2) empathyScore = Math.min(30, empathyScore + 5);
  empathyScore = Math.min(30, Math.max(0, empathyScore));

  // 2. Premature Advice/Lecture Avoidance (25 max)
  // Preachy/blaming reduces score drastically (down to 0~4), supportive listening rewards up to 25.
  let solutionPacingScore = 10;
  const preachyKeywords = [
    "너도 잘못", "네 탓", "니 탓", "다음엔", "그렇게 하지마", "왜 그랬어", "병원 가", "운동해", "그냥 참아",
    "그러니까", "왜 맨날", "고쳐", "생각 좀 해", "정신 차려"
  ];
  const supportiveActionKeywords = [
    "들어줄게", "함께", "같이", "내가 옆에", "안아줄게", "맛있는 거", "푹 쉬", "내 편", "네 편", "이야기해줘",
    "천천히", "힘이 되어", "언제든", "내가 지켜"
  ];

  let hasPreachy = false;
  for (const pk of preachyKeywords) {
    if (text.includes(pk)) {
      solutionPacingScore = 0;
      hasPreachy = true;
      break;
    }
  }

  if (!hasPreachy) {
    let supportiveCount = 0;
    for (const sk of supportiveActionKeywords) {
      if (text.includes(sk)) supportiveCount++;
    }
    solutionPacingScore += Math.min(15, supportiveCount * 6);
    if (len >= 18 && matchedEmpathy >= 1) solutionPacingScore = Math.min(25, solutionPacingScore + 4);
  }
  if (len < 5) solutionPacingScore = Math.min(2, solutionPacingScore);
  solutionPacingScore = Math.min(25, Math.max(0, solutionPacingScore));

  // 3. Partner Customization (25 max)
  let personalizationScore = 5;
  if (text.includes(partnerName) || text.includes("자기") || text.includes("너") || text.includes("우리")) {
    personalizationScore += 8;
  }
  if (len >= 25) {
    personalizationScore += 6;
  }
  if (partnerPrefs?.needsAloneTimeWhenUpset && (text.includes("시간") || text.includes("천천히") || text.includes("기다릴게") || text.includes("쉬어"))) {
    personalizationScore += 6;
  }
  if (partnerPrefs?.likesSurprise && (text.includes("선물") || text.includes("맛있는") || text.includes("데리러") || text.includes("사가"))) {
    personalizationScore += 5;
  }
  if (hasDismissive || hasPreachy) {
    personalizationScore = 0;
  } else if (len < 8) {
    personalizationScore = Math.min(3, personalizationScore);
  }
  personalizationScore = Math.min(25, Math.max(0, personalizationScore));

  // 4. Warmth & Tone (20 max)
  let warmthScore = 4;
  const warmthKeywords = ["사랑", "고마워", "소중", "든든", "꼭", "정말", "항상", "언제든", "토닥", "응원", "내 맘", "따뜻", "힘내"];
  let matchedWarmth = 0;
  for (const wk of warmthKeywords) {
    if (text.includes(wk)) matchedWarmth++;
  }
  warmthScore += Math.min(16, matchedWarmth * 5);
  if (text.includes("ㅠㅠ") || text.includes("🥺") || text.includes("💕") || text.includes("❤️") || text.includes("!")) {
    warmthScore += 2;
  }
  if (hasDismissive || hasPreachy || len < 6) {
    warmthScore = Math.min(2, warmthScore);
  }
  warmthScore = Math.min(20, Math.max(0, warmthScore));

  const totalScore = Math.min(100, Math.max(0, empathyScore + solutionPacingScore + personalizationScore + warmthScore));

  let headline = "참 잘했어요!";
  let deductionReason = "전반적으로 훌륭한 공감입니다.";

  if (totalScore >= 90) {
    headline = "완벽한 공감이에요! (100점 만점급)";
    deductionReason = "연인의 감정을 온전히 수용하고 깊은 정서적 지지와 온기를 건넨 흠잡을 데 없는 최상급 답변입니다.";
  } else if (totalScore >= 78) {
    headline = "따뜻한 배려가 돋보여요";
    deductionReason = `${partnerName}님의 기분을 헤아리는 온기가 느껴집니다. 조금 더 구체적인 위로 멘트와 감정 단어를 더하면 최상위 점수에 도달할 수 있습니다.`;
  } else if (totalScore >= 60) {
    headline = "기본적인 시도이나 깊이가 부족해요";
    deductionReason = "기본적인 반응은 했으나, 상대방의 핵심 고통에 대한 깊은 공감이나 연인 맞춤 배려가 부족하여 큰 위로가 되기 어렵습니다.";
  } else if (totalScore >= 35) {
    headline = "연인이 서운해할 수 있어요";
    deductionReason = "답변이 너무 짧거나 성의가 부족하며, 감정 수용보다 섣부른 조언이나 건조한 단답형 반응이 앞섰습니다.";
  } else {
    headline = "심각한 상처를 줄 수 있는 반응이에요!";
    deductionReason = "상대방의 감정을 축소하거나 회피/비난하는 뉘앙스가 섞여 있어 연인의 마음에 큰 상처와 벽을 만들 수 있습니다.";
  }

  let oneLinerFeedback = "연인의 지친 감정을 먼저 있는 그대로 안아주는 진심 어린 태도가 가장 중요합니다.";
  if (totalScore >= 85) {
    oneLinerFeedback = `${partnerName}님의 속마음을 정확히 짚어주어 큰 안도감과 사랑을 전했습니다.`;
  } else if (totalScore >= 65) {
    oneLinerFeedback = "상대의 감정을 부정하지 않은 점은 좋으나, 조금 더 다정하고 구체적인 감정의 언어로 감싸주세요.";
  } else if (totalScore >= 40) {
    oneLinerFeedback = "해결책을 내거나 방어하기보다, '많이 힘들었지'라는 따뜻한 한마디로 시작해보세요.";
  } else {
    oneLinerFeedback = "연인의 감정을 무시하거나 가볍게 넘기지 말고, 온전한 내 편이 되어주는 태도가 절실합니다.";
  }

  let aiAnalysis = `${partnerName}(${partnerMbti})님의 감정 상태('${partnerEmotion}')에 집중할 때, 단순한 사실 전달보다 "내가 네 편이다"라는 정서적 확신을 주는 것이 효과적입니다.`;
  if (totalScore >= 80) {
    aiAnalysis = `상대의 감정을 경청하고 존중하는 태도가 돋보입니다. ${partnerName}님의 성향(${partnerTraits})에 맞춰 사소한 일상도 공감해준 점이 높은 점수를 받았습니다.`;
  } else if (totalScore <= 35) {
    aiAnalysis = `상대방의 절박한 감정 호소('${partnerEmotion}')에 비해 답변이 너무 단절적이거나 공감의 온도가 차갑습니다. 상대방의 입장에서 한 번 더 경청해주는 훈련이 필요합니다.`;
  }

  const recommendedResponse = `"${partnerName}야, 오늘 하루 정말 고생 많았어. 네가 얼마나 애썼는지 내가 다 아는데 속상하다. 이따가 맛있는 거 먹으면서 푹 쉬자, 내가 다 들어줄게!"`;
  const partnerReactionComment =
    totalScore >= 80
      ? `${partnerName}님이 당신의 진심 어린 말에 긴장을 풀고 따뜻한 미소를 짓습니다.`
      : totalScore >= 50
      ? `${partnerName}님이 당신의 답변을 들으며 내심 더 깊은 위로와 공감을 기다리고 있습니다.`
      : `${partnerName}님이 굳은 표정으로 깊은 한숨을 쉬며 마음의 문을 닫으려 합니다.`;

  return {
    score: totalScore,
    headline,
    oneLinerFeedback,
    aiAnalysis,
    recommendedResponse,
    partnerReactionComment,
    empathyKeywords: totalScore >= 70 ? ["감정 수용", "정서적 지지", "경청의 온기"] : ["공감 부족", "조언 앞섬", "단답형 반응"],
    rubricBreakdown: {
      empathyScore,
      solutionPacingScore,
      personalizationScore,
      warmthScore,
      deductionReason,
    },
    xpEarned: Math.max(5, Math.round(totalScore * 0.35)),
    userResponse: text,
  };
}

const SCENARIO_BANK = [
  {
    title: "회사 상사와의 갈등으로 지쳐있을 때",
    category: "공감 연습",
    step: "맞춤 퀘스트",
    description: "상대방의 억울함과 피로를 전적으로 지지하고 내 편이 되어주는 연습입니다.",
    partnerDialogue: "오늘 진짜 말도 안 되는 일로 팀장님한테 한참 깨졌어... 너무 억울하고 기운 빠져.",
    partnerEmotion: "억울함, 무력감, 전적인 내 편이 되어주길 바람",
    hint: "누가 잘못했는지 따지기보다, 연인이 느꼈을 속상함에 100% 공감해주세요.",
  },
  {
    title: "우울해서 하루 종일 아무것도 못했을 때",
    category: "일상 속 배려",
    step: "감정 케어",
    description: "무기력함에 자책하는 연인을 다정하게 안심시켜주는 대화입니다.",
    partnerDialogue: "오늘 주말인데 침대에 누워서 아무것도 안 하고 핸드폰만 봤어... 나 왜 이럴까.",
    partnerEmotion: "자책감, 무기력함, 다정한 보살핌 갈망",
    hint: "게으르다고 지적하지 말고, 그동안 열심히 달린 몸과 마음이 쉬어가는 시간이라고 토닥여주세요.",
  },
  {
    title: "중요한 발표나 면접 전날 극도로 긴장할 때",
    category: "공감 연습",
    step: "응원 퀘스트",
    description: "불안해하는 연인에게 든든한 믿음과 자존감을 불어넣어 주는 연습입니다.",
    partnerDialogue: "내일 발표인데 심장이 터질 것 같아... 실수하면 어쩌지? 너무 무서워 ㅠㅠ",
    partnerEmotion: "극도의 불안감, 실패에 대한 두려움",
    hint: "'잘할 수 있어'라는 단순한 격려보다, 연인이 얼마나 치열하게 준비했는지 인정해 주세요.",
  },
  {
    title: "서로 다른 데이트 취향으로 섭섭할 때",
    category: "갈등 해결",
    step: "조율 퀘스트",
    description: "상대의 취향을 존중하면서도 서로가 행복할 수 있는 대안을 제시하는 연습입니다.",
    partnerDialogue: "난 조용하게 둘이 있고 싶었는데, 사람 많고 시끄러운 데 가자고 하니까 좀 피곤해...",
    partnerEmotion: "에너지 고갈, 내 의견이 반영되지 않는다는 서운함",
    hint: "방어적으로 변명하지 말고, 연인의 지친 상태를 먼저 배려하며 편안한 장소를 제안해보세요.",
  },
  {
    title: "사소한 일로 연락이 뜸했을 때 서운함 표현",
    category: "서운함 풀기",
    step: "관계 회복",
    description: "연인의 불안과 섭섭함을 진심으로 사과하고 신뢰를 회복하는 연습입니다.",
    partnerDialogue: "바쁜 건 알겠는데... 몇 시간 동안 답장도 없고, 나만 기다리는 것 같아서 속상했어.",
    partnerEmotion: "우선순위에서 밀렸다는 불안감, 서운함",
    hint: "바빴다는 핑계보다, 기다리면서 마음 졸였을 연인의 감정을 먼저 품어주세요.",
  },
];

function generateDynamicAdviceChat(userMsg: string, pName: string, pMbti: string, pTraits: string) {
  const q = (userMsg || "").toLowerCase();
  if (q.includes("애교") || q.includes("귀엽") || q.includes("사랑스럽")) {
    return `연인 '${pName}'(${pMbti})님의 마음을 사르르 녹일 수 있는 애교 만점 멘트예요! 💕\n\n👉 **추천 멘트:**\n"우리 ${pName} 오늘 하루도 고생 많아찌? 내가 세상에서 제일 많이 사랑하구 꼬옥 안아줄게! 맛난 거 먹으러 가자 멍멍! 🐶❤️"\n\n가벼운 스킨십이나 다정한 눈맞춤과 함께 건네보세요!`;
  }
  if (q.includes("심쿵") || q.includes("포인트") || q.includes("설레")) {
    return `'${pName}'(${pMbti})님이 특히 심쿵하는 포인트는 **'사소한 디테일을 기억해주는 순간'**이에요! ✨\n\n👉 **실전 팁:**\n1. 지나가듯 말했던 좋아하는 음료나 간식을 깜짝 준비하기\n2. "${pName}야, 지난번에 네가 이 노래 좋아한다고 했잖아. 들으니까 네 생각나더라"처럼 일상 속 존재감 각인하기\n3. 말끝마다 따뜻하게 이름을 불러주기!`;
  }
  if (q.includes("선물") || q.includes("서프라이즈") || q.includes("이벤트")) {
    return `'${pName}'님에게는 거창한 물질적 선물보다 **'진심이 담긴 정성'**이 10배 더 감동적이에요! 🎁\n\n👉 **추천 서프라이즈:**\n- 손편지와 함께 좋아하는 달콤한 디저트 배달해주기\n- 지친 날 깜짝 데리러 가기\n- "오늘 고생한 ${pName}를 위한 힐링 쿠폰" 귀엽게 건네기\n\n소소하지만 마음이 가득 담긴 행동이 가장 큰 감동을 줍니다! 💕`;
  }
  if (q.includes("서운") || q.includes("화") || q.includes("싸움") || q.includes("갈등")) {
    return `'${pName}'님이 서운해하거나 화가 났을 때는 **'3초 멈춤의 법칙'**을 적용해보세요! 🌿\n\n👉 **해결 화법:**\n1. 변명 멈추기: "차가 막혀서~", "일이 바빠서~" 대신\n2. 감정 인정하기: "${pName}야, 많이 기다리고 속상했지? 내가 미리 신경 쓰지 못해서 정말 미안해."\n3. 대안 제시: "오늘 저녁은 네가 먹고 싶은 곳으로 가자, 내가 다 맞출게!"\n\n이렇게 하면 갈등이 오히려 신뢰를 깊게 만드는 기회가 됩니다!`;
  }

  return `연인 '${pName}'(${pMbti}, ${pTraits})님과의 관계에서 가장 중요한 핵심은 **'판단 없는 공감'**입니다! 💕\n\n상대방이 고민이나 감정을 이야기할 때 즉각적인 해결책을 주기보다는, "그랬구나, 정말 힘들었겠다", "내가 항상 ${pName} 편이야"라는 안정감을 먼저 전해주세요.\n\n궁금한 상황이나 멘트가 더 있다면 편하게 물어보세요! 언제든 도와드릴게요. 😊`;
}

function getRandomScenario(pName: string, pMbti: string, category?: string) {
  const filtered = category
    ? SCENARIO_BANK.filter((s) => s.category.includes(category))
    : SCENARIO_BANK;
  const pool = filtered.length > 0 ? filtered : SCENARIO_BANK;
  const pick = pool[Math.floor(Math.random() * pool.length)];
  return {
    id: "custom-" + Date.now(),
    title: `${pName}의 ${pick.title}`,
    category: pick.category,
    step: "맞춤 퀘스트",
    description: `${pName}(${pMbti})의 마음에 집중하며 ${pick.description}`,
    partnerDialogue: pick.partnerDialogue.replace(/연인/g, pName),
    partnerEmotion: pick.partnerEmotion,
    hint: pick.hint.replace(/연인/g, pName),
  };
}

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: Date.now() });
});

// Evaluate couple empathy response
app.post("/api/evaluate-response", async (req, res) => {
  const { userResponse, partnerInfo, scenario } = req.body || {};

  if (!userResponse || !userResponse.trim()) {
    return res.status(400).json({ error: "답변을 입력해주세요." });
  }

  const scenarioTitle = req.body.scenarioTitle || scenario?.title || "일상 대화";
  const scenarioCategory = req.body.scenarioCategory || scenario?.category || "공감 연습";
  const partnerDialogue = req.body.partnerDialogue || scenario?.partnerDialogue || "오늘 힘든 일이 있었어...";
  const partnerEmotion = req.body.partnerEmotion || scenario?.partnerEmotion || "위로와 공감이 절실한 상태";

  const partnerName = partnerInfo?.name || "연인";
  const partnerMbti = partnerInfo?.mbti || "알 수 없음";
  const partnerTraits = partnerInfo?.traits || "다정하지만 상처받기 쉬움";
  const partnerPrefs = partnerInfo?.preferences || {};

  // Try Gemini API if key is set
  try {
    const ai = getGeminiClient();
    if (ai) {
      const prompt = `
당신은 대한민국 최고의 연애 심리 및 공감 대화 전문가 '원앙 코치'입니다.
연인 '${partnerName}'(MBTI: ${partnerMbti}, 특징: ${partnerTraits})에게 건넨 사용자 답변을 100점 만점으로 엄격하고 변별력 있게 채점하세요.

[상황]: ${scenarioTitle} / 연인의 말: "${partnerDialogue}" / 연인의 감정: ${partnerEmotion}
[사용자의 답변]: "${userResponse}"

★ [점수 분포 및 표준편차 가이드라인 (반드시 준수)]:
- 잘 한 답변과 못 한 답변의 점수 차이가 60점 이상 나도록 큰 표준편차로 극명하게 변별해야 합니다!
- [최상위 공감 (90~100점)]: 감정을 전적으로 수용하고 연인의 성향에 맞춘 다정한 위로와 애정을 보인 답변 (예: "오늘 진짜 많이 힘들었지... 네가 얼마나 애썼는지 내가 다 알아. 이따 맛있는 거 먹으면서 꼭 안아줄게")
- [우수 공감 (75~88점)]: 따뜻하게 들어주고 공감했으나 살짝 짧거나 맞춤 디테일이 보완 가능한 답변
- [미흡/조언형 (35~55점)]: 감정 수용 없이 바로 해결책/훈계를 제시하거나, 단답형 성의 없는 답변 (예: "다음엔 그렇게 하지마", "병원 가봐", "힘내")
- [최악/상처형 (0~30점)]: 비난, 회피, 귀찮음, 상대방 탓, 가스라이팅, 감정 무시 (예: "별것도 아닌 걸로 오버하네", "어쩌라고", "몰라 알아서 해", "너도 잘못했네")

★ 4대 채점 루브릭 (합산 100점):
1. 감정 수용 & 경청 (30점 만점: 최악 0~5점, 보통 15점, 완벽 28~30점)
2. 섣부른 조언/훈계 자제 (25점 만점: 훈계/지적 시 0~4점, 경청/수용 시 22~25점)
3. 연인 성향 맞춤 배려 (25점 만점: 불성실 0~5점, 성향 배려 시 22~25점)
4. 어조의 온도감 & 진정성 (20점 만점: 차가움/단답 0~4점, 다정함 18~20점)

JSON 응답:
{
  "score": 92,
  "headline": "완벽한 공감이에요!",
  "oneLinerFeedback": "한 줄 총평",
  "aiAnalysis": "심층 분석 2-3문장",
  "recommendedResponse": "연인 맞춤 모범 대사",
  "partnerReactionComment": "연인의 속마음 반응",
  "empathyKeywords": ["감정 수용", "따뜻한 제안"],
  "rubricBreakdown": {
    "empathyScore": 28,
    "solutionPacingScore": 24,
    "personalizationScore": 22,
    "warmthScore": 18,
    "deductionReason": "감점 요인 설명"
  },
  "xpEarned": 25
}
`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              score: { type: Type.INTEGER },
              rubricBreakdown: {
                type: Type.OBJECT,
                properties: {
                  empathyScore: { type: Type.INTEGER },
                  solutionPacingScore: { type: Type.INTEGER },
                  personalizationScore: { type: Type.INTEGER },
                  warmthScore: { type: Type.INTEGER },
                  deductionReason: { type: Type.STRING },
                },
                required: [
                  "empathyScore",
                  "solutionPacingScore",
                  "personalizationScore",
                  "warmthScore",
                  "deductionReason",
                ],
              },
              headline: { type: Type.STRING },
              oneLinerFeedback: { type: Type.STRING },
              aiAnalysis: { type: Type.STRING },
              recommendedResponse: { type: Type.STRING },
              partnerReactionComment: { type: Type.STRING },
              empathyKeywords: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              xpEarned: { type: Type.INTEGER },
            },
            required: [
              "score",
              "rubricBreakdown",
              "headline",
              "oneLinerFeedback",
              "aiAnalysis",
              "recommendedResponse",
              "partnerReactionComment",
              "empathyKeywords",
              "xpEarned",
            ],
          },
        },
      });

      const parsed = JSON.parse(response.text?.trim() || "{}");
      if (parsed.score !== undefined && parsed.rubricBreakdown) {
        return res.json({
          ...parsed,
          userResponse,
        });
      }
    }
  } catch {
    // Graceful fallback without throwing unhandled errors
  }

  // Reliable, high-precision deterministic evaluation fallback
  const result = evaluateEmpathyStrictRuleEngine(
    userResponse,
    partnerName,
    partnerMbti,
    partnerTraits,
    partnerPrefs,
    scenarioTitle,
    partnerDialogue,
    partnerEmotion
  );

  return res.json(result);
});

// Interactive AI Relationship Coach Chatbot
app.post("/api/chat-advice", async (req, res) => {
  const { message, history, partnerInfo, currentScenario } = req.body || {};

  const partnerName = partnerInfo?.name || "연인";
  const partnerMbti = partnerInfo?.mbti || "미설정";
  const partnerTraits = partnerInfo?.traits || "기본 성향";

  try {
    const ai = getGeminiClient();
    if (ai) {
      const systemInstruction = `당신은 'HeartSync'의 따뜻한 1:1 연애 코치 '원앙 코치'입니다. 연인 '${partnerName}'(MBTI: ${partnerMbti}, 특징: ${partnerTraits})에게 전할 실용적 조언과 사랑스러운 대사를 친절하게 추천해주세요.`;

      const chatContents = (history || []).map((h: { role: string; text: string }) => ({
        role: h.role === "user" ? "user" : "model",
        parts: [{ text: h.text }],
      }));

      chatContents.push({
        role: "user",
        parts: [
          {
            text: `[현재 상황: ${currentScenario?.title || "일상 대화"}]\n질문: "${message}"`,
          },
        ],
      });

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: chatContents,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      if (response.text) {
        return res.json({ reply: response.text });
      }
    }
  } catch {
    // Graceful fallback
  }

  const reply = generateDynamicAdviceChat(message, partnerName, partnerMbti, partnerTraits);
  return res.json({ reply });
});

// Generate Custom Couple Scenario dynamically
app.post("/api/generate-scenario", async (req, res) => {
  const { partnerInfo, category } = req.body || {};
  const partnerName = partnerInfo?.name || "연인";
  const partnerMbti = partnerInfo?.mbti || "ENFP";
  const partnerTraits = partnerInfo?.traits || "감성적이고 세심함";

  try {
    const ai = getGeminiClient();
    if (ai) {
      const prompt = `
연인 '${partnerName}'(MBTI: ${partnerMbti}, 성향: ${partnerTraits})의 특성을 반영한 현실감 있는 커플 대화 퀘스트 1개를 생성하세요.
카테고리: ${category || "공감 연습"}
JSON 필드: title, category, step("맞춤 퀘스트"), description, partnerDialogue, partnerEmotion, hint.
`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              category: { type: Type.STRING },
              step: { type: Type.STRING },
              description: { type: Type.STRING },
              partnerDialogue: { type: Type.STRING },
              partnerEmotion: { type: Type.STRING },
              hint: { type: Type.STRING },
            },
            required: ["title", "category", "step", "description", "partnerDialogue", "partnerEmotion", "hint"],
          },
        },
      });

      const parsed = JSON.parse(response.text?.trim() || "{}");
      if (parsed.title && parsed.partnerDialogue) {
        return res.json({
          id: "custom-" + Date.now(),
          ...parsed,
        });
      }
    }
  } catch {
    // Graceful fallback
  }

  const scenario = getRandomScenario(partnerName, partnerMbti, category);
  return res.json(scenario);
});

// Vite / static file serving
async function setupVite() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`HeartSync Server listening on http://0.0.0.0:${PORT}`);
  });
}

setupVite();
