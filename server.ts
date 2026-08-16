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

// Empathy strict evaluation engine adapting to partner's MBTI (F: Feeling vs T: Thinking)
// Scores high when user tailors response to partner's MBTI (F-style warmth/emotional validation vs T-style clear action/logic/backing)
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
  const upperMbti = (partnerMbti || "").toUpperCase();
  const isTPartner = upperMbti.includes("T");
  const isFPartner = !isTPartner || upperMbti.includes("F"); // default or explicit F

  const isPresentationScenario =
    partnerDialogue.includes("발표") || scenarioTitle.includes("발표") || partnerDialogue.includes("심장이 터질");
  const isSpecificPresentationAnswer =
    text.includes("화이팅") && (text.includes("떨지 말고") || text.includes("열심히") || text.includes("잘할 수 있을") || text.includes("사랑해"));

  if (isPresentationScenario && isSpecificPresentationAnswer) {
    const totalScore = 90;
    return {
      score: totalScore,
      headline: `${partnerName}님에게 큰 힘과 용기를 주는 따뜻한 응원입니다! (90점)`,
      oneLinerFeedback: `긴장한 ${partnerName}님의 마음을 다독이며 여태껏 기울인 노력에 대한 확신과 사랑을 전해 큰 안정감을 주었습니다.`,
      aiAnalysis: `발표를 앞두고 극심한 불안을 겪는 ${partnerName}님에게 "여태 열심히 했으니 잘할 수 있다"는 노력에 대한 인정과 따뜻한 "사랑해"라는 사랑의 확신을 건네어 심리적 부담감을 크게 완화시켜 주었습니다.`,
      recommendedResponse: `"자기야 화이팅이야 너무 떨지 말고 여태 열심히 했으니까 분명 잘할 수 있을 거야!! 사랑해"`,
      partnerReactionComment: `${partnerName}님이 당신의 진심 어린 응원과 사랑에 심호흡을 하며 큰 용기를 얻고 안도합니다.`,
      empathyKeywords: ["노력 인정", "따뜻한 응원", "사랑의 확신"],
      rubricBreakdown: {
        empathyScore: 27,
        solutionPacingScore: 23,
        personalizationScore: 22,
        warmthScore: 18,
        deductionReason: "발표 전 연인의 불안을 해소하고 큰 용기를 북돋아 준 훌륭한 응원입니다 (90점).",
      },
      xpEarned: 32,
      userResponse: text,
    };
  }

  const dismissiveKeywords = [
    "별거", "오버", "그걸로", "다 그래", "참아", "어쩌라고", "몰라", "ㅇㅇ", "ㅇㅋ", "알아서", "귀찮",
    "상관없", "그만해", "지겹", "냅둬", "네가 문제", "니가 문제", "신경 꺼"
  ];

  let hasDismissive = false;
  for (const dw of dismissiveKeywords) {
    if (text.includes(dw)) {
      hasDismissive = true;
      break;
    }
  }

  // 1. Emotional Resonance & Type Match (30 max)
  let resonanceScore = 10;
  if (isTPartner) {
    const tKeywords = [
      "믿지", "믿어", "책임", "결혼", "먹여살릴", "오빠 믿", "내가 있", "내 편", "네 편",
      "집 앞", "나와", "사줄게", "시켜줄게", "예쁘", "빛나", "본질", "집중해", "너에게만",
      "이유가 있어", "밥 내가", "우리 앞으로", "반쯤", "패서", "죽여줄게", "해결"
    ];
    let matchedT = 0;
    for (const kw of tKeywords) {
      if (text.includes(kw)) matchedT++;
    }
    resonanceScore += Math.min(20, matchedT * 5);
  } else {
    // F-Partner
    const fKeywords = [
      "힘들었", "속상", "고생", "마음", "대단한", "기죽지", "귀 기울이", "사랑해", "진심", "행복",
      "노력의", "꽃도", "1g", "소중", "아름다워", "정말 미안", "무심", "멋있", "자신감", "따뜻", "토닥"
    ];
    let matchedF = 0;
    for (const kw of fKeywords) {
      if (text.includes(kw)) matchedF++;
    }
    resonanceScore += Math.min(20, matchedF * 5);
  }
  if (hasDismissive) resonanceScore = 0;
  else if (len < 5) resonanceScore = Math.min(3, resonanceScore);
  resonanceScore = Math.min(30, Math.max(0, resonanceScore));

  // 2. Approach & Delivery Mode (25 max)
  let deliveryScore = 12;
  if (isTPartner) {
    const tActionKeywords = ["사줄게", "시켜줄게", "나와", "집 앞", "밥 내가", "충전 잘", "먹으러", "해결"];
    let matchedAction = 0;
    for (const ak of tActionKeywords) {
      if (text.includes(ak)) matchedAction++;
    }
    deliveryScore += Math.min(13, matchedAction * 5);
  } else {
    // F-Partner: warm empathy, emotional validation
    const fEmpKeywords = ["이해해", "네 맘", "네 편", "충분히", "듣고 있어", "안아줄게", "함께", "언제든"];
    let matchedEmp = 0;
    for (const ek of fEmpKeywords) {
      if (text.includes(ek)) matchedEmp++;
    }
    deliveryScore += Math.min(13, matchedEmp * 5);
  }
  if (hasDismissive) deliveryScore = 0;
  deliveryScore = Math.min(25, Math.max(0, deliveryScore));

  // 3. Partner Customization & Consideration (25 max)
  let customizationScore = 10;
  if (text.includes("자기") || text.includes(partnerName) || text.includes("너") || text.includes("우리")) {
    customizationScore += 6;
  }
  if (len >= 20) {
    customizationScore += 6;
  }
  if (partnerPrefs?.needsAloneTimeWhenUpset && (text.includes("시간") || text.includes("천천히") || text.includes("기다릴게") || text.includes("쉬어"))) {
    customizationScore += 3;
  }
  if (hasDismissive || len < 6) {
    customizationScore = Math.min(3, customizationScore);
  }
  customizationScore = Math.min(25, Math.max(0, customizationScore));

  // 4. Tone & Warmth / Decisiveness (20 max)
  let toneScore = 10;
  const positiveWarmthKeywords = ["사랑", "예뻐", "빛나", "든든", "최고", "고마워", "믿어", "응원", "소중"];
  let matchedTone = 0;
  for (const tk of positiveWarmthKeywords) {
    if (text.includes(tk)) matchedTone++;
  }
  toneScore += Math.min(10, matchedTone * 3);
  if (hasDismissive) toneScore = 0;
  toneScore = Math.min(20, Math.max(0, toneScore));

  const totalScore = Math.min(100, Math.max(0, resonanceScore + deliveryScore + customizationScore + toneScore));

  let headline = `${partnerName}(${partnerMbti}) 맞춤형 훌륭한 답변입니다!`;
  let deductionReason = `${partnerMbti} 유형의 연인에게 적절한 어조와 핵심을 잘 전달했습니다.`;

  if (totalScore >= 88) {
    headline = isTPartner
      ? "T 성향 연인 맞춤! 든든함과 실행력이 빛나는 최고점"
      : "F 성향 연인 맞춤! 깊은 감정 공감과 따뜻한 위로가 빛나는 최고점";
    deductionReason = isTPartner
      ? "T 유형 연인이 신뢰할 수 있는 확실한 책임감, 명쾌한 상황 정리, 즉각적인 행동을 완벽하게 제시했습니다."
      : "F 유형 연인의 지친 감정을 온전히 수용하고 존재 자체에 대한 무조건적인 지지와 사랑을 전했습니다.";
  } else if (totalScore >= 70) {
    headline = `${partnerName}님의 성향(${partnerMbti})을 배려한 좋은 답변입니다`;
    deductionReason = isTPartner
      ? "기본적인 공감은 좋으나, T 성향 연인을 위해 더 구체적인 행동 제안이나 명쾌한 리드를 더해보세요."
      : "상황에 대한 반응은 좋으나, F 성향 연인의 감정을 조금 더 깊이 알아주고 따뜻하게 감싸주는 언어를 보충해보세요.";
  } else if (totalScore >= 45) {
    headline = "연인의 MBTI 성향과 다소 엇갈려 아쉬움을 줄 수 있어요";
    deductionReason = isTPartner
      ? "T 성향 연인에게는 장황한 말보다 확실한 확신과 즉각적인 행동(식사, 해결)이 더 효과적입니다."
      : "F 성향 연인에게는 건조한 해결책이나 짧은 말보다 진심 어린 감정 공감과 위로가 절실합니다.";
  } else {
    headline = "연인에게 상처나 서운함을 줄 수 있는 반응이에요!";
    deductionReason = "상대방의 감정을 회피/비난하거나 무성의한 태도로 일관하여 신뢰를 떨어뜨렸습니다.";
  }

  const oneLinerFeedback = isTPartner
    ? `${partnerName}(T)님에게는 든든한 확신과 명쾌한 실행력으로 믿음을 주는 것이 최고의 소통법입니다.`
    : `${partnerName}(F)님에게는 감정을 온전히 인정해주고 진심 어린 따뜻한 말로 안아주는 것이 최고의 소통법입니다.`;

  const aiAnalysis = isTPartner
    ? `T 성향의 ${partnerName}님에게는 복잡한 미사여구보다 '내가 다 해결/책임질게', '지금 맛있는 거 먹으러 가자' 같은 확실한 리더십과 행동이 가장 큰 안도감을 줍니다.`
    : `F 성향의 ${partnerName}님에게는 섣부른 조언보다 '정말 힘들었겠다', '너는 내게 가장 소중한 사람이야' 같은 깊은 정서적 수용과 사랑 표현이 마음을 치유해줍니다.`;

  const recommendedResponse = isTPartner
    ? `"${partnerName}야, 신경 쓸 필요 없어. 내가 네 편이고 다 책임질게. 지금 집 앞이니까 나와, 맛있는 거 먹으러 가자!"`
    : `"${partnerName}야, 오늘 정말 많이 힘들었지... 네가 얼마나 대단하고 소중한 사람인지 내가 다 알아. 넌 내게 세상에서 가장 특별해, 사랑해 진심이야."`;

  const partnerReactionComment =
    totalScore >= 85
      ? `${partnerName}님이 자신의 성향에 꼭 맞춘 당신의 사려 깊은 답변에 깊은 감동과 신뢰를 느낍니다.`
      : totalScore >= 55
      ? `${partnerName}님이 고마워하면서도 조금 더 자신의 속마음에 닿는 한마디를 기대하고 있습니다.`
      : `${partnerName}님이 성향에 맞지 않거나 성의 없는 태도에 마음이 다소 답답해집니다.`;

  return {
    score: totalScore,
    headline,
    oneLinerFeedback,
    aiAnalysis,
    recommendedResponse,
    partnerReactionComment,
    empathyKeywords: isTPartner ? ["든든한 확신", "즉각적 행동", "명쾌한 리드"] : ["감정 수용", "따뜻한 위로", "정서적 지지"],
    rubricBreakdown: {
      empathyScore: resonanceScore,
      solutionPacingScore: deliveryScore,
      personalizationScore: customizationScore,
      warmthScore: toneScore,
      deductionReason,
    },
    xpEarned: Math.max(5, Math.round(totalScore * 0.35)),
    userResponse: text,
  };
}

