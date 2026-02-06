"use client";

import { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, User, signOut } from "firebase/auth";
import { collection, query, onSnapshot, addDoc, orderBy, Timestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Terminal, Send, LogOut, Code, FileText, PlayCircle, Cpu, Users, ChevronDown, Plus } from "lucide-react";
import MermaidChart from "@/components/MermaidChart";
import { getUserTeams, Team } from "@/lib/teams";
import TeamModal from "@/components/TeamModal";

// Type definition for Project (as defined in Phase A)
interface Project {
    id: string;
    inputContext: string;
    status: "generating" | "completed" | "error";
    output?: {
        story: string | { problem: string; solution: string; tech: string }; // 3-paragraph pitch
        diagram: string; // Mermaid string
        game_quests: { title: string; instruction: string; xp: number }[];
        demo_script: { time: string; action: string; script: string }[];
        cheat_sheet: { problem_summary: string; tech_stack_array: string[]; innovation_score: number };
    };
    createdAt: any;
}

export default function Dashboard() {
    const [user, setUser] = useState<User | null>(null);
    const [teams, setTeams] = useState<Team[]>([]);
    const [currentTeam, setCurrentTeam] = useState<Team | null>(null);
    const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);

    const [inputContext, setInputContext] = useState("");
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (!currentUser) {
                router.push("/");
            } else {
                setUser(currentUser);

                // Fetch User's Teams
                const userTeams = await getUserTeams(currentUser.uid);
                setTeams(userTeams);
            }
        });

        return () => unsubscribe();
    }, [router]);

    // Listener for Projects (User or Team)
    useEffect(() => {
        if (!user) return;

        setLoading(true);
        let q;

        if (currentTeam) {
            // Listen to TEAM projects
            q = query(
                collection(db, "teams", currentTeam.id, "projects"),
                orderBy("createdAt", "desc")
            );
        } else {
            // Listen to PERSONAL projects
            q = query(
                collection(db, "users", user.uid, "projects"),
                orderBy("createdAt", "desc")
            );
        }

        const unsubProjects = onSnapshot(q, (snapshot) => {
            const projs = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as Project[];
            setProjects(projs);
            setLoading(false);
        });

        return () => unsubProjects();
    }, [user, currentTeam]);

    const handleTeamJoined = async () => {
        if (user) {
            const userTeams = await getUserTeams(user.uid);
            setTeams(userTeams);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputContext.trim() || !user) return;

        try {
            // Optimistic UI or wait for real-time update?
            // Step A: Call API to start process
            const response = await fetch("/api/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId: user.uid,
                    userContext: inputContext,
                    teamId: currentTeam?.id // Optional: if present, generate in team
                }),
            });

            if (!response.ok) {
                // Handle error (maybe toast)
                console.error("API Error");
            }

            setInputContext("");
        } catch (error) {
            console.error("Submission Error", error);
        }
    };

    const handleLogout = async () => {
        await signOut(auth);
        router.push("/");
    };

    if (loading) return <div className="min-h-screen bg-background flex items-center justify-center text-primary font-mono animate-pulse">CONNECTING_TO_MAINFRAME...</div>;

    return (
        <div className="min-h-screen bg-background text-foreground font-mono p-6">
            <nav className="flex justify-between items-center mb-12 border-b border-primary/20 pb-4">
                <div className="flex items-center space-x-2 text-primary">
                    <Terminal className="w-6 h-6" />
                    <span className="font-bold tracking-widest hidden md:block">DevStory_DASHBOARD</span>
                </div>

                {/* Team Switcher */}
                <div className="flex items-center space-x-4 bg-card/30 border border-primary/20 rounded-full px-4 py-2">
                    <button
                        onClick={() => setCurrentTeam(null)}
                        className={`text-sm flex items-center space-x-2 transition-colors ${!currentTeam ? "text-primary font-bold" : "text-muted-foreground hover:text-white"}`}
                    >
                        <Users className="w-4 h-4" />
                        <span>PERSONAL</span>
                    </button>
                    <div className="h-4 w-px bg-white/20"></div>
                    {teams.map(team => (
                        <button
                            key={team.id}
                            onClick={() => setCurrentTeam(team)}
                            className={`text-sm flex items-center space-x-2 transition-colors ${currentTeam?.id === team.id ? "text-secondary font-bold" : "text-muted-foreground hover:text-white"}`}
                        >
                            <span>{team.name}</span>
                        </button>
                    ))}
                    <button onClick={() => setIsTeamModalOpen(true)} className="text-muted-foreground hover:text-primary">
                        <Plus className="w-4 h-4" />
                    </button>
                </div>

                <div className="flex items-center space-x-4">
                    <span className="text-sm text-muted-foreground hidden md:block">User: {user?.displayName}</span>
                    <button onClick={handleLogout} className="hover:text-primary transition-colors">
                        <LogOut className="w-5 h-5" />
                    </button>
                </div>
            </nav>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Input Console */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="border border-primary/50 bg-card/50 p-6 rounded-lg shadow-[0_0_15px_rgba(57,255,20,0.1)]">
                        <h2 className="text-xl font-bold text-primary mb-4 flex items-center">
                            <Cpu className="w-5 h-5 mr-2" /> INPUT_VECTOR
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs uppercase text-muted-foreground mb-1">Idea</label>
                                <textarea
                                    value={inputContext}
                                    onChange={(e) => setInputContext(e.target.value)}
                                    className="w-full bg-black/50 border border-primary/30 rounded p-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all h-32"
                                    placeholder="'An app that uses AI to...'"
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full bg-primary/10 border border-primary text-primary py-3 font-bold hover:bg-primary hover:text-black transition-all flex items-center justify-center space-x-2"
                            >
                                <Send className="w-4 h-4" />
                                <span>EXECUTE_PROTOCOL</span>
                            </button>
                        </form>
                    </div>
                </div>

                {/* Live Workshop */}
                <div className="lg:col-span-8 space-y-6">
                    <h2 className="text-xl font-bold text-primary mb-4 flex items-center">
                        <Terminal className="w-5 h-5 mr-2" />
                        {currentTeam ? `TEAM_OUTPUT_STREAM [${currentTeam.name}]` : "PERSONAL_OUTPUT_STREAM"}
                    </h2>

                    <div className="space-y-6">
                        <AnimatePresence>
                            {projects.map((project) => (
                                <motion.div
                                    key={project.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="border border-border bg-card/30 rounded-lg overflow-hidden"
                                >
                                    <div className="bg-primary/5 p-3 border-b border-primary/10 flex justify-between items-center">
                                        <span className="text-xs uppercase text-muted-foreground truncate max-w-[200px]">{project.inputContext}</span>
                                        <span className={`text-xs px-2 py-1 rounded border ${project.status === "completed" ? "border-primary text-primary" :
                                            project.status === "error" ? "border-destructive text-destructive" :
                                                "border-yellow-500 text-yellow-500 animate-pulse"
                                            }`}>
                                            {project.status.toUpperCase()}
                                        </span>
                                    </div>

                                    {project.status === "completed" && project.output && (
                                        <div className="p-6 space-y-8">
                                            {/* Story */}
                                            <section>
                                                <h3 className="text-lg font-bold text-secondary mb-2 flex items-center"><FileText className="w-4 h-4 mr-2" /> STORY_PITCH</h3>
                                                <div className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed border-l-2 border-secondary pl-4">
                                                    {typeof project.output.story === 'string' ? project.output.story : (
                                                        <div className="space-y-4">
                                                            <div>
                                                                <strong className="text-primary block mb-1">PROBLEM:</strong>
                                                                {project.output.story.problem}
                                                            </div>
                                                            <div>
                                                                <strong className="text-primary block mb-1">SOLUTION:</strong>
                                                                {project.output.story.solution}
                                                            </div>
                                                            <div>
                                                                <strong className="text-primary block mb-1">TECH:</strong>
                                                                {project.output.story.tech}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </section>

                                            {/* Architecture */}
                                            <section>
                                                <h3 className="text-lg font-bold text-secondary mb-2 flex items-center"><Code className="w-4 h-4 mr-2" /> ARCH_DIAGRAM</h3>
                                                <div className="bg-black/50 p-4 rounded border border-white/10 overflow-x-auto">
                                                    <MermaidChart chart={project.output.diagram} />
                                                </div>
                                            </section>

                                            {/* Game Quests & Cheat Sheet Grid */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="bg-primary/5 p-4 rounded border border-primary/20">
                                                    <h4 className="text-primary font-bold text-sm mb-3">QUEST_LOG (DEMO)</h4>
                                                    <ul className="space-y-2">
                                                        {project.output.game_quests.map((q, i) => (
                                                            <li key={i} className="flex justify-between text-xs">
                                                                <span>{q.title}</span>
                                                                <span className="text-primary">+{q.xp}XP</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                                <div className="bg-secondary/5 p-4 rounded border border-secondary/20">
                                                    <h4 className="text-secondary font-bold text-sm mb-3">CHEAT_SHEET</h4>
                                                    <div className="space-y-2 text-xs">
                                                        <p>INNOVATION_SCORE: {project.output.cheat_sheet.innovation_score}/100</p>
                                                        <div className="flex flex-wrap gap-1">
                                                            {project.output.cheat_sheet.tech_stack_array.map((tech, i) => (
                                                                <span key={i} className="bg-white/10 px-1 rounded">{tech}</span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Scripts */}
                                            <section>
                                                <h3 className="text-lg font-bold text-secondary mb-2 flex items-center"><PlayCircle className="w-4 h-4 mr-2" /> DEMO_SCRIPT</h3>
                                                <div className="bg-black p-4 rounded border border-white/10 font-mono text-xs space-y-2 max-h-60 overflow-y-auto">
                                                    {project.output.demo_script.map((step, i) => (
                                                        <div key={i} className="grid grid-cols-12 gap-2">
                                                            <span className="col-span-2 text-primary">{step.time}</span>
                                                            <span className="col-span-10">
                                                                <span className="text-secondary uppercase">[{step.action}]</span> {step.script}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </section>
                                        </div>
                                    )}

                                    {project.status === "generating" && (
                                        <div className="p-12 flex flex-col items-center justify-center text-primary space-y-4">
                                            <Cpu className="w-12 h-12 animate-spin" />
                                            <span className="animate-pulse">PROCESSING_DATA...</span>
                                        </div>
                                    )}

                                    {project.status === "error" && (
                                        <div className="p-4 text-destructive text-center">
                                            SYSTEM_FAILURE: Generative process interrupted.
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {projects.length === 0 && !loading && (
                            <div className="text-center text-muted-foreground p-12 border border-dashed border-white/10 rounded-lg">
                                NO_PROJECTS_DETECTED. INITIATE_FIRST_PROTOCOL.
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <TeamModal
                isOpen={isTeamModalOpen}
                onClose={() => setIsTeamModalOpen(false)}
                userId={user?.uid || ""}
                onTeamJoined={handleTeamJoined}
            />
        </div>
    );
}
