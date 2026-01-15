import { supabase } from "@/lib/supabase";
import type { Session } from "@supabase/supabase-js";
import { useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { ReactNode, useEffect, useRef, useState } from "react";

type Props = { children: ReactNode };

export default function AppSessionGuard({ children }: Props) {
  const router = useRouter();
  const segments = useSegments();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isNavigationReady, setIsNavigationReady] = useState(false);
  const hasHiddenSplash = useRef(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (loading) return;

    const inAuthFlow = segments[0] === "(auth)";

    const authenticatedRoutes = [
      "(tabs)",
      "conversation",
      "edit-profile",
      "handyman-profile",
      "preferences",
      "security",
      "job-details",
      "onboarding",
      "payment-methods",
      "modal",
    ];

    const inAuthenticatedRoute = authenticatedRoutes.includes(segments[0] as string);

    if (session && !inAuthenticatedRoute) {
      router.replace("/(tabs)");
    } else if (!session && !inAuthFlow) {
      router.replace("/welcome");
    } else {
      // Already on the correct route
      setIsNavigationReady(true);
    }
  }, [session, loading, segments]);

  // Hide splash screen once navigation is ready
  useEffect(() => {
    if (isNavigationReady && !hasHiddenSplash.current) {
      hasHiddenSplash.current = true;
      SplashScreen.hideAsync();
    }
  }, [isNavigationReady]);

  // Keep showing nothing (splash screen stays visible) until ready
  if (loading || !isNavigationReady) {
    return null;
  }

  return <>{children}</>;
}
