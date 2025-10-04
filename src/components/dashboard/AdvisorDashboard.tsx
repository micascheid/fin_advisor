import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { LogOut, Users, Briefcase, Plus, TrendingUp } from "lucide-react";
import { toast } from "sonner";

interface Profile {
  id: string;
  name: string;
  tagline: string | null;
}

interface Client {
  id: string;
  client_id: string;
  assigned_at: string;
  profiles: Profile;
}

const AdvisorDashboard = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch advisor profile
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);

      // Fetch assigned clients
      const { data: clientsData, error: clientsError } = await supabase
        .from("advisor_client_assignments")
        .select(`
          id,
          client_id,
          assigned_at,
          profiles!advisor_client_assignments_client_id_fkey (
            id,
            name,
            tagline
          )
        `)
        .eq("advisor_id", user.id);

      if (clientsError) throw clientsError;
      setClients(clientsData || []);
    } catch (error: any) {
      toast.error("Error loading dashboard");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Portfolio Pair</h1>
                <p className="text-sm text-muted-foreground">Advisor Dashboard</p>
              </div>
            </div>
            <Button variant="outline" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Welcome, {profile?.name}</h2>
          <p className="text-muted-foreground">{profile?.tagline || "Financial Advisor"}</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
          <Card className="card-shadow border-0">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{clients.length}</div>
            </CardContent>
          </Card>

          <Card className="card-shadow border-0">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active Portfolios</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">0</div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold">My Clients</h3>
            <Button onClick={() => navigate("/profile")}>
              Edit Profile
            </Button>
          </div>

          {clients.length === 0 ? (
            <Card className="card-shadow border-0">
              <CardContent className="pt-6 text-center py-12">
                <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No clients yet</h3>
                <p className="text-muted-foreground mb-4">
                  Clients can find and select you from the advisor directory
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {clients.map((client) => (
                <Card key={client.id} className="card-shadow border-0 hover:shadow-lg smooth-transition">
                  <CardHeader>
                    <CardTitle>{client.profiles.name}</CardTitle>
                    <CardDescription>
                      Joined {new Date(client.assigned_at).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button
                      onClick={() => navigate(`/portfolios/${client.client_id}`)}
                      className="w-full"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create Portfolio
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdvisorDashboard;
