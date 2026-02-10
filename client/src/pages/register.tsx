import { useState } from "react";
import { Link } from "wouter";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { ArrowLeft, UserPlus } from "lucide-react";
import { NeonButton, GlassCard, InputField, PageTransition, Header } from "@/components/ui-components";
import { queryClient } from "@/lib/queryClient";

export default function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  
  const { register } = useAuth();
  const [, setLocation] = useLocation();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const user = await register.mutateAsync({ username, password });
      queryClient.setQueryData(["/api/user"], user);
      setLocation("/menu");
    } catch (error) {
      // Error is handled by mutation
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-black relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/20 via-black to-black" />
      
      <div className="relative w-full max-w-md z-10">
        <PageTransition>
          <div className="mb-6">
            <Link href="/">
              <button className="flex items-center text-gray-400 hover:text-white transition-colors">
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to Login
              </button>
            </Link>
          </div>

          <Header title="JOIN SPYGAME" subtitle="Create your agent profile" />

          <GlassCard className="space-y-6">
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-gray-400 font-bold ml-1">Username</label>
                <InputField 
                  placeholder="Choose a username" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-gray-400 font-bold ml-1">Password</label>
                <InputField 
                  type="password" 
                  placeholder="Create a password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <NeonButton 
                type="submit" 
                className="w-full"
                isLoading={register.isPending}
              >
                <UserPlus className="mr-2 h-5 w-5" />
                Create Account
              </NeonButton>
            </form>
          </GlassCard>
        </PageTransition>
      </div>
    </div>
  );
}
