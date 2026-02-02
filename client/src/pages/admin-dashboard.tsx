import { useAuth } from "@/hooks/use-auth";
import { useAdminStats, useUsersList, useDeleteUser } from "@/hooks/use-game-data";
import { Link } from "wouter";
import { LogOut, Users, Eye, Trash2, ShieldAlert } from "lucide-react";
import { NeonButton, GlassCard, PageTransition, Header } from "@/components/ui-components";

export default function AdminDashboard() {
  const { logout } = useAuth();
  const { data: stats } = useAdminStats();
  const { data: users, isLoading: usersLoading } = useUsersList();
  const { mutate: deleteUser } = useDeleteUser();

  return (
    <div className="min-h-screen p-6 bg-black text-white">
      <PageTransition>
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold font-display tracking-widest text-primary">HOST DASHBOARD</h2>
            <NeonButton variant="ghost" onClick={() => logout.mutate()}>
              <LogOut className="mr-2 h-4 w-4" /> Logout
            </NeonButton>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <GlassCard className="flex items-center gap-4 bg-gradient-to-br from-purple-900/40 to-black">
              <div className="p-3 bg-primary/20 rounded-full">
                <Eye className="h-8 w-8 text-primary" />
              </div>
              <div>
                <p className="text-sm text-gray-400 uppercase tracking-wider">Total Visits</p>
                <p className="text-3xl font-bold font-mono">{stats?.visits || 0}</p>
              </div>
            </GlassCard>

            <GlassCard className="flex items-center gap-4 bg-gradient-to-br from-cyan-900/40 to-black">
              <div className="p-3 bg-accent/20 rounded-full">
                <Users className="h-8 w-8 text-accent" />
              </div>
              <div>
                <p className="text-sm text-gray-400 uppercase tracking-wider">Total Users</p>
                <p className="text-3xl font-bold font-mono">{stats?.totalUsers || 0}</p>
              </div>
            </GlassCard>
          </div>

          <GlassCard className="overflow-hidden">
            <div className="flex items-center gap-2 mb-6">
              <ShieldAlert className="h-6 w-6 text-red-500" />
              <h3 className="text-xl font-bold uppercase tracking-wide">User Management</h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-gray-400 text-sm uppercase tracking-wider">
                    <th className="p-4 font-medium">ID</th>
                    <th className="p-4 font-medium">Username</th>
                    <th className="p-4 font-medium">Password</th>
                    <th className="p-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {usersLoading ? (
                    <tr><td colSpan={4} className="p-8 text-center text-gray-500">Loading users...</td></tr>
                  ) : users?.map((user: any) => (
                    <tr key={user.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-4 font-mono text-gray-500">{user.id}</td>
                      <td className="p-4 font-medium">{user.username} {user.username === 'admin' && <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded ml-2">HOST</span>}</td>
                      <td className="p-4 font-mono text-gray-400">{user.password}</td>
                      <td className="p-4 text-right">
                        {user.username !== 'admin' && (
                          <button 
                            onClick={() => {
                              if(confirm(`Delete user ${user.username}?`)) deleteUser(user.id);
                            }}
                            className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                            title="Delete User"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
          
          <div className="flex justify-center pt-8">
            <Link href="/">
              <NeonButton variant="secondary">Back to Login Screen</NeonButton>
            </Link>
          </div>
        </div>
      </PageTransition>
    </div>
  );
}
