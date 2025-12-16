// import Image from "next/image";

// export default function Home() {
//   return (
//     <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
//       <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
//         <Image
//           className="dark:invert"
//           src="/next.svg"
//           alt="Next.js logo"
//           width={100}
//           height={20}
//           priority
//         />
//         <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
//           <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
//             To get started, edit the page.tsx file.
//           </h1>
//           <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
//             Looking for a starting point or more instructions? Head over to{" "}
//             <a
//               href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//               className="font-medium text-zinc-950 dark:text-zinc-50"
//             >
//               Templates
//             </a>{" "}
//             or the{" "}
//             <a
//               href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//               className="font-medium text-zinc-950 dark:text-zinc-50"
//             >
//               Learning
//             </a>{" "}
//             center.
//           </p>
//         </div>
//         <div className="flex flex-col gap-4 text-base font-medium sm:flex-row">
//           <a
//             className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-foreground px-5 text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc] md:w-[158px]"
//             href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//             target="_blank"
//             rel="noopener noreferrer"
//           >
//             <Image
//               className="dark:invert"
//               src="/vercel.svg"
//               alt="Vercel logomark"
//               width={16}
//               height={16}
//             />
//             Deploy Now
//           </a>
//           <a
//             className="flex h-12 w-full items-center justify-center rounded-full border border-solid border-black/[.08] px-5 transition-colors hover:border-transparent hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a] md:w-[158px]"
//             href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//             target="_blank"
//             rel="noopener noreferrer"
//           >
//             Documentation
//           </a>
//         </div>
//       </main>
//     </div>
//   );
// }



// import { Link } from "react-router-dom";
import Link from "next/link";
import { User, Truck, LayoutDashboard, Zap, Shield, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

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
    icon: Truck,
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
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-accent/5" />
        <div className="absolute top-20 right-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-accent/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "1.5s" }} />

        <div className="container mx-auto px-4 pt-32 pb-20 relative">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 animate-fade-up opacity-0" style={{ animationDelay: "0.1s" }}>
              <Zap className="w-4 h-4" />
              Instant Delivery Platform
            </div>
            
            <h1 className="text-5xl md:text-7xl font-extrabold mb-6 animate-fade-up opacity-0" style={{ animationDelay: "0.2s" }}>
              <span className="gradient-text">Quick Commerce</span>
              <br />
              <span className="text-foreground">Reimagined</span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-10 max-w-xl mx-auto animate-fade-up opacity-0" style={{ animationDelay: "0.3s" }}>
              Experience lightning-fast deliveries with real-time tracking. Order, deliver, and manage — all in one powerful platform.
            </p>

            <div className="flex items-center justify-center gap-4 animate-fade-up opacity-0" style={{ animationDelay: "0.4s" }}>
              {/* <Link to="/customer"> */}
              <Link href="/login">
                {/* <Button size="xl" variant="hero"> */}
                <Button size="lg" variant="default">
                  Start Ordering
                </Button>
              </Link>
              <Link href="/login">
                {/* <Button size="xl" variant="outline"> */}
                <Button size="lg" variant="outline">
                  Become a Partner
                </Button>
              </Link>
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
