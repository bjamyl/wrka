# Real-time Booking Tracking Specification

> Uber-like live tracking experience for handyman bookings

---

## Overview

This feature enables customers to track their handyman in real-time from the moment they leave for the job until arrival. The design prioritizes minimal database storage by using Supabase Broadcast for ephemeral location data.

---

## Status Flow

```
pending → accepted → on_the_way → arrived → in_progress → completed
                         │
                    [live location streaming]
```

### Status Definitions

| Status | Description | Triggered By |
|--------|-------------|--------------|
| `pending` | Booking created, waiting for handyman | Customer creates booking |
| `accepted` | Handyman accepted the job | Handyman accepts |
| `on_the_way` | Handyman is traveling to location | Handyman starts navigation |
| `arrived` | Handyman has arrived at location | Handyman marks arrival |
| `in_progress` | Work is being performed | Handyman starts work |
| `completed` | Job finished | Handyman/Customer marks complete |
| `cancelled` | Job cancelled | Customer cancels (before in_progress) |
| `rejected` | Handyman declined | Handyman declines |

---

## Architecture

### Data Flow

```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│  Handyman App   │         │    Supabase     │         │  Customer App   │
└────────┬────────┘         └────────┬────────┘         └────────┬────────┘
         │                           │                           │
         │  UPDATE status            │                           │
         │  ──────────────────────►  │  Postgres Changes         │
         │                           │  ──────────────────────►  │
         │                           │                           │
         │  BROADCAST location       │                           │
         │  ──────────────────────►  │  Broadcast (no storage)   │
         │  (every 3-5 seconds)      │  ──────────────────────►  │
         │                           │                           │
         │                           │                           │
```

### What Gets Stored (Database)

| Data | Stored | Location |
|------|--------|----------|
| Booking status | Yes | `service_requests.status` |
| Status timestamps | Yes | `accepted_at`, `started_at`, `completed_at` |
| Live location | **No** | Broadcast channel only |
| ETA | **No** | Calculated client-side |

### Supabase Realtime Channels

| Channel Type | Purpose | Storage |
|--------------|---------|---------|
| Postgres Changes | Status updates | Yes |
| Broadcast | Live location streaming | No |

---

## Database Changes Required

### 1. Expand Status Enum

**Current enum:**
```sql
'pending', 'accepted', 'in_progress', 'rejected', 'completed', 'cancelled'
```

**New enum:**
```sql
'pending', 'accepted', 'on_the_way', 'arrived', 'in_progress', 'rejected', 'completed', 'cancelled'
```

**SQL to execute:**
```sql
-- Add new status values to the enum
ALTER TYPE service_request_status ADD VALUE 'on_the_way' AFTER 'accepted';
ALTER TYPE service_request_status ADD VALUE 'arrived' AFTER 'on_the_way';
```

> **Note:** If status is stored as TEXT (not enum), no migration needed - just update app code.

### 2. Add Timestamp Column (Optional)

```sql
-- Track when handyman started traveling (optional, for analytics)
ALTER TABLE service_requests
ADD COLUMN departed_at TIMESTAMP WITH TIME ZONE;
```

### 3. Enable Realtime for service_requests

Ensure the table has realtime enabled in Supabase Dashboard:
- Go to Database → Replication
- Enable `service_requests` table for realtime

---

## Customer App Implementation

### 1. Subscribe to Status Changes

```typescript
// Hook: useBookingRealtimeStatus.ts
import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export function useBookingRealtimeStatus(bookingId: string, onStatusChange: (status: string) => void) {
  useEffect(() => {
    const channel = supabase
      .channel(`booking-status:${bookingId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'service_requests',
          filter: `id=eq.${bookingId}`,
        },
        (payload) => {
          onStatusChange(payload.new.status);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [bookingId, onStatusChange]);
}
```

### 2. Subscribe to Location Broadcast

```typescript
// Hook: useHandymanLocation.ts
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

type Location = {
  lat: number;
  lng: number;
  heading?: number;
  timestamp: number;
};

