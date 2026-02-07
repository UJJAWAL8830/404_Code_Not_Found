import { db } from "@/lib/firebase";
import { doc, updateDoc, increment, getDoc, arrayUnion, addDoc, collection, Timestamp } from "firebase/firestore";

// Constants
const LEVEL_THRESHOLDS = Array.from({ length: 20 }, (_, i) => (i + 1) * 1000); // Level 1 = 1000 XP, Level 2 = 2000 XP...

export const ACTIONS = {
    LOGIN: { xp: 10, message: "jacked into the mainframe" },
    GENERATE_PROJECT: { xp: 50, message: "deployed a new prototype" },
    FIX_BUG: { xp: 30, message: "neutralized a system anomaly" },
    COMPLETE_QUEST: { xp: 100, message: "fulfilled a mission objective" },
    RECRUIT_MEMBER: { xp: 200, message: "expanded the operative network" }
};

export const BADGES = {
    NIGHT_OWL: { id: "night_owl", name: "Night Owl", icon: "Moon", description: "Active between 2AM and 5AM" },
    ARCHITECT: { id: "architect", name: "The Architect", icon: "Cpu", description: "Generated 5+ projects" },
    TEAM_PLAYER: { id: "team_player", name: "Squad Leader", icon: "Users", description: "Recruited 3 operatives" }
};

export const awardXP = async (userId: string, teamId: string | null, actionType: keyof typeof ACTIONS) => {
    try {
        const action = ACTIONS[actionType];
        const userRef = doc(db, "users", userId);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) return;

        const userData = userSnap.data();
        const currentXP = (userData.xp || 0) + action.xp;
        const currentLevel = userData.level || 1;

        // Calculate Level Up
        let newLevel = currentLevel;
        if (currentXP >= (currentLevel * 1000)) {
            newLevel += 1;
        }

        const updates: any = {
            xp: increment(action.xp),
            level: newLevel
        };

        // Check for Badges (Simple logic for now)
        // e.g. Night Owl
        const hours = new Date().getHours();
        if (hours >= 2 && hours <= 5 && !userData.badges?.includes(BADGES.NIGHT_OWL.id)) {
            updates.badges = arrayUnion(BADGES.NIGHT_OWL.id);
            // Log badge award
            if (teamId) {
                await addDoc(collection(db, "teams", teamId, "activityLog"), {
                    message: `unlocked badge: [${BADGES.NIGHT_OWL.name}]`,
                    type: "reward",
                    userId: userId,
                    userName: userData.displayName || "Operative",
                    timestamp: Timestamp.now()
                });
            }
        }

        await updateDoc(userRef, updates);

        // Log Action to Team Feed
        if (teamId) {
            await addDoc(collection(db, "teams", teamId, "activityLog"), {
                message: `${action.message} (+${action.xp} XP)`,
                type: "action",
                userId: userId,
                userName: userData.displayName || "Operative",
                timestamp: Timestamp.now()
            });

            if (newLevel > currentLevel) {
                await addDoc(collection(db, "teams", teamId, "activityLog"), {
                    message: `promoted to Level ${newLevel}!`,
                    type: "reward",
                    userId: userId,
                    userName: userData.displayName || "Operative",
                    timestamp: Timestamp.now()
                });
            }
        }

    } catch (error) {
        console.error("Error awarding XP:", error);
    }
};