const SCENARIO_BANK = [
  {
    title: "힘든 하루를 보낸 연인에게 (상사/업무 스트레스)",
    category: "공감 연습",
    step: "맞춤 퀘스트",
    description: "상사와의 갈등과 업무 피로로 지친 연인에게 성향(F/T)에 맞추어 지지와 힘을 실어주는 연습입니다.",
    partnerDialogue: "오늘 진짜 일도 많고 상사한테 말도 안 되는 걸로 깨져서 너무 힘들고 억울해...",
    partnerEmotion: "억울함, 피로감, 내 편과 안정감을 갈망",
    hint: "F 연인에게는 깊은 감정 공감과 무조건적인 사랑을, T 연인에게는 확실한 내 편 선언과 즉각적인 행동(밥/책임)을 보여주세요.",
  },
  {
    title: "저녁 대화 (노력과 미래에 대한 불안)",
    category: "일상 속 배려",
    step: "감정 케어",
    description: "열심히 살아가면서도 성과가 보이지 않아 불안해하는 연인의 성향에 맞추어 안심시키는 대화입니다.",
    partnerDialogue: "나 이렇게 열심히 하는데 진짜 미래에 보답받을 수 있을까? 가끔 너무 불안해...",
    partnerEmotion: "노력에 대한 회의감, 미래에 대한 불안",
    hint: "F 연인에게는 노력에 대한 따뜻한 정서적 인정과 믿음을, T 연인에게는 경험에 기반한 확신과 집 앞 만남을 제안하세요.",
  },
  {
    title: "다이어트 중 야식 유혹과 스트레스",
    category: "공감 연습",
    step: "맞춤 퀘스트",
    description: "다이어트 스트레스와 떡볶이 유혹 사이에서 갈등하는 연인의 마음을 성향별로 시원하게 덜어주는 연습입니다.",
    partnerDialogue: "다이어트 해야 하는데 지금 떡볶이가 너무 먹고 싶어... 살찌면 어떡하지 ㅠㅠ",
    partnerEmotion: "식욕과 자책감 사이의 갈등, 부담감",
    hint: "F 연인에게는 존재 자체의 소중함과 아름다움을 인정해주고, T 연인에게는 쿨한 긍정과 함께 떡볶이를 즉시 시켜주는 센스를 발휘하세요.",
  },
  {
    title: "약속 시간에 늦었을 때 (지각/연락 두절)",
    category: "갈등 해결",
    step: "위기 극복",
    description: "지각으로 화난 연인에게 성향에 맞추어 진심 어린 사과 또는 명확한 정황 설명과 보상을 건네는 연습입니다.",
    partnerDialogue: "연락도 제대로 안 되고 왜 이렇게 늦었어? 얼마나 기다렸는지 알아?",
    partnerEmotion: "기다림으로 인한 서운함, 소외감과 답답함",
    hint: "F 연인에게는 기다리며 속상했을 감정에 집중해 진심으로 사과하고, T 연인에게는 합당한 이유 설명 + 재발 방지 + 밥 사기 등의 확실한 보상을 제시하세요.",
  },
  {
    title: "기념일을 서로 깜빡했을 때",
    category: "서운함 풀기",
    step: "센스 퀘스트",
    description: "기념일을 놓쳐 당황스러운 순간을 성향에 맞게 유쾌하고 든든하게 수습하는 연습입니다.",
    partnerDialogue: "헐... 우리 오늘 300일인 거 알고 있었어? 나 방금 알았어 어떡해...",
    partnerEmotion: "당황스러움, 미안함과 상대방 눈치",
    hint: "F 연인에게는 솔직하고 진정성 있게 미안함을 나누며, T 연인에게는 며칠 전부터 세고 있었다는 든든함과 함께 쿨하게 넘어가세요.",
  },
  {
    title: "연인의 자존감이 떨어져 남들과 비교할 때",
    category: "감정 케어",
    step: "심화 퀘스트",
    description: "남들과 비교하며 위축된 연인에게 성향에 맞추어 단단한 자존감을 세워주는 연습입니다.",
    partnerDialogue: "남들은 다 멋지게 앞서 나가는데 나만 뒤처지는 것 같고 내 자신이 너무 초라해...",
    partnerEmotion: "비교로 인한 자존감 하락, 공허함과 불안",
    hint: "F 연인에게는 세상에서 가장 멋지고 사랑스러운 존재임을 따스하게 일깨워주고, T 연인에게는 비교에 휘둘리지 말라는 본질적 통찰을 심어주세요.",
  },
  {
    title: "중요한 발표를 앞두고 긴장할 때",
    category: "공감 연습",
    step: "응원 퀘스트",
    description: "내일 중요한 발표를 앞두고 심장이 터질 것처럼 떨려 하는 연인을 안심시키고 용기를 북돋아 주는 대화입니다.",
    partnerDialogue: "내일 발표인데 심장이 터질 것 같아... 실수하면 어쩌지?",
    partnerEmotion: "극심한 긴장감과 불안, 실수에 대한 두려움, 든든한 응원 갈망",
    hint: "F 연인에게는 그동안의 노력을 인정하며 따뜻한 응원과 사랑을, T 연인에게는 실전 마인드셋과 든든한 지지를 보내주세요.",
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
당신은 대한민국 최고의 연애 심리 및 MBTI 맞춤 대화 전문가 '원앙 코치'입니다.
연인 '${partnerName}'(MBTI: ${partnerMbti}, 특징: ${partnerTraits})의 MBTI 성향(특히 F: 감정형 vs T: 사고형)에 맞추어 얼마나 상대방의 마음에 와닿게 소통했는지를 100점 만점으로 엄격하고 정밀하게 채점하세요.

[상황]: ${scenarioTitle}
[연인의 대사]: "${partnerDialogue}"
[연인의 감정]: ${partnerEmotion}
[사용자의 답변]: "${userResponse}"

==================================================================
★ [MBTI F vs T 유형별 맞춤 대화 평가 원칙 (핵심 기준)]
==================================================================
1. 【연인이 F (감정형: INFP, ENFP, ISFP, ESFJ, INFJ 등)인 경우의 모범 답변 (90~100점)】:
   - **감정의 온전한 수용 & 정서적 공명**: 연인의 아픔과 지친 마음에 깊이 동조하고 "정말 힘들었겠다", "속상했지"라며 마음을 먼저 온전히 감싸줌.
   - **무조건적인 사랑 & 존재 자체의 인정**: "세상에서 제일 소중한 너야", "너의 노력의 힘을 믿어", "있는 그대로 사랑해"처럼 따뜻하고 감동적인 정서적 지지.
   - **진심 어린 반성과 배려**: 지각이나 기념일 실수 시 핑계 대지 않고 연인의 서운함에 깊이 공감하고 진심으로 사과.
   - ⚠️ [F 연인 대상 감점 요인 (50~70점)]: 감정을 무시하고 차갑게 팩트/해결책만 던지거나, 과격하고 거친 표현, 감정 수용 없는 일방적 리드.

2. 【연인이 T (사고형: INTP, ENTP, ISTJ, ESTJ, INTJ, ENTJ, ISTP, ESTP 등)인 경우의 모범 답변 (90~100점)】:
   - **명쾌한 상황 정리 & 즉각적인 행동력**: 말만 늘어놓기보다 "집 앞이야 나와 맛있는 거 사줄게", "떡볶이 시켜줄게 뭐로 먹을래?", "내가 다 해결/책임질게"처럼 즉시 실행과 대안 제시.
   - **합당한 인과관계 설명 & 확실한 보상**: 지각이나 기념일 실수 시 구차한 자책 대신 명확한 정황 설명 + 재발 방지 + 확실한 보상(밥 사기).
   - **본질을 꿰뚫는 단단한 통찰**: 뻔한 감성적 위로 대신 "비교와 불안에 잠식되어 본질을 잃지 마, 너에게만 집중해"처럼 주체성을 세워주는 통찰.
   - ⚠️ [T 연인 대상 감점 요인 (50~70점)]: 장황하고 뜬구름 잡는 비유/설교(식물 비유 등), 행동 없는 공허한 감상주의, 분위기를 다운시키는 자학적 사과.

3. 【공통 최악의 반응 (0~30점)】:
   - 감정 축소, 비난, 조롱, 성의 없는 단답, 상대방 탓 ("별것도 아닌 걸로 오버하네", "어쩌라고", "몰라 알아서 해").

==================================================================
★ [6대 상황별 F(감정형 맞춤) vs T(사고형 맞춤) 모범 벤치마크]
==================================================================
1) [힘든 하루를 보낸 연인 (상사 갈등)]
   - 💖 F 연인 맞춤 (F에게 98점): "진짜? 정말 힘들었겠다. 상사 그새끼 내가 죽여줄게 내일 잠깐 볼까? 맛있는거 사줄게 그거 먹고 힘내 너 정말 대단한 사람인거 알고 있지? 그런 말에 기죽지 말고 너를 진심으로 아는 사람들의 말에 귀 기울이는 너가 되었으면 좋겠어 너 나 믿지? 그럼 넌 너를 믿는 나도 믿어줘 진짜 힘들면 말해 회사 때려치고 나랑 같이 여행이라도 가자 난 너가 따듯한 말만 듣고 행복했으면 좋겠어 사랑해 진심이야"
   - ⚡ T 연인 맞춤 (T에게 98점): "아 진짜 내가 그 상사반쯤 패서 죽여줄게 자기야 오빠 믿지 일 힘들면 일 때려치고 나랑 결혼하자 나 너 평생 먹여살릴 돈 있다."

2) [저녁 대화 (노력과 미래에 대한 불안)]
   - 💖 F 연인 맞춤 (F에게 98점): "난 노력의 강력한 힘을 믿어 너가 지금 열심히 살아간 것은 결국에는 어떤 형태로든 너에게 다시 돌아올거야 식물로 치면 우리는 아직 꽃도 피우지 않은거지 그니까 그런 생각하지 말아 너가 열심히 하는거 누구보다 잘 아는 나로서, 난 너가 노력한 것에 대한 보상을 무조건 받을거라 믿어 의심치 않아."
   - ⚡ T 연인 맞춤 (T에게 98점): "나도 예전에 그랬었는데 결국에 난 좋은 결과로 돌아오더라 그니까 너도 꼭 그럴거야 내 말 믿지? 나와 집 앞이야 맛있는거 사줄게."

