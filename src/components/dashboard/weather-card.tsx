"use client";
import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Sun, MapPin, Navigation } from "lucide-react";
import { Skeleton } from '../ui/skeleton';

export function WeatherCard() {
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('Loading...');

  useEffect(() => {
    // Set date on mount
    setDate(new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }));
    
    // Get location on mount, only runs on client
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            // In a real app, you would use position.coords.latitude and position.coords.longitude
            // to call a weather API and get the city name. For now, we'll use a placeholder.
            setLocation('Green Valley');
          },
          (error) => {
            console.error("Geolocation error:", error);
            setLocation('Location N/A');
          }
        );
    } else {
        setLocation('Geolocation not supported');
    }

  }, []);

  return (
    <Card className="w-full md:w-auto">
      <CardContent className="p-4 flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Sun className="w-8 h-8 text-amber-500" />
          <div>
            <p className="text-2xl font-bold">28°C</p>
            <p className="text-sm text-muted-foreground">Sunny</p>
          </div>
        </div>
        <div className="border-l pl-4">
          <p className="flex items-center gap-1 font-semibold">
            <MapPin className="w-4 h-4"/> {location}
          </p>
          {date ? (
            <p className="text-sm text-muted-foreground">{date}</p>
          ) : (
            <Skeleton className="h-4 w-24 mt-1" />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
