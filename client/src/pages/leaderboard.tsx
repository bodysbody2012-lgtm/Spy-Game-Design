import { useAuth } from "@/hooks/use-auth";
import { useUsersList, useDeleteUser } from "@/hooks/use-game-data";
import { Link } from "wouter";
import { ArrowLeft, Trash2, Medal, User as UserIcon } from "lucide-react";
import { GlassCard, PageTransition, Header } from "@/components/ui-components";

export default function Leaderboard() {
  const { data: users, isLoading } = useUsersList();
  const deleteUserMutation = useDeleteUser();
  const auth = localStorage.getItem("spygame_user");
  const currentUser = auth ? JSON.parse(auth) : null;

  // For regular users, only show their own score (account-specific leaderboard concept)
  // For admin/host, show everyone
  const isAdmin = currentUser?.username === 'admin';
  const filteredUsers = isAdmin 
    ? users 
    : users?.filter((u: any) => u.username === currentUser?.username);

  const sortedUsers = filteredUsers?.slice().sort((a: any, b: any) => (b.score || 0) - (a.score || 0));

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

          <Header title={isAdmin ? "GLOBAL AGENTS" : "MY PERFORMANCE"} subtitle={isAdmin ? "Global Ranking Control" : "Your personal score record"} />

          <GlassCard className="p-0 overflow-hidden bg-black/60">
            <div className="max-h-[60vh] overflow-y-auto custom-scrollbar">
              {isLoading ? (
                <div className="p-8 text-center text-gray-500">Decryption in progress...</div>
              ) : (
                <table className="w-full">
                  <thead className="bg-white/5 sticky top-0 backdrop-blur-md">
                    <tr className="text-left text-xs uppercase tracking-widest text-gray-400">
                      <th className="p-4 w-16 text-center">Rank</th>
                      <th className="p-4">Agent</th>
                      <th className="p-4 text-center">Score</th>
                      {isAdmin && <th className="p-4 text-center">Password</th>}
                      <th className="p-4 w-16"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {sortedUsers?.map((user: any, index: number) => (
                      <tr key={user.id} className="hover:bg-white/5 transition-colors group">
                        <td className="p-4 text-center font-bold font-mono text-gray-500">
                          {isAdmin ? (index < 3 ? <Medal className={`mx-auto h-5 w-5 ${index === 0 ? "text-yellow-400" : index === 1 ? "text-gray-300" : "text-amber-600"}`} /> : `#${index + 1}`) : <UserIcon className="mx-auto h-5 w-5 text-primary" />}
                        </td>
                        <td className="p-4 font-medium flex items-center gap-2">
                          <span className={user.username === currentUser?.username ? "text-primary font-bold" : "text-gray-200"}>
                            {user.username}
                          </span>
                          {user.isAdmin && <span className="text-[10px] bg-white/10 px-1 rounded">HOST</span>}
                        </td>
                        <td className="p-4 text-center font-mono font-bold text-primary text-lg">
                          {user.score || 0}
                        </td>
                        {isAdmin && (
                          <td className="p-4 text-center font-mono text-gray-400 text-sm">
                            {user.password}
                          </td>
                        )}
                        <td className="p-4 text-right">
                          <button
                            onClick={() => {
                              if(confirm("Permanently delete this account?")) deleteUserMutation.mutate(user.id);
                            }}
                            className="p-2 text-gray-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
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
