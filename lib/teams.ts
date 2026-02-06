import { db } from "@/lib/firebase";
import { collection, addDoc, updateDoc, doc, arrayUnion, getDoc, query, where, getDocs, Timestamp, setDoc } from "firebase/firestore";

export interface Team {
    id: string;
    name: string;
    ownerId: string;
    members: string[];
    createdAt: any;
    synergyScore: number;
}

export const createTeam = async (teamName: string, userId: string): Promise<string> => {
    try {
        // 1. Create Team Doc
        const teamRef = await addDoc(collection(db, "teams"), {
            name: teamName,
            ownerId: userId,
            members: [userId],
            createdAt: Timestamp.now(),
            synergyScore: 0
        });

        // 2. Update User's teamIds
        const userRef = doc(db, "users", userId);

        // Ensure user doc exists or create it
        await setDoc(userRef, {
            teamIds: arrayUnion(teamRef.id)
        }, { merge: true });

        return teamRef.id;

    } catch (error) {
        console.error("Error creating team:", error);
        throw error;
    }
};

export const joinTeam = async (teamId: string, userId: string): Promise<void> => {
    try {
        const teamRef = doc(db, "teams", teamId);
        const teamSnap = await getDoc(teamRef);

        if (!teamSnap.exists()) {
            throw new Error("Team not found");
        }

        // Add user to team
        await updateDoc(teamRef, {
            members: arrayUnion(userId)
        });

        // Add team to user
        const userRef = doc(db, "users", userId);
        await setDoc(userRef, {
            teamIds: arrayUnion(teamId)
        }, { merge: true });

    } catch (error) {
        console.error("Error joining team:", error);
        throw error;
    }
};

export const getUserTeams = async (userId: string): Promise<Team[]> => {
    try {
        // Query teams where members array contains userId
        const q = query(collection(db, "teams"), where("members", "array-contains", userId));
        const querySnapshot = await getDocs(q);

        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as Team[];
    } catch (error) {
        console.error("Error fetching teams:", error);
        return [];
    }
};
