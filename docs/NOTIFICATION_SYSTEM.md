# Unified Notification System

## Architecture

This app uses a **centralized notification system** that handles ALL types of notifications through a single, robust architecture.

```
┌─────────────────────────────────────────┐
│      NotificationsContext               │
│  (Central hub for ALL notifications)    │
└─────────────────────────────────────────┘
            ↑
            │ addNotification()
            │
    ┌───────┴────────┬──────────────┬──────────────┐
    │                │              │              │
┌───┴────────┐  ┌───┴───────┐  ┌───┴──────┐  ┌───┴──────┐
│  Service   │  │ Messages  │  │ Payment  │  │  System  │
│  Requests  │  │           │  │          │  │  Alerts  │
└────────────┘  └───────────┘  └──────────┘  └──────────┘
```

## Components

### 1. **NotificationsContext** (`contexts/NotificationsContext.tsx`)
The central hub that manages all notifications.

**Features:**
- Supports multiple notification types: `success`, `error`, `info`, `warning`
- Supports multiple categories: `toast`, `service_request`, `message`, `payment`, `system`
- Actionable notifications with custom buttons
- Auto-dismiss for simple toasts
- Manual dismiss for actionable notifications

### 2. **NotificationToast** (`components/notifications-toast.tsx`)
Beautiful UI component that displays all notifications.

**Features:**
- Animated entrance/exit
- Progress bar for auto-dismissing toasts
- Action buttons for actionable notifications
- Category-specific icons
- Color-coded by type

### 3. **ServiceRequestsContext** (`contexts/ServiceRequestsContext.tsx`)
Example of how to use the unified notification system.

## Usage Examples

### Simple Toast Notification

```typescript
import { useNotification } from '@/contexts/NotificationsContext';

function MyComponent() {
  const { addNotification } = useNotification();

  const showSuccess = () => {
    addNotification({
      type: 'success',
      category: 'toast',
      title: 'Success!',
      message: 'Profile updated successfully',
      duration: 3000, // Auto-dismiss after 3 seconds
    });
  };

  return <Button onPress={showSuccess}>Update Profile</Button>;
}
```

### Actionable Notification (Service Request)

```typescript
import { useNotification } from '@/contexts/NotificationsContext';

function ServiceRequestListener() {
  const { addNotification } = useNotification();

  const showServiceRequest = (request) => {
    addNotification({
      type: request.priority === 'urgent' ? 'warning' : 'info',
      category: 'service_request',
      title: '🔔 New Job Request',
      message: request.title,
      duration: Infinity, // Don't auto-dismiss
      data: request, // Attach full data
      actions: [
        {
          label: 'Accept',
          action: async () => {
            await acceptRequest(request.id);
          },
          style: 'primary',
        },
        {
          label: 'Reject',
          action: async () => {
            await rejectRequest(request.id);
          },
          style: 'danger',
        },
        {
          label: 'View Details',
          action: () => {
            navigate('/job-details', { id: request.id });
          },
          style: 'secondary',
        },
      ],
    });
  };
}
```

### Message Notification

```typescript
const showNewMessage = (message) => {
  addNotification({
    type: 'info',
    category: 'message',
    title: `New message from ${message.senderName}`,
    message: message.text,
    duration: 5000,
    actions: [
      {
        label: 'Reply',
        action: () => navigate('/chat', { userId: message.senderId }),
        style: 'primary',
      },
    ],
  });
};
```

### Payment Notification

```typescript
const showPaymentReceived = (amount) => {
  addNotification({
    type: 'success',
    category: 'payment',
    title: 'Payment Received',
    message: `You received $${amount}`,
    duration: 4000,
  });
};
```

## Setup

### 1. Wrap your app with providers

```typescript
// app/_layout.tsx
import { NotificationProvider } from '@/contexts/NotificationsContext';
import { ServiceRequestProvider } from '@/contexts/ServiceRequestsContext';
import { NotificationToast } from '@/components/notifications-toast';

export default function RootLayout() {
  return (
    <NotificationProvider>
      <ServiceRequestProvider>
        {/* Your app */}
        <Stack />

        {/* Notification UI - placed at root level */}
        <NotificationToast />
      </ServiceRequestProvider>
    </NotificationProvider>
  );
}
```

### 2. Use anywhere in your app

Any component can now trigger notifications:

```typescript
const { addNotification } = useNotification();

addNotification({
  type: 'success',
  category: 'toast',
  title: 'Done!',
  message: 'Operation completed',
});
```

## Notification Types

| Type      | Use Case                          | Color  |
|-----------|-----------------------------------|--------|
| `success` | Operation succeeded               | Green  |
| `error`   | Operation failed                  | Red    |
| `warning` | Important alert, urgent requests  | Amber  |
| `info`    | General information               | Blue   |

## Notification Categories

| Category          | Icon            | Use Case                        |
|-------------------|-----------------|---------------------------------|
| `toast`           | Type-based      | Simple messages                 |
| `service_request` | Bell            | New job requests                |
| `message`         | MessageCircle   | Chat messages                   |
| `payment`         | DollarSign      | Payment notifications           |
| `system`          | Type-based      | System alerts                   |

## Action Button Styles

| Style       | Appearance           | Use Case              |
|-------------|----------------------|-----------------------|
| `primary`   | Black background     | Main action (Accept)  |
| `secondary` | Gray background      | Alternative action    |
| `danger`    | Red background       | Destructive action    |

## Best Practices

1. **Use categories** - Always specify a category for better UX
2. **Actionable = Infinity duration** - Don't auto-dismiss if user needs to respond
3. **Include data** - Attach full objects for action handlers to use
4. **Clear actions** - Use clear, action-oriented button labels
5. **Limit actions** - Max 3 action buttons per notification
6. **Toast for feedback** - Use simple toasts for operation results
7. **Actionable for requests** - Use actionable notifications when user input is needed

## Migration Guide

If you have existing notification code, update it like this:

**Before:**
```typescript
Alert.alert('Success', 'Profile updated');
```

**After:**
```typescript
addNotification({
  type: 'success',
  category: 'toast',
  title: 'Success',
  message: 'Profile updated',
});
```

This provides a better UX with beautiful animations and consistent styling!
