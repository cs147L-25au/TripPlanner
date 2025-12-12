import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Platform,
  Modal,
  Dimensions,
  KeyboardAvoidingView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DatePicker from "../../components/DatePicker";
import TaskTimer from "../../components/TaskTimer";
import AnimatedButton from "../../components/AnimatedButton";
import { supabase } from "../../lib/supabase";

interface Responsibility {
  id: string;
  task: string;
  assignedTo: string;
  trip: string;
  tripDate: string;
  completeBy: string;
  category: string;
  completed: boolean;
}

interface PackingItem {
  id: string;
  item: string;
  assignedTo: string;
  trip: string;
  bag: string;
  packed: boolean;
}

interface Payment {
  id: string;
  description: string;
  amount: string;
  from: string;
  to: string;
  trip: string;
  paid: boolean;
}

type TabType = "responsibilities" | "packing" | "payments";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// Warm, inviting color scheme
const colors = {
  // Primary warm palette
  primary: "#E67E5A", // Warm coral
  secondary: "#D4A574", // Warm sand
  accent: "#5B9A8B", // Warm teal
  tertiary: "#C97D60", // Terracotta

  // Backgrounds - warm tones
  background: "#FFF8F5", // Warm cream
  surface: "#FFFFFF", // Pure white for contrast
  cardBg: "#FFFBF8", // Very warm off-white

  // Text - warm grays
  text: "#3D2F2A", // Warm dark brown
  textLight: "#8B6F5E", // Warm medium brown
  textMuted: "#A68B7A", // Warm light brown

  // Borders - warm
  border: "#E8D5C8", // Warm beige border
  borderLight: "#F0E6DD", // Very light warm border

  // Category colors - warm and vibrant
  accommodation: "#E67E5A", // Warm coral
  transportation: "#5B9A8B", // Warm teal
  excursions: "#D4A574", // Warm sand

  // Status colors - warm
  success: "#6B9B7A", // Warm green
  warning: "#D4A574", // Warm amber
  error: "#D87A7A", // Warm red

  // Header
  headerBg: "#FFF8F5", // Warm cream
};

// Sample data for demo account
const DEMO_SAMPLE_RESPONSIBILITIES: Responsibility[] = [
  {
    id: "1",
    task: "Book accommodation",
    assignedTo: "Claudia",
    trip: "Summer Trip",
    tripDate: "06/15/2025",
    completeBy: "12/20/2024",
    category: "Accommodation",
    completed: false,
  },
  {
    id: "2",
    task: "Plan itinerary",
    assignedTo: "Sohrab",
    trip: "Summer Trip",
    tripDate: "06/15/2025",
    completeBy: "12/18/2024",
    category: "Excursions",
    completed: false,
  },
  {
    id: "3",
    task: "Reserve restaurant",
    assignedTo: "Adrian",
    trip: "Summer Trip",
    tripDate: "06/15/2025",
    completeBy: "12/15/2024",
    category: "Excursions",
    completed: true,
  },
  {
    id: "4",
    task: "Buy tickets",
    assignedTo: "Claudia",
    trip: "Winter Getaway",
    tripDate: "01/20/2025",
    completeBy: "01/10/2025",
    category: "Transportation",
    completed: false,
  },
  {
    id: "5",
    task: "Research activities",
    assignedTo: "Claudia",
    trip: "Summer Trip",
    tripDate: "06/15/2025",
    completeBy: "12/22/2024",
    category: "Excursions",
    completed: false,
  },
];

const DEMO_SAMPLE_PACKING_ITEMS: PackingItem[] = [
  {
    id: "1",
    item: "Passport",
    assignedTo: "Claudia",
    trip: "Summer Trip",
    bag: "Carry-on",
    packed: true,
  },
  {
    id: "2",
    item: "Camera",
    assignedTo: "Sohrab",
    trip: "Summer Trip",
    bag: "Carry-on",
    packed: false,
  },
  {
    id: "3",
    item: "First aid kit",
    assignedTo: "Adrian",
    trip: "Summer Trip",
    bag: "Checked",
    packed: false,
  },
  {
    id: "4",
    item: "Ski jacket",
    assignedTo: "Claudia",
    trip: "Winter Getaway",
    bag: "Checked",
    packed: false,
  },
  {
    id: "5",
    item: "Travel adapter",
    assignedTo: "Claudia",
    trip: "Summer Trip",
    bag: "Carry-on",
    packed: false,
  },
];

const DEMO_SAMPLE_PAYMENTS: Payment[] = [
  {
    id: "1",
    description: "Venmo Kevin for Airbnb",
    amount: "$150",
    from: "Claudia",
    to: "Kevin",
    trip: "Summer Trip",
    paid: false,
  },
  {
    id: "2",
    description: "Split dinner bill",
    amount: "$45",
    from: "Sohrab",
    to: "Claudia",
    trip: "Summer Trip",
    paid: true,
  },
  {
    id: "3",
    description: "Flight reimbursement",
    amount: "$320",
    from: "Adrian",
    to: "Claudia",
    trip: "Winter Getaway",
    paid: false,
  },
];

const DEMO_SAMPLE_TRIPS = ["Summer Trip", "Winter Getaway", "Beach Vacation"];