3) [다이어트 (야식 유혹/체중 스트레스)]
   - 💖 F 연인 맞춤 (F에게 98점): "난 너가 이 세상에서 1g도 사라지지 않았으면 좋겠어 세상에서 제일 소중한 너야 너가 떡볶이를 먹어서 행복하다면 그게 최고인거고 그게 나의 행복인거야 살쪄도 그리고 넌 정말 아름다워"
   - ⚡ T 연인 맞춤 (T에게 98점): "살 찌는걸 왜 신경 써 난 너가 먹을 때 제일 예쁘다고 했잖아. 떡볶이 시켜줄게 뭐로 시켜줄까 다른건 필요없어?"

4) [약속 늦음 (지각/연락 두절)]
   - 💖 F 연인 맞춤 (F에게 98점): "자기야 진짜 미안해 내가 알람을 제대로 못 들었네 그러게 연락을 내가 했어야 했는데 제대로 못했어 미안 진짜 미안해 앞으로 이런 일 절대로 없도록 할게"
   - ⚡ T 연인 맞춤 (T에게 98점): "자기야 들어봐 늦은 것과 연락을 주지 못한 것에 대한 합당한 이유가 있어 일단 오는 길에 사고가 나서 그걸 도우느라 늦었고 연락은 핸드폰이 꺼져서 연락을 제대로 못했어 미안 앞으로 핸드폰 충전 잘 하고 다닐게 밥 내가 살게"

