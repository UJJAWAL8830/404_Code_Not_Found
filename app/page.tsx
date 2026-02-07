"use client";

import { signInWithPopup, GithubAuthProvider } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Github, Terminal, Cpu, Wifi } from "lucide-react";

export default function Home() {
  const router = useRouter();

  const handleLogin = async () => {
    try {
      const provider = new GithubAuthProvider();
      await signInWithPopup(auth, provider);
      router.push("/dashboard");
    } catch (error) {
      console.error("Login failed:", error);
      alert("System Access Denied. Check console logs.");
    }
  };

  return (
    <main className="min-h-screen grid grid-cols-1 md:grid-cols-2 bg-background text-foreground overflow-hidden">

      {/* LEFT SIDE: Visuals / Cyberpunk City Loop */}
      <div className="relative hidden md:flex flex-col items-center justify-center bg-black overflow-hidden border-r border-primary/20">
        {/* Animated Grid Background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)]"></div>

        {/* Glowing Core */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-primary/20 rounded-full blur-[120px] animate-pulse"></div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5 }}
          className="z-10 text-center space-y-4 p-8"
        >
          <div className="inline-block p-4 border border-primary/30 rounded-full bg-black/50 backdrop-blur-md mb-6 shadow-[0_0_30px_rgba(57,255,20,0.2)]">
            <Terminal className="w-16 h-16 text-primary" />
          </div>
          <h1 className="text-5xl font-black tracking-tighter text-white">
            DEVSTORY <span className="text-primary">OS</span>
          </h1>
          <p className="text-muted-foreground font-mono text-sm tracking-widest uppercase">
            v2.0 // Hackathon_Operating_System
          </p>
        </motion.div>

        {/* Floating Code Snippets Effect (Decorative) */}
        <div className="absolute bottom-10 left-10 text-[10px] font-mono text-primary/40 space-y-1 opacity-50">
          <p>&gt; IP_ADDRESS: 127.0.0.1</p>
          <p>&gt; CONNECTION: SECURE</p>
          <p>&gt; ENCRYPTION: AES-256</p>
        </div>
      </div>

      {/* RIGHT SIDE: Login Interface */}
      <div className="relative flex flex-col items-center justify-center p-8 md:p-16 bg-[#0a0a0a]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent"></div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="w-full max-w-md space-y-8 relative z-10"
        >
          {/* Login Card */}
          <div className="bg-card/40 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-2xl">
            <div className="space-y-2 mb-8 text-center md:text-left">
              <h2 className="text-2xl font-bold text-white flex items-center justify-center md:justify-start gap-2">
                <Cpu className="w-5 h-5 text-primary" />
                <span>IDENTIFY_USER</span>
              </h2>
              <p className="text-sm text-muted-foreground font-mono">
                Please authenticate to access the War Room.
              </p>
            </div>

            <div className="space-y-4">
              <button
                onClick={handleLogin}
                className="w-full group relative px-6 py-4 bg-primary text-black font-mono font-bold tracking-wider hover:bg-primary/90 transition-all duration-300 shadow-[0_0_20px_rgba(57,255,20,0.3)] hover:shadow-[0_0_30px_rgba(57,255,20,0.5)] flex items-center justify-center gap-3 overflow-hidden rounded-lg"
              >
                <Github className="w-5 h-5" />
                <span>AUTHENTICATE_GITHUB</span>

                {/* Glitch Effect */}
                <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500"></div>
              </button>

              <div className="grid grid-cols-2 gap-4">
                <button disabled className="px-4 py-3 border border-white/10 rounded-lg text-xs font-mono text-muted-foreground hover:bg-white/5 transition-colors cursor-not-allowed flex items-center justify-center gap-2">
                  <span>GUEST_ACCESS</span>
                </button>
                <button disabled className="px-4 py-3 border border-white/10 rounded-lg text-xs font-mono text-muted-foreground hover:bg-white/5 transition-colors cursor-not-allowed flex items-center justify-center gap-2">
                  <span>GOOGLE_OAUTH</span>
                </button>
              </div>
            </div>
          </div>

          {/* Footer Status */}
          <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground/60 border-t border-white/5 pt-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
              <span>SYSTEM_STATUS: ONLINE</span>
            </div>
            <div className="flex items-center gap-2">
              <Wifi className="w-3 h-3" />
              <span>LATENCY: 12ms</span>
            </div>
          </div>

        </motion.div>
      </div>
    </main>
  );
}
