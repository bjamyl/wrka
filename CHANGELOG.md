# wrka - Development Changelog

This file tracks completed tasks, bug fixes, and feature implementations for the wrka application.

---

## 2025-12-16

### Bug Fix: Navigation Routing Issues

**Status:** Completed

**Problem:**
- Clicking on a conversation from the messages page redirected to the homepage instead of the conversation detail page
- Profile child pages (Edit Profile, Handyman Profile, Preferences, Security) also redirected back to homepage instead of opening

**Root Cause:**
1. Missing `Stack.Screen` definitions in `app/_layout.tsx` for root-level routes
2. `AppSessionGuard` component was redirecting authenticated users back to `/(tabs)` whenever they navigated to any route outside the tabs group

**Solution:**

1. Added missing `Stack.Screen` definitions to `app/_layout.tsx`:
   - `edit-profile`
   - `handyman-profile`
   - `preferences`
   - `security`
   - `job-details`
   - `onboarding`

2. Updated `components/guards/AppSessionGuard.tsx` to recognize all valid authenticated routes:
   ```typescript
   const authenticatedRoutes = [
     "(tabs)",
     "conversation",
     "edit-profile",
     "handyman-profile",
     "preferences",
     "security",
     "job-details",
     "onboarding",
     "modal",
   ];
   ```

**Files Modified:**
- `app/_layout.tsx`
- `components/guards/AppSessionGuard.tsx`

---

### Bug Fix: Conversation Input Hidden Behind Keyboard

**Status:** Completed

**Problem:**
- When opening a conversation and tapping on the input field, the keyboard would cover the text input
- Users couldn't see what they were typing, unlike modern chat apps (WhatsApp, Telegram, etc.)

**Root Cause:**
- `SafeAreaView` was only handling top edges, not bottom
- `KeyboardAvoidingView` wasn't properly configured
- Missing keyboard event listeners to auto-scroll messages when keyboard appears

**Solution:**

1. Replaced `SafeAreaView` with regular `View` and manual safe area insets handling using `useSafeAreaInsets()`
2. Added keyboard show listener to auto-scroll messages to bottom when keyboard appears
3. Added `keyboardDismissMode="interactive"` and `keyboardShouldPersistTaps="handled"` to FlatList for better UX
4. Applied dynamic bottom padding to input container based on device safe area

**Files Modified:**
- `app/conversation/[id].tsx`

---

## Messages Module - Pending Tasks

- [ ] Real-time message updates (Supabase realtime subscriptions)
- [ ] Message read receipts
- [ ] Typing indicators
- [ ] Image/file attachments
- [ ] Message search functionality
- [ ] Push notifications for new messages

---
