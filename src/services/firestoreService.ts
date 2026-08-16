import {
  doc,
  setDoc,
  getDoc,
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  addDoc,
  serverTimestamp,
  onSnapshot,
  Unsubscribe,
} from "firebase/firestore";
import { db } from "../firebase";
import { UserProfile, PartnerInfo, EvaluationResult } from "../types";

/**
 * Saves or updates a user's profile in Firestore (/users/{userId})
 */
export async function saveUserProfileToFirestore(userId: string, profile: UserProfile): Promise<void> {
  if (!userId || userId === "guest") return;
  try {
    const userRef = doc(db, "users", userId);
    // Remove undefined values to avoid Firestore errors
    const cleanedProfile = JSON.parse(JSON.stringify(profile));
    await setDoc(
      userRef,
      {
        ...cleanedProfile,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (error) {
    console.warn("Error saving user profile to Firestore:", error);
  }
}

/**
 * Loads a user's profile from Firestore (/users/{userId})
 */
export async function loadUserProfileFromFirestore(userId: string): Promise<UserProfile | null> {
  if (!userId || userId === "guest") return null;
  try {
    const userRef = doc(db, "users", userId);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      return snap.data() as UserProfile;
    }
  } catch (error) {
    console.warn("Error loading user profile from Firestore:", error);
  }
  return null;
}

/**
 * Saves partner information in Firestore (/users/{userId}/partner/info)
 */
export async function savePartnerInfoToFirestore(userId: string, partner: PartnerInfo): Promise<void> {
  if (!userId || userId === "guest") return;
  try {
    const partnerRef = doc(db, "users", userId, "partner", "info");
    const cleanedPartner = JSON.parse(JSON.stringify(partner));
    await setDoc(
      partnerRef,
      {
        ...cleanedPartner,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (error) {
    console.warn("Error saving partner info to Firestore:", error);
  }
}

/**
 * Loads partner information from Firestore (/users/{userId}/partner/info)
 */
export async function loadPartnerInfoFromFirestore(userId: string): Promise<PartnerInfo | null> {
  if (!userId || userId === "guest") return null;
  try {
    const partnerRef = doc(db, "users", userId, "partner", "info");
    const snap = await getDoc(partnerRef);
    if (snap.exists()) {
      return snap.data() as PartnerInfo;
    }
  } catch (error) {
    console.warn("Error loading partner info from Firestore:", error);
  }
  return null;
}

/**
 * Saves a new practice/evaluation result to Firestore (/users/{userId}/practices)
 */
export async function savePracticeResultToFirestore(
  userId: string,
  result: EvaluationResult
): Promise<string | null> {
  if (!userId || userId === "guest") return null;
  try {
    const practicesCol = collection(db, "users", userId, "practices");
    const cleanedResult = JSON.parse(JSON.stringify(result));
    const docRef = await addDoc(practicesCol, {
      ...cleanedResult,
      createdAt: serverTimestamp(),
      timestamp: result.timestamp || Date.now(),
    });
    return docRef.id;
  } catch (error) {
    console.warn("Error saving practice result to Firestore:", error);
    return null;
  }
}

/**
 * Loads recent practice history from Firestore (/users/{userId}/practices)
 */
export async function loadPracticeHistoryFromFirestore(
  userId: string,
  maxCount: number = 20
): Promise<EvaluationResult[]> {
  if (!userId || userId === "guest") return [];
  try {
    const practicesCol = collection(db, "users", userId, "practices");
    const q = query(practicesCol, orderBy("timestamp", "desc"), limit(maxCount));
    const snapshot = await getDocs(q);

    const history: EvaluationResult[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      history.push({
        score: data.score ?? 0,
        headline: data.headline ?? "",
        oneLinerFeedback: data.oneLinerFeedback ?? "",
        aiAnalysis: data.aiAnalysis ?? "",
        recommendedResponse: data.recommendedResponse ?? "",
        partnerReactionComment: data.partnerReactionComment ?? "",
        empathyKeywords: data.empathyKeywords ?? [],
        xpEarned: data.xpEarned ?? 0,
        userResponse: data.userResponse ?? "",
        scenarioId: data.scenarioId,
        timestamp: data.timestamp ?? Date.now(),
        rubricBreakdown: data.rubricBreakdown,
      });
    });
    return history;
  } catch (error) {
    console.warn("Error loading practice history from Firestore:", error);
    return [];
  }
}

/**
 * Subscribes to real-time updates for user profile
 */
export function subscribeUserProfile(
  userId: string,
  callback: (profile: UserProfile) => void
): Unsubscribe | null {
  if (!userId || userId === "guest") return null;
  try {
    const userRef = doc(db, "users", userId);
    return onSnapshot(userRef, (snap) => {
      if (snap.exists()) {
        callback(snap.data() as UserProfile);
      }
    });
  } catch (error) {
    console.warn("Error subscribing to user profile:", error);
    return null;
  }
}

/**
 * Subscribes to real-time updates for practice history
 */
export function subscribePracticeHistory(
  userId: string,
  callback: (history: EvaluationResult[]) => void,
  maxCount: number = 20
): Unsubscribe | null {
  if (!userId || userId === "guest") return null;
  try {
    const practicesCol = collection(db, "users", userId, "practices");
    const q = query(practicesCol, orderBy("timestamp", "desc"), limit(maxCount));
    return onSnapshot(q, (snapshot) => {
      const history: EvaluationResult[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        history.push({
          score: data.score ?? 0,
          headline: data.headline ?? "",
          oneLinerFeedback: data.oneLinerFeedback ?? "",
          aiAnalysis: data.aiAnalysis ?? "",
          recommendedResponse: data.recommendedResponse ?? "",
          partnerReactionComment: data.partnerReactionComment ?? "",
          empathyKeywords: data.empathyKeywords ?? [],
          xpEarned: data.xpEarned ?? 0,
          userResponse: data.userResponse ?? "",
          scenarioId: data.scenarioId,
          timestamp: data.timestamp ?? Date.now(),
          rubricBreakdown: data.rubricBreakdown,
        });
      });
      callback(history);
    });
  } catch (error) {
    console.warn("Error subscribing to practice history:", error);
    return null;
  }
}
