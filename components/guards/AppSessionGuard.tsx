import { supabase } from "@/lib/supabase";
import type { Session } from "@supabase/supabase-js";
import { useRouter, useSegments } from "expo-router";
import { ReactNode, useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";

type Props = { children: ReactNode };

export default function AppSessionGuard({ children }: Props) {
  const router = useRouter();
  const segments = useSegments();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

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

    // Routes that authenticated users can access
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

    const inAuthenticatedRoute = authenticatedRoutes.includes(segments[0] as string);

    if (session && !inAuthenticatedRoute) {
      router.replace("/(tabs)");
    } else if (!session && !inAuthFlow) {
      router.replace("/welcome");
    }
  }, [session, loading, segments]); 

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return <>{children}</>;
}
