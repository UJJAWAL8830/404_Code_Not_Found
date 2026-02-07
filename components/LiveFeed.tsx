"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, limit, onSnapshot, Timestamp } from "firebase/firestore";
import { Activity, UserMinus, UserPlus, Zap, Trophy, GitCommit } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface LogItem {
    id: string;
    message: string;
    type: "join" | "leave" | "action" | "reward" | "system";
    userId: string;
    userName: string;
    timestamp: any;
}

export default function LiveFeed({ teamId }: { teamId?: string }) {
    const [logs, setLogs] = useState<LogItem[]>([]);

    useEffect(() => {
        if (!teamId) return;

        const q = query(
            collection(db, "teams", teamId, "activityLog"),
            orderBy("timestamp", "desc"),
            limit(20)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const newLogs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as LogItem[];
            setLogs(newLogs);
        });

        return () => unsubscribe();
    }, [teamId]);

    const getIcon = (type: string) => {
        switch (type) {
            case "join": return <UserPlus className="w-3 h-3 text-green-400" />;
            case "leave": return <UserMinus className="w-3 h-3 text-red-400" />;
            case "reward": return <Trophy className="w-3 h-3 text-yellow-400" />;
            case "action": return <Zap className="w-3 h-3 text-blue-400" />;
            default: return <Activity className="w-3 h-3 text-gray-400" />;
        }
    };

    if (!teamId) return <div className="text-xs text-muted-foreground p-4">SELECT_TEAM_TO_VIEW_FEED...</div>;

    return (
        <div className="h-full flex flex-col bg-black/40 border-l border-white/10">
            <div className="p-3 border-b border-white/10 flex items-center justify-between">
                <span className="text-xs font-bold text-primary flex items-center gap-2">
                    <Activity className="w-4 h-4" /> LIVE_FEED_PROTOCOL
                </span>
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-primary/20">
                <AnimatePresence initial={false}>
                    {logs.map((log) => (
                        <motion.div
                            key={log.id}
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0 }}
                            className="text-xs font-mono"
                        >
                            <div className="flex gap-2 text-muted-foreground mb-1">
                                <span>{log.timestamp?.toDate ? log.timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}</span>
                                <span className="opacity-50">::</span>
                            </div>
                            <div className="p-2 rounded bg-white/5 border border-white/5 relative overflow-hidden group">
                                <div className="absolute top-0 left-0 w-[2px] h-full bg-white/20 group-hover:bg-primary transition-colors"></div>
                                <div className="flex items-start gap-2">
                                    <div className="mt-0.5">{getIcon(log.type)}</div>
                                    <span className="text-gray-300">
                                        <span className="text-primary font-bold">@{log.userName}</span> {log.message}
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                    {logs.length === 0 && (
                        <div className="text-center text-muted-foreground opacity-50 pt-10">
                            NO_ACTIVITY_DETECTED
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
