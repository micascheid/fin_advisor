import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, UserCheck, TrendingUp } from "lucide-react";
import { toast } from "sonner";

interface Advisor {
  id: string;
  name: string;
  tagline: string | null;
}

const AdvisorDirectory = () => {
  const navigate = useNavigate();
  const [advisors, setAdvisors] = useState<Advisor[]>([]);
  const [loading, setLoading] = useState(true);
  const [selecting, setSelecting] = useState<string | null>(null);

  useEffect(() => {
    fetchAdvisors();
  }, []);

  const fetchAdvisors = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("role", "advisor")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setAdvisors(data || []);
    } catch (error: any) {
      toast.error("Error loading advisors");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAdvisor = async (advisorId: string) => {
    setSelecting(advisorId);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from("advisor_client_assignments")
        .insert({
          advisor_id: advisorId,
          client_id: user.id,
        });

      if (error) throw error;

      toast.success("Advisor selected successfully!");
      navigate("/dashboard");
    } catch (error: any) {
      toast.error(error.message || "Error selecting advisor");
    } finally {
      setSelecting(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Find Your Advisor</h1>
                <p className="text-sm text-muted-foreground">Choose from our professional advisors</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Available Advisors</h2>
          <p className="text-muted-foreground">
            Select an advisor to begin your personalized financial journey
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading advisors...</p>
          </div>
        ) : advisors.length === 0 ? (
          <Card className="card-shadow border-0">
            <CardContent className="pt-6 text-center py-12">
              <UserCheck className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No advisors available yet</h3>
              <p className="text-muted-foreground">
                Check back soon as advisors join the platform
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {advisors.map((advisor) => (
              <Card key={advisor.id} className="card-shadow border-0 hover:shadow-lg smooth-transition">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserCheck className="w-5 h-5 text-primary" />
                    {advisor.name}
                  </CardTitle>
                  <CardDescription>
                    {advisor.tagline || "Financial Advisor"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={() => handleSelectAdvisor(advisor.id)}
                    disabled={selecting === advisor.id}
                    className="w-full"
                  >
                    {selecting === advisor.id ? "Selecting..." : "Select Advisor"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default AdvisorDirectory;
