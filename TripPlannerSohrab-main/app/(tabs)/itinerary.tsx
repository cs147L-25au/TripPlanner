import React, { useState, useEffect, useCallback } from "react";
import {
    View,
    Text,
    StyleSheet,
    SectionList,
    TouchableOpacity,
    Modal,
    TextInput,
    ScrollView,
    Alert,
    Platform,
    ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { supabase, isSupabaseConfigured } from "../../lib/supabase";
import { ItineraryItem, ItineraryItemInput, Trip, TripMember } from "../../types/database";

// Warm, inviting color scheme (matching existing app)
const colors = {
    primary: "#E67E5A",
    secondary: "#D4A574",
    accent: "#5B9A8B",
    background: "#FFF8F5",
    surface: "#FFFFFF",
    cardBg: "#FFFBF8",
    text: "#3D2F2A",
    textLight: "#8B6F5E",
    textMuted: "#A68B7A",
    border: "#E8D5C8",
    borderLight: "#F0E6DD",
    flight: "#5B9A8B",
    lodging: "#E67E5A",
    activity: "#D4A574",
    success: "#6B9B7A",
    error: "#D87A7A",
};

interface GroupedItem {
    title: string;
    data: ItineraryItem[];
}

export default function ItineraryScreen() {
    const [currentUser] = useState<string>("Claudia"); // TODO: Get from auth
    const [selectedTrip, setSelectedTrip] = useState<string | null>(null);
    const [trips, setTrips] = useState<Trip[]>([]);
    const [tripMembers, setTripMembers] = useState<TripMember[]>([]);
    const [itineraryItems, setItineraryItems] = useState<ItineraryItem[]>([]);
    const [groupedItems, setGroupedItems] = useState<GroupedItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showTripSelector, setShowTripSelector] = useState(false);
    const [showCreateTripModal, setShowCreateTripModal] = useState(false);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [editingItem, setEditingItem] = useState<ItineraryItem | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        type: "activity" as "flight" | "lodging" | "activity",
        title: "",
        date: "",
        time: "",
        location: "",
        notes: "",
        bookedBy: currentUser,
    });

    // Trip creation form state
    const [tripFormData, setTripFormData] = useState({
        name: "",
        startDate: "",
        endDate: "",
    });

    // Invite member form state
    const [inviteFormData, setInviteFormData] = useState({
        userName: "",
        userEmail: "",
    });

    // Fetch trips
    const fetchTrips = useCallback(async () => {
        setLoading(true);

        if (!isSupabaseConfigured()) {
            setLoading(false);
            // Don't show alert immediately - let user see the empty state
            console.warn("Supabase not configured");
            return;
        }

        try {
            const { data, error } = await supabase
                .from("trips")
                .select("*")
                .order("start_date", { ascending: true });

            if (error) throw error;
            if (data) {
                setTrips(data);
                if (data.length > 0 && !selectedTrip) {
                    setSelectedTrip(data[0].id);
                }
            }
        } catch (error: any) {
            console.error("Error fetching trips:", error);
            const errorMessage = error?.message || "Unknown error";

            // Check if it's an HTML response (configuration error)
            if (errorMessage.includes("<!DOCTYPE") || errorMessage.includes("<html")) {
                Alert.alert(
                    "Configuration Error",
                    "Supabase URL or API key is incorrect. Please check your .env file and restart the app."
                );
            } else {
                Alert.alert("Error", `Failed to load trips: ${errorMessage}`);
            }
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch trip members
    const fetchTripMembers = useCallback(async (tripId: string) => {
        if (!isSupabaseConfigured()) {
            return;
        }

        try {
            const { data, error } = await supabase
                .from("trip_members")
                .select("*")
                .eq("trip_id", tripId);

            if (error) throw error;
            if (data) {
                console.log("Fetched trip members:", data);
                setTripMembers(data);
            } else {
                console.log("No trip members found for trip:", tripId);
                setTripMembers([]);
            }
        } catch (error: any) {
            console.error("Error fetching trip members:", error);
            setTripMembers([]);
        }
    }, []);

    // Fetch itinerary items
    const fetchItineraryItems = useCallback(async (tripId: string) => {
        if (!isSupabaseConfigured()) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const { data, error } = await supabase
                .from("itinerary_items")
                .select("*")
                .eq("trip_id", tripId)
                .order("date", { ascending: true })
                .order("time", { ascending: true });

            if (error) throw error;
            if (data) {
                setItineraryItems(data);
                groupItemsByDate(data);
            }
        } catch (error: any) {
            console.error("Error fetching itinerary items:", error);
            const errorMessage = error?.message || "Unknown error";

            if (errorMessage.includes("<!DOCTYPE") || errorMessage.includes("<html")) {
                Alert.alert(
                    "Configuration Error",
                    "Supabase URL or API key is incorrect. Please check your .env file."
                );
            } else {
                Alert.alert("Error", `Failed to load itinerary: ${errorMessage}`);
            }
        } finally {
            setLoading(false);
        }
    }, []);

    // Group items by date
    const groupItemsByDate = (items: ItineraryItem[]) => {
        const grouped: { [key: string]: ItineraryItem[] } = {};

        items.forEach((item) => {
            const dateKey = item.date;
            if (!grouped[dateKey]) {
                grouped[dateKey] = [];
            }
            grouped[dateKey].push(item);
        });

        const sections: GroupedItem[] = Object.keys(grouped)
            .sort()
            .map((date) => ({
                title: formatDateHeader(date),
                data: grouped[date],
            }));

        setGroupedItems(sections);
    };

    // Format date for section header
    const formatDateHeader = (dateString: string): string => {
        const date = new Date(dateString);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const itemDate = new Date(date);
        itemDate.setHours(0, 0, 0, 0);

        const diffTime = itemDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        const options: Intl.DateTimeFormatOptions = {
            weekday: "long",
            month: "long",
            day: "numeric",
        };

        if (diffDays === 0) return `Today, ${date.toLocaleDateString("en-US", options)}`;
        if (diffDays === 1) return `Tomorrow, ${date.toLocaleDateString("en-US", options)}`;
        if (diffDays === -1) return `Yesterday, ${date.toLocaleDateString("en-US", options)}`;
        if (diffDays > 1 && diffDays <= 7) {
            return `${date.toLocaleDateString("en-US", { weekday: "long" })}, ${date.toLocaleDateString("en-US", { month: "long", day: "numeric" })}`;
        }

        return date.toLocaleDateString("en-US", options);
    };

    // Format time for display
    const formatTime = (time: string): string => {
        if (!time) return "";
        const [hours, minutes] = time.split(":");
        const hour = parseInt(hours, 10);
        const ampm = hour >= 12 ? "PM" : "AM";
        const displayHour = hour % 12 || 12;
        return `${displayHour}:${minutes} ${ampm}`;
    };

    // Get type color
    const getTypeColor = (type: string) => {
        switch (type) {
            case "flight":
                return colors.flight;
            case "lodging":
                return colors.lodging;
            case "activity":
                return colors.activity;
            default:
                return colors.textLight;
        }
    };

    // Get type icon
    const getTypeIcon = (type: string) => {
        switch (type) {
            case "flight":
                return "airplane";
            case "lodging":
                return "bed";
            case "activity":
                return "walk";
            default:
                return "ellipse";
        }
    };

    // Load data when trip changes
    useEffect(() => {
        if (selectedTrip) {
            fetchItineraryItems(selectedTrip);
            fetchTripMembers(selectedTrip);
        }
    }, [selectedTrip]);

    // Initial load
    useEffect(() => {
        fetchTrips();
    }, []);

    // Reset form
    const resetForm = () => {
        setFormData({
            type: "activity",
            title: "",
            date: "",
            time: "",
            location: "",
            notes: "",
            bookedBy: currentUser,
        });
        setEditingItem(null);
    };

    // Reset trip form
    const resetTripForm = () => {
        setTripFormData({
            name: "",
            startDate: "",
            endDate: "",
        });
    };

    // Reset invite form
    const resetInviteForm = () => {
        setInviteFormData({
            userName: "",
            userEmail: "",
        });
    };

    // Invite member to trip
    const inviteMember = async () => {
        if (!selectedTrip) {
            Alert.alert("Error", "Please select a trip first");
            return;
        }

        if (!inviteFormData.userName.trim()) {
            Alert.alert("Error", "Please enter a name");
            return;
        }

        try {
            // Generate a simple user_id from the name/email
            const userId = inviteFormData.userEmail.trim()
                ? inviteFormData.userEmail.toLowerCase().replace(/[^a-z0-9]/g, "_")
                : inviteFormData.userName.toLowerCase().replace(/\s+/g, "_") + "_" + Date.now();

            // Check if member already exists
            const { data: existingMembers } = await supabase
                .from("trip_members")
                .select("*")
                .eq("trip_id", selectedTrip)
                .eq("user_id", userId);

            if (existingMembers && existingMembers.length > 0) {
                Alert.alert("Error", "This person is already a member of this trip");
                return;
            }

            // Add member
            const { error } = await supabase.from("trip_members").insert([
                {
                    trip_id: selectedTrip,
                    user_id: userId,
                    user_name: inviteFormData.userName.trim(),
                    role: "member",
                },
            ]);

            if (error) throw error;

            // Refresh trip members
            await fetchTripMembers(selectedTrip);

            // Close modal and reset form
            setShowInviteModal(false);
            resetInviteForm();

            Alert.alert("Success", `${inviteFormData.userName.trim()} has been added to the trip!`);
        } catch (error: any) {
            console.error("Error inviting member:", error);
            Alert.alert("Error", error.message || "Failed to invite member");
        }
    };

    // Remove member from trip
    const removeMember = (memberId: string, memberName: string) => {
        if (!selectedTrip) return;

        Alert.alert(
            "Remove Member",
            `Are you sure you want to remove ${memberName} from this trip?`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Remove",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            const { error } = await supabase
                                .from("trip_members")
                                .delete()
                                .eq("id", memberId);

                            if (error) throw error;

                            // Refresh trip members
                            await fetchTripMembers(selectedTrip);

                            Alert.alert("Success", `${memberName} has been removed from the trip`);
                        } catch (error: any) {
                            console.error("Error removing member:", error);
                            Alert.alert("Error", error.message || "Failed to remove member");
                        }
                    },
                },
            ]
        );
    };

    // Create trip
    const createTrip = async () => {
        if (!isSupabaseConfigured()) {
            Alert.alert("Error", "Supabase is not configured. Please set up your .env file.");
            return;
        }

        if (!tripFormData.name.trim() || !tripFormData.startDate || !tripFormData.endDate) {
            Alert.alert("Error", "Please fill in all fields");
            return;
        }

        // Validate dates
        const startDate = new Date(tripFormData.startDate);
        const endDate = new Date(tripFormData.endDate);

        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            Alert.alert("Error", "Please enter valid dates");
            return;
        }

        if (endDate < startDate) {
            Alert.alert("Error", "End date must be after start date");
            return;
        }

        try {
            // Create the trip
            const { data: tripData, error: tripError } = await supabase
                .from("trips")
                .insert([
                    {
                        name: tripFormData.name.trim(),
                        start_date: tripFormData.startDate,
                        end_date: tripFormData.endDate,
                    },
                ])
                .select()
                .single();

            if (tripError) throw tripError;

            if (tripData) {
                // Add current user as owner
                const { error: memberError } = await supabase
                    .from("trip_members")
                    .insert([
                        {
                            trip_id: tripData.id,
                            user_id: currentUser.toLowerCase().replace(/\s+/g, "_"), // Simple user ID generation
                            user_name: currentUser,
                            role: "owner",
                        },
                    ]);

                if (memberError) {
                    console.error("Error adding trip member:", memberError);
                    // Trip was created but member wasn't - still show success
                }

                // Refresh trips list
                await fetchTrips();

                // Select the newly created trip
                setSelectedTrip(tripData.id);

                // Close modal and reset form
                setShowCreateTripModal(false);
                resetTripForm();

                Alert.alert("Success", `Trip "${tripData.name}" created successfully!`);
            }
        } catch (error: any) {
            console.error("Error creating trip:", error);
            Alert.alert("Error", error.message || "Failed to create trip");
        }
    };

    // Open add modal
    const openAddModal = () => {
        resetForm();
        setShowAddModal(true);
    };

    // Open edit modal
    const openEditModal = (item: ItineraryItem) => {
        setFormData({
            type: item.type,
            title: item.title,
            date: item.date,
            time: item.time,
            location: item.location,
            notes: item.notes || "",
            bookedBy: item.booked_by,
        });
        setEditingItem(item);
        setShowAddModal(true);
    };

    // Save item
    const saveItem = async () => {
        if (!selectedTrip) {
            Alert.alert("Error", "Please select a trip first");
            return;
        }

        if (!formData.title.trim() || !formData.date || !formData.time) {
            Alert.alert("Error", "Please fill in all required fields");
            return;
        }

        try {
            if (editingItem) {
                // Update existing item
                const { error } = await supabase
                    .from("itinerary_items")
                    .update({
                        type: formData.type,
                        title: formData.title.trim(),
                        date: formData.date,
                        time: formData.time,
                        location: formData.location.trim(),
                        notes: formData.notes.trim() || null,
                        booked_by: formData.bookedBy,
                        updated_at: new Date().toISOString(),
                    })
                    .eq("id", editingItem.id);

                if (error) throw error;
            } else {
                // Create new item
                const newItem: ItineraryItemInput = {
                    trip_id: selectedTrip,
                    type: formData.type,
                    title: formData.title.trim(),
                    date: formData.date,
                    time: formData.time,
                    location: formData.location.trim(),
                    notes: formData.notes.trim() || null,
                    booked_by: formData.bookedBy,
                };

                const { error } = await supabase
                    .from("itinerary_items")
                    .insert([newItem]);

                if (error) throw error;
            }

            setShowAddModal(false);
            resetForm();
            if (selectedTrip) {
                fetchItineraryItems(selectedTrip);
            }
        } catch (error: any) {
            console.error("Error saving item:", error);
            Alert.alert("Error", error.message || "Failed to save item");
        }
    };

    // Delete item
    const deleteItem = (item: ItineraryItem) => {
        Alert.alert(
            "Delete Item",
            `Are you sure you want to delete "${item.title}"?`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            const { error } = await supabase
                                .from("itinerary_items")
                                .delete()
                                .eq("id", item.id);

                            if (error) throw error;
                            if (selectedTrip) {
                                fetchItineraryItems(selectedTrip);
                            }
                        } catch (error: any) {
                            console.error("Error deleting item:", error);
                            Alert.alert("Error", error.message || "Failed to delete item");
                        }
                    },
                },
            ]
        );
    };

    // Render section header
    const renderSectionHeader = ({ section }: { section: GroupedItem }) => (
        <View style={styles.sectionHeader}>
            <Text style={styles.sectionHeaderText}>{section.title}</Text>
        </View>
    );

    // Render item
    const renderItem = ({ item }: { item: ItineraryItem }) => {
        const typeColor = getTypeColor(item.type);
        const typeIcon = getTypeIcon(item.type);

        return (
            <TouchableOpacity
                style={[styles.itemCard, { borderLeftColor: typeColor }]}
                onPress={() => openEditModal(item)}
            >
                <View style={styles.itemContent}>
                    <View style={[styles.typeIndicator, { backgroundColor: typeColor }]}>
                        <Ionicons name={typeIcon as any} size={16} color={colors.surface} />
                    </View>
                    <View style={styles.itemDetails}>
                        <View style={styles.itemHeader}>
                            <Text style={styles.itemTitle}>{item.title}</Text>
                            <TouchableOpacity
                                style={styles.deleteButton}
                                onPress={() => deleteItem(item)}
                            >
                                <Ionicons name="close" size={18} color={colors.textMuted} />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.itemMeta}>
                            <View style={styles.metaRow}>
                                <Ionicons name="time-outline" size={14} color={colors.textLight} />
                                <Text style={styles.metaText}>{formatTime(item.time)}</Text>
                            </View>
                            {item.location && (
                                <View style={styles.metaRow}>
                                    <Ionicons name="location-outline" size={14} color={colors.textLight} />
                                    <Text style={styles.metaText}>{item.location}</Text>
                                </View>
                            )}
                            <View style={styles.metaRow}>
                                <Ionicons name="person-outline" size={14} color={colors.textLight} />
                                <Text style={styles.metaText}>
                                    Booked by {item.booked_by === currentUser ? "You" : item.booked_by}
                                </Text>
                            </View>
                        </View>
                        {item.notes && (
                            <View style={styles.notesContainer}>
                                <Text style={styles.notesText}>{item.notes}</Text>
                            </View>
                        )}
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    const selectedTripData = trips.find((t) => t.id === selectedTrip);

    return (
        <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerContent}>
                    <Text style={styles.headerTitle}>Itinerary</Text>
                    <View style={styles.headerRight}>
                        <TouchableOpacity
                            style={styles.tripSelector}
                            onPress={() => setShowTripSelector(true)}
                        >
                            <Text style={styles.tripSelectorText} numberOfLines={1}>
                                {selectedTripData?.name || "Select Trip"}
                            </Text>
                            <Ionicons name="chevron-down" size={16} color={colors.text} />
                        </TouchableOpacity>
                        {isSupabaseConfigured() && (
                            <TouchableOpacity
                                style={styles.addTripButton}
                                onPress={() => setShowCreateTripModal(true)}
                            >
                                <Ionicons name="add" size={20} color={colors.primary} />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
                {/* Trip Members Bar */}
                {selectedTrip && isSupabaseConfigured() && (
                    <View style={styles.membersBar}>
                        {tripMembers.length > 0 ? (
                            <>
                                <View style={styles.membersList}>
                                    {tripMembers.slice(0, 5).map((member) => (
                                        <View key={member.id} style={styles.memberChip}>
                                            <Text style={styles.memberChipText}>
                                                {member.user_name === currentUser
                                                    ? "You"
                                                    : member.user_name}
                                            </Text>
                                            {member.role === "owner" && (
                                                <Ionicons
                                                    name="star"
                                                    size={12}
                                                    color={colors.primary}
                                                    style={styles.ownerIcon}
                                                />
                                            )}
                                        </View>
                                    ))}
                                    {tripMembers.length > 5 && (
                                        <Text style={styles.moreMembersText}>
                                            +{tripMembers.length - 5} more
                                        </Text>
                                    )}
                                </View>
                                <TouchableOpacity
                                    style={styles.inviteButton}
                                    onPress={() => setShowInviteModal(true)}
                                >
                                    <Ionicons name="person-add" size={16} color={colors.primary} />
                                    <Text style={styles.inviteButtonText}>Invite</Text>
                                </TouchableOpacity>
                            </>
                        ) : (
                            <TouchableOpacity
                                style={styles.inviteButtonFull}
                                onPress={() => setShowInviteModal(true)}
                            >
                                <Ionicons name="person-add" size={16} color={colors.primary} />
                                <Text style={styles.inviteButtonText}>Invite Members</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                )}
            </View>

            {/* Content */}
            {!selectedTrip && !loading ? (
                <View style={styles.emptyState}>
                    <Ionicons name="calendar-outline" size={64} color={colors.textLight} />
                    <Text style={styles.emptyStateText}>No trips available</Text>
                    <Text style={styles.emptyStateSubtext}>
                        {!isSupabaseConfigured()
                            ? "Please configure Supabase in your .env file to load trips"
                            : trips.length === 0
                                ? "Create your first trip to start planning your itinerary"
                                : "Select a trip from the dropdown above"}
                    </Text>
                    {isSupabaseConfigured() && (
                        <TouchableOpacity
                            style={styles.createTripButton}
                            onPress={() => setShowCreateTripModal(true)}
                        >
                            <Ionicons name="add-circle" size={20} color={colors.surface} />
                            <Text style={styles.createTripButtonText}>Create Trip</Text>
                        </TouchableOpacity>
                    )}
                </View>
            ) : loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : groupedItems.length === 0 ? (
                <View style={styles.emptyState}>
                    <Ionicons name="calendar-outline" size={64} color={colors.textLight} />
                    <Text style={styles.emptyStateText}>No itinerary items yet</Text>
                    <Text style={styles.emptyStateSubtext}>
                        Tap the + button to add flights, lodging, or activities
                    </Text>
                </View>
            ) : (
                <SectionList
                    sections={groupedItems}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    renderSectionHeader={renderSectionHeader}
                    contentContainerStyle={styles.listContent}
                    stickySectionHeadersEnabled={false}
                />
            )}

            {/* Add Button */}
            {selectedTrip && (
                <TouchableOpacity style={styles.fab} onPress={openAddModal}>
                    <Ionicons name="add" size={28} color={colors.surface} />
                </TouchableOpacity>
            )}

            {/* Trip Selector Modal */}
            <Modal
                visible={showTripSelector}
                transparent
                animationType="fade"
                onRequestClose={() => setShowTripSelector(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setShowTripSelector(false)}
                >
                    <View style={styles.tripSelectorModal}>
                        <View style={styles.tripSelectorModalHeader}>
                            <Text style={styles.modalTitle}>Select Trip</Text>
                            <TouchableOpacity
                                style={styles.createTripButtonSmall}
                                onPress={() => {
                                    setShowTripSelector(false);
                                    setShowCreateTripModal(true);
                                }}
                            >
                                <Ionicons name="add" size={18} color={colors.primary} />
                                <Text style={styles.createTripButtonSmallText}>New Trip</Text>
                            </TouchableOpacity>
                        </View>
                        <ScrollView>
                            {trips.length === 0 ? (
                                <View style={styles.emptyTripList}>
                                    <Text style={styles.emptyTripListText}>No trips yet</Text>
                                    <Text style={styles.emptyTripListSubtext}>
                                        Tap "New Trip" above to create one
                                    </Text>
                                </View>
                            ) : (
                                trips.map((trip) => (
                                    <TouchableOpacity
                                        key={trip.id}
                                        style={[
                                            styles.tripOption,
                                            selectedTrip === trip.id && styles.tripOptionSelected,
                                        ]}
                                        onPress={() => {
                                            setSelectedTrip(trip.id);
                                            setShowTripSelector(false);
                                        }}
                                    >
                                        <View style={styles.tripOptionContent}>
                                            <Text
                                                style={[
                                                    styles.tripOptionText,
                                                    selectedTrip === trip.id &&
                                                    styles.tripOptionTextSelected,
                                                ]}
                                            >
                                                {trip.name}
                                            </Text>
                                            <Text style={styles.tripOptionDates}>
                                                {new Date(trip.start_date).toLocaleDateString()} -{" "}
                                                {new Date(trip.end_date).toLocaleDateString()}
                                            </Text>
                                        </View>
                                        {selectedTrip === trip.id && (
                                            <Ionicons name="checkmark" size={20} color={colors.primary} />
                                        )}
                                    </TouchableOpacity>
                                ))
                            )}
                        </ScrollView>
                    </View>
                </TouchableOpacity>
            </Modal>

            {/* Add/Edit Item Modal */}
            <Modal
                visible={showAddModal}
                transparent
                animationType="slide"
                onRequestClose={() => {
                    setShowAddModal(false);
                    resetForm();
                }}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>
                                {editingItem ? "Edit Item" : "Add Item"}
                            </Text>
                            <TouchableOpacity
                                onPress={() => {
                                    setShowAddModal(false);
                                    resetForm();
                                }}
                            >
                                <Ionicons name="close" size={24} color={colors.text} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
                            {/* Type Selector */}
                            <Text style={styles.modalLabel}>Type *</Text>
                            <View style={styles.typeSelector}>
                                {(["flight", "lodging", "activity"] as const).map((type) => (
                                    <TouchableOpacity
                                        key={type}
                                        style={[
                                            styles.typeOption,
                                            formData.type === type && {
                                                backgroundColor: getTypeColor(type) + "20",
                                                borderColor: getTypeColor(type),
                                            },
                                        ]}
                                        onPress={() => setFormData({ ...formData, type })}
                                    >
                                        <Ionicons
                                            name={getTypeIcon(type) as any}
                                            size={20}
                                            color={formData.type === type ? getTypeColor(type) : colors.textLight}
                                        />
                                        <Text
                                            style={[
                                                styles.typeOptionText,
                                                formData.type === type && {
                                                    color: getTypeColor(type),
                                                    fontWeight: "600",
                                                },
                                            ]}
                                        >
                                            {type.charAt(0).toUpperCase() + type.slice(1)}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            {/* Title */}
                            <Text style={styles.modalLabel}>Title *</Text>
                            <TextInput
                                style={styles.modalInput}
                                placeholder="e.g., Flight to Paris"
                                value={formData.title}
                                onChangeText={(text) => setFormData({ ...formData, title: text })}
                                placeholderTextColor={colors.textLight}
                            />

                            {/* Date */}
                            <Text style={styles.modalLabel}>Date *</Text>
                            <TextInput
                                style={styles.modalInput}
                                placeholder="YYYY-MM-DD"
                                value={formData.date}
                                onChangeText={(text) => setFormData({ ...formData, date: text })}
                                placeholderTextColor={colors.textLight}
                            />

                            {/* Time */}
                            <Text style={styles.modalLabel}>Time *</Text>
                            <TextInput
                                style={styles.modalInput}
                                placeholder="HH:mm (e.g., 14:30)"
                                value={formData.time}
                                onChangeText={(text) => setFormData({ ...formData, time: text })}
                                placeholderTextColor={colors.textLight}
                            />

                            {/* Location */}
                            <Text style={styles.modalLabel}>Location</Text>
                            <TextInput
                                style={styles.modalInput}
                                placeholder="e.g., JFK Airport"
                                value={formData.location}
                                onChangeText={(text) => setFormData({ ...formData, location: text })}
                                placeholderTextColor={colors.textLight}
                            />

                            {/* Notes */}
                            <Text style={styles.modalLabel}>Notes</Text>
                            <TextInput
                                style={[styles.modalInput, styles.modalTextArea]}
                                placeholder="Additional details..."
                                value={formData.notes}
                                onChangeText={(text) => setFormData({ ...formData, notes: text })}
                                placeholderTextColor={colors.textLight}
                                multiline
                                numberOfLines={4}
                            />

                            {/* Booked By */}
                            <Text style={styles.modalLabel}>Booked By</Text>
                            <View style={styles.pickerContainer}>
                                {tripMembers.map((member) => (
                                    <TouchableOpacity
                                        key={member.id}
                                        style={[
                                            styles.pickerOption,
                                            formData.bookedBy === member.user_name &&
                                            styles.pickerOptionSelected,
                                        ]}
                                        onPress={() =>
                                            setFormData({ ...formData, bookedBy: member.user_name })
                                        }
                                    >
                                        <Text
                                            style={[
                                                styles.pickerOptionText,
                                                formData.bookedBy === member.user_name &&
                                                styles.pickerOptionTextSelected,
                                            ]}
                                        >
                                            {member.user_name === currentUser ? "You" : member.user_name}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            {/* Save Button */}
                            <TouchableOpacity style={styles.saveButton} onPress={saveItem}>
                                <Text style={styles.saveButtonText}>
                                    {editingItem ? "Save Changes" : "Add Item"}
                                </Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            {/* Create Trip Modal */}
            <Modal
                visible={showCreateTripModal}
                transparent
                animationType="slide"
                onRequestClose={() => {
                    setShowCreateTripModal(false);
                    resetTripForm();
                }}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Create New Trip</Text>
                            <TouchableOpacity
                                onPress={() => {
                                    setShowCreateTripModal(false);
                                    resetTripForm();
                                }}
                            >
                                <Ionicons name="close" size={24} color={colors.text} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
                            {/* Trip Name */}
                            <Text style={styles.modalLabel}>Trip Name *</Text>
                            <TextInput
                                style={styles.modalInput}
                                placeholder="e.g., Summer Vacation"
                                value={tripFormData.name}
                                onChangeText={(text) =>
                                    setTripFormData({ ...tripFormData, name: text })
                                }
                                placeholderTextColor={colors.textLight}
                            />

                            {/* Start Date */}
                            <Text style={styles.modalLabel}>Start Date *</Text>
                            <TextInput
                                style={styles.modalInput}
                                placeholder="YYYY-MM-DD (e.g., 2025-06-15)"
                                value={tripFormData.startDate}
                                onChangeText={(text) =>
                                    setTripFormData({ ...tripFormData, startDate: text })
                                }
                                placeholderTextColor={colors.textLight}
                            />
                            <Text style={styles.modalHint}>
                                Enter date in YYYY-MM-DD format
                            </Text>

                            {/* End Date */}
                            <Text style={styles.modalLabel}>End Date *</Text>
                            <TextInput
                                style={styles.modalInput}
                                placeholder="YYYY-MM-DD (e.g., 2025-06-25)"
                                value={tripFormData.endDate}
                                onChangeText={(text) =>
                                    setTripFormData({ ...tripFormData, endDate: text })
                                }
                                placeholderTextColor={colors.textLight}
                            />
                            <Text style={styles.modalHint}>
                                Enter date in YYYY-MM-DD format
                            </Text>

                            {/* Create Button */}
                            <TouchableOpacity style={styles.saveButton} onPress={createTrip}>
                                <Text style={styles.saveButtonText}>Create Trip</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            {/* Invite Member Modal */}
            <Modal
                visible={showInviteModal}
                transparent
                animationType="slide"
                onRequestClose={() => {
                    setShowInviteModal(false);
                    resetInviteForm();
                }}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Invite Member</Text>
                            <TouchableOpacity
                                onPress={() => {
                                    setShowInviteModal(false);
                                    resetInviteForm();
                                }}
                            >
                                <Ionicons name="close" size={24} color={colors.text} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
                            {/* Current Members */}
                            {tripMembers.length > 0 && (
                                <>
                                    <Text style={styles.modalLabel}>Current Members</Text>
                                    <View style={styles.currentMembersList}>
                                        {tripMembers.map((member) => (
                                            <View key={member.id} style={styles.currentMemberItem}>
                                                <View style={styles.currentMemberInfo}>
                                                    <Text style={styles.currentMemberName}>
                                                        {member.user_name === currentUser
                                                            ? "You"
                                                            : member.user_name}
                                                    </Text>
                                                    {member.role === "owner" && (
                                                        <View style={styles.ownerBadge}>
                                                            <Ionicons
                                                                name="star"
                                                                size={12}
                                                                color={colors.primary}
                                                            />
                                                            <Text style={styles.ownerBadgeText}>
                                                                Owner
                                                            </Text>
                                                        </View>
                                                    )}
                                                    {member.role === "member" && (
                                                        <Text style={styles.memberRoleText}>
                                                            Member
                                                        </Text>
                                                    )}
                                                </View>
                                                {member.user_name !== currentUser &&
                                                    tripMembers.find(
                                                        (m) => m.user_name === currentUser && m.role === "owner"
                                                    ) && (
                                                        <TouchableOpacity
                                                            style={styles.removeMemberButton}
                                                            onPress={() =>
                                                                removeMember(member.id, member.user_name)
                                                            }
                                                        >
                                                            <Ionicons
                                                                name="close-circle"
                                                                size={20}
                                                                color={colors.error}
                                                            />
                                                        </TouchableOpacity>
                                                    )}
                                            </View>
                                        ))}
                                    </View>
                                </>
                            )}

                            {/* Add New Member */}
                            <Text style={styles.modalLabel}>Add New Member</Text>

                            {/* Name */}
                            <Text style={styles.modalSubLabel}>Name *</Text>
                            <TextInput
                                style={styles.modalInput}
                                placeholder="e.g., John Doe"
                                value={inviteFormData.userName}
                                onChangeText={(text) =>
                                    setInviteFormData({ ...inviteFormData, userName: text })
                                }
                                placeholderTextColor={colors.textLight}
                            />

                            {/* Email (Optional) */}
                            <Text style={styles.modalSubLabel}>Email (Optional)</Text>
                            <TextInput
                                style={styles.modalInput}
                                placeholder="e.g., john@example.com"
                                value={inviteFormData.userEmail}
                                onChangeText={(text) =>
                                    setInviteFormData({ ...inviteFormData, userEmail: text })
                                }
                                placeholderTextColor={colors.textLight}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                            <Text style={styles.modalHint}>
                                Email is optional but helps identify members
                            </Text>

                            {/* Invite Button */}
                            <TouchableOpacity style={styles.saveButton} onPress={inviteMember}>
                                <Text style={styles.saveButtonText}>Add Member</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        backgroundColor: colors.surface,
        paddingHorizontal: 20,
        paddingTop: 8,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: colors.borderLight,
        zIndex: 10,
    },
    headerContent: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    headerRight: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    addTripButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: colors.primary + "15",
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1,
        borderColor: colors.primary + "40",
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: "700",
        color: colors.text,
    },
    tripSelector: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.cardBg,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.border,
        maxWidth: 200,
        minHeight: 36,
    },
    tripSelectorText: {
        fontSize: 14,
        fontWeight: "600",
        color: colors.text,
        marginRight: 6,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    emptyState: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 40,
    },
    emptyStateText: {
        fontSize: 18,
        fontWeight: "600",
        color: colors.text,
        marginTop: 16,
        marginBottom: 8,
    },
    emptyStateSubtext: {
        fontSize: 14,
        color: colors.textLight,
        textAlign: "center",
    },
    listContent: {
        padding: 16,
        paddingBottom: 100,
    },
    sectionHeader: {
        backgroundColor: colors.background,
        paddingVertical: 12,
        paddingHorizontal: 4,
        marginTop: 8,
        marginBottom: 4,
    },
    sectionHeaderText: {
        fontSize: 16,
        fontWeight: "700",
        color: colors.text,
        letterSpacing: 0.3,
    },
    itemCard: {
        backgroundColor: colors.surface,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderLeftWidth: 4,
        borderWidth: 1,
        borderColor: colors.border,
        ...Platform.select({
            ios: {
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 3,
            },
            android: {
                elevation: 2,
            },
        }),
    },
    itemContent: {
        flexDirection: "row",
    },
    typeIndicator: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
    },
    itemDetails: {
        flex: 1,
    },
    itemHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 8,
    },
    itemTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: colors.text,
        flex: 1,
        marginRight: 8,
    },
    deleteButton: {
        padding: 4,
    },
    itemMeta: {
        marginBottom: 8,
    },
    metaRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 4,
    },
    metaText: {
        fontSize: 13,
        color: colors.textLight,
        marginLeft: 6,
    },
    notesContainer: {
        marginTop: 8,
        padding: 10,
        backgroundColor: colors.cardBg,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: colors.borderLight,
    },
    notesText: {
        fontSize: 13,
        color: colors.text,
        lineHeight: 18,
    },
    fab: {
        position: "absolute",
        right: 20,
        bottom: 90,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: colors.primary,
        justifyContent: "center",
        alignItems: "center",
        ...Platform.select({
            ios: {
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 8,
            },
            android: {
                elevation: 6,
            },
        }),
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "flex-end",
    },
    modalContent: {
        backgroundColor: colors.surface,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: "90%",
        paddingBottom: 40,
    },
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: colors.text,
    },
    modalScroll: {
        padding: 20,
    },
    modalLabel: {
        fontSize: 13,
        fontWeight: "600",
        color: colors.text,
        marginBottom: 8,
        marginTop: 16,
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },
    typeSelector: {
        flexDirection: "row",
        gap: 8,
        marginBottom: 8,
    },
    typeOption: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: colors.border,
        backgroundColor: colors.background,
    },
    typeOptionText: {
        fontSize: 14,
        fontWeight: "500",
        color: colors.text,
        marginLeft: 6,
    },
    modalInput: {
        backgroundColor: colors.background,
        borderRadius: 10,
        padding: 14,
        fontSize: 15,
        color: colors.text,
        borderWidth: 1,
        borderColor: colors.border,
        marginBottom: 8,
    },
    modalTextArea: {
        minHeight: 100,
        textAlignVertical: "top",
    },
    pickerContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
        marginBottom: 8,
    },
    pickerOption: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 8,
        backgroundColor: colors.background,
        borderWidth: 1,
        borderColor: colors.border,
    },
    pickerOptionSelected: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    pickerOptionText: {
        fontSize: 14,
        fontWeight: "500",
        color: colors.textLight,
    },
    pickerOptionTextSelected: {
        color: colors.surface,
    },
    saveButton: {
        backgroundColor: colors.primary,
        borderRadius: 10,
        padding: 16,
        alignItems: "center",
        marginTop: 24,
    },
    saveButtonText: {
        color: colors.surface,
        fontSize: 16,
        fontWeight: "600",
    },
    tripSelectorModal: {
        backgroundColor: colors.surface,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: "50%",
        padding: 20,
        marginTop: "auto",
    },
    tripOption: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 16,
        paddingHorizontal: 16,
        borderRadius: 8,
        marginBottom: 8,
        backgroundColor: colors.background,
        borderWidth: 1,
        borderColor: colors.border,
    },
    tripOptionSelected: {
        backgroundColor: colors.primary + "15",
        borderColor: colors.primary,
    },
    tripOptionText: {
        fontSize: 16,
        fontWeight: "500",
        color: colors.text,
    },
    tripOptionTextSelected: {
        color: colors.primary,
        fontWeight: "600",
    },
    tripSelectorModalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
    },
    createTripButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.primary,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 10,
        marginTop: 24,
        gap: 8,
    },
    createTripButtonText: {
        color: colors.surface,
        fontSize: 16,
        fontWeight: "600",
    },
    createTripButtonSmall: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.primary + "15",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        gap: 4,
    },
    createTripButtonSmallText: {
        color: colors.primary,
        fontSize: 14,
        fontWeight: "600",
    },
    tripOptionContent: {
        flex: 1,
    },
    tripOptionDates: {
        fontSize: 12,
        color: colors.textLight,
        marginTop: 4,
    },
    emptyTripList: {
        padding: 40,
        alignItems: "center",
    },
    emptyTripListText: {
        fontSize: 16,
        fontWeight: "600",
        color: colors.text,
        marginBottom: 8,
    },
    emptyTripListSubtext: {
        fontSize: 14,
        color: colors.textLight,
        textAlign: "center",
    },
    membersBar: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: colors.borderLight,
        minHeight: 40,
    },
    membersList: {
        flexDirection: "row",
        flexWrap: "wrap",
        alignItems: "center",
        flex: 1,
        gap: 6,
    },
    memberChip: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.cardBg,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.border,
        gap: 4,
    },
    memberChipText: {
        fontSize: 12,
        fontWeight: "500",
        color: colors.text,
    },
    ownerIcon: {
        marginLeft: 2,
    },
    moreMembersText: {
        fontSize: 12,
        color: colors.textLight,
        fontStyle: "italic",
    },
    inviteButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.primary + "15",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        gap: 4,
        borderWidth: 1,
        borderColor: colors.primary + "40",
    },
    inviteButtonFull: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.primary + "15",
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 8,
        gap: 6,
        flex: 1,
        borderWidth: 1,
        borderColor: colors.primary + "40",
    },
    inviteButtonText: {
        fontSize: 13,
        fontWeight: "600",
        color: colors.primary,
    },
    currentMembersList: {
        marginBottom: 16,
    },
    currentMemberItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: colors.cardBg,
        padding: 12,
        borderRadius: 8,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: colors.border,
    },
    currentMemberInfo: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    currentMemberName: {
        fontSize: 15,
        fontWeight: "600",
        color: colors.text,
    },
    ownerBadge: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.primary + "20",
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        gap: 3,
    },
    ownerBadgeText: {
        fontSize: 10,
        fontWeight: "600",
        color: colors.primary,
        textTransform: "uppercase",
    },
    memberRoleText: {
        fontSize: 12,
        color: colors.textLight,
        fontStyle: "italic",
    },
    removeMemberButton: {
        padding: 4,
    },
    modalSubLabel: {
        fontSize: 12,
        fontWeight: "600",
        color: colors.text,
        marginBottom: 6,
        marginTop: 8,
    },
});

