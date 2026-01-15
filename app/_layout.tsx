import AppSessionGuard from "@/components/guards/AppSessionGuard";
import { NotificationToast } from "@/components/notifications-toast";
import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import { CountryProvider } from "@/contexts/CountryContext";
import { NotificationProvider } from "@/contexts/NotificationsContext";
import { ServiceRequestProvider } from "@/contexts/ServiceRequestsContext";
import "@/global.css";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { queryClient } from "@/lib/queryClient";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { QueryClientProvider } from "@tanstack/react-query";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";

// Keep splash screen visible until auth check completes
SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  initialRouteName: "(auth)",
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  const [fontsLoaded] = useFonts({
    DMSansRegular: require("../assets/fonts/DMSans-Regular.ttf"),
    DMSansMedium: require("../assets/fonts/DMSans-Medium.ttf"),
    DmSansSemiBold: require("../assets/fonts/DMSans-SemiBold.ttf"),
    DMSansBold: require("../assets/fonts/DMSans-Bold.ttf"),
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <CountryProvider>
          <AppSessionGuard>
            <NotificationProvider>
              <ServiceRequestProvider>
              <GluestackUIProvider mode="light">
                <ThemeProvider
                  value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
                >
                  <BottomSheetModalProvider>
                    <Stack screenOptions={{ headerShown: false }}>
                      <Stack.Screen name="(auth)" />
                      <Stack.Screen name="(tabs)" />
                      <Stack.Screen name="conversation" />
                      <Stack.Screen name="edit-profile" />
                      <Stack.Screen name="handyman-profile" />
                      <Stack.Screen name="preferences" />
                      <Stack.Screen name="security" />
                      <Stack.Screen name="job-details" />
                      <Stack.Screen name="onboarding" />
                      <Stack.Screen name="payment-methods" />
                      <Stack.Screen
                        name="modal"
                        options={{
                          presentation: "modal",
                          title: "Modal",
                          headerShown: true,
                        }}
                      />
                    </Stack>
                    <StatusBar style="auto" />
                    <NotificationToast />
                  </BottomSheetModalProvider>
                </ThemeProvider>
              </GluestackUIProvider>
            </ServiceRequestProvider>
            </NotificationProvider>
          </AppSessionGuard>
        </CountryProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
