import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useRecordVisit } from "@/hooks/use-game-data";
import { Eye, EyeOff, Lock, User, Shield } from "lucide-react";
import { NeonButton, GlassCard, InputField, PageTransition, Header } from "@/components/ui-components";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  const { login } = useAuth();
  const { mutate: recordVisit } = useRecordVisit();

  useEffect(() => {
    recordVisit();
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    login.mutate({ username, password });
  };

  const handleHostLogin = () => {
    login.mutate({ username: "admin", password: "admin" });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[url('https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center relative">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
      
      <div className="relative w-full max-w-md z-10">
        <PageTransition>
          <Header title="SPYGAME" subtitle="Identify the imposter among us" />

          <GlassCard className="space-y-6">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-gray-400 font-bold ml-1">Username</label>
                <div className="relative">
                  <User className="absolute left-3 top-3.5 h-5 w-5 text-gray-500" />
                  <InputField 
                    placeholder="Enter username" 
                    className="pl-10"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-gray-400 font-bold ml-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-500" />
                  <InputField 
                    type={showPassword ? "text" : "password"} 
                    placeholder="Enter password" 
                    className="pl-10 pr-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3.5 text-gray-400 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <NeonButton 
                type="submit" 
                className="w-full"
                isLoading={login.isPending}
              >
                Login
              </NeonButton>
            </form>

            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-black/50 px-2 text-gray-500">Or continue with</span>
              </div>
            </div>

            <div className="grid gap-3">
              <NeonButton 
                variant="secondary" 
                className="w-full text-sm"
                onClick={handleHostLogin}
              >
                <Shield className="mr-2 h-4 w-4" />
                Log in Host Account
              </NeonButton>
              
              <Link href="/register">
                <NeonButton variant="ghost" className="w-full text-sm">
                  Create New Account
                </NeonButton>
              </Link>
            </div>
          </GlassCard>
        </PageTransition>
      </div>
    </div>
  );
}