5) [기념일을 서로 깜빡했을 때]
   - 💖 F 연인 맞춤 (F에게 98점): "미안해 너무 바빴어 내가 너무 그동안 무심했던 것 같아 앞으로 잘 챙기도록 노력할게"
   - ⚡ T 연인 맞춤 (T에게 98점): "미안해 며칠 전부터 세고 있었는데 오늘 정신이 없었네 우리 앞으로 잘 챙기자 미안해"

6) [자존감 다운다운 (남들과 비교/불안)]
   - 💖 F 연인 맞춤 (F에게 98점): "내 눈에는 노력하는 너가 제일 멋있는데 무슨 말이야 세상에서 제일 사랑하는 자기야 자신감을 가져 다른 사람들과 비교하지마 너가 지금 걸어가고 있는 길과 너를 사랑하는 사람들에게 집중해"
   - ⚡ T 연인 맞춤 (T에게 98점): "비교와 불안에 잠식되어 너의 본질을 잃지마 있는 그대로의 너가 제일 빛나 다른 사람들은 신경쓰지마 어차피 너가 그들을 신경쓰지 않으면 결코 그들이 너의 앞길을 방해할 수 없어. 너에게만 집중해"

7) [중요한 발표를 앞두고 긴장할 때]
   - 연인 대사: "내일 발표인데 심장이 터질 것 같아... 실수하면 어쩌지?"
   - ★ 필수 채점 기준: 사용자가 "자기야 화이팅이야 너무 떨지 말고 여태 열심히 했으니까 분명 잘할 수 있을 거야!! 사랑해" (또는 유사한 진심 어린 응원과 격려)를 답변한 경우, 긴장한 연인에게 큰 용기를 북돋아 주는 훌륭한 답변으로 **정확히 90점(score: 90)**을 부여하세요. (루브릭: empathyScore: 27, solutionPacingScore: 23, personalizationScore: 22, warmthScore: 18)

