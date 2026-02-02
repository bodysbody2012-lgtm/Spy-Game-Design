import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Play, Trophy, LogOut } from "lucide-react";
import { NeonButton, GlassCard, PageTransition, Header } from "@/components/ui-components";

export default function Menu() {
  const { logout } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-black relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px]" />
      <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-accent/10 rounded-full blur-[80px]" />

      <div className="w-full max-w-md relative z-10">
        <PageTransition>
          <Header title="MAIN MENU" subtitle="Select an operation" />

          <div className="space-y-4">
            <Link href="/game/mode">
              <button className="group w-full relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary via-purple-600 to-primary rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-300 animate-pulse"></div>
                <div className="relative bg-black border border-white/10 rounded-2xl p-8 flex items-center justify-between group-hover:-translate-y-1 transition-transform duration-300">
                  <div className="text-left">
                    <h3 className="text-2xl font-black italic uppercase tracking-wider text-white">Play Game</h3>
                    <p className="text-purple-300 text-sm mt-1">Start a new mission</p>
                  </div>
                  <Play className="h-8 w-8 text-white group-hover:scale-110 transition-transform" fill="currentColor" />
                </div>
              </button>
            </Link>

            <Link href="/leaderboard">
              <GlassCard className="flex items-center justify-between group cursor-pointer hover:bg-white/5 transition-colors">
                <div className="text-left">
                  <h3 className="text-xl font-bold uppercase tracking-wide">Leaderboard</h3>
                  <p className="text-gray-400 text-sm">View top agents</p>
                </div>
                <Trophy className="h-6 w-6 text-yellow-500 group-hover:rotate-12 transition-transform" />
              </GlassCard>
            </Link>

            <NeonButton 
              variant="ghost" 
              className="w-full mt-8 text-gray-500 hover:text-red-400"
              onClick={() => logout.mutate()}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Abort Mission (Logout)
            </NeonButton>
          </div>
        </PageTransition>
      </div>
    </div>
  );
}
