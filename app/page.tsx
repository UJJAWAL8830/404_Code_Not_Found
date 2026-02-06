"use client";

import { signInWithPopup, GithubAuthProvider } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Github, Terminal } from "lucide-react";

export default function Home() {
  const router = useRouter();

  const handleLogin = async () => {
    try {
      const provider = new GithubAuthProvider();
      await signInWithPopup(auth, provider);
      router.push("/dashboard");
    } catch (error) {
      console.error("Login failed:", error);
      alert("Login failed. Check console for details.");
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-background text-foreground relative overflow-hidden">
      {/* Grid Background Effect */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

      {/* Cyberpunk Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px] pointer-events-none"></div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="z-10 flex flex-col items-center space-y-8 max-w-2xl w-full"
      >
        <div className="flex items-center space-x-4 mb-4">
          <Terminal className="w-12 h-12 text-primary animate-pulse" />
          <h1 className="text-6xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-primary to-ring drop-shadow-[0_0_10px_rgba(57,255,20,0.5)]">
            DEVSTORY
          </h1>
        </div>

        <p className="text-xl text-muted-foreground text-center font-mono max-w-lg">
           Every line of code has it’s own story
          <br />
          <span className="text-primary font-bold">&gt; Generate winning packages instantly.</span>
        </p>

        <div className="w-full h-px bg-gradient-to-r from-transparent via-border to-transparent my-8"></div>

        <button
          onClick={handleLogin}
          className="group relative px-8 py-4 bg-background border border-primary text-primary font-mono font-bold tracking-widest hover:bg-primary hover:text-black transition-all duration-300 shadow-[0_0_20px_rgba(57,255,20,0.3)] hover:shadow-[0_0_40px_rgba(57,255,20,0.6)]"
        >
          <span className="flex items-center space-x-3">
            <Github className="w-6 h-6" />
            <span>INITIALIZE_LOGIN</span>
          </span>
          <div className="absolute inset-0 border border-primary translate-x-1 translate-y-1 -z-10 group-hover:translate-x-0 group-hover:translate-y-0 transition-transform"></div>
        </button>

        <p className="text-xs text-muted-foreground/50 mt-12 font-mono">
          SYSTEM_READY // WAITING_FOR_USER_INPUT
        </p>
      </motion.div>
    </main>
  );
}