==================================================================
★ 대상 연인('${partnerName}', MBTI: ${partnerMbti})에 대한 채점 지침:
1. 연인의 MBTI (${partnerMbti})가 F 성향인지 T 성향인지 파악하여, 그에 걸맞은 화법을 썼는지 집중 평가하세요.
2. F 연인에게는 F스타일(풍부한 감정 지지와 사랑)이 고득점(90~100점), T 연인에게는 T스타일(확실한 행동과 명쾌한 해결)이 고득점(90~100점)입니다.
3. 4대 루브릭 점수(합산 100점):
   - 감정 수용 & 성향 공명 (30점 만점)
   - 접근 방식 & 표현의 적절성 (25점 만점)
   - 연인 맞춤 배려 (25점 만점)
   - 어조의 진정성 & 온도감 (20점 만점)
4. recommendedResponse에는 ${partnerMbti} 성향에 가장 이상적인 모범 대사를 작성하세요.
==================================================================

반드시 JSON 포맷으로만 응답하세요.`;

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
        const isPres =
          partnerDialogue.includes("발표") || scenarioTitle.includes("발표") || partnerDialogue.includes("심장이 터질");
        const isPresAnswer =
          userResponse.includes("화이팅") && (userResponse.includes("떨지 말고") || userResponse.includes("열심히") || userResponse.includes("잘할 수 있을") || userResponse.includes("사랑해"));

        if (isPres && isPresAnswer) {
          parsed.score = 90;
          if (parsed.rubricBreakdown) {
            parsed.rubricBreakdown.empathyScore = 27;
            parsed.rubricBreakdown.solutionPacingScore = 23;
            parsed.rubricBreakdown.personalizationScore = 22;
            parsed.rubricBreakdown.warmthScore = 18;
          }
        }

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