export default function CollabPlanner147() {
  const [currentUser, setCurrentUser] = useState<string>("Claudia");
  const [isDemoAccount, setIsDemoAccount] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<TabType>("responsibilities");
  const [selectedPerson, setSelectedPerson] = useState<string>("My Tasks");
  const [selectedTrip, setSelectedTrip] = useState<string>("All");
  const [selectedBag, setSelectedBag] = useState<string>("All");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");

  const [showPersonFilter, setShowPersonFilter] = useState(false);
  const [showTripFilter, setShowTripFilter] = useState(false);
  const [showBagFilter, setShowBagFilter] = useState(false);
  const [showStatusFilter, setShowStatusFilter] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showTripModal, setShowTripModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [newTripName, setNewTripName] = useState("");
  const [newTripStartDate, setNewTripStartDate] = useState("");
  const [newTripEndDate, setNewTripEndDate] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteTrip, setInviteTrip] = useState("");

  const personFilterRef = useRef<View>(null);
  const tripFilterRef = useRef<View>(null);
  const bagFilterRef = useRef<View>(null);
  const statusFilterRef = useRef<View>(null);
  const [filterPositions, setFilterPositions] = useState({
    person: { x: 0, y: 0, width: 0 },
    trip: { x: 0, y: 0, width: 0 },
    bag: { x: 0, y: 0, width: 0 },
    status: { x: 0, y: 0, width: 0 },
  });

  const [responsibilities, setResponsibilities] = useState<Responsibility[]>([]);
  const [packingItems, setPackingItems] = useState<PackingItem[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);

  const [newTask, setNewTask] = useState("");
  const [newTaskAssignee, setNewTaskAssignee] = useState("");
  const [newTaskTrip, setNewTaskTrip] = useState("");
  const [newTaskTripDate, setNewTaskTripDate] = useState("");
  const [newTaskCompleteBy, setNewTaskCompleteBy] = useState("");
  const [newTaskCategory, setNewTaskCategory] = useState("");
  const [newItem, setNewItem] = useState("");
  const [newItemAssignee, setNewItemAssignee] = useState("");
  const [newItemTrip, setNewItemTrip] = useState("");
  const [newItemBag, setNewItemBag] = useState("");
  const [newPayment, setNewPayment] = useState("");
  const [newPaymentAmount, setNewPaymentAmount] = useState("");
  const [newPaymentFrom, setNewPaymentFrom] = useState("");
  const [newPaymentTo, setNewPaymentTo] = useState("");
  const [newPaymentTrip, setNewPaymentTrip] = useState("");

  const teamMembers = ["Claudia", "Sohrab", "Adrian"];
  const [trips, setTrips] = useState<string[]>([]);
  const bags = ["Carry-on", "Checked", "Personal Item"];

  // Check if user is demo account and load data
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const isDemo = user.email === "demo@tripplanner.com";
          setIsDemoAccount(isDemo);

          if (isDemo) {
            // Use sample data for demo account
            setResponsibilities(DEMO_SAMPLE_RESPONSIBILITIES);
            setPackingItems(DEMO_SAMPLE_PACKING_ITEMS);
            setPayments(DEMO_SAMPLE_PAYMENTS);
            setTrips(DEMO_SAMPLE_TRIPS);
          } else {
            // Load from database for new accounts
            await loadTripsFromDB();
            await loadResponsibilitiesFromDB();
            await loadPackingItemsFromDB();
            await loadPaymentsFromDB();
          }
        }
      } catch (error) {
        console.error("Error loading user data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, []);

  const loadTripsFromDB = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('trips')
        .select('name')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error loading trips:", error);
        return;
      }

      setTrips(data?.map(t => t.name) || []);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const loadResponsibilitiesFromDB = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('responsibilities')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error loading responsibilities:", error);
        return;
      }

      const converted: Responsibility[] = (data || []).map((r: any) => ({
        id: r.id,
        task: r.task,
        assignedTo: r.assigned_to,
        trip: r.trip_name,
        tripDate: r.trip_date ? new Date(r.trip_date).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }).replace(/\//g, '/') : '',
        completeBy: r.complete_by ? new Date(r.complete_by).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }).replace(/\//g, '/') : '',
        category: r.category,
        completed: r.completed || false,
      }));

      setResponsibilities(converted);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const loadPackingItemsFromDB = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('packing_items')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error loading packing items:", error);
        return;
      }

      const converted: PackingItem[] = (data || []).map((p: any) => ({
        id: p.id,
        item: p.item,
        assignedTo: p.assigned_to,
        trip: p.trip_name,
        bag: p.bag,
        packed: p.packed || false,
      }));

      setPackingItems(converted);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const loadPaymentsFromDB = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error loading payments:", error);
        return;
      }

      const converted: Payment[] = (data || []).map((p: any) => ({
        id: p.id,
        description: p.description,
        amount: p.amount,
        from: p.from_person,
        to: p.to_person,
        trip: p.trip_name,
        paid: p.paid || false,
      }));

      setPayments(converted);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const categories = [
    { name: "Transportation", color: colors.transportation },
    { name: "Accommodation", color: colors.accommodation },
    { name: "Excursions", color: colors.excursions },
  ];

  const getCategoryColor = (categoryName: string) => {
    const category = categories.find((c) => c.name === categoryName);
    return category ? category.color : colors.textLight;
  };

  // Get dominant category for a trip based on tasks
  const getTripCategoryColor = (tripName: string) => {
    const tripTasks = responsibilities.filter((r) => r.trip === tripName);
    if (tripTasks.length === 0) return colors.textLight;

    // Count categories
    const categoryCounts: { [key: string]: number } = {};
    tripTasks.forEach((task) => {
      categoryCounts[task.category] = (categoryCounts[task.category] || 0) + 1;
    });

    // Get most common category
    const dominantCategory = Object.keys(categoryCounts).reduce((a, b) =>
      categoryCounts[a] > categoryCounts[b] ? a : b
    );

    return getCategoryColor(dominantCategory);
  };

  const measureFilterButton = (
    ref: React.RefObject<View | null>,
    key: "person" | "trip" | "bag" | "status"
  ) => {
    if (ref.current) {
      ref.current.measureInWindow((x, y, width, height) => {
        setFilterPositions((prev) => ({
          ...prev,
          [key]: { x, y: y + height, width },
        }));
      });
    }
  };

  const handleFilterPress = (type: "person" | "trip" | "bag" | "status") => {
    const refs = {
      person: personFilterRef,
      trip: tripFilterRef,
      bag: bagFilterRef,
      status: statusFilterRef,
    };
    measureFilterButton(refs[type], type);

    if (type === "person") setShowPersonFilter(!showPersonFilter);
    if (type === "trip") setShowTripFilter(!showTripFilter);
    if (type === "bag") setShowBagFilter(!showBagFilter);
    if (type === "status") setShowStatusFilter(!showStatusFilter);
  };

  const getFilteredResponsibilities = () => {
    let filtered = responsibilities;
    if (selectedPerson === "My Tasks") {
      filtered = filtered.filter((r) => r.assignedTo === currentUser);
    } else if (selectedPerson !== "All") {
      filtered = filtered.filter((r) => r.assignedTo === selectedPerson);
    }
    if (selectedTrip !== "All") {
      filtered = filtered.filter((r) => r.trip === selectedTrip);
    }
    if (selectedStatus === "To-Do") {
      filtered = filtered.filter((r) => !r.completed);
    } else if (selectedStatus === "Completed") {
      filtered = filtered.filter((r) => r.completed);
    }
    return filtered;
  };

  const getFilteredPackingItems = () => {
    let filtered = packingItems;
    if (selectedPerson === "My Tasks") {
      filtered = filtered.filter((item) => item.assignedTo === currentUser);
    } else if (selectedPerson !== "All") {
      filtered = filtered.filter((item) => item.assignedTo === selectedPerson);
    }
    if (selectedTrip !== "All") {
      filtered = filtered.filter((item) => item.trip === selectedTrip);
    }
    if (selectedBag !== "All") {
      filtered = filtered.filter((item) => item.bag === selectedBag);
    }
    return filtered;
  };

  const getFilteredPayments = () => {
    let filtered = payments;
    if (selectedTrip !== "All") {
      filtered = filtered.filter((p) => p.trip === selectedTrip);
    }
    return filtered;
  };

  const addResponsibility = () => {
    if (
      newTask.trim() &&
      newTaskAssignee.trim() &&
      newTaskTrip.trim() &&
      newTaskCompleteBy.trim() &&
      newTaskCategory.trim()
    ) {
      // Convert date from YYYY-MM-DD to MM/DD/YYYY format
      const formatDateForDisplay = (dateStr: string) => {
        if (!dateStr || dateStr === "TBD") return "TBD";
        const date = new Date(dateStr);
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const year = date.getFullYear();
        return `${month}/${day}/${year}`;
      };

      const newResp: Responsibility = {
        id: Date.now().toString(),
        task: newTask.trim(),
        assignedTo: newTaskAssignee.trim(),
        trip: newTaskTrip.trim(),
        tripDate: formatDateForDisplay(newTaskTripDate),
        completeBy: formatDateForDisplay(newTaskCompleteBy),
        category: newTaskCategory.trim(),
        completed: false,
      };
      setResponsibilities([...responsibilities, newResp]);
      setNewTask("");
      setNewTaskAssignee("");
      setNewTaskTrip("");
      setNewTaskTripDate("");
      setNewTaskCompleteBy("");
      setNewTaskCategory("");
      setShowAddModal(false);
    } else {
      Alert.alert("Error", "Please fill in all required fields");
    }
  };

  const toggleResponsibility = (id: string) => {
    setResponsibilities(
      responsibilities.map((resp) =>
        resp.id === id ? { ...resp, completed: !resp.completed } : resp
      )
    );
  };

  const deleteResponsibility = (id: string) => {
    Alert.alert("Delete Task", "Are you sure you want to delete this task?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () =>
          setResponsibilities(
            responsibilities.filter((resp) => resp.id !== id)
          ),
      },
    ]);
  };

  const addPackingItem = () => {
    if (
      newItem.trim() &&
      newItemAssignee.trim() &&
      newItemTrip.trim() &&
      newItemBag.trim()
    ) {
      const newPackingItem: PackingItem = {
        id: Date.now().toString(),
        item: newItem.trim(),
        assignedTo: newItemAssignee.trim(),
        trip: newItemTrip.trim(),
        bag: newItemBag.trim(),
        packed: false,
      };
      setPackingItems([...packingItems, newPackingItem]);
      setNewItem("");
      setNewItemAssignee("");
      setNewItemTrip("");
      setNewItemBag("");
      setShowAddModal(false);
    } else {
      Alert.alert("Error", "Please fill in all fields");
    }
  };

  const togglePackingItem = (id: string) => {
    setPackingItems(
      packingItems.map((item) =>
        item.id === id ? { ...item, packed: !item.packed } : item
      )
    );
  };

  const deletePackingItem = (id: string) => {
    Alert.alert("Delete Item", "Are you sure you want to delete this item?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () =>
          setPackingItems(packingItems.filter((item) => item.id !== id)),
      },
    ]);
  };

  const addPayment = () => {
    if (
      newPayment.trim() &&
      newPaymentAmount.trim() &&
      newPaymentFrom.trim() &&
      newPaymentTo.trim() &&
      newPaymentTrip.trim()
    ) {
      const newPaymentItem: Payment = {
        id: Date.now().toString(),
        description: newPayment.trim(),
        amount: newPaymentAmount.trim(),
        from: newPaymentFrom.trim(),
        to: newPaymentTo.trim(),
        trip: newPaymentTrip.trim(),
        paid: false,
      };
      setPayments([...payments, newPaymentItem]);
      setNewPayment("");
      setNewPaymentAmount("");
      setNewPaymentFrom("");
      setNewPaymentTo("");
      setNewPaymentTrip("");
      setShowAddModal(false);
    } else {
      Alert.alert("Error", "Please fill in all fields");
    }
  };

  const togglePayment = (id: string) => {
    setPayments(
      payments.map((p) => (p.id === id ? { ...p, paid: !p.paid } : p))
    );
  };

  const deletePayment = (id: string) => {
    Alert.alert(
      "Delete Payment",
      "Are you sure you want to delete this payment?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => setPayments(payments.filter((p) => p.id !== id)),
        },
      ]
    );
  };

  const getCompletedCount = (
    items: (Responsibility | PackingItem | Payment)[]
  ) => {
    return items.filter((item) => {
      if ("completed" in item) return item.completed;
      if ("packed" in item) return item.packed;
      if ("paid" in item) return item.paid;
      return false;
    }).length;
  };

  const parseDate = (dateString: string): Date => {
    if (dateString === "TBD") return new Date("2099-12-31");
    if (dateString.includes("/")) {
      const [month, day, year] = dateString.split("/");
      return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    }
    return new Date(dateString);
  };

  const isOverdue = (dateString: string, completed: boolean) => {
    if (completed || dateString === "TBD") return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const goalDate = parseDate(dateString);
    goalDate.setHours(0, 0, 0, 0);
    return goalDate < today;
  };

  const isDueSoon = (dateString: string, completed: boolean) => {
    if (completed || dateString === "TBD") return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const goalDate = parseDate(dateString);
    goalDate.setHours(0, 0, 0, 0);
    const daysUntil = Math.ceil(
      (goalDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysUntil >= 0 && daysUntil <= 3;
  };

  const sendNudge = (task: Responsibility) => {
    Alert.alert(
      "Reminder Sent",
      `A reminder has been sent to ${task.assignedTo} about "${task.task}" (Due: ${task.completeBy})`,
      [{ text: "OK" }]
    );
  };

  const createTrip = async () => {
    if (!newTripName.trim()) {
      Alert.alert("Error", "Please enter a trip name");
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert("Error", "You must be logged in to create a trip");
        return;
      }

      const { data, error } = await supabase
        .from('trips')
        .insert({
          user_id: user.id,
          name: newTripName.trim(),
          start_date: newTripStartDate || null,
          end_date: newTripEndDate || null,
        })
        .select()
        .single();

      if (error) {
        Alert.alert("Error", error.message);
        return;
      }

      // Add to local trips list
      setTrips([...trips, newTripName.trim()]);
      setNewTripName("");
      setNewTripStartDate("");
      setNewTripEndDate("");
      setShowTripModal(false);
      Alert.alert("Success", "Trip created successfully!");
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to create trip");
    }
  };

  const invitePerson = async () => {
    if (!inviteEmail.trim() || !inviteTrip) {
      Alert.alert("Error", "Please enter an email and select a trip");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(inviteEmail.trim())) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert("Error", "You must be logged in to invite people");
        return;
      }

      // First, find the trip_id
      const { data: tripData, error: tripError } = await supabase
        .from('trips')
        .select('id')
        .eq('name', inviteTrip)
        .eq('user_id', user.id)
        .single();

      if (tripError || !tripData) {
        Alert.alert("Error", "Trip not found");
        return;
      }

      // Find the user by email
      const { data: inviteeData, error: inviteeError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', inviteEmail.trim())
        .single();

      if (inviteeError || !inviteeData) {
        Alert.alert("Error", "User with this email not found. They need to sign up first.");
        return;
      }

      // Create invitation
      const { error: inviteError } = await supabase
        .from('trip_members')
        .insert({
          trip_id: tripData.id,
          user_id: inviteeData.id,
          invited_by: user.id,
          status: 'pending',
        });

      if (inviteError) {
        if (inviteError.code === '23505') { // Unique constraint violation
          Alert.alert("Error", "This person is already invited to this trip");
        } else {
          Alert.alert("Error", inviteError.message);
        }
        return;
      }

      setInviteEmail("");
      setInviteTrip("");
      setShowInviteModal(false);
      Alert.alert("Success", `Invitation sent to ${inviteEmail.trim()}!`);
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to send invitation");
    }
  };

  const filteredResponsibilities = getFilteredResponsibilities();
  const filteredPackingItems = getFilteredPackingItems();
  const filteredPayments = getFilteredPayments();

  const renderDropdown = (
    visible: boolean,
    options: string[],
    selected: string,
    onSelect: (value: string) => void,
    position: { x: number; y: number; width: number },
    onClose: () => void
  ) => {
    if (!visible) return null;

    return (
      <Modal
        transparent
        visible={visible}
        animationType="fade"
        onRequestClose={onClose}
      >
        <TouchableOpacity
          style={styles.dropdownOverlay}
          activeOpacity={1}
          onPress={onClose}
        >
          <View
            style={[
              styles.dropdown,
              {
                left: Math.max(16, Math.min(position.x, SCREEN_WIDTH - 200)),
                top: position.y + 4,
                width: Math.max(150, position.width),
              },
            ]}
          >
            {options.map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.dropdownOption,
                  selected === option && styles.dropdownOptionSelected,
                ]}
                onPress={() => {
                  onSelect(option);
                  onClose();
                }}
              >
                <Text
                  style={[
                    styles.dropdownOptionText,
                    selected === option && styles.dropdownOptionTextSelected,
                  ]}
                >
                  {option}
                </Text>
                {selected === option && (
                  <View style={styles.dropdownCheck}>
                    <Text style={styles.dropdownCheckText}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    );
  };

  const renderIcon = (iconType: string) => {
    const icons: { [key: string]: string } = {
      tasks: "✓",
      packing: "□",
      payments: "$",
      calendar: "◷",
      chat: "○",
      settings: "◯",
    };
    return icons[iconType] || "•";
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {getCompletedCount(responsibilities)}/{responsibilities.length}
              </Text>
              <Text style={styles.statLabel}>Tasks</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {getCompletedCount(packingItems)}/{packingItems.length}
              </Text>
              <Text style={styles.statLabel}>Items</Text>
            </View>
            {activeTab === "payments" && (
              <>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>
                    {getCompletedCount(payments)}/{payments.length}
                  </Text>
                  <Text style={styles.statLabel}>Payments</Text>
                </View>
              </>
            )}
          </View>
          <View style={styles.userBadge}>
            <Text style={styles.userBadgeText}>{currentUser}</Text>
          </View>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.headerActionButton}
            onPress={() => setShowTripModal(true)}
            accessibilityRole="button"
            accessibilityLabel="Create new trip"
          >
            <Text style={styles.headerActionText}>+ New Trip</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerActionButton}
            onPress={() => setShowInviteModal(true)}
            accessibilityRole="button"
            accessibilityLabel="Invite people"
          >
            <Text style={styles.headerActionText}>Invite</Text>
          </TouchableOpacity>
        </View>
      </View>


      {/* Filters */}
      {(activeTab === "responsibilities" || activeTab === "packing") && (
        <View style={styles.filterBar}>
          <View style={styles.filterRow}>
            <View ref={personFilterRef} collapsable={false}>
              <TouchableOpacity
                style={[
                  styles.filterButton,
                  selectedPerson !== "All" &&
                  selectedPerson !== "My Tasks" &&
                  styles.filterButtonActive,
                ]}
                onPress={() => handleFilterPress("person")}
              >
                <Text
                  style={[
                    styles.filterButtonText,
                    selectedPerson !== "All" &&
                    selectedPerson !== "My Tasks" &&
                    styles.filterButtonTextActive,
                  ]}
                >
                  Member
                </Text>
                <Text style={styles.filterButtonArrow}>▼</Text>
              </TouchableOpacity>
            </View>

            {activeTab === "responsibilities" && (
              <View ref={statusFilterRef} collapsable={false}>
                <TouchableOpacity
                  style={[
                    styles.filterButton,
                    selectedStatus !== "All" && styles.filterButtonActive,
                  ]}
                  onPress={() => handleFilterPress("status")}
                >
                  <Text
                    style={[
                      styles.filterButtonText,
                      selectedStatus !== "All" && styles.filterButtonTextActive,
                    ]}
                  >
                    {selectedStatus}
                  </Text>
                  <Text style={styles.filterButtonArrow}>▼</Text>
                </TouchableOpacity>
              </View>
            )}

            {activeTab === "packing" && (
              <View ref={bagFilterRef} collapsable={false}>
                <TouchableOpacity
                  style={[
                    styles.filterButton,
                    selectedBag !== "All" && styles.filterButtonActive,
                  ]}
                  onPress={() => handleFilterPress("bag")}
                >
                  <Text
                    style={[
                      styles.filterButtonText,
                      selectedBag !== "All" && styles.filterButtonTextActive,
                    ]}
                  >
                    Bag
                  </Text>
                  <Text style={styles.filterButtonArrow}>▼</Text>
                </TouchableOpacity>
              </View>
            )}

            <View ref={tripFilterRef} collapsable={false}>
              <TouchableOpacity
                style={[
                  styles.filterButton,
                  selectedTrip !== "All" && {
                    backgroundColor: getTripCategoryColor(selectedTrip) + "20",
                    borderColor: getTripCategoryColor(selectedTrip),
                    borderWidth: 2,
                  },
                ]}
                onPress={() => handleFilterPress("trip")}
              >
                <Text
                  style={[
                    styles.filterButtonText,
                    selectedTrip !== "All" && {
                      color: getTripCategoryColor(selectedTrip),
                      fontWeight: "600",
                    },
                  ]}
                >
                  Trip
                </Text>
                <Text
                  style={[
                    styles.filterButtonArrow,
                    selectedTrip !== "All" && {
                      color: getTripCategoryColor(selectedTrip),
                    },
                  ]}
                >
                  ▼
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {activeTab === "payments" && (
        <View style={styles.filterBar}>
          <View style={styles.filterRow}>
            <View ref={tripFilterRef} collapsable={false}>
              <TouchableOpacity
                style={[
                  styles.filterButton,
                  selectedTrip !== "All" && {
                    backgroundColor: getTripCategoryColor(selectedTrip) + "20",
                    borderColor: getTripCategoryColor(selectedTrip),
                    borderWidth: 1.5,
                  },
                ]}
                onPress={() => handleFilterPress("trip")}
              >
                <Text
                  style={[
                    styles.filterButtonText,
                    selectedTrip !== "All" && {
                      color: getTripCategoryColor(selectedTrip),
                      fontWeight: "600",
                    },
                  ]}
                >
                  Trip
                </Text>
                <Text
                  style={[
                    styles.filterButtonArrow,
                    selectedTrip !== "All" && {
                      color: getTripCategoryColor(selectedTrip),
                    },
                  ]}
                >
                  ▼
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === "responsibilities" ? (
          <View style={styles.contentSection}>
            {filteredResponsibilities.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>No tasks found</Text>
                <Text style={styles.emptyStateSubtext}>
                  Try adjusting your filters
                </Text>
              </View>
            ) : (
              (() => {
                // Group by trip for visual organization
                const groupedByTrip: { [key: string]: Responsibility[] } = {};
                filteredResponsibilities.forEach((resp) => {
                  if (!groupedByTrip[resp.trip]) {
                    groupedByTrip[resp.trip] = [];
                  }
                  groupedByTrip[resp.trip].push(resp);
                });

                return Object.entries(groupedByTrip).map(
                  ([tripName, tripTasks], tripIndex) => {
                    const tripCategoryColor = getTripCategoryColor(tripName);
                    return (
                      <View key={tripName} style={styles.tripGroup}>
                        {tripIndex > 0 && <View style={styles.tripSpacer} />}
                        <View
                          style={[
                            styles.tripTag,
                            { borderLeftColor: tripCategoryColor },
                          ]}
                        >
                          <Text
                            style={[
                              styles.tripTagText,
                              { color: tripCategoryColor },
                            ]}
                          >
                            {tripName}
                          </Text>
                        </View>
                        {tripTasks.map((resp, taskIndex) => {
                          const overdue = isOverdue(
                            resp.completeBy,
                            resp.completed
                          );
                          const dueSoon = isDueSoon(
                            resp.completeBy,
                            resp.completed
                          );
                          const categoryColor = getCategoryColor(resp.category);
                          return (
                            <View
                              key={resp.id}
                              style={[
                                styles.itemCard,
                                {
                                  borderLeftWidth: 4,
                                  borderLeftColor: categoryColor,
                                  backgroundColor: categoryColor + "18",
                                },
                                taskIndex === 0 && { marginTop: 4 },
                                taskIndex === tripTasks.length - 1 && {
                                  marginBottom: 0,
                                },
                                resp.completed && styles.itemCardCompleted,
                                overdue &&
                                !resp.completed &&
                                styles.itemCardOverdue,
                                dueSoon &&
                                !resp.completed &&
                                !overdue &&
                                styles.itemCardDueSoon,
                              ]}
                            >
                              <TouchableOpacity
                                style={styles.itemContent}
                                onPress={() => toggleResponsibility(resp.id)}
                                accessibilityRole="checkbox"
                                accessibilityState={{ checked: resp.completed }}
                                accessibilityLabel={`${resp.task}, assigned to ${resp.assignedTo}, due ${resp.completeBy}`}
                              >
                                <View
                                  style={[
                                    styles.checkbox,
                                    resp.completed && styles.checkboxChecked,
                                  ]}
                                >
                                  {resp.completed && (
                                    <Text style={styles.checkmark}>✓</Text>
                                  )}
                                </View>
                                <View style={styles.itemTextContainer}>
                                  <View style={styles.itemHeaderRow}>
                                    <Text
                                      style={[
                                        styles.itemText,
                                        resp.completed &&
                                        styles.itemTextCompleted,
                                      ]}
                                      numberOfLines={2}
                                    >
                                      {resp.task}
                                    </Text>
                                  </View>
                                  <View style={styles.itemMetaRow}>
                                    <View
                                      style={[
                                        styles.categoryTag,
                                        { backgroundColor: categoryColor },
                                      ]}
                                    >
                                      <Text style={styles.categoryTagText}>
                                        {resp.category}
                                      </Text>
                                    </View>
                                    <View
                                      style={[
                                        styles.badge,
                                        resp.assignedTo === currentUser &&
                                        styles.badgeMine,
                                      ]}
                                    >
                                      <Text
                                        style={[
                                          styles.badgeText,
                                          resp.assignedTo === currentUser &&
                                          styles.badgeTextMine,
                                        ]}
                                      >
                                        {resp.assignedTo === currentUser
                                          ? "You"
                                          : resp.assignedTo}
                                      </Text>
                                    </View>
                                    <View style={styles.badge}>
                                      <Text style={styles.badgeText}>
                                        {resp.trip}
                                      </Text>
                                    </View>
                                  </View>
                                  <View style={styles.dateContainer}>
                                    <View style={styles.dateRow}>
                                      <Text style={styles.dateLabel}>
                                        Trip:
                                      </Text>
                                      <Text
                                        style={styles.dateValue}
                                        accessibilityLabel={`Trip date: ${resp.tripDate}`}
                                      >
                                        {resp.tripDate}
                                      </Text>
                                    </View>
                                    <View style={styles.dateRow}>
                                      <Text style={styles.dateLabel}>Due:</Text>
                                      <Text
                                        style={[
                                          styles.dateValue,
                                          overdue &&
                                          !resp.completed &&
                                          styles.dateValueOverdue,
                                          dueSoon &&
                                          !resp.completed &&
                                          !overdue &&
                                          styles.dateValueDueSoon,
                                        ]}
                                        accessibilityLabel={`Due date: ${resp.completeBy}`}
                                      >
                                        {resp.completeBy}
                                      </Text>
                                    </View>
                                    {!resp.completed && (
                                      <View style={styles.timerContainer}>
                                        <TaskTimer
                                          completeBy={resp.completeBy}
                                          completed={resp.completed}
                                        />
                                      </View>
                                    )}
                                  </View>
                                </View>
                              </TouchableOpacity>
                              <View style={styles.itemActions}>
                                {!resp.completed && (
                                  <TouchableOpacity
                                    style={styles.remindButton}
                                    onPress={() => sendNudge(resp)}
                                    accessibilityRole="button"
                                    accessibilityLabel={`Send reminder for ${resp.task}`}
                                  >
                                    <Text style={styles.remindButtonText}>🔔 Remind</Text>
                                  </TouchableOpacity>
                                )}
                                <TouchableOpacity
                                  style={styles.deleteButton}
                                  onPress={() => deleteResponsibility(resp.id)}
                                  accessibilityRole="button"
                                  accessibilityLabel={`Delete task: ${resp.task}`}
                                >
                                  <Text style={styles.deleteIcon}>×</Text>
                                </TouchableOpacity>
                              </View>
                            </View>
                          );
                        })}
                      </View>
                    );
                  }
                );
              })()
            )}
          </View>
        ) : activeTab === "packing" ? (
          <View style={styles.contentSection}>
            {filteredPackingItems.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>No items found</Text>
                <Text style={styles.emptyStateSubtext}>
                  Try adjusting your filters
                </Text>
              </View>
            ) : (
              (() => {
                // Group by person, then by trip, then by bag
                const groupedByPerson: {
                  [key: string]: {
                    [key: string]: { [key: string]: PackingItem[] };
                  };
                } = {};
                filteredPackingItems.forEach((item) => {
                  if (!groupedByPerson[item.assignedTo]) {
                    groupedByPerson[item.assignedTo] = {};
                  }
                  if (!groupedByPerson[item.assignedTo][item.trip]) {
                    groupedByPerson[item.assignedTo][item.trip] = {};
                  }
                  if (!groupedByPerson[item.assignedTo][item.trip][item.bag]) {
                    groupedByPerson[item.assignedTo][item.trip][item.bag] = [];
                  }
                  groupedByPerson[item.assignedTo][item.trip][item.bag].push(
                    item
                  );
                });

                return Object.entries(groupedByPerson).map(
                  ([personName, personTrips], personIndex) => {
                    const isCurrentUser = personName === currentUser;
                    return (
                      <View key={personName} style={styles.personGroup}>
                        {personIndex > 0 && <View style={styles.tripSpacer} />}
                        <View
                          style={[
                            styles.personTag,
                            isCurrentUser && styles.personTagMine,
                          ]}
                        >
                          <Text
                            style={[
                              styles.personTagText,
                              isCurrentUser && styles.personTagTextMine,
                            ]}
                          >
                            {isCurrentUser ? "You" : personName}
                          </Text>
                        </View>
                        {Object.entries(personTrips).map(
                          ([tripName, tripBags], tripIndex) => {
                            const tripCategoryColor =
                              getTripCategoryColor(tripName);
                            return (
                              <View key={tripName} style={styles.tripGroup}>
                                {tripIndex > 0 && (
                                  <View style={styles.bagSpacer} />
                                )}
                                <View
                                  style={[
                                    styles.tripTag,
                                    { borderLeftColor: tripCategoryColor },
                                  ]}
                                >
                                  <Text
                                    style={[
                                      styles.tripTagText,
                                      { color: tripCategoryColor },
                                    ]}
                                  >
                                    {tripName}
                                  </Text>
                                </View>
                                {Object.entries(tripBags).map(
                                  ([bagName, bagItems], bagIndex) => (
                                    <View key={bagName} style={styles.bagGroup}>
                                      <View style={styles.bagTag}>
                                        <Text style={styles.bagTagText}>
                                          {bagName}
                                        </Text>
                                      </View>
                                      {bagItems.map((item, itemIndex) => (
                                        <View
                                          key={item.id}
                                          style={[
                                            styles.packingItemCard,
                                            item.packed &&
                                            styles.itemCardCompleted,
                                            itemIndex === 0 && { marginTop: 4 },
                                            itemIndex ===
                                            bagItems.length - 1 && {
                                              marginBottom: 0,
                                            },
                                          ]}
                                        >
                                          <TouchableOpacity
                                            style={styles.itemContent}
                                            onPress={() =>
                                              togglePackingItem(item.id)
                                            }
                                          >
                                            <View
                                              style={[
                                                styles.checkbox,
                                                item.packed &&
                                                styles.checkboxChecked,
                                              ]}
                                            >
                                              {item.packed && (
                                                <Text style={styles.checkmark}>
                                                  ✓
                                                </Text>
                                              )}
                                            </View>
                                            <View
                                              style={styles.itemTextContainer}
                                            >
                                              <Text
                                                style={[
                                                  styles.itemText,
                                                  item.packed &&
                                                  styles.itemTextCompleted,
                                                ]}
                                                numberOfLines={2}
                                              >
                                                {item.item}
                                              </Text>
                                            </View>
                                          </TouchableOpacity>
                                          <TouchableOpacity
                                            style={styles.deleteButton}
                                            onPress={() =>
                                              deletePackingItem(item.id)
                                            }
                                          >
                                            <Text style={styles.deleteIcon}>
                                              ×
                                            </Text>
                                          </TouchableOpacity>
                                        </View>
                                      ))}
                                    </View>
                                  )
                                )}
                              </View>
                            );
                          }
                        )}
                      </View>
                    );
                  }
                );
              })()
            )}
          </View>
        ) : (
          <View style={styles.contentSection}>
            {filteredPayments.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>No payments found</Text>
                <Text style={styles.emptyStateSubtext}>
                  Try adjusting your filters
                </Text>
              </View>
            ) : (
              (() => {
                // Group by trip for visual organization
                const groupedByTrip: { [key: string]: Payment[] } = {};
                filteredPayments.forEach((payment) => {
                  if (!groupedByTrip[payment.trip]) {
                    groupedByTrip[payment.trip] = [];
                  }
                  groupedByTrip[payment.trip].push(payment);
                });

                return Object.entries(groupedByTrip).map(
                  ([tripName, tripPayments], tripIndex) => {
                    const tripCategoryColor = getTripCategoryColor(tripName);
                    return (
                      <View key={tripName} style={styles.tripGroup}>
                        {tripIndex > 0 && <View style={styles.tripSpacer} />}
                        <View
                          style={[
                            styles.tripTag,
                            { borderLeftColor: tripCategoryColor },
                          ]}
                        >
                          <Text
                            style={[
                              styles.tripTagText,
                              { color: tripCategoryColor },
                            ]}
                          >
                            {tripName}
                          </Text>
                        </View>
                        {tripPayments.map((payment, paymentIndex) => (
                          <View
                            key={payment.id}
                            style={[
                              styles.itemCard,
                              styles.paymentCard,
                              payment.paid && styles.itemCardCompleted,
                              paymentIndex === 0 && { marginTop: 4 },
                              paymentIndex === tripPayments.length - 1 && {
                                marginBottom: 0,
                              },
                            ]}
                          >
                            <TouchableOpacity
                              style={styles.itemContent}
                              onPress={() => togglePayment(payment.id)}
                            >
                              <View
                                style={[
                                  styles.checkbox,
                                  payment.paid && styles.checkboxChecked,
                                ]}
                              >
                                {payment.paid && (
                                  <Text style={styles.checkmark}>✓</Text>
                                )}
                              </View>
                              <View style={styles.itemTextContainer}>
                                <Text
                                  style={[
                                    styles.itemText,
                                    payment.paid && styles.itemTextCompleted,
                                  ]}
                                >
                                  {payment.description}
                                </Text>
                                <View style={styles.paymentInfo}>
                                  <Text style={styles.paymentAmount}>
                                    {payment.amount}
                                  </Text>
                                  <Text style={styles.paymentFromTo}>
                                    {payment.from} → {payment.to}
                                  </Text>
                                </View>
                                <View style={styles.itemMetaRow}>
                                  <View style={styles.badge}>
                                    <Text style={styles.badgeText}>
                                      {payment.trip}
                                    </Text>
                                  </View>
                                </View>
                              </View>
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={styles.deleteButton}
                              onPress={() => deletePayment(payment.id)}
                            >
                              <Text style={styles.deleteIcon}>×</Text>
                            </TouchableOpacity>
                          </View>
                        ))}
                      </View>
                    );
                  }
                );
              })()
            )}
          </View>
        )}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.footerTab}
          onPress={() => setActiveTab("responsibilities")}
          accessibilityRole="tab"
          accessibilityState={{ selected: activeTab === "responsibilities" }}
          accessibilityLabel="Tasks tab"
        >
          <View
            style={[
              styles.footerIcon,
              activeTab === "responsibilities" && styles.footerIconActive,
            ]}
          >
            <Text style={styles.footerIconText}>{renderIcon("tasks")}</Text>
          </View>
          <Text
            style={[
              styles.footerLabel,
              activeTab === "responsibilities" && styles.footerLabelActive,
            ]}
          >
            Tasks
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.footerTab}
          onPress={() => setActiveTab("packing")}
          accessibilityRole="tab"
          accessibilityState={{ selected: activeTab === "packing" }}
          accessibilityLabel="Packing tab"
        >
          <View
            style={[
              styles.footerIcon,
              activeTab === "packing" && styles.footerIconActive,
            ]}
          >
            <Text style={styles.footerIconText}>{renderIcon("packing")}</Text>
          </View>
          <Text
            style={[
              styles.footerLabel,
              activeTab === "packing" && styles.footerLabelActive,
            ]}
          >
            Packing
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.footerTab}
          onPress={() => setActiveTab("payments")}
          accessibilityRole="tab"
          accessibilityState={{ selected: activeTab === "payments" }}
          accessibilityLabel="Payments tab"
        >
          <View
            style={[
              styles.footerIcon,
              activeTab === "payments" && styles.footerIconActive,
            ]}
          >
            <Text style={styles.footerIconText}>{renderIcon("payments")}</Text>
          </View>
          <Text
            style={[
              styles.footerLabel,
              activeTab === "payments" && styles.footerLabelActive,
            ]}
          >
            Payments
          </Text>
        </TouchableOpacity>
      </View>

      {/* Floating Add Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowAddModal(true)}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel={`Add new ${activeTab === "responsibilities" ? "task" : activeTab === "packing" ? "packing item" : "payment"}`}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      {/* Dropdowns */}
      {renderDropdown(
        showPersonFilter,
        ["My Tasks", "All", ...teamMembers],
        selectedPerson,
        setSelectedPerson,
        filterPositions.person,
        () => setShowPersonFilter(false)
      )}
      {renderDropdown(
        showTripFilter,
        ["All", ...trips],
        selectedTrip,
        setSelectedTrip,
        filterPositions.trip,
        () => setShowTripFilter(false)
      )}
      {renderDropdown(
        showBagFilter,
        ["All", ...bags],
        selectedBag,
        setSelectedBag,
        filterPositions.bag,
        () => setShowBagFilter(false)
      )}
      {renderDropdown(
        showStatusFilter,
        ["All", "To-Do", "Completed"],
        selectedStatus,
        setSelectedStatus,
        filterPositions.status,
        () => setShowStatusFilter(false)
      )}

      {/* Add Modal */}
      <Modal
        visible={showAddModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {activeTab === "responsibilities"
                  ? "Add New Task"
                  : activeTab === "packing"
                    ? "Add Packing Item"
                    : "Add Payment"}
              </Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Text style={styles.modalClose}>×</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalScroll}>
              {activeTab === "responsibilities" ? (
                <>
                  <Text style={styles.modalLabel}>Task</Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="Enter task..."
                    value={newTask}
                    onChangeText={setNewTask}
                    placeholderTextColor={colors.textLight}
                  />
                  <Text style={styles.modalLabel}>Assigned To</Text>
                  <View style={styles.pickerContainer}>
                    {teamMembers.map((member) => (
                      <TouchableOpacity
                        key={member}
                        style={[
                          styles.pickerOption,
                          newTaskAssignee === member &&
                          styles.pickerOptionSelected,
                        ]}
                        onPress={() => setNewTaskAssignee(member)}
                      >
                        <Text
                          style={[
                            styles.pickerOptionText,
                            newTaskAssignee === member &&
                            styles.pickerOptionTextSelected,
                          ]}
                        >
                          {member}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  <Text style={styles.modalLabel}>Trip</Text>
                  <View style={styles.pickerContainer}>
                    {trips.map((trip) => (
                      <TouchableOpacity
                        key={trip}
                        style={[
                          styles.pickerOption,
                          newTaskTrip === trip && styles.pickerOptionSelected,
                        ]}
                        onPress={() => setNewTaskTrip(trip)}
                      >
                        <Text
                          style={[
                            styles.pickerOptionText,
                            newTaskTrip === trip &&
                            styles.pickerOptionTextSelected,
                          ]}
                        >
                          {trip}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  <Text style={styles.modalLabel}>Category</Text>
                  <View style={styles.pickerContainer}>
                    {categories.map((category) => (
                      <TouchableOpacity
                        key={category.name}
                        style={[
                          styles.categoryOption,
                          newTaskCategory === category.name && {
                            backgroundColor: category.color + "20",
                            borderColor: category.color,
                            borderWidth: 2,
                          },
                        ]}
                        onPress={() => setNewTaskCategory(category.name)}
                      >
                        <View
                          style={[
                            styles.categoryDot,
                            { backgroundColor: category.color },
                          ]}
                        />
                        <Text
                          style={[
                            styles.categoryOptionText,
                            newTaskCategory === category.name && {
                              color: category.color,
                              fontWeight: "600",
                            },
                          ]}
                        >
                          {category.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  <DatePicker
                    label="Trip Date (Optional)"
                    value={newTaskTripDate}
                    onChange={(date) => setNewTaskTripDate(date)}
                    placeholder="Select trip date"
                  />
                  <DatePicker
                    label="Complete By *"
                    value={newTaskCompleteBy}
                    onChange={(date) => setNewTaskCompleteBy(date)}
                    placeholder="Select completion date"
                  />
                  <TouchableOpacity
                    style={styles.modalAddButton}
                    onPress={addResponsibility}
                  >
                    <Text style={styles.modalAddButtonText}>Add Task</Text>
                  </TouchableOpacity>
                </>
              ) : activeTab === "packing" ? (
                <>
                  <Text style={styles.modalLabel}>Item</Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="Enter item to pack..."
                    value={newItem}
                    onChangeText={setNewItem}
                    placeholderTextColor={colors.textLight}
                  />
                  <Text style={styles.modalLabel}>Assigned To</Text>
                  <View style={styles.pickerContainer}>
                    {teamMembers.map((member) => (
                      <TouchableOpacity
                        key={member}
                        style={[
                          styles.pickerOption,
                          newItemAssignee === member &&
                          styles.pickerOptionSelected,
                        ]}
                        onPress={() => setNewItemAssignee(member)}
                      >
                        <Text
                          style={[
                            styles.pickerOptionText,
                            newItemAssignee === member &&
                            styles.pickerOptionTextSelected,
                          ]}
                        >
                          {member}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  <Text style={styles.modalLabel}>Trip</Text>
                  <View style={styles.pickerContainer}>
                    {trips.map((trip) => (
                      <TouchableOpacity
                        key={trip}
                        style={[
                          styles.pickerOption,
                          newItemTrip === trip && styles.pickerOptionSelected,
                        ]}
                        onPress={() => setNewItemTrip(trip)}
                      >
                        <Text
                          style={[
                            styles.pickerOptionText,
                            newItemTrip === trip &&
                            styles.pickerOptionTextSelected,
                          ]}
                        >
                          {trip}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  <Text style={styles.modalLabel}>Bag</Text>
                  <View style={styles.pickerContainer}>
                    {bags.map((bag) => (
                      <TouchableOpacity
                        key={bag}
                        style={[
                          styles.pickerOption,
                          newItemBag === bag && styles.pickerOptionSelected,
                        ]}
                        onPress={() => setNewItemBag(bag)}
                      >
                        <Text
                          style={[
                            styles.pickerOptionText,
                            newItemBag === bag &&
                            styles.pickerOptionTextSelected,
                          ]}
                        >
                          {bag}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  <TouchableOpacity
                    style={styles.modalAddButton}
                    onPress={addPackingItem}
                  >
                    <Text style={styles.modalAddButtonText}>Add Item</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <Text style={styles.modalLabel}>Description</Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="e.g., Venmo Kevin for Airbnb"
                    value={newPayment}
                    onChangeText={setNewPayment}
                    placeholderTextColor={colors.textLight}
                  />
                  <Text style={styles.modalLabel}>Amount</Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="e.g., $150"
                    value={newPaymentAmount}
                    onChangeText={setNewPaymentAmount}
                    placeholderTextColor={colors.textLight}
                    keyboardType="default"
                  />
                  <Text style={styles.modalLabel}>From</Text>
                  <View style={styles.pickerContainer}>
                    {teamMembers.map((member) => (
                      <TouchableOpacity
                        key={member}
                        style={[
                          styles.pickerOption,
                          newPaymentFrom === member &&
                          styles.pickerOptionSelected,
                        ]}
                        onPress={() => setNewPaymentFrom(member)}
                      >
                        <Text
                          style={[
                            styles.pickerOptionText,
                            newPaymentFrom === member &&
                            styles.pickerOptionTextSelected,
                          ]}
                        >
                          {member}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  <Text style={styles.modalLabel}>To</Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="Person name"
                    value={newPaymentTo}
                    onChangeText={setNewPaymentTo}
                    placeholderTextColor={colors.textLight}
                  />
                  <Text style={styles.modalLabel}>Trip</Text>
                  <View style={styles.pickerContainer}>
                    {trips.map((trip) => (
                      <TouchableOpacity
                        key={trip}
                        style={[
                          styles.pickerOption,
                          newPaymentTrip === trip &&
                          styles.pickerOptionSelected,
                        ]}
                        onPress={() => setNewPaymentTrip(trip)}
                      >
                        <Text
                          style={[
                            styles.pickerOptionText,
                            newPaymentTrip === trip &&
                            styles.pickerOptionTextSelected,
                          ]}
                        >
                          {trip}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  <TouchableOpacity
                    style={styles.modalAddButton}
                    onPress={addPayment}
                  >
                    <Text style={styles.modalAddButtonText}>Add Payment</Text>
                  </TouchableOpacity>
                </>
              )}
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Create Trip Modal */}
      <Modal
        visible={showTripModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowTripModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create New Trip</Text>
              <TouchableOpacity onPress={() => setShowTripModal(false)}>
                <Text style={styles.modalClose}>×</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalScroll}>
              <Text style={styles.modalLabel}>Trip Name *</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Enter trip name..."
                value={newTripName}
                onChangeText={setNewTripName}
                placeholderTextColor={colors.textLight}
              />
              <Text style={styles.modalLabel}>Start Date (Optional)</Text>
              <DatePicker
                date={newTripStartDate}
                onDateChange={setNewTripStartDate}
                placeholder="Select start date"
              />
              <Text style={styles.modalLabel}>End Date (Optional)</Text>
              <DatePicker
                date={newTripEndDate}
                onDateChange={setNewTripEndDate}
                placeholder="Select end date"
              />
              <TouchableOpacity
                style={styles.modalAddButton}
                onPress={createTrip}
              >
                <Text style={styles.modalAddButtonText}>Create Trip</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Invite Person Modal */}
      <Modal
        visible={showInviteModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowInviteModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Invite People</Text>
              <TouchableOpacity onPress={() => setShowInviteModal(false)}>
                <Text style={styles.modalClose}>×</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalScroll}>
              <Text style={styles.modalLabel}>Email *</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Enter email address..."
                value={inviteEmail}
                onChangeText={setInviteEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor={colors.textLight}
              />
              <Text style={styles.modalLabel}>Trip *</Text>
              <View style={styles.pickerContainer}>
                {trips.map((trip) => (
                  <TouchableOpacity
                    key={trip}
                    style={[
                      styles.pickerOption,
                      inviteTrip === trip && styles.pickerOptionSelected,
                    ]}
                    onPress={() => setInviteTrip(trip)}
                  >
                    <Text
                      style={[
                        styles.pickerOptionText,
                        inviteTrip === trip &&
                        styles.pickerOptionTextSelected,
                      ]}
                    >
                      {trip}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TouchableOpacity
                style={styles.modalAddButton}
                onPress={invitePerson}
              >
                <Text style={styles.modalAddButtonText}>Send Invitation</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
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
    backgroundColor: colors.headerBg,
    paddingHorizontal: 20,
    paddingTop: 6,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.text,
    letterSpacing: -0.3,
  },
  userBadge: {
    backgroundColor: colors.cardBg,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    flexShrink: 0,
    marginLeft: 12,
  },
  userBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.text,
  },
  headerActions: {
    flexDirection: "row",
    gap: 10,
    paddingTop: 12,
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  headerActionButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    flex: 1,
  },
  headerActionText: {
    color: colors.surface,
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  statItem: {
    flex: 1,
    minWidth: 0,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: colors.textLight,
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: colors.border,
    marginHorizontal: 8,
    flexShrink: 0,
  },
  filterBar: {
    backgroundColor: colors.background,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  filterRow: {
    flexDirection: "row",
    gap: 8,
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    minWidth: 90,
  },
  filterButtonActive: {
    backgroundColor: colors.cardBg,
    borderColor: colors.border,
  },
  filterButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.text,
    marginRight: 6,
    letterSpacing: 0.1,
  },
  filterButtonTextActive: {
    color: colors.text,
  },
  filterButtonArrow: {
    fontSize: 9,
    color: colors.textLight,
  },
  dropdownOverlay: {
    flex: 1,
    backgroundColor: "transparent",
  },
  dropdown: {
    position: "absolute",
    backgroundColor: colors.surface,
    borderRadius: 8,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
  },
  dropdownOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.background,
  },
  dropdownOptionSelected: {
    backgroundColor: colors.background,
  },
  dropdownOptionText: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.text,
  },
  dropdownOptionTextSelected: {
    fontWeight: "600",
    color: colors.text,
  },
  dropdownCheck: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  dropdownCheckText: {
    color: colors.surface,
    fontSize: 12,
    fontWeight: "bold",
  },
  scrollView: {
    flex: 1,
  },
  contentSection: {
    padding: 14,
  },
  tripGroup: {
    marginBottom: 8,
  },
  tripSpacer: {
    height: 12,
  },
  tripTag: {
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 8,
    paddingVertical: 6,
    marginBottom: 6,
    borderLeftWidth: 3,
    backgroundColor: colors.cardBg,
    borderRadius: 4,
  },
  tripTagText: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.3,
    textTransform: "uppercase",
  },
  personGroup: {
    marginBottom: 12,
  },
  personTag: {
    paddingLeft: 12,
    paddingVertical: 8,
    marginBottom: 8,
    backgroundColor: colors.cardBg,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  personTagMine: {
    backgroundColor: colors.accent + "15",
    borderColor: colors.accent + "40",
  },
  personTagText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.text,
    letterSpacing: 0.2,
  },
  personTagTextMine: {
    color: colors.accent,
  },
  bagGroup: {
    marginBottom: 8,
    marginLeft: 12,
  },
  bagSpacer: {
    height: 8,
  },
  bagTag: {
    paddingLeft: 10,
    paddingVertical: 5,
    marginBottom: 6,
    backgroundColor: colors.background,
    borderRadius: 4,
    borderLeftWidth: 2,
    borderLeftColor: colors.border,
  },
  bagTagText: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.textLight,
    letterSpacing: 0.2,
    textTransform: "uppercase",
  },
  packingItemCard: {
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: 12,
    marginBottom: 6,
    flexDirection: "row",
    alignItems: "flex-start",
    borderWidth: 1,
    borderColor: colors.border,
    position: "relative",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  itemCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "flex-start",
    borderWidth: 1,
    borderColor: colors.border,
    borderRightWidth: 1,
    position: "relative",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  paymentCard: {
    borderLeftColor: colors.accent,
    borderLeftWidth: 4,
    backgroundColor: colors.accent + "18",
  },
  itemCardCompleted: {
    opacity: 0.5,
    backgroundColor: colors.cardBg,
  },
  itemCardOverdue: {
    borderLeftColor: colors.error,
    backgroundColor: colors.error + "15",
  },
  itemCardDueSoon: {
    borderLeftColor: colors.warning,
    backgroundColor: colors.warning + "15",
  },
  categoryTag: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 4,
    alignSelf: "flex-start",
    flexShrink: 0,
  },
  categoryTagText: {
    fontSize: 9,
    fontWeight: "700",
    color: colors.surface,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  itemContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.border,
    marginRight: 12,
    marginTop: 2,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.surface,
  },
  checkboxChecked: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  checkmark: {
    color: colors.surface,
    fontSize: 14,
    fontWeight: "bold",
  },
  itemTextContainer: {
    flex: 1,
    paddingRight: 44,
  },
  itemHeaderRow: {
    marginBottom: 8,
  },
  itemText: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.text,
    lineHeight: 20,
    letterSpacing: -0.1,
  },
  itemTextCompleted: {
    textDecorationLine: "line-through",
    color: colors.textMuted,
  },
  itemMetaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 8,
    alignItems: "center",
  },
  dateContainer: {
    marginTop: 2,
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: colors.cardBg,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  timerContainer: {
    marginTop: 8,
    alignItems: 'flex-start',
  },
  dateRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  dateLabel: {
    fontSize: 11,
    fontWeight: "500",
    color: colors.textLight,
    letterSpacing: 0.1,
  },
  dateValue: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.text,
    letterSpacing: -0.1,
  },
  dateValueOverdue: {
    color: colors.error,
  },
  dateValueDueSoon: {
    color: colors.warning,
  },
  badge: {
    backgroundColor: colors.cardBg,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  badgeMine: {
    backgroundColor: colors.accent + "15",
    borderColor: colors.accent + "40",
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "500",
    color: colors.text,
    letterSpacing: 0.1,
  },
  badgeTextMine: {
    color: colors.accent,
    fontWeight: "600",
  },
  paymentInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: colors.cardBg,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  paymentAmount: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
    letterSpacing: -0.2,
  },
  paymentFromTo: {
    fontSize: 12,
    fontWeight: "500",
    color: colors.textLight,
    letterSpacing: 0.1,
  },
  itemActions: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 6,
    gap: 4,
  },
  remindButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: colors.accent + "20",
    borderWidth: 1,
    borderColor: colors.accent,
  },
  remindButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.accent,
  },
  deleteButton: {
    padding: 4,
  },
  deleteIcon: {
    fontSize: 20,
    color: colors.textMuted,
    fontWeight: "300",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textLight,
    marginBottom: 6,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: colors.textLight,
  },
  bottomSpacer: {
    height: 80,
  },
  footer: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 8,
    paddingBottom: 8,
    paddingHorizontal: 8,
    justifyContent: "space-around",
  },
  footerTab: {
    alignItems: "center",
    flex: 1,
  },
  footerIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.cardBg,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 3,
    borderWidth: 1,
    borderColor: colors.border,
  },
  footerIconActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  footerIconText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: "400",
  },
  footerLabel: {
    fontSize: 10,
    fontWeight: "500",
    color: colors.textLight,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  footerLabelActive: {
    color: colors.text,
    fontWeight: "600",
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
  fabText: {
    fontSize: 28,
    color: colors.surface,
    fontWeight: "300",
    lineHeight: 28,
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
    maxHeight: "85%",
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
  modalClose: {
    fontSize: 28,
    color: colors.textLight,
    fontWeight: "300",
    lineHeight: 28,
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
  categoryOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 8,
    marginBottom: 8,
  },
  categoryDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  categoryOptionText: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.text,
  },
  modalAddButton: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    padding: 16,
    alignItems: "center",
    marginTop: 24,
  },
  modalAddButtonText: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: "600",
  },
  modalHint: {
    fontSize: 12,
    color: colors.textLight,
    marginTop: -4,
    marginBottom: 8,
  },
});
