import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useGameLogic, type CategoryKey } from "@/hooks/use-game-logic";
import { NeonButton, GlassCard, PageTransition, Header } from "@/components/ui-components";
import { Eye, EyeOff, User, Fingerprint, Crown, CheckCircle2, ArrowRight, Info } from "lucide-react";
import { playSFX } from "@/components/audio-controller";

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
  }, [game.players.length]); // Use length to avoid re-triggering if reference changes

  if (game.players.length === 0) {
    const initialized = localStorage.getItem("spygame_initialized");
    const saved = localStorage.getItem("spygame_current_session");
    
    if (initialized === "true" && saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.players && parsed.players.length > 0) {
          game.setPlayers(parsed.players);
          game.setSelectedCategory(parsed.category);
          return (
            <div className="min-h-screen p-6 bg-black flex items-center justify-center">
              <div className="text-primary animate-pulse text-xl font-bold">RESTORING SESSION...</div>
            </div>
          );
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

  // Pre-load components and logic for next phase
  useEffect(() => {
    if (allRevealed) {
      // Immediate transition
    }
  }, [allRevealed]);

  const assignments = JSON.parse(localStorage.getItem("spygame_current_session") || "{}").assignments || [];

  // 3. Discussion Phase
  if (allRevealed) {
    const currentAssignment = assignments[questionIdx];

    return (
      <div className="min-h-screen p-6 bg-black flex flex-col items-center justify-center">
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
      </div>
    );
  }

  // 1 & 2. Role Reveal Phase
  const playerName = game.players[game.currentTurn];
  const isRevealed = revealed[game.currentTurn];
  
  // Re-fetch spy index from storage to be safe
  const savedSession = JSON.parse(localStorage.getItem("spygame_current_session") || "{}");
  const actualSpyIndex = savedSession.spyIndex;
  const actualSecretWord = savedSession.secretWord;
  const isSpy = actualSpyIndex === game.currentTurn;

  // Memoize random words for spy guess to prevent re-renders
  const [spyGuessWords, setSpyGuessWords] = useState<string[]>([]);
  
  useEffect(() => {
    if (allRevealed && spyGuessWords.length === 0) {
      const categoryWords = CATEGORIES[game.selectedCategory || "football"];
      const others = categoryWords.filter(w => w !== game.secretWord);
      const randomOthers = others.sort(() => 0.5 - Math.random()).slice(0, 9);
      setSpyGuessWords([game.secretWord!, ...randomOthers].sort(() => 0.5 - Math.random()));
    }
  }, [allRevealed, game.selectedCategory, game.secretWord]);

  return (
    <div className="min-h-screen p-6 bg-black flex flex-col items-center justify-center">
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
                <div className="mt-4">
                  {isSpy ? (
                    <div className="space-y-4">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <div className="bg-red-500/20 p-4 rounded-full">
                          <Crown className="h-12 w-12 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]" />
                        </div>
                        <span className="text-4xl font-black italic tracking-tighter text-red-500 neon-text-red">YOU ARE THE SPY</span>
                      </div>
                      <p className="text-gray-300 text-base font-medium">Blend in. Don't let them find you.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <p className="text-gray-400 text-sm uppercase tracking-widest font-bold">Your Secret Word</p>
                      <div className="bg-primary/10 border border-primary/30 p-6 rounded-2xl shadow-[0_0_20px_rgba(var(--primary),0.1)] relative group">
                        <span className="text-5xl font-black text-primary neon-text tracking-tighter block drop-shadow-[0_0_10px_rgba(var(--primary),0.8)]">
                          {actualSecretWord ? (actualSecretWord.charAt(0).toUpperCase() + actualSecretWord.slice(1).toLowerCase()) : "LOADING..."}
                        </span>
                        
                        <a 
                          href={`https://www.google.com/search?q=${actualSecretWord}+meaning`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="absolute -top-3 -right-3 p-2 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-500 transition-colors"
                          title="What is this?"
                        >
                          <Info className="h-5 w-5" />
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <NeonButton 
                  variant="primary"
                  className="mt-4 w-full h-14"
                  onClick={() => {
                    playSFX("click");
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
              className="w-full h-16 text-xl"
              onClick={handleNext}
            >
              <CheckCircle2 className="mr-2 h-6 w-6" /> I've seen it
            </NeonButton>
          )}
        </div>
    </div>
  );
}
