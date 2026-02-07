import { db } from "@/lib/firebase";
import { collection, addDoc, updateDoc, doc, arrayUnion, getDoc, query, where, getDocs, Timestamp, setDoc, documentId } from "firebase/firestore";

export interface Team {
    id: string;
    name: string;
    ownerId: string;
    members: string[];
    createdAt: any;
    synergyScore: number;
}

export interface TeamMember {
    uid: string;
    displayName: string;
    photoURL: string;
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

        // 3. Log Activity
        await addDoc(collection(db, "teams", teamRef.id, "activityLog"), {
            message: "established the squad",
            type: "action",
            userId: userId,
            userName: "Commander", // You might want to pass real name
            timestamp: Timestamp.now()
        });

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

export const addMemberToTeam = async (teamId: string, targetUserId: string, inviterName: string): Promise<void> => {
    try {
        // Verify target user exists first (optional but good practice)
        // For now, we assume ID is correct or handled by joinTeam logic mostly
        // But if we are "Adding" by ID, we should check.

        // Add user to team
        const teamRef = doc(db, "teams", teamId);
        await updateDoc(teamRef, {
            members: arrayUnion(targetUserId)
        });

        // Add team to user
        const userRef = doc(db, "users", targetUserId);
        await setDoc(userRef, {
            teamIds: arrayUnion(teamId)
        }, { merge: true });

        // Log Activity
        await addDoc(collection(db, "teams", teamId, "activityLog"), {
            message: `recruited operative ${targetUserId.slice(0, 5)}...`,
            type: "join",
            userId: "SYSTEM",
            userName: inviterName,
            timestamp: Timestamp.now()
        });

    } catch (error) {
        console.error("Error adding member:", error);
        throw error;
    }
}

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

export const getTeamMembers = async (memberIds: string[]): Promise<TeamMember[]> => {
    if (!memberIds || memberIds.length === 0) return [];

    try {
        // Firestore 'in' query supports max 10 items. If members > 10, need to batch or loop.
        // For hackathon teams (usually small), 10 limit is fine.
        // Or we can just fetch individual docs in parallel.

        const memberPromises = memberIds.map(id => getDoc(doc(db, "users", id)));
        const memberSnaps = await Promise.all(memberPromises);

        return memberSnaps.map(snap => {
            if (snap.exists()) {
                const data = snap.data();
                return {
                    uid: snap.id,
                    displayName: data.displayName || "Unknown Operative",
                    photoURL: data.photoURL || "",
                };
            }
            return { uid: "unknown", displayName: "Unknown", photoURL: "" };
        });

    } catch (error) {
        console.error("Error fetching members:", error);
        return [];
    }
};
