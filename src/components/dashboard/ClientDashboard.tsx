import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { LogOut, UserCheck, Briefcase, Search, TrendingUp } from "lucide-react";
import { toast } from "sonner";

interface Profile {
  id: string;
  name: string;
  tagline: string | null;
}

interface Assignment {
  advisor_id: string;
  profiles: Profile;
}

const ClientDashboard = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [portfolios, setPortfolios] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch client profile
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);

      // Fetch advisor assignment
      const { data: assignmentData, error: assignmentError } = await supabase
        .from("advisor_client_assignments")
        .select(`
          advisor_id,
          profiles!advisor_client_assignments_advisor_id_fkey (
            id,
            name,
            tagline
          )
        `)
        .eq("client_id", user.id)
        .maybeSingle();

      if (assignmentError && assignmentError.code !== 'PGRST116') throw assignmentError;
      setAssignment(assignmentData);

      // Fetch portfolios if advisor is assigned
      if (assignmentData) {
        const { data: portfoliosData, error: portfoliosError } = await supabase
          .from("portfolios")
          .select("*")
          .eq("client_id", user.id)
          .eq("status", "published");

        if (portfoliosError) throw portfoliosError;
        setPortfolios(portfoliosData || []);
      }
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
                <p className="text-sm text-muted-foreground">Client Dashboard</p>
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
          <p className="text-muted-foreground">Your financial journey starts here</p>
        </div>

        {!assignment ? (
          <Card className="card-shadow border-0 mb-8">
            <CardHeader>
              <CardTitle>Find Your Advisor</CardTitle>
              <CardDescription>
                Browse our directory of professional financial advisors and select the one that's right for you
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate("/advisors")} size="lg" className="w-full sm:w-auto">
                <Search className="w-4 h-4 mr-2" />
                Browse Advisors
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card className="card-shadow border-0 mb-8">
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <UserCheck className="w-5 h-5 text-primary" />
                  <CardTitle>Your Advisor</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold">{assignment.profiles.name}</h3>
                  <p className="text-muted-foreground">{assignment.profiles.tagline}</p>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <h3 className="text-2xl font-bold">Your Portfolios</h3>
              
              {portfolios.length === 0 ? (
                <Card className="card-shadow border-0">
                  <CardContent className="pt-6 text-center py-12">
                    <Briefcase className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">No portfolios yet</h3>
                    <p className="text-muted-foreground">
                      Your advisor will create personalized portfolio recommendations for you
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {portfolios.map((portfolio: any) => (
                    <Card key={portfolio.id} className="card-shadow border-0 hover:shadow-lg smooth-transition">
                      <CardHeader>
                        <CardTitle>{portfolio.name}</CardTitle>
                        <CardDescription>{portfolio.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Button
                          onClick={() => navigate(`/portfolio/${portfolio.id}`)}
                          variant="outline"
                          className="w-full"
                        >
                          View Details
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default ClientDashboard;
