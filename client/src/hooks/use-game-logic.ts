import { useState } from "react";

export const CATEGORIES = {
  "football": [
    "Messi", "Ronaldo", "Salah", "Neymar", "Mbappe", "Benzema", "Haaland", "Lewandowski",
    "Vinicius", "De Bruyne", "Modric", "Kane", "Griezmann", "Pedri", "Bellingham", "Musiala",
    "Alisson", "Courtois", "Van Dijk", "Hakimi"
  ],
  "heroes": [
    "Superman", "Batman", "Spiderman", "Iron Man", "Thor", "Hulk", "Wonder Woman", "Black Panther",
    "Captain America", "Doctor Strange", "Black Widow", "Flash", "Aquaman", "Green Lantern", "Wolverine", "Deadpool",
    "Iron Fist", "Daredevil", "Ant-Man", "Hawkeye"
  ],
  "tech": [
    "Apple", "Microsoft", "Google", "Tesla", "Amazon", "Samsung", "Sony", "Nvidia",
    "Meta", "Netflix", "Adobe", "Intel", "IBM", "Oracle", "Spotify", "Uber",
    "Airbnb", "Twitter", "Snapchat", "Tiktok"
  ],
  "games": [
    "Minecraft", "GTA V", "FIFA", "Fortnite", "Call of Duty", "Mario", "Zelda", "League of Legends",
    "Valorant", "Overwatch", "Among Us", "Cyberpunk 2077", "Elden Ring", "Skyrim", "Portal", "Halo",
    "Sonic", "Pac-Man", "Tetris", "Roblox"
  ],
  "food": [
    "Koshary", "Falafel", "Molokhia", "Fatteh", "Shawarma", "Mahshi", "Hawawshi", "Ful Medames",
    "Fesikh", "Kofta", "Roz Bel Laban", "Basbousa", "Kunafa", "Qatayef", "Om Ali", "Hamam Mahshi",
    "Sayadeya", "Mesaqa'a", "Kishk", "Baba Ganoush"
  ],
  "countries": [
    "Egypt", "USA", "France", "Japan", "Brazil", "Germany", "Italy", "China",
    "UK", "Spain", "Russia", "Canada", "Australia", "India", "Mexico", "Turkey",
    "Saudi Arabia", "UAE", "Morocco", "Argentina"
  ],
  "cars": [
    "BMW", "Mercedes", "Toyota", "Ferrari", "Lamborghini", "Audi", "Porsche", "Honda",
    "Ford", "Chevrolet", "Nissan", "Hyundai", "Kia", "Lexus", "Bentley", "Rolls Royce",
    "Aston Martin", "Jaguar", "Land Rover", "Jeep"
  ]
} as const;

export type CategoryKey = keyof typeof CATEGORIES;

export function useGameLogic() {
  const [secretWord, setSecretWord] = useState<string | null>(() => {
    const saved = localStorage.getItem("spygame_current_session");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.secretWord) return parsed.secretWord;
      } catch (e) {
        return null;
      }
    }
    return null;
  });
  
  const [spyIndex, setSpyIndex] = useState<number | null>(() => {
    const saved = localStorage.getItem("spygame_current_session");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (typeof parsed.spyIndex === 'number') return parsed.spyIndex;
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  const [players, setPlayers] = useState<string[]>(() => {
    const saved = localStorage.getItem("spygame_current_session");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.players) return parsed.players;
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  const [selectedCategory, setSelectedCategory] = useState<CategoryKey | null>(() => {
    const saved = localStorage.getItem("spygame_current_session");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.category) return parsed.category;
      } catch (e) {
        return null;
      }
    }
    return null;
  });
  const [currentTurn, setCurrentTurn] = useState(0);
  
  const startGame = (playerList: string[], category: CategoryKey) => {
    const items = CATEGORIES[category];
    const secret = items[Math.floor(Math.random() * items.length)];
    const spy = Math.floor(Math.random() * playerList.length);

    const assignments = [];
    for (let i = 0; i < 12; i++) {
      const askerIdx = i % playerList.length;
      let targetIdx = (i + 1) % playerList.length;
      if (askerIdx === targetIdx) targetIdx = (i + 2) % playerList.length;
      assignments.push({ asker: playerList[askerIdx], target: playerList[targetIdx] });
    }

    setPlayers(playerList);
    setSelectedCategory(category);
    setSecretWord(secret);
    setSpyIndex(spy);
    setCurrentTurn(0);

    const gameState = {
      players: playerList,
      category,
      secretWord: secret,
      spyIndex: spy,
      assignments,
      startedAt: Date.now()
    };

    localStorage.setItem("spygame_current_session", JSON.stringify(gameState));
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
