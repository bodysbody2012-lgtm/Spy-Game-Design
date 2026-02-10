import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

// Pages
import Login from "@/pages/login";
import Register from "@/pages/register";
import AdminDashboard from "@/pages/admin-dashboard";
import Menu from "@/pages/menu";
import Leaderboard from "@/pages/leaderboard";
import ModeSelect from "@/pages/game/mode-select";
import GameSetup from "@/pages/game/setup";
import GamePlay from "@/pages/game/play";
import GameVote from "@/pages/game/vote";
import GameResult from "@/pages/game/result";

import Welcome from "@/pages/welcome";

function Router() {
  return (
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

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