export function useHandymanLocation(bookingId: string, isTracking: boolean) {
  const [location, setLocation] = useState<Location | null>(null);

  useEffect(() => {
    if (!isTracking) return;

    const channel = supabase
      .channel(`location:${bookingId}`)
      .on('broadcast', { event: 'location' }, (payload) => {
        setLocation(payload.payload as Location);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [bookingId, isTracking]);

  return location;
}
```

### 3. Tracking Map Component

```typescript
// Component: TrackingMap.tsx
// Show map with:
// - Handyman's live location (moving marker)
// - Job location (destination marker)
// - Route line (optional, via directions API)
// - ETA display (calculated from distance)
```

### 4. Status-Based UI

```typescript
// In BookingDetails screen:
switch (status) {
  case 'accepted':
    // Show "Handyman will be on their way soon"
    break;
  case 'on_the_way':
    // Show TrackingMap with live location
    // Show ETA
    break;
  case 'arrived':
    // Show "Your handyman has arrived!"
    // Hide map, show "Work starting soon"
    break;
  case 'in_progress':
    // Show job progress UI
    break;
}
```

---

## Handyman App Implementation

### 1. Status Update Functions

```typescript
// Update booking status
async function updateBookingStatus(bookingId: string, status: string) {
  const updates: any = { status };

  // Add timestamps for specific statuses
  if (status === 'on_the_way') {
    updates.departed_at = new Date().toISOString();
  } else if (status === 'arrived') {
    // Nothing extra needed
  } else if (status === 'in_progress') {
    updates.started_at = new Date().toISOString();
  } else if (status === 'completed') {
    updates.completed_at = new Date().toISOString();
  }

  const { error } = await supabase
    .from('service_requests')
    .update(updates)
    .eq('id', bookingId);

  return { error };
}
```

### 2. Location Broadcasting

```typescript
// Hook: useLocationBroadcast.ts
import { useEffect, useRef } from 'react';
import * as Location from 'expo-location';
import { supabase } from '@/lib/supabase';

export function useLocationBroadcast(bookingId: string, isActive: boolean) {
  const channelRef = useRef<any>(null);

  useEffect(() => {
    if (!isActive || !bookingId) return;

    // Create broadcast channel
    channelRef.current = supabase.channel(`location:${bookingId}`);
    channelRef.current.subscribe();

    // Start location tracking
    let subscription: Location.LocationSubscription;

    (async () => {
      subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          distanceInterval: 10, // Update every 10 meters
          timeInterval: 3000,   // Or every 3 seconds
        },
        (location) => {
          // Broadcast location (no DB storage)
          channelRef.current?.send({
            type: 'broadcast',
            event: 'location',
            payload: {
              lat: location.coords.latitude,
              lng: location.coords.longitude,
              heading: location.coords.heading,
              timestamp: Date.now(),
            },
          });
        }
      );
    })();

    return () => {
      subscription?.remove();
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [bookingId, isActive]);
}
```

### 3. UI Flow for Handyman

```
Job Accepted Screen
    │
    ▼
[Start Navigation] button
    │
    ▼
Status → "on_the_way"
Location broadcasting starts
    │
    ▼
[I've Arrived] button
    │
    ▼
Status → "arrived"
Location broadcasting stops
    │
    ▼
[Start Job] button (with fee confirmation dialog)
    │
    ▼
Status → "in_progress"
```

---

## ETA Calculation

Calculate client-side using Haversine distance + average speed assumption:

```typescript
function calculateETA(
  handymanLat: number,
  handymanLng: number,
  destinationLat: number,
  destinationLng: number,
  averageSpeedKmh: number = 30 // Urban driving average
): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(destinationLat - handymanLat);
  const dLng = toRad(destinationLng - handymanLng);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(handymanLat)) * Math.cos(toRad(destinationLat)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  // ETA in minutes
  return Math.round((distance / averageSpeedKmh) * 60);
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}
```

For more accurate ETA, integrate Google Maps Directions API or similar.

---

## Testing Checklist

### Customer App
- [ ] Receives real-time status updates
- [ ] Shows tracking map when status = "on_the_way"
- [ ] Displays live handyman location on map
- [ ] Shows ETA and updates as handyman moves
- [ ] Hides map when status = "arrived"
- [ ] Handles handyman going offline gracefully

### Handyman App
- [ ] Can update status to "on_the_way"
- [ ] Broadcasts location while on_the_way
- [ ] Can mark "arrived" (stops broadcasting)
- [ ] Location permissions handled properly
- [ ] Battery-efficient location tracking

### Edge Cases
- [ ] Poor network connectivity
- [ ] Handyman app killed/backgrounded
- [ ] Customer app backgrounded (push notification)
- [ ] Multiple simultaneous bookings

---

## Future Enhancements

1. **Push Notifications** - Notify customer of status changes when app is backgrounded
2. **Route Display** - Show actual route on map via Directions API
3. **Traffic-aware ETA** - Use Google Maps for accurate ETA
4. **Progress Photos** - Handyman uploads before/during/after photos
5. **Chat Integration** - Quick messaging during tracking

---

*Last Updated: January 2025*
