import { useState, useEffect } from "react";
import { StyleSheet, FlatList, RefreshControl, Alert } from "react-native";

import Theme from "@/assets/theme";
import Post from "@/components/Post";
import Loading from "@/components/Loading";

import timeAgo from "@/utils/timeAgo";

import useSession from "@/utils/useSession";
import db from "@/database/db";

import type { PostSelect } from "@/types";

type FeedListProps = {
  shouldNavigateToComments?: boolean;
  fetchUsersPostsOnly?: boolean;
  sortBy?: "new" | "top"; // extension: support multiple ranking modes
};

export default function FeedList({
  shouldNavigateToComments = false,
  fetchUsersPostsOnly = false,
  sortBy = "new",
}: FeedListProps) {
  const [posts, setPosts] = useState<PostSelect[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const session = useSession();

  useEffect(() => {
    if (!session) return;

    fetchPosts();


    const channel = db
      .channel(`posts-updates-${sortBy}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "raw_posts" },
        () => fetchPosts()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "likes" },
        () => fetchPosts()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "comments" },
        () => fetchPosts()
      )
      .subscribe();

    return () => {
      db.removeChannel(channel);
    };
  }, [session, sortBy]);

  const fetchPosts = async () => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      if (!session) {
        setIsLoading(false);
        throw new Error(
          "Session not found. You must be signed in to view posts"
        );
      }

      let query = db.from("posts").select("*");

      if (sortBy === "top") {
        // Top feed sorts by like count first
        query = query
          .order("like_count", { ascending: false })
          .order("timestamp", { ascending: false });
      } else {
        // default feed is chronological
        query = query.order("timestamp", { ascending: false });
      }

      if (fetchUsersPostsOnly) {
        query = query.eq("user_id", session.user.id);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      setPosts(data ?? []);
    } catch (error) {
      console.error("Error fetching posts:", error);
      Alert.alert("Error fetching posts");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  if (isLoading && !isRefreshing) {
    return <Loading />;
  }

  return (
    <FlatList
      data={posts}
      keyExtractor={(item) =>
        `${item.id}-${item.like_count}-${item.current_user_vote}`
      }
      renderItem={({ item }) => (
        <Post
          shouldNavigateOnPress={shouldNavigateToComments}
          id={item.id}
          userId={item.user_id}
          username={item.username ?? "Anonymous"}
          timestamp={timeAgo(item.timestamp)}
          text={item.text}
          currentLikeCount={item.like_count}
          currentUserVote={item.current_user_vote}
          commentCount={item.comment_count}
        />
      )}
      contentContainerStyle={styles.posts}
      style={styles.postsContainer}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={() => {
            setIsRefreshing(true);
            fetchPosts();
          }}
          tintColor={Theme.colors.textPrimary} // only applies to iOS
        />
      }
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: Theme.colors.backgroundPrimary,
  },
  postsContainer: {
    width: "100%",
  },
  posts: {
    gap: 8,
  },
});
