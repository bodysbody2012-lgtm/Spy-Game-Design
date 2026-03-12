import { Suspense, lazy } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

// Lazy load non-critical pages
const Login = lazy(() => import("@/pages/login"));
const Register = lazy(() => import("@/pages/register"));
const AdminDashboard = lazy(() => import("@/pages/admin-dashboard"));
const Menu = lazy(() => import("@/pages/menu"));
const Leaderboard = lazy(() => import("@/pages/leaderboard"));
const ModeSelect = lazy(() => import("@/pages/game/mode-select"));
const GameSetup = lazy(() => import("@/pages/game/setup"));
const GamePlay = lazy(() => import("@/pages/game/play"));
const GameVote = lazy(() => import("@/pages/game/vote"));
const GameResult = lazy(() => import("@/pages/game/result"));

import Welcome from "@/pages/welcome";
import ChatPage from "@/pages/chat";
import { AudioController } from "@/components/audio-controller";

function Router() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <Switch>
        <Route path="/" component={Welcome} />
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
        <Route path="/admin" component={AdminDashboard} />
        <Route path="/menu" component={Menu} />
        <Route path="/leaderboard" component={Leaderboard} />
        
        {/* Game Routes */}
        <Route path="/game/mode" component={ModeSelect} />
        <Route path="/game/setup" component={GameSetup} />
        <Route path="/game/play" component={GamePlay} />
        <Route path="/game/vote" component={GameVote} />
        <Route path="/game/result" component={GameResult} />

        <Route path="/chat" component={ChatPage} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <AudioController />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
