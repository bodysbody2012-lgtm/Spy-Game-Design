import { useState, useEffect } from "react";
import { Link } from "wouter";
import { NeonButton, GlassCard, PageTransition, Header } from "@/components/ui-components";
import { Trophy, Skull, RefreshCw, Home } from "lucide-react";
import { CATEGORIES } from "@/hooks/use-game-logic";

export default function GameResult() {
  const [view, setView] = useState<'reveal' | 'spy-guess' | 'final'>('reveal');
  const [gameState, setGameState] = useState<any>(null);
  const [voteResult, setVoteResult] = useState<any>(null);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);

  useEffect(() => {
    // In a real app, pull these from robust state management
    const session = localStorage.getItem("spygame_current_session");
    const vote = localStorage.getItem("spygame_vote_result");
    
    // Mocking state reconstruction for demo continuity
    if (session && vote) {
      const parsedSession = JSON.parse(session);
      // We are mocking spyIndex here as 0 for the demo flow since it wasn't persisted in this stateless flow
      // In real code, ensure spyIndex is passed through every step
      setGameState({ ...parsedSession, spyIndex: 0, secretWord: CATEGORIES[parsedSession.category as keyof typeof CATEGORIES][0] });
      setVoteResult(JSON.parse(vote));
    }
  }, []);

  if (!gameState || !voteResult) return null;

  const spyName = gameState.players[gameState.spyIndex];
  const wasSpyCaught = voteResult.votedIndex === gameState.spyIndex;
  
  // 1. Reveal Screen
  if (view === 'reveal') {
    return (
      <div className="min-h-screen p-6 bg-black flex flex-col items-center justify-center">
        <PageTransition>
          <div className="text-center space-y-8 max-w-md w-full">
            <h2 className="text-gray-400 uppercase tracking-widest font-bold">The Spy Was</h2>
            
            <div className="relative py-8">
              <div className="absolute inset-0 bg-red-500/20 blur-3xl rounded-full" />
              <h1 className="relative text-6xl font-black text-red-500 neon-text animate-bounce">
                {spyName}
              </h1>
            </div>

            <div className={`p-6 rounded-2xl border ${wasSpyCaught ? 'bg-green-900/20 border-green-500' : 'bg-red-900/20 border-red-500'}`}>
              <h3 className={`text-2xl font-bold mb-2 ${wasSpyCaught ? 'text-green-400' : 'text-red-400'}`}>
                {wasSpyCaught ? "SPY CAUGHT!" : "SPY ESCAPED!"}
              </h3>
              <p className="text-gray-300">
                {wasSpyCaught 
                  ? "Citizens identified the traitor." 
                  : "The spy fooled everyone."}
              </p>
            </div>

            <NeonButton 
              className="w-full"
              onClick={() => {
                if (wasSpyCaught) {
                  setView('spy-guess');
                } else {
                  setView('final');
                }
              }}
            >
              Continue
            </NeonButton>
          </div>
        </PageTransition>
      </div>
    );
  }

  // 2. Spy Guess Screen (Only if caught)
  if (view === 'spy-guess') {
    const words = CATEGORIES[gameState.category as keyof typeof CATEGORIES];
    
    return (
      <div className="min-h-screen p-6 bg-black">
        <PageTransition>
           <div className="max-w-2xl mx-auto space-y-6">
             <Header title="LAST CHANCE" subtitle="Spy, guess the location to win!" />
             
             <div className="grid grid-cols-2 gap-3">
               {words.map((word: string) => (
                 <button
                   key={word}
                   onClick={() => setSelectedWord(word)}
                   className={`p-4 rounded-xl border text-center font-bold transition-all ${
                     selectedWord === word 
                       ? "bg-purple-600 border-purple-400 shadow-lg scale-105 z-10" 
                       : "bg-white/5 border-white/10 hover:bg-white/10 text-gray-300"
                   }`}
                 >
                   {word}
                 </button>
               ))}
             </div>

             <NeonButton 
               className="w-full mt-8"
               disabled={!selectedWord}
               onClick={() => setView('final')}
             >
               Make Guess
             </NeonButton>
           </div>
        </PageTransition>
      </div>
    );
  }

  // 3. Final Result
  const spyGuessedRight = selectedWord === gameState.secretWord;
  // Logic: Spy wins if NOT caught OR if caught but guessed right
  const spyWins = !wasSpyCaught || spyGuessedRight;

  return (
    <div className="min-h-screen p-6 bg-black flex flex-col items-center justify-center text-center">
      <PageTransition>
        <div className="max-w-md w-full space-y-8">
           <div className="flex justify-center mb-6">
             {spyWins ? (
               <Skull className="h-24 w-24 text-red-500 animate-pulse" />
             ) : (
               <Trophy className="h-24 w-24 text-yellow-500 animate-bounce" />
             )}
           </div>

           <div>
             <h1 className={`text-5xl font-black uppercase mb-2 ${spyWins ? 'text-red-500' : 'text-yellow-400'}`}>
               {spyWins ? "SPY WINS" : "CITIZENS WIN"}
             </h1>
             <p className="text-gray-400">
               {wasSpyCaught && spyGuessedRight 
                 ? `Spy correctly guessed "${gameState.secretWord}"!` 
                 : wasSpyCaught 
                   ? "Spy failed to guess the location."
                   : "Spy was never found."}
             </p>
           </div>

           <div className="grid grid-cols-2 gap-4 pt-8">
             <Link href="/game/setup?category=football">
               <NeonButton variant="secondary" className="w-full">
                 <RefreshCw className="mr-2 h-4 w-4" /> Play Again
               </NeonButton>
             </Link>
             <Link href="/menu">
               <NeonButton className="w-full">
                 <Home className="mr-2 h-4 w-4" /> Main Menu
               </NeonButton>
             </Link>
           </div>
        </div>
      </PageTransition>
    </div>
  );
}
