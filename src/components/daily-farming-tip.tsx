
'use client';

import { useState, useEffect } from 'react';
import { getDailyFarmingTip } from '@/ai/flows/daily-farming-tip';
import { Skeleton } from '@/components/ui/skeleton';

export function DailyFarmingTip() {
  const [tip, setTip] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTip() {
      try {
        setLoading(true);
        const response = await getDailyFarmingTip({
          location: 'Central India',
          season: 'Monsoon',
        });
        setTip(response.tip);
      } catch (err) {
        setError('Could not fetch a tip at this time.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchTip();
  }, []);

  if (loading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    );
  }

  if (error) {
    return <p className="text-sm text-destructive">{error}</p>;
  }

  return (
    <p className="text-sm text-muted-foreground italic">
      &quot;{tip}&quot;
    </p>
  );
}
