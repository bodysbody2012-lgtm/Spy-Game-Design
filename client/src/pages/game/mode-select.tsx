import { Link, useLocation } from "wouter";
import { useGameLogic, CATEGORIES, type CategoryKey } from "@/hooks/use-game-logic";
import { ArrowLeft, Users, Zap, Building2, Gamepad2, Pizza, Globe2, Car } from "lucide-react";
import { PageTransition, Header } from "@/components/ui-components";

// Helper for saving selection
const CATEGORY_CONFIG: Record<CategoryKey, { icon: any, label: string, color: string }> = {
  football: { icon: Users, label: "Football Players", color: "from-green-500 to-emerald-700" },
  heroes: { icon: Zap, label: "Super Heroes", color: "from-blue-500 to-indigo-700" },
  tech: { icon: Building2, label: "Tech Brands", color: "from-gray-500 to-slate-700" },
  games: { icon: Gamepad2, label: "Video Games", color: "from-purple-500 to-fuchsia-700" },
  food: { icon: Pizza, label: "Egyptian Food", color: "from-orange-500 to-red-700" },
  countries: { icon: Globe2, label: "World Countries", color: "from-cyan-500 to-blue-700" },
  cars: { icon: Car, label: "Car Brands", color: "from-red-500 to-rose-700" },
};

export default function ModeSelect() {
  const [, setLocation] = useLocation();

  const handleSelect = (category: CategoryKey) => {
    // We pass category via URL query param for the next page to pick up
    setLocation(`/game/setup?category=${category}`);
  };

  return (
    <div className="min-h-screen p-6 bg-black relative">
      <PageTransition>
        <div className="max-w-4xl mx-auto space-y-6">
          <Link href="/menu">
            <button className="flex items-center text-gray-400 hover:text-white transition-colors">
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back
            </button>
          </Link>

          <Header title="SELECT MODE" subtitle="Choose your category" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(Object.keys(CATEGORIES) as CategoryKey[]).map((key) => {
              const config = CATEGORY_CONFIG[key];
              const Icon = config.icon;
              
              return (
                <button
                  key={key}
                  onClick={() => handleSelect(key)}
                  className="group relative overflow-hidden rounded-2xl h-32 text-left transition-all hover:scale-105 active:scale-95"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${config.color} opacity-80 group-hover:opacity-100 transition-opacity`} />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                  
                  <div className="relative z-10 p-6 flex flex-col justify-between h-full">
                    <Icon className="h-8 w-8 text-white opacity-80 group-hover:opacity-100" />
                    <span className="font-bold text-lg uppercase tracking-wider text-white">
                      {config.label}
                    </span>
                  </div>
                  
                  <div className="absolute -right-4 -bottom-4 h-24 w-24 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-colors" />
                </button>
              );
            })}
          </div>
        </div>
      </PageTransition>
    </div>
  );
}
