"use client";

import { motion } from "framer-motion";
import { User, Shield, Zap, Target, Star, X } from "lucide-react";
import { TeamMember } from "@/lib/teams";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface OperativeModalProps {
    isOpen: boolean;
    onClose: () => void;
    member: TeamMember | null;
}

export default function OperativeModal({ isOpen, onClose, member }: OperativeModalProps) {
    if (!isOpen || !member) return null;

    // Mock Data for Phase C (Will be connected to backend in Phase D)
    const stats = {
        level: 5,
        xp: 450,
        nextLevelXp: 1000,
        rank: "ARCHITECT",
        badges: ["Night Owl", "First Blood", "Prompt Master"],
        contribution: [
            { day: "Mon", value: 40 },
            { day: "Tue", value: 30 },
            { day: "Wed", value: 70 },
            { day: "Thu", value: 20 },
            { day: "Fri", value: 90 },
            { day: "Sat", value: 50 },
            { day: "Sun", value: 10 },
        ]
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-[#0a0a0a] border border-primary/30 w-full max-w-2xl rounded-xl shadow-[0_0_50px_rgba(57,255,20,0.15)] relative overflow-hidden flex flex-col md:flex-row"
            >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50"></div>
                <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-white z-10">
                    <X className="w-5 h-5" />
                </button>

                {/* LEFT: Identity Column */}
                <div className="w-full md:w-1/3 bg-white/5 p-6 flex flex-col items-center text-center border-r border-white/10">
                    <div className="w-24 h-24 rounded-full border-2 border-primary p-1 mb-4 relative">
                        <div className="w-full h-full rounded-full overflow-hidden bg-black">
                            {member.photoURL ? (
                                <img src={member.photoURL} alt={member.displayName} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-neutral-800 text-2xl font-bold">
                                    {member.displayName.substring(0, 1)}
                                </div>
                            )}
                        </div>
                        <div className="absolute -bottom-2 -right-2 bg-black border border-primary text-primary text-[10px] font-bold px-2 py-0.5 rounded-full">
                            LVL {stats.level}
                        </div>
                    </div>

                    <h2 className="text-xl font-bold text-white mb-1">{member.displayName}</h2>
                    <p className="text-xs text-primary font-mono tracking-widest uppercase mb-6">{stats.rank}</p>

                    <div className="w-full space-y-2 mb-6">
                        <div className="flex justify-between text-[10px] text-muted-foreground">
                            <span>XP PROGRESS</span>
                            <span>{stats.xp} / {stats.nextLevelXp}</span>
                        </div>
                        <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-primary transition-all duration-1000" style={{ width: `${(stats.xp / stats.nextLevelXp) * 100}%` }}></div>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 w-full">
                        {stats.badges.map((badge, i) => (
                            <div key={i} className="aspect-square bg-black border border-white/10 rounded flex items-center justify-center text-xs text-muted-foreground hover:border-primary hover:text-primary transition-colors cursor-help" title={badge}>
                                <Star className="w-4 h-4" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* RIGHT: Stats & contribution */}
                <div className="flex-1 p-6 space-y-6">
                    <div>
                        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                            <Zap className="w-4 h-4 text-primary" />
                            CONTRIBUTION_MATRIX
                        </h3>
                        <div className="h-40 w-full bg-black/50 rounded border border-white/5 p-2">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={stats.contribution}>
                                    <XAxis dataKey="day" stroke="#444" fontSize={10} tickLine={false} axisLine={false} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#000', borderColor: '#333', fontSize: '12px' }}
                                        cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                                    />
                                    <Bar dataKey="value" radius={[2, 2, 0, 0]}>
                                        {stats.contribution.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={index === 4 ? '#39FF14' : '#222'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/5 p-4 rounded border border-white/5">
                            <div className="text-xs text-muted-foreground mb-1">MISSION_COMPLETION</div>
                            <div className="text-2xl font-bold text-white">92%</div>
                        </div>
                        <div className="bg-white/5 p-4 rounded border border-white/5">
                            <div className="text-xs text-muted-foreground mb-1">CODE_VELOCITY</div>
                            <div className="text-2xl font-bold text-white">High</div>
                        </div>
                    </div>
                </div>

            </motion.div>
        </div>
    );
}
