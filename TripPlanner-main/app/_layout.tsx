import "react-native-gesture-handler";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useRouter, useSegments, usePathname } from "expo-router";
import * as Linking from "expo-linking";

export default function RootLayout() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const segments = useSegments();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === "(tabs)";
    const isInvitePage = pathname?.startsWith("/invite/");

    if (isInvitePage) {
      return;
    }

    if (!session && inAuthGroup) {
      router.replace("/login");
    } else if (session && !inAuthGroup && !isInvitePage) {
      router.replace("/(tabs)");
    }
  }, [session, segments, loading, pathname]);

  useEffect(() => {
    const handleDeepLink = async (event: { url: string }) => {
      const { path } = Linking.parse(event.url);
      
      if (path?.startsWith('/invite/')) {
        const token = path.split('/invite/')[1];
        router.push(`/invite/${token}`);
      }
    };

    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink({ url });
      }
    });

    const subscription = Linking.addEventListener('url', handleDeepLink);

    return () => {
      subscription.remove();
    };
  }, [router]);

  return (
    <>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="login" />
        <Stack.Screen name="signup" />
        <Stack.Screen name="invite/[token]" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </>
  );
}
