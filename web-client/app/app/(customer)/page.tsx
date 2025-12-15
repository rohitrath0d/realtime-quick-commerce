import { redirect } from 'next/navigation';

export default function CustomerIndex() {
  // Redirect /customer to the dashboard
  redirect('/customer/dashboard');
}
