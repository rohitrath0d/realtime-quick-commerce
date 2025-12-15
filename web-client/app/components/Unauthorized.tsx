import Link from 'next/link';
import { Button } from '@/components/ui/button';

const Unauthorized = ({ userRole }: { userRole?: string }) => {
  return (
    <div className="container mx-auto px-4 py-20 text-center">
      <div className="w-full max-w-md mx-auto">
        <h2 className="text-2xl font-bold mb-4">Unauthorized</h2>
        <p className="text-muted-foreground mb-6">You do not have permission to access this page.</p>
        <div className="flex items-center justify-center gap-2">
          <Link href="/login">
            <Button variant="ghost">Go to Login</Button>
          </Link>
          {userRole === 'customer' && (
            <Link href="/customer">
              <Button>Go to Customer</Button>
            </Link>
          )}
          {userRole === 'store' && (
            <Link href="/store">
              <Button>Go to Store</Button>
            </Link>
          )}
          {userRole === 'delivery' && (
            <Link href="/delivery">
              <Button>Go to Delivery</Button>
            </Link>
          )}
          {userRole === 'admin' && (
            <Link href="/admin">
              <Button>Go to Admin</Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
