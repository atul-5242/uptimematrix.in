'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/store';
import { Button } from '@/components/ui/button';

export default function DashboardPage() {
  const token = useAppSelector((s) => s.auth.token);
  const router = useRouter();

  useEffect(() => {
    if (!token) router.replace('/signin');
  }, [token, router]);

  if (!token) return null;

  return (
    <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-2">Welcome back! Here is your monitoring overview.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-xl border p-6 bg-background">
          <h2 className="text-sm font-medium text-muted-foreground">Monitored Services</h2>
          <div className="mt-2 text-2xl font-semibold">—</div>
        </div>
        <div className="rounded-xl border p-6 bg-background">
          <h2 className="text-sm font-medium text-muted-foreground">Incidents (24h)</h2>
          <div className="mt-2 text-2xl font-semibold">—</div>
        </div>
        <div className="rounded-xl border p-6 bg-background">
          <h2 className="text-sm font-medium text-muted-foreground">Avg Response</h2>
          <div className="mt-2 text-2xl font-semibold">—</div>
        </div>
      </div>

      <div className="mt-8 flex gap-3">
        <Button onClick={() => router.push('/onboarding')}>Start monitoring</Button>
        <Button variant="outline" onClick={() => router.push('/')}>Go to homepage</Button>
      </div>
    </main>
  );
}
