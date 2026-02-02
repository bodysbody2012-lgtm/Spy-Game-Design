import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useGameLogic, type CategoryKey } from "@/hooks/use-game-logic";
import { NeonButton, GlassCard, PageTransition, Header } from "@/components/ui-components";
import { Eye, EyeOff, User, Fingerprint, Crown, CheckCircle2 } from "lucide-react";

export default function GamePlay() {
  const [location, setLocation] = useLocation();
  const game = useGameLogic();
  
  const [showRole, setShowRole] = useState(false);
  const [sessionLoaded, setSessionLoaded] = useState(false);

  // Initialize game from local storage session
  useEffect(() => {
    const sessionData = localStorage.getItem("spygame_current_session");
    if (!sessionData) {
      setLocation("/game/setup");
      return;
    }
    
    const { players, category } = JSON.parse(sessionData);
    game.startGame(players, category);
    setSessionLoaded(true);
  }, []);

  if (!sessionLoaded || !game.isGameActive) return null;

  const currentPlayer = game.players[game.currentTurn];
  const isSpy = game.currentTurn === game.spyIndex;

  // Render different screens based on game state
  
  // 1. Pass phone screen
  if (!showRole && game.currentTurn < game.players.length) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-black">
        <PageTransition>
          <div className="text-center space-y-8">
            <div className="w-24 h-24 mx-auto bg-primary/20 rounded-full flex items-center justify-center animate-pulse">
              <User className="h-12 w-12 text-primary" />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-gray-400 font-display tracking-widest uppercase">Pass the device to</h2>
              <h1 className="text-4xl md:text-6xl font-black text-white neon-text">{currentPlayer}</h1>
            </div>

            <NeonButton 
              onClick={() => setShowRole(true)}
              className="w-full max-w-xs mx-auto text-lg h-16"
            >
              <Fingerprint className="mr-2 h-6 w-6" />
              Reveal Identity
            </NeonButton>
          </div>
        </PageTransition>
      </div>
    );
  }

  // 2. Role Reveal Screen
  if (showRole && game.currentTurn < game.players.length) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-6 transition-colors duration-500 ${isSpy ? 'bg-red-950/30' : 'bg-blue-950/30'}`}>
        <PageTransition>
          <GlassCard className="max-w-md mx-auto text-center py-12 px-8 border-2 border-white/20">
            <div className="mb-8">
              {isSpy ? (
                <EyeOff className="h-20 w-20 mx-auto text-red-500 mb-4" />
              ) : (
                <Crown className="h-20 w-20 mx-auto text-blue-500 mb-4" />
              )}
              
              <h2 className="text-xl text-gray-400 uppercase tracking-widest font-bold mb-2">
                {isSpy ? "You are the" : "Your secret word is"}
              </h2>
              
              <h1 className={`text-4xl md:text-5xl font-black uppercase ${isSpy ? 'text-red-500' : 'text-blue-400 neon-text'}`}>
                {isSpy ? "SPY" : game.secretWord}
              </h1>
              
              {isSpy && (
                <p className="mt-4 text-red-300 font-medium">Try to blend in and guess the word!</p>
              )}
            </div>

            <NeonButton 
              className={`w-full ${isSpy ? 'bg-red-600 hover:bg-red-700 shadow-red-500/20' : ''}`}
              onClick={() => {
                setShowRole(false);
                game.nextTurn();
              }}
            >
              <CheckCircle2 className="mr-2 h-5 w-5" />
              Understand & Pass
            </NeonButton>
          </GlassCard>
        </PageTransition>
      </div>
    );
  }

  // 3. All players revealed -> Discussion Phase
  const assignments = JSON.parse(localStorage.getItem("spygame_current_session") || "{}").assignments || [];

  return (
    <div className="min-h-screen p-6 bg-black flex flex-col items-center justify-center">
      <PageTransition>
        <div className="text-center space-y-8 max-w-md w-full">
          <Header title="DISCUSS" subtitle="Follow the question order" />

          <div className="space-y-4 text-left">
            {assignments.map((a: any, i: number) => (
              <GlassCard key={i} className="p-4 border-primary/20">
                <p className="text-sm text-gray-400">Question {i + 1}</p>
                <p className="text-lg font-bold">
                  <span className="text-primary">{a.asker}</span> asks <span className="text-blue-400">{a.target}</span>
                </p>
              </GlassCard>
            ))}
          </div>

          <div className="space-y-4">
            <p className="text-gray-400 text-sm">
              Each player asks their target a question. Two rounds of questions.
            </p>
            
            <NeonButton 
              className="w-full h-16 text-lg"
              onClick={() => {
                 setLocation("/game/vote");
              }}
            >
              Start Voting
            </NeonButton>
          </div>
        </div>
      </PageTransition>
    </div>
  );
}
