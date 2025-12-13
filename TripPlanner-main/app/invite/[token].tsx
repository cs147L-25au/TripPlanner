import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from 'expo-router';
import { supabase } from '../../lib/supabase';
import * as Linking from 'expo-linking';

export default function InviteAcceptScreen() {
  const { token } = useLocalSearchParams<{ token: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [invitationData, setInvitationData] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    loadInvitation();
  }, [token]);

  const loadInvitation = async () => {
    if (!token) {
      Alert.alert("Error", "Invalid invitation link");
      router.replace("/login");
      return;
    }

    try {
      const { data, error } = await supabase
        .from('trip_members')
        .select(`
          *,
          trips:trips (
            id,
            name,
            start_date,
            end_date
          ),
          inviter:profiles!trip_members_invited_by_fkey (
            email,
            full_name
          )
        `)
        .eq('invitation_token', token)
        .maybeSingle();

      if (error || !data) {
        Alert.alert("Error", "Invitation not found or expired");
        router.replace("/login");
        return;
      }

      if (data.status === 'accepted') {
        Alert.alert("Already Accepted", "This invitation has already been accepted.");
        router.replace("/login");
        return;
      }

      setInvitationData(data);
      setEmail(data.invited_email || '');
      setLoading(false);
    } catch (error) {
      console.error("Error loading invitation:", error);
      Alert.alert("Error", "Failed to load invitation");
      router.replace("/login");
    }
  };

  const handleSignUp = async () => {
    if (!email.trim() || !password.trim() || !confirmPassword.trim()) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return;
    }

    if (email.trim() !== invitationData.invited_email) {
      Alert.alert("Error", `Please use the email address you were invited with: ${invitationData.invited_email}`);
      return;
    }

    setIsSigningUp(true);
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      });

      if (authError) {
        Alert.alert("Sign Up Error", authError.message);
        setIsSigningUp(false);
        return;
      }

      if (authData.user) {
        await supabase.from('profiles').insert({
          id: authData.user.id,
          email: authData.user.email,
          full_name: '',
        });

        await acceptInvitation(authData.user.id);
      }
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to sign up");
      setIsSigningUp(false);
    }
  };

  const handleSignIn = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Error", "Please enter email and password");
      return;
    }

    if (email.trim() !== invitationData.invited_email) {
      Alert.alert("Error", `Please use the email address you were invited with: ${invitationData.invited_email}`);
      return;
    }

    setIsLoggingIn(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        Alert.alert("Sign In Error", error.message);
        setIsLoggingIn(false);
        return;
      }

      if (data.user) {
        await acceptInvitation(data.user.id);
      }
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to sign in");
      setIsLoggingIn(false);
    }
  };

  const acceptInvitation = async (userId: string) => {
    try {
      const { error: updateError } = await supabase
        .from('trip_members')
        .update({
          user_id: userId,
          status: 'accepted',
        })
        .eq('invitation_token', token);

      if (updateError) {
        console.error("Error accepting invitation:", updateError);
        Alert.alert("Error", "Failed to accept invitation");
        return;
      }

      Alert.alert(
        "Success!",
        `You've been added to "${invitationData.trips.name}"!`,
        [
          {
            text: "OK",
            onPress: () => {
              router.replace("/(tabs)");
            },
          },
        ]
      );
    } catch (error) {
      console.error("Error:", error);
      Alert.alert("Error", "Failed to accept invitation");
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#E67E5A" />
          <Text style={styles.loadingText}>Loading invitation...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!invitationData) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            <Text style={styles.title}>You're Invited!</Text>
            <Text style={styles.subtitle}>
              {invitationData.inviter?.full_name || invitationData.inviter?.email} invited you to join
            </Text>
            <View style={styles.tripCard}>
              <Text style={styles.tripName}>{invitationData.trips.name}</Text>
              {invitationData.trips.start_date && (
                <Text style={styles.tripDate}>
                  {new Date(invitationData.trips.start_date).toLocaleDateString()} - {invitationData.trips.end_date ? new Date(invitationData.trips.end_date).toLocaleDateString() : 'TBD'}
                </Text>
              )}
            </View>

            <View style={styles.form}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder={invitationData.invited_email}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                editable={false}
              />

              <Text style={styles.sectionTitle}>Sign Up</Text>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Create a password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
              />

              <Text style={styles.label}>Confirm Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Confirm your password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                autoCapitalize="none"
              />

              <TouchableOpacity
                style={[styles.button, styles.primaryButton, isSigningUp && styles.buttonDisabled]}
                onPress={handleSignUp}
                disabled={isSigningUp}
              >
                {isSigningUp ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.buttonText}>Sign Up & Join Trip</Text>
                )}
              </TouchableOpacity>

              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>OR</Text>
                <View style={styles.dividerLine} />
              </View>

              <Text style={styles.sectionTitle}>Already have an account?</Text>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
              />

              <TouchableOpacity
                style={[styles.button, styles.secondaryButton, isLoggingIn && styles.buttonDisabled]}
                onPress={handleSignIn}
                disabled={isLoggingIn}
              >
                {isLoggingIn ? (
                  <ActivityIndicator color="#E67E5A" />
                ) : (
                  <Text style={[styles.buttonText, styles.secondaryButtonText]}>Sign In & Join Trip</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8F5',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#8B6F5E',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#3D2F2A',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#8B6F5E',
    textAlign: 'center',
    marginBottom: 24,
  },
  tripCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
    borderWidth: 2,
    borderColor: '#E67E5A',
    alignItems: 'center',
  },
  tripName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#3D2F2A',
    marginBottom: 8,
  },
  tripDate: {
    fontSize: 14,
    color: '#8B6F5E',
  },
  form: {
    width: '100%',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#3D2F2A',
    marginTop: 24,
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3D2F2A',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E8D5C8',
    color: '#3D2F2A',
  },
  button: {
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  primaryButton: {
    backgroundColor: '#E67E5A',
  },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E67E5A',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: '#E67E5A',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E8D5C8',
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: '#8B6F5E',
    fontWeight: '600',
  },
});

