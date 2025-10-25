import { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  Pressable,
  Image,
  StatusBar,
  TextInput,
  View,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";
import * as WebBrowser from "expo-web-browser";

import { Themes } from "./assets/Themes";
import { useSpotifyAuth } from "./utils/useSpotifyAuth";
import type { Track, SpotifyAuthResponse } from "./utils/types";
import { getMyTopTracks } from "./utils/apiOptions";
import Song from "./components/Song";

WebBrowser.maybeCompleteAuthSession();

// minimal types for the Search API response (keeps `any` out)
type SpotifyTrackItem = {
  id: string;
  name: string;
  artists: { name: string }[];
  album: { name: string; images: { url: string }[] };
  duration_ms: number;
  external_urls: { spotify?: string };
  preview_url: string | null;
};

type SpotifySearchResponse = { tracks?: { items: SpotifyTrackItem[] } };

export default function App() {
  const { authResponse, getSpotifyAuth } = useSpotifyAuth();
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const asDirect = authResponse as SpotifyAuthResponse | null;
    const asExpo = authResponse as {
      type?: string;
      params?: { access_token?: string };
    } | null;

    let accessToken: string | undefined;

    if (asDirect?.access_token) {
      accessToken = asDirect.access_token;
    } else if (asExpo && asExpo.type === "success") {
      accessToken = asExpo.params?.access_token;
    }
    if (accessToken) {
      setToken(accessToken);
      console.log("[AUTH] token saved:", accessToken.slice(0, 16) + "..."); // debugging
    } else {
      setToken(null);
      console.log("[AUTH] no token found in authResponse"); // debugging
    }
  }, [authResponse]);

  const [tracks, setTracks] = useState<Track[] | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      setTracks(null);
      return;
    }

    setLoading(true);
    getMyTopTracks(token)
      .then((result: Track[] | null) => {
        console.log("[PART 3] fetch result:", result);
        if (result && Array.isArray(result)) {
          console.log(`[Part 3] ${result.length} tracks retrieved`);
          setTracks(result);
        } else {
          setTracks(null);
        }
      })
      .catch(() => {
        setTracks(null);
      })
      .finally(() => setLoading(false));
  }, [token]);

  // Choosing to complete the search extension 
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);

  // Search helper using Spotify's search API re: given docs
  const searchTracks = (tok: string, q: string) => {
    const url = `https://api.spotify.com/v1/search?type=track&limit=20&q=${encodeURIComponent(
      q
    )}`;
    return fetch(url, { headers: { Authorization: `Bearer ${tok}` } })
      .then((res) => res.json())
      .then((data: SpotifySearchResponse) => {
        const items = data.tracks?.items ?? [];
        const mapped: Track[] = items.map((t) => ({
          songTitle: t.name,
          songArtists: t.artists?.map((a) => ({ name: a.name })) ?? [],
          albumName: t.album?.name,
          imageUrl: t.album?.images?.[0]?.url,
          duration: t.duration_ms,
          externalUrl: t.external_urls?.spotify,
          previewUrl: t.preview_url ?? undefined,
        }));
        return mapped;
      });
  };

  // button-triggered search (empty query restores top tracks)
  const runSearch = () => {
    const q = searchQuery.trim();
    if (!token) return;

    if (!q) {
      setSearching(true);
      getMyTopTracks(token)
        .then((result: Track[] | null) => setTracks(result ?? null))
        .finally(() => setSearching(false));
      return;
    }

    setSearching(true);
    searchTracks(token, q)
      .then((result) => setTracks(result))
      .finally(() => setSearching(false));
  };

  // Debounces auto search
  useEffect(() => {
    if (!token) return;
    const q = searchQuery.trim();
    if (q.length < 2) return; // avoid spamming for short input

    const handle = setTimeout(() => {
      setSearching(true);
      searchTracks(token, q)
        .then((result) => setTracks(result))
        .finally(() => setSearching(false));
    }, 500);

    return () => clearTimeout(handle);
  }, [searchQuery, token]);

  let content = null;
  if (!token) {
    content = (
      <Pressable style={styles.authButton} onPress={() => getSpotifyAuth()}>
        <Image
          source={require("./assets/spotify-logo.png")}
          style={styles.authButtonIcon}
        />
        <Text style={styles.authButtonText}>Connect with Spotify</Text>
      </Pressable>
    );
  } else {
    content = (
      <View style={{ flex: 1, alignSelf: "stretch" }}>
        <View style={styles.searchRow}>
          <TextInput
            placeholder="Search tracks"
            placeholderTextColor={Themes.colors.gray}
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCorrect={false}
            autoCapitalize="none"
          />
          <Pressable style={styles.searchBtn} onPress={runSearch}>
            <Text style={styles.searchBtnText}>Search</Text>
          </Pressable>
        </View>

        {loading || searching ? (
          <ActivityIndicator size="large" color={Themes.colors.spotify} />
        ) : tracks && Array.isArray(tracks) ? (
          <FlatList
            data={tracks}
            keyExtractor={(item, index) =>
              item.externalUrl ||
              item.previewUrl ||
              `${item.songTitle}-${index}`
            }
            renderItem={({ item, index }) => (
              <Song track={item} index={index + 1} />
            )}
            ListHeaderComponent={<Text style={styles.header}>Results</Text>}
            contentContainerStyle={{ paddingBottom: 16 }}
          />
        ) : (
          <Text style={styles.text}>No tracks available.</Text>
        )}
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        {content}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Themes.colors.background,
    justifyContent: "center",
    alignItems: "center",
  },
  authButton: {
    flexDirection: "row",
    gap: 5,
    borderRadius: 40,
    padding: 12,
    backgroundColor: Themes.colors.spotify,
    alignItems: "center",
    justifyContent: "center",
  },
  authButtonText: {
    fontSize: 12,
    fontWeight: "bold",
    color: Themes.colors.white,
    textTransform: "uppercase",
    textAlign: "center",
  },
  authButtonIcon: {
    height: 15,
    width: 15,
  },
  text: {
    color: Themes.colors.white,
  },
  header: {
    color: Themes.colors.white,
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    marginVertical: 16,
  },
  searchRow: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: "center",
  },
  searchInput: {
    flex: 1,
    backgroundColor: "#222",
    color: Themes.colors.white,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchBtn: {
    backgroundColor: Themes.colors.spotify,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
  },
  searchBtnText: {
    color: Themes.colors.white,
    fontWeight: "700",
    textTransform: "uppercase",
    fontSize: 12,
  },
});