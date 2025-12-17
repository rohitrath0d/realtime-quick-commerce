"use client";
// import { Link } from "react-router-dom";
import Link from "next/link";
import { User, TruckElectric, LayoutDashboard, Zap, Shield, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import HomePageDeliveryAnimation from "@/components/animations/HomePageDelivery"; "../components/animations/HomePageDelivery"

const roleCards = [
  {
    title: "Customer",
    description: "Browse products, place orders, and track deliveries in real-time",
    icon: User,
    path: "/customer",
    gradient: "from-primary to-primary-glow",
  },
  {
    title: "Delivery Partner",
    description: "Accept orders, update delivery status, and manage your deliveries",
    icon: TruckElectric,
    path: "/delivery",
    gradient: "from-accent to-warning",
  },
  {
    title: "Admin",
    description: "Monitor all orders, manage partners, and oversee operations",
    icon: LayoutDashboard,
    path: "/admin",
    gradient: "from-success to-primary",
  },
];

const features = [
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Get your orders delivered in minutes, not hours",
  },
  {
    icon: Clock,
    title: "Real-Time Tracking",
    description: "Track your order every step of the way",
  },
  {
    icon: Shield,
    title: "Secure & Reliable",
    description: "Enterprise-grade security for all transactions",
  },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background">

      <section className="relative w-full min-h-screen overflow-hidden bg-background">
        {/* Background effects */}
        <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-accent/5" />
        <div className="absolute top-10 right-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float" />
        <div
          className="absolute bottom-10 left-10 w-80 h-80 bg-accent/10 rounded-full blur-3xl animate-float"
          style={{ animationDelay: "1.5s" }}
        />

        <div className="container mx-auto px-8 py-20 relative h-full flex items-center">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full items-center">

            {/* LEFT CONTENT */}
            <div className="max-w-xl ml-10">
              <div
                className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 animate-fade-up opacity-0"
                style={{ animationDelay: "0.1s" }}
              >
                <Zap className="w-4 h-4" />
                Instant Delivery Platform
              </div>

              <h1
                className="text-5xl md:text-6xl font-extrabold mb-6 animate-fade-up opacity-0"
                style={{ animationDelay: "0.2s" }}
              >
                <span className="gradient-text">Quick Commerce</span>
                <br />
                <span className="text-foreground">Reimagined</span>
              </h1>

              <p
                className="text-xl text-muted-foreground mb-10 animate-fade-up opacity-0"
                style={{ animationDelay: "0.3s" }}
              >
                Experience lightning-fast deliveries with real-time tracking. Order,
                deliver, and manage — all in one powerful platform.
              </p>

              <div
                className="flex items-center gap-4 animate-fade-up opacity-0"
                style={{ animationDelay: "0.4s" }}
              >
                <Link href="/login">
                  <Button size="lg">Start Ordering</Button>
                </Link>

                <Link href="/login">
                  <Button size="lg" variant="outline">
                    Become a Partner
                  </Button>
                </Link>
              </div>
            </div>

            {/* RIGHT LOTTIE CONTAINER */}
            <div className="w-full h-[600px] flex justify-center md:justify-end">
              <HomePageDeliveryAnimation />
            </div>

          </div>
        </div>
      </section>
      {/* Role Selection */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Choose Your Portal</h2>
            <p className="text-muted-foreground">Select your role to access the dashboard</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {roleCards.map((role, index) => (
              <Link
                key={role.path}
                // to={role.path}
                href={role.path}
                className="group animate-fade-up opacity-0"
                style={{ animationDelay: `${0.5 + index * 0.1}s` }}
              >
                <div className="glass-card rounded-2xl p-6 h-full transition-all duration-500 hover:shadow-glow hover:-translate-y-2 border border-transparent hover:border-primary/20">
                  <div className={`w-14 h-14 rounded-xl bg-linear-to-br ${role.gradient} flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <role.icon className="w-7 h-7 text-primary-foreground" />
                  </div>

                  <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                    {role.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {role.description}
                  </p>

                  <div className="mt-5 flex items-center text-primary text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    Enter Portal →
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="text-center animate-fade-up opacity-0"
                style={{ animationDelay: `${0.8 + index * 0.1}s` }}
              >
                <div className="w-12 h-12 rounded-xl bg-linear-to-br from-primary/10 to-primary/5 flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2024 QuickDash. Built for speed and reliability.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
