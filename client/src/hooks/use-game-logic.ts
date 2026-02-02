import { useState } from "react";

export const CATEGORIES = {
  "football": ["Messi", "Ronaldo", "Salah", "Neymar", "Mbappe", "Benzema", "Haaland", "Lewandowski"],
  "heroes": ["Superman", "Batman", "Spiderman", "Iron Man", "Thor", "Hulk", "Wonder Woman", "Black Panther"],
  "tech": ["Apple", "Microsoft", "Google", "Tesla", "Amazon", "Samsung", "Sony", "Nvidia"],
  "games": ["Minecraft", "GTA V", "FIFA", "Fortnite", "Call of Duty", "Mario", "Zelda", "League of Legends"],
  "food": ["Koshary", "Falafel", "Molokhia", "Fatteh", "Shawarma", "Mahshi", "Hawawshi", "Ful Medames"],
  "countries": ["Egypt", "USA", "France", "Japan", "Brazil", "Germany", "Italy", "China"],
  "cars": ["BMW", "Mercedes", "Toyota", "Ferrari", "Lamborghini", "Audi", "Porsche", "Honda"]
} as const;

export type CategoryKey = keyof typeof CATEGORIES;

export function useGameLogic() {
  // We'll manage local game state here since it's transient per session
  const [players, setPlayers] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey | null>(null);
  const [spyIndex, setSpyIndex] = useState<number | null>(null);
  const [secretWord, setSecretWord] = useState<string | null>(null);
  const [currentTurn, setCurrentTurn] = useState(0); // For pass-and-play
  
  const startGame = (playerList: string[], category: CategoryKey) => {
    const items = CATEGORIES[category];
    const secret = items[Math.floor(Math.random() * items.length)];
    const spy = Math.floor(Math.random() * playerList.length);

    // Assign turns: Who asks whom (12 questions)
    const assignments = [];
    for (let i = 0; i < 12; i++) {
      const askerIdx = i % playerList.length;
      const targetIdx = (i + 1) % playerList.length;
      assignments.push({ asker: playerList[askerIdx], target: playerList[targetIdx] });
    }

    setPlayers(playerList);
    setSelectedCategory(category);
    setSecretWord(secret);
    setSpyIndex(spy);
    setCurrentTurn(0);

    localStorage.setItem("spygame_current_session", JSON.stringify({
      players: playerList,
      category,
      secretWord: secret,
      spyIndex: spy,
      assignments,
      startedAt: Date.now()
    }));
  };

  const nextTurn = () => {
    setCurrentTurn(prev => prev + 1);
  };

  const resetGame = () => {
    setPlayers([]);
    setSelectedCategory(null);
    setSpyIndex(null);
    setSecretWord(null);
    setCurrentTurn(0);
  };

  return {
    players,
    setPlayers,
    selectedCategory,
    setSelectedCategory,
    spyIndex,
    secretWord,
    currentTurn,
    startGame,
    nextTurn,
    resetGame,
    isGameActive: !!secretWord
  };
}
