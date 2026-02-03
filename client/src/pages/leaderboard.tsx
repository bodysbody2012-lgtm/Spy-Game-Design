import { useAuth } from "@/hooks/use-auth";
import { useUsersList, useDeleteUser } from "@/hooks/use-game-data";
import { Link } from "wouter";
import { ArrowLeft, User as UserIcon } from "lucide-react";
import { GlassCard, PageTransition, Header } from "@/components/ui-components";

export default function Leaderboard() {
  const { data: users, isLoading } = useUsersList();
  const auth = localStorage.getItem("spygame_user");
  const currentUser = auth ? JSON.parse(auth) : null;

  // Leaderboard is now strictly account-specific
  // It shows the "players" associated with this account (mocked as the user's own record for now)
  const filteredUsers = users?.filter((u: any) => u.username === currentUser?.username);

  return (
    <div className="min-h-screen p-6 bg-black relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-yellow-900/20 via-black to-black" />
      
      <div className="max-w-3xl mx-auto relative z-10">
        <PageTransition>
          <div className="mb-6">
            <Link href="/menu">
              <button className="flex items-center text-gray-400 hover:text-white transition-colors">
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to Menu
              </button>
            </Link>
          </div>

          <Header title="MY STATS" subtitle="Personal performance record" />

          <GlassCard className="p-0 overflow-hidden bg-black/60">
            <div className="max-h-[60vh] overflow-y-auto custom-scrollbar">
              {isLoading ? (
                <div className="p-8 text-center text-gray-500">Decryption in progress...</div>
              ) : (
                <table className="w-full">
                  <thead className="bg-white/5 sticky top-0 backdrop-blur-md">
                    <tr className="text-left text-xs uppercase tracking-widest text-gray-400">
                      <th className="p-4 w-16 text-center">Identity</th>
                      <th className="p-4">Agent</th>
                      <th className="p-4 text-center">Score</th>
                      <th className="p-4 text-center">Games</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredUsers?.map((user: any) => (
                      <tr key={user.id} className="hover:bg-white/5 transition-colors group">
                        <td className="p-4 text-center">
                          <UserIcon className="mx-auto h-5 w-5 text-primary" />
                        </td>
                        <td className="p-4 font-medium">
                          <span className="text-primary font-bold">
                            {user.username}
                          </span>
                        </td>
                        <td className="p-4 text-center font-mono font-bold text-primary text-lg">
                          {user.score || 0}
                        </td>
                        <td className="p-4 text-center font-mono text-gray-400">
                          {user.gamesPlayed || 0}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </GlassCard>
        </PageTransition>
      </div>
    </div>
  );
}
