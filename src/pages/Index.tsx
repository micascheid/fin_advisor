import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { TrendingUp, Users, Briefcase, Shield } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
        
        <div className="container relative mx-auto px-4 py-20 lg:py-32">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 mb-6">
              <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center elegant-shadow">
                <TrendingUp className="w-7 h-7 text-primary-foreground" />
              </div>
              <h1 className="text-4xl font-bold text-gradient">Portfolio Pair</h1>
            </div>
            
            <h2 className="text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Connect with Expert Financial Advisors
            </h2>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              A modern platform connecting clients with professional financial advisors for personalized portfolio management and wealth growth strategies.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={() => navigate("/auth")} className="text-lg px-8 elegant-shadow">
                Get Started
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate("/auth")}>
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold mb-4">How It Works</h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Simple, secure, and designed for your financial success
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="card-shadow bg-card rounded-2xl p-8 text-center smooth-transition hover:shadow-lg">
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Users className="w-7 h-7 text-primary" />
              </div>
              <h4 className="text-xl font-semibold mb-3">For Clients</h4>
              <p className="text-muted-foreground">
                Browse our directory of professional advisors and find the perfect match for your financial goals.
              </p>
            </div>

            <div className="card-shadow bg-card rounded-2xl p-8 text-center smooth-transition hover:shadow-lg">
              <div className="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
                <Briefcase className="w-7 h-7 text-accent" />
              </div>
              <h4 className="text-xl font-semibold mb-3">For Advisors</h4>
              <p className="text-muted-foreground">
                Create your profile, connect with clients, and build personalized portfolio strategies.
              </p>
            </div>

            <div className="card-shadow bg-card rounded-2xl p-8 text-center smooth-transition hover:shadow-lg">
              <div className="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
                <Shield className="w-7 h-7 text-accent" />
              </div>
              <h4 className="text-xl font-semibold mb-3">Secure & Simple</h4>
              <p className="text-muted-foreground">
                Built with security and simplicity in mind, making financial planning accessible to everyone.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center card-shadow bg-card rounded-3xl p-12">
            <h3 className="text-3xl font-bold mb-4">Ready to Start Your Financial Journey?</h3>
            <p className="text-muted-foreground mb-8">
              Join Portfolio Pair today and connect with expert advisors who understand your goals.
            </p>
            <Button size="lg" onClick={() => navigate("/auth")} className="text-lg px-8">
              Create Your Account
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
