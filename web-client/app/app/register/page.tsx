"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, UserPlus, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/providers/AuthProvider';
// import { toast } from '@/hooks/use-toast';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

type Role = 'customer' | 'store' | 'delivery';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<Role>('customer');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { register } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await register({ name, email, password, role, phone: phone || undefined });
      // toast({
      //   title: 'Account created!',
      //   description: 'Welcome to QuickDash',
      // });
      toast.success('Account created! Welcome to QuickDash');
      
      // Redirect based on role
      const roleRoutes: Record<Role, string> = {
        // customer: '/customer/dashboard',
        customer: '/customer',
        store: '/store',
        delivery: '/delivery',
      };
      router.replace(roleRoutes[role]);
    } catch (error) {
      // toast({
      //   title: 'Registration failed',
      //   description: error instanceof Error ? error.message : 'Something went wrong',
      //   variant: 'destructive',
      // });
      toast.error(error instanceof Error ? error.message : 'Registration failed. Something went wrong.');
    } finally {
      setIsLoading(false);
    }
  };

  const roles: { value: Role; label: string; description: string }[] = [
    { value: 'customer', label: 'Customer', description: 'Order products' },
    { value: 'store', label: 'Store Owner', description: 'Manage orders' },
    { value: 'delivery', label: 'Delivery Partner', description: 'Deliver orders' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-up opacity-0" style={{ animationDelay: '0.1s' }}>
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-primary to-accent flex items-center justify-center">
              <Zap className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold text-foreground">QuickDash</span>
          </Link>
          <h1 className="text-2xl font-bold text-foreground mb-2">Create an account</h1>
          <p className="text-muted-foreground">Join QuickDash today</p>
        </div>

        {/* Form */}
        <div className="glass-card rounded-2xl p-6 animate-fade-up opacity-0" style={{ animationDelay: '0.2s' }}>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Role Selection */}
            <div className="space-y-2">
              <Label>I want to</Label>
              <div className="grid grid-cols-3 gap-2">
                {roles.map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setRole(r.value)}
                    className={cn(
                      'p-3 rounded-xl text-center transition-all duration-300',
                      role === r.value
                        ? 'bg-primary text-primary-foreground shadow-glow'
                        : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                    )}
                  >
                    <p className="text-sm font-medium">{r.label}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="h-12 rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12 rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone (optional)</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+1 555-0123"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="h-12 rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="h-12 rounded-xl pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant="hero"
              size="lg"
              className="w-full h-12 rounded-xl"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <UserPlus className="w-5 h-5 mr-2" />
                  Create Account
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link href="/login" className="text-primary hover:underline font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
