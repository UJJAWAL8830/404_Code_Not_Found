import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { db } from "@/lib/firebase";
import { collection, addDoc, doc, updateDoc, Timestamp } from "firebase/firestore";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    systemInstruction: `SYSTEM_INSTRUCTION:
You are the DevStory Engine. Analyze the input and return a STRICT JSON object with these keys:
- "story": A 3-paragraph pitch (Problem, Solution, Tech).
- "diagram": A Mermaid.js graph TD string visualizing the architecture. DO NOT USE MARKDOWN CODE BLOCKS. Just the raw string.
- "game_quests": Array of 3 objects {title, instruction, xp} for a demo walkthrough.
- "demo_script": Array of objects {time, action, script} for a 60s video.
- "cheat_sheet": Object {problem_summary, tech_stack_array, innovation_score}.
`,
    generationConfig: { responseMimeType: "application/json" }
});

export async function POST(req: Request) {
    try {
        const { userId, userContext, teamId } = await req.json();

        if (!userId || !userContext) {
            return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
        }

        // Determine Collection Path (User or Team)
        // If teamId is provided, we save to teams/{teamId}/projects
        // Else, users/{userId}/projects
        let collectionRef;
        if (teamId) {
            collectionRef = collection(db, "teams", teamId, "projects");
        } else {
            collectionRef = collection(db, "users", userId, "projects");
        }

        // 1. Create Document in "generating" state
        const docRef = await addDoc(collectionRef, {
            inputContext: userContext,
            userId: userId, // Track who created it if in a team
            status: "generating",
            createdAt: Timestamp.now(),
            output: null
        });

        // 2. Generate Content
        // Next.js functions have timeouts, but Gemini Flash is fast. 
        // Ideally we should use background workers, but Vercel/NextJS functions allow some seconds.
        // We will await it here.

        const prompt = `Input Context: ${userContext}`;

        try {
            const result = await model.generateContent(prompt);
            const responseText = result.response.text();
            const jsonOutput = JSON.parse(responseText);

            // 3. Update Document to "completed"
            // Use same logic to reconstruct doc reference or just use doc(collectionRef, docRef.id)
            // But collectionRef is a CollectionReference, so we need doc(collectionRef, id) logic or full path.
            // Easier to just use doc() builder with the path.

            const finalDocRef = doc(collectionRef, docRef.id);

            await updateDoc(finalDocRef, {
                status: "completed",
                output: jsonOutput
            });

            return NextResponse.json({ success: true, id: docRef.id });

        } catch (aiError) {
            console.error("AI Generation Error:", aiError);
            const finalDocRef = doc(collectionRef, docRef.id);
            await updateDoc(finalDocRef, {
                status: "error",
            });
            return NextResponse.json({ error: "AI Generation Failed" }, { status: 500 });
        }

    } catch (error) {
        console.error("API Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
