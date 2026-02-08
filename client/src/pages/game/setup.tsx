import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useGameLogic, type CategoryKey, CATEGORIES } from "@/hooks/use-game-logic";
import { ArrowLeft, UserPlus, Save, Play, X } from "lucide-react";
import { NeonButton, GlassCard, InputField, PageTransition, Header } from "@/components/ui-components";
import { useToast } from "@/hooks/use-toast";

export default function GameSetup() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  
  // Extract category from query params
  const searchParams = new URLSearchParams(window.location.search);
  const category = searchParams.get("category") as CategoryKey;

  const [playerNames, setPlayerNames] = useState<string[]>([]);
  const [currentName, setCurrentName] = useState("");

  // Load saved names on mount
  useEffect(() => {
    const saved = localStorage.getItem("spygame_players");
    if (saved) {
      try {
        setPlayerNames(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load saved players");
      }
    }
  }, []);

  const addPlayer = () => {
    if (!currentName.trim()) return;
    if (playerNames.includes(currentName.trim())) {
      toast({ title: "Name already exists", variant: "destructive" });
      return;
    }
    setPlayerNames([...playerNames, currentName.trim()]);
    setCurrentName("");
  };

  const removePlayer = (index: number) => {
    setPlayerNames(playerNames.filter((_, i) => i !== index));
  };

  const saveNames = () => {
    localStorage.setItem("spygame_players", JSON.stringify(playerNames));
    toast({ title: "Player list saved!" });
  };

  const handleStart = () => {
    if (playerNames.length < 3) {
      toast({ title: "Need at least 3 players", variant: "destructive" });
      return;
    }
    
    const items = CATEGORIES[category];
    const secret = items[Math.floor(Math.random() * items.length)];
    const spy = Math.floor(Math.random() * playerNames.length);

    const assignments = [];
    for (let i = 0; i < 12; i++) {
      const askerIdx = i % playerNames.length;
      let targetIdx = (i + 1) % playerNames.length;
      if (askerIdx === targetIdx) targetIdx = (i + 2) % playerNames.length;
      assignments.push({ asker: playerNames[askerIdx], target: playerNames[targetIdx] });
    }

    const gameState = {
      players: playerNames,
      category,
      secretWord: secret,
      spyIndex: spy,
      assignments,
      startedAt: Date.now()
    };
    
    // Fix: Using a specific key to mark session as fully initialized
    localStorage.setItem("spygame_current_session", JSON.stringify(gameState));
    localStorage.setItem("spygame_initialized", "true");
    setLocation("/game/play");
  };

  if (!category) {
    setLocation("/game/mode");
    return null;
  }

  return (
    <div className="min-h-screen p-4 bg-black flex flex-col items-center">
      <PageTransition>
        <div className="w-full max-w-md space-y-6">
          <Link href="/game/mode">
            <button className="flex items-center text-gray-400 hover:text-white transition-colors">
              <ArrowLeft className="h-5 w-5 mr-2" />
              Change Mode
            </button>
          </Link>

          <Header title="ADD PLAYERS" subtitle={`Mode: ${category.toUpperCase()}`} />

          <GlassCard className="space-y-4">
            <div className="flex gap-2">
              <InputField
                placeholder="Enter player name"
                value={currentName}
                onChange={(e) => setCurrentName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addPlayer()}
              />
              <NeonButton onClick={addPlayer} disabled={!currentName.trim()} className="px-3">
                <UserPlus className="h-5 w-5" />
              </NeonButton>
            </div>

            <div className="max-h-[300px] overflow-y-auto custom-scrollbar space-y-2 min-h-[100px]">
              {playerNames.length === 0 && (
                <div className="text-center text-gray-500 py-8 italic">No players added yet</div>
              )}
              {playerNames.map((name, idx) => (
                <div key={idx} className="flex items-center justify-between bg-white/5 p-3 rounded-xl animate-in fade-in slide-in-from-left-2">
                  <span className="font-bold text-gray-200">{name}</span>
                  <button 
                    onClick={() => removePlayer(idx)}
                    className="text-gray-500 hover:text-red-500 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-3 pt-4 border-t border-white/10">
              <NeonButton variant="secondary" onClick={saveNames} className="flex-1 text-sm">
                <Save className="mr-2 h-4 w-4" />
                Save Names
              </NeonButton>
              <NeonButton onClick={handleStart} className="flex-[2]" disabled={playerNames.length < 3}>
                Start Game
                <Play className="ml-2 h-4 w-4 fill-current" />
              </NeonButton>
            </div>
          </GlassCard>
        </div>
      </PageTransition>
    </div>
  );
}
