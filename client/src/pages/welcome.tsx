import { Link } from "wouter";
import { PageTransition, NeonButton } from "@/components/ui-components";
import introImg from "@assets/New_Bitmap_Image_1770752351617.bmp";

export default function Welcome() {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md w-full space-y-8">
        <div className="space-y-6 py-12">
          <h2 className="text-xl font-bold text-primary/80 tracking-[0.3em] uppercase animate-pulse">
            This game is developed by
          </h2>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white neon-text uppercase italic drop-shadow-[0_0_15px_rgba(var(--primary),0.5)]">
            Abdelwahab Ahmed
          </h1>
        </div>
        
        <div className="space-y-4">
          <p className="text-gray-400 font-medium leading-relaxed max-w-sm mx-auto">
            The ultimate multiplayer social deduction experience. <br/>
            Play with friends, find the spy, and win the game.
          </p>
        </div>

        <div className="pt-6">
          <Link href="/login">
            <NeonButton className="w-full h-16 text-xl shadow-[0_0_20px_rgba(var(--primary),0.3)] hover:shadow-[0_0_40px_rgba(var(--primary),0.6)] transition-all bg-primary/20 border-primary/40 hover:bg-primary/30">
              START MISSION
            </NeonButton>
          </Link>
        </div>
      </div>
    </div>
  );
}
