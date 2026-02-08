import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useGameLogic, type CategoryKey } from "@/hooks/use-game-logic";
import { NeonButton, GlassCard, PageTransition, Header } from "@/components/ui-components";
import { Eye, EyeOff, User, Fingerprint, Crown, CheckCircle2, ArrowRight } from "lucide-react";

export default function GamePlay() {
  const [location, setLocation] = useLocation();
  const game = useGameLogic();
  const [revealed, setRevealed] = useState<boolean[]>([]);
  const [allRevealed, setAllRevealed] = useState(false);
  const [questionIdx, setQuestionIdx] = useState(0);

  useEffect(() => {
    if (game.players.length > 0 && revealed.length === 0) {
      setRevealed(new Array(game.players.length).fill(false));
    }
  }, [game.players]);

  if (game.players.length === 0) {
    const initialized = localStorage.getItem("spygame_initialized");
    const saved = localStorage.getItem("spygame_current_session");
    
    if (initialized === "true" && saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.players && parsed.players.length > 0) {
          game.setPlayers(parsed.players);
          game.setSelectedCategory(parsed.category);
        } else {
          setLocation("/game/mode");
          return null;
        }
      } catch (e) {
        setLocation("/game/mode");
        return null;
      }
    } else {
      setLocation("/game/mode");
      return null;
    }
  }

  const handleNext = () => {
    if (game.currentTurn < game.players.length - 1) {
      game.nextTurn();
    } else {
      setAllRevealed(true);
      game.nextTurn();
    }
  };

  const assignments = JSON.parse(localStorage.getItem("spygame_current_session") || "{}").assignments || [];

  // 3. Discussion Phase
  if (allRevealed) {
    const currentAssignment = assignments[questionIdx];

    return (
      <div className="min-h-screen p-6 bg-black flex flex-col items-center justify-center">
        <PageTransition>
          <div className="text-center space-y-8 max-w-md w-full">
            <Header title={`QUESTION ${questionIdx + 1} / 12`} subtitle="Follow the order" />

            <div className="space-y-6">
              {currentAssignment ? (
                <GlassCard className="p-8 border-primary/30 bg-primary/5 shadow-[0_0_20px_rgba(var(--primary),0.1)]">
                  <p className="text-sm text-gray-400 uppercase tracking-widest mb-4">Turn Order</p>
                  <div className="flex flex-col items-center gap-4">
                    <span className="text-3xl font-black text-primary neon-text">{currentAssignment.asker}</span>
                    <span className="text-gray-500 font-bold italic">asks</span>
                    <span className="text-3xl font-black text-blue-400 neon-text">{currentAssignment.target}</span>
                  </div>
                </GlassCard>
              ) : (
                <GlassCard className="p-8 border-green-500/30 bg-green-500/5">
                  <p className="text-xl font-bold text-green-400">All questions completed!</p>
                </GlassCard>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4">
              {questionIdx < 11 ? (
                <NeonButton 
                  className="w-full h-16 text-xl"
                  onClick={() => setQuestionIdx(prev => prev + 1)}
                >
                  Next Question <ArrowRight className="ml-2 h-6 w-6" />
                </NeonButton>
              ) : (
                <NeonButton 
                  className="w-full h-16 text-xl bg-red-600"
                  onClick={() => setLocation("/game/vote")}
                >
                  Proceed to Vote
                </NeonButton>
              )}
              
              <NeonButton 
                variant="ghost"
                className="w-full text-gray-500 hover:text-white"
                onClick={() => setLocation("/game/vote")}
              >
                Skip to Voting
              </NeonButton>
            </div>
          </div>
        </PageTransition>
      </div>
    );
  }

  // 1 & 2. Role Reveal Phase
  const playerName = game.players[game.currentTurn];
  const isRevealed = revealed[game.currentTurn];
  const isSpy = game.spyIndex === game.currentTurn;

  return (
    <div className="min-h-screen p-6 bg-black flex flex-col items-center justify-center">
      <PageTransition>
        <div className="text-center space-y-8 max-w-md w-full">
          <Header 
            title={playerName || "NEXT PLAYER"} 
            subtitle={`Pass the phone to ${playerName || 'next player'}`} 
          />

          <GlassCard className={`p-10 transition-all duration-500 ${isRevealed ? 'border-primary shadow-[0_0_30px_rgba(var(--primary),0.2)]' : 'border-white/10'}`}>
            <div className="flex flex-col items-center gap-6">
              <div className="p-4 bg-white/5 rounded-full">
                <Fingerprint className={`h-16 w-16 ${isRevealed ? 'text-primary' : 'text-gray-600'}`} />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-2xl font-black tracking-tighter uppercase">{playerName}</h3>
                <p className="text-gray-500 text-sm font-medium uppercase tracking-widest">Identify your mission</p>
              </div>

              {isRevealed ? (
                <div className="mt-4 animate-in fade-in zoom-in duration-300">
                  {isSpy ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-center gap-2 text-red-500">
                        <Crown className="h-6 w-6" />
                        <span className="text-3xl font-black italic tracking-tighter">YOU ARE THE SPY</span>
                      </div>
                      <p className="text-gray-400 text-sm">Blend in. Don't let them find you.</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-gray-400 text-sm uppercase tracking-widest">Your Secret Word</p>
                      <span className="text-4xl font-black text-primary neon-text tracking-tighter uppercase block">
                        {game.secretWord}
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <NeonButton 
                  variant="primary"
                  className="mt-4 w-full h-14"
                  onClick={() => {
                    const newRevealed = [...revealed];
                    newRevealed[game.currentTurn] = true;
                    setRevealed(newRevealed);
                  }}
                >
                  <Eye className="mr-2 h-5 w-5" /> Reveal Secret
                </NeonButton>
              )}
            </div>
          </GlassCard>

          {isRevealed && (
            <NeonButton 
              className="w-full h-16 text-xl animate-in slide-in-from-bottom-4 duration-500"
              onClick={handleNext}
            >
              <CheckCircle2 className="mr-2 h-6 w-6" /> I've seen it
            </NeonButton>
          )}
        </div>
      </PageTransition>
    </div>
  );
}
