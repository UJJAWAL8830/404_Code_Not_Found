"use client";

import { useState } from "react";
import { createTeam, joinTeam } from "@/lib/teams";
import { Users, Plus, ArrowRight, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

interface TeamModalProps {
    userId: string;
    onTeamJoined: () => void;
    isOpen: boolean;
    onClose: () => void;
}

export default function TeamModal({ userId, onTeamJoined, isOpen, onClose }: TeamModalProps) {
    const [mode, setMode] = useState<"create" | "join">("create");
    const [inputVal, setInputVal] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    if (!isOpen) return null;

    const handleAction = async () => {
        if (!inputVal.trim()) return;
        setLoading(true);
        setError("");

        try {
            if (mode === "create") {
                await createTeam(inputVal, userId);
            } else {
                await joinTeam(inputVal, userId);
            }
            onTeamJoined();
            onClose();
        } catch (err: any) {
            console.error(err);
            setError(mode === "create" ? "Failed to create team." : "Failed to join. Check ID.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-[#0a0a0a] border border-primary/30 w-full max-w-md p-6 rounded-xl shadow-[0_0_50px_rgba(57,255,20,0.15)] relative overflow-hidden"
            >
                {/* Decorative Elements */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50"></div>

                <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                    <Users className="w-6 h-6 mr-3 text-primary" />
                    {mode === "create" ? "INIT_NEW_SQUAD" : "JOIN_NETWORK"}
                </h2>

                <div className="flex space-x-1 mb-6 bg-white/5 p-1 rounded-lg">
                    <button
                        onClick={() => setMode("create")}
                        className={`flex-1 py-2 text-sm font-bold rounded transition-all ${mode === "create" ? "bg-primary text-black shadow" : "text-muted-foreground hover:text-white"}`}
                    >
                        CREATE
                    </button>
                    <button
                        onClick={() => setMode("join")}
                        className={`flex-1 py-2 text-sm font-bold rounded transition-all ${mode === "join" ? "bg-secondary text-black shadow" : "text-muted-foreground hover:text-white"}`}
                    >
                        JOIN
                    </button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-xs uppercase text-muted-foreground mb-2">
                            {mode === "create" ? "SQUAD_NAME" : "ACCESS_CODE (TEAM ID)"}
                        </label>
                        <input
                            type="text"
                            value={inputVal}
                            onChange={(e) => setInputVal(e.target.value)}
                            placeholder={mode === "create" ? "e.g. Cyber Ninjas" : "Paste long ID here..."}
                            className="w-full bg-black border border-white/20 rounded p-3 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-mono"
                        />
                    </div>

                    {error && <p className="text-destructive text-xs font-mono border border-destructive/20 p-2 rounded bg-destructive/5">{error}</p>}

                    <button
                        onClick={handleAction}
                        disabled={loading || !inputVal.trim()}
                        className={`w-full py-4 rounded font-bold flex items-center justify-center space-x-2 transition-all group ${mode === "create" ? "bg-primary/20 text-primary border border-primary hover:bg-primary hover:text-black" : "bg-secondary/20 text-secondary border border-secondary hover:bg-secondary hover:text-black"
                            }`}
                    >
                        {loading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <>
                                <span>{mode === "create" ? "ESTABLISH_LINK" : "CONNECT_UPLINK"}</span>
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>
                </div>

                <div className="mt-4 text-center">
                    <button onClick={onClose} className="text-xs text-muted-foreground hover:text-white underline decoration-dashed">
                        ABORT_MISSION (CLOSE)
                    </button>
                </div>

            </motion.div>
        </div>
    );
}
