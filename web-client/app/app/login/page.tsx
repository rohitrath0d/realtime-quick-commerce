"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, LogIn, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/providers/AuthProvider';
// import { toast } from '@/hooks/use-toast';
import { toast } from 'sonner';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const router = useRouter();
  const params = useSearchParams();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await login(email, password);
      toast.success('Login successful');

      // Redirect based on provided 'from' query param or default
      const from = params?.get('from') || '/';

      console.log('Search params:', params); // Check if 'from' exists
      console.log('Redirecting from:', params?.get('from'));

      // if (params?.get('from')) {
      if (from !== '/') {
        router.replace(from);
      } else if (response?.user?.role) {
        const role = String(response.user.role).trim().toLowerCase();
        switch (role) {
          case 'customer':
            // router.replace('/customer/dashboard');
            router.replace('/customer');
            break;
          case 'store':
            router.replace('/store');
            break;
          case 'delivery':
            router.replace('/delivery');
            break;
          case 'admin':
            router.replace('/admin');
            break;
          default:
            router.replace('/');
        }
      } else {
        router.replace(from);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  const demoCredentials = [
    { role: 'Customer', email: 'customer@test.com', password: 'Test@123' },
    { role: 'Store', email: 'store@test.com', password: 'Test@123' },
    { role: 'Delivery', email: 'delivery@test.com', password: 'Test@123' },
    { role: 'Admin', email: 'admin@test.com', password: 'Admin@123' },
  ];

  const fillDemo = (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
  };

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
          <h1 className="text-2xl font-bold text-foreground mb-2">Welcome back</h1>
          <p className="text-muted-foreground">Sign in to your account</p>
        </div>

        {/* Form */}
        <div className="glass-card rounded-2xl p-6 animate-fade-up opacity-0" style={{ animationDelay: '0.2s' }}>
          <form onSubmit={handleSubmit} className="space-y-4">
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
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
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
                  <LogIn className="w-5 h-5 mr-2" />
                  Sign In
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Don&apost have an account?{' '}
              <Link href="/register" className="text-primary hover:underline font-medium">
                Sign up
              </Link>
            </p>
          </div>
        </div>

        {/* Demo Credentials */}
        <div className="mt-6 animate-fade-up opacity-0" style={{ animationDelay: '0.3s' }}>
          <p className="text-center text-sm text-muted-foreground mb-3">Demo credentials</p>
          <div className="grid grid-cols-2 gap-2">
            {demoCredentials.map((cred) => (
              <button
                key={cred.role}
                onClick={() => fillDemo(cred.email, cred.password)}
                className="px-3 py-2 text-xs rounded-lg bg-secondary hover:bg-secondary/80 text-secondary-foreground transition-colors"
              >
                {cred.role}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
