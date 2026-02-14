import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { NeonButton, GlassCard, PageTransition, Header } from "@/components/ui-components";
import { Trophy, Skull, RefreshCw, Home } from "lucide-react";
import { CATEGORIES } from "@/hooks/use-game-logic";

export default function GameResult() {
  const [location, setLocation] = useLocation();
  const [view, setView] = useState<'reveal' | 'spy-guess' | 'final'>('reveal');
  const [gameState, setGameState] = useState<any>(null);
  const [voteResult, setVoteResult] = useState<any>(null);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [guessConfirmed, setGuessConfirmed] = useState(false);

  useEffect(() => {
    const session = localStorage.getItem("spygame_current_session");
    const vote = localStorage.getItem("spygame_vote_result");
    if (session && vote) {
      setGameState(JSON.parse(session));
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
                  ? "Citizens identified the traitor. Now the Spy must guess the word!" 
                  : "The spy fooled everyone and wins!"}
              </p>
            </div>

            <NeonButton 
              className="w-full"
              onClick={() => {
                // Spy ALWAYS guesses now
                setView('spy-guess');
              }}
            >
              Continue
            </NeonButton>
          </div>
        </PageTransition>
      </div>
    );
  }

  // 2. Spy Guess Screen
  const [displayWords, setDisplayWords] = useState<string[]>([]);

  useEffect(() => {
    if (view === 'spy-guess' && gameState && displayWords.length === 0) {
      const allWords = CATEGORIES[gameState.category as keyof typeof CATEGORIES];
      const secretWord = gameState.secretWord;
      
      // Select 10 words including the secret word
      const otherWords = allWords.filter(w => w !== secretWord);
      const shuffledOthers = [...otherWords].sort(() => 0.5 - Math.random());
      const words = [secretWord, ...shuffledOthers.slice(0, 9)].sort(() => 0.5 - Math.random());
      setDisplayWords(words);
    }
  }, [view, gameState, displayWords.length]);

  if (view === 'spy-guess' && !guessConfirmed) {
    return (
      <div className="min-h-screen p-6 bg-black flex flex-col items-center justify-center">
        <PageTransition>
           <div className="max-w-2xl mx-auto space-y-6 text-center">
             <Header title="SPY'S TURN" subtitle={`${spyName}, guess the secret word!`} />
             
             <div className="grid grid-cols-2 gap-3">
               {displayWords.map((word: string) => (
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
               className="w-full mt-8 h-16 text-xl"
               disabled={!selectedWord}
               onClick={() => setGuessConfirmed(true)}
             >
               Confirm Guess
             </NeonButton>
           </div>
        </PageTransition>
      </div>
    );
  }

  // Final Reveal Logic
  const spyGuessedRight = selectedWord === gameState.secretWord;
  const spyWins = spyGuessedRight || !wasSpyCaught;

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
               The secret word was <span className="text-white font-bold">"{gameState.secretWord}"</span>.
               <br />
               {spyGuessedRight 
                 ? `Spy guessed correctly!` 
                 : `Spy guessed "${selectedWord}" and failed.`}
             </p>
           </div>

           <NeonButton onClick={() => setLocation("/menu")} className="w-full">
             Back to Menu
           </NeonButton>
        </div>
      </PageTransition>
    </div>
  );
}
