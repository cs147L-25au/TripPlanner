import React, { useState, useMemo } from "react";
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

interface Expense {
  id: string;
  description: string;
  amount: number;
  currency: string;
  category: ExpenseCategory;
  paidBy: string;
  splitBetween: string[];
  trip: string;
  date: string;
  createdAt: Date;
}

interface Balance {
  person: string;
  balance: number; // positive = owed money, negative = owes money
}

interface Settlement {
  from: string;
  to: string;
  amount: number;
}

type ExpenseCategory = "lodging" | "transport" | "food" | "activities" | "other";
type ViewMode = "expenses" | "summary" | "chart";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// Refined warm color palette with deeper accents
const colors = {
  // Primary palette - warm sunset tones
  primary: "#E85D4C", // Warm red-coral
  secondary: "#F4A259", // Golden amber
  accent: "#4ECDC4", // Tropical teal
  tertiary: "#95C623", // Fresh lime

  // Background hierarchy
  background: "#FFFAF6", // Warm cream paper
  surface: "#FFFFFF",
  cardBg: "#FFF9F5",
  elevated: "#FFFFFF",

  // Text hierarchy
  text: "#2D2A26", // Warm charcoal
  textSecondary: "#6B6560",
  textMuted: "#A39E98",
  textInverse: "#FFFFFF",

  // Borders
  border: "#E8E0D8",
  borderLight: "#F2EDE8",
  borderFocus: "#E85D4C",

  // Category colors - vibrant and distinct
  lodging: "#E85D4C", // Warm red
  transport: "#4ECDC4", // Teal
  food: "#F4A259", // Golden amber
  activities: "#9B5DE5", // Purple
  other: "#6B6560", // Neutral gray

  // Status
  positive: "#4ECDC4", // Teal - you're owed
  negative: "#E85D4C", // Red - you owe
  neutral: "#6B6560",
  success: "#4ECDC4",
  warning: "#F4A259",

  // Chart colors
  chartBg: "#FFF9F5",
  chartGrid: "#E8E0D8",
};

// Currency data
const currencies = [
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen" },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar" },
];

// Mock exchange rates (in real app, fetch from API)
const exchangeRates: { [key: string]: number } = {
  USD: 1,
  EUR: 1.08,
  GBP: 1.27,
  JPY: 0.0067,
  CAD: 0.74,
  AUD: 0.65,
};

const categoryConfig: {
  [key in ExpenseCategory]: { label: string; color: string; icon: string };
} = {
  lodging: { label: "Lodging", color: colors.lodging, icon: "🏠" },
  transport: { label: "Transport", color: colors.transport, icon: "✈️" },
  food: { label: "Food", color: colors.food, icon: "🍽️" },
  activities: { label: "Activities", color: colors.activities, icon: "🎯" },
  other: { label: "Other", color: colors.other, icon: "📦" },
};

export default function BudgetTrackerScreen() {
  const [currentUser] = useState<string>("Claudia");
  const [baseCurrency, setBaseCurrency] = useState<string>("USD");
  const [viewMode, setViewMode] = useState<ViewMode>("expenses");
  const [selectedTrip, setSelectedTrip] = useState<string>("All");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showTripFilter, setShowTripFilter] = useState(false);
  const [showCategoryFilter, setShowCategoryFilter] = useState(false);
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);

  // Sample data
  const teamMembers = ["Claudia", "Sohrab", "Adrian", "Kevin"];
  const trips = ["Summer Trip", "Winter Getaway", "Beach Vacation"];

  const [expenses, setExpenses] = useState<Expense[]>([
    {
      id: "1",
      description: "Airbnb - 3 nights",
      amount: 450,
      currency: "USD",
      category: "lodging",
      paidBy: "Kevin",
      splitBetween: ["Claudia", "Sohrab", "Adrian", "Kevin"],
      trip: "Summer Trip",
      date: "2025-06-15",
      createdAt: new Date("2024-12-01"),
    },
    {
      id: "2",
      description: "Flight tickets",
      amount: 320,
      currency: "USD",
      category: "transport",
      paidBy: "Claudia",
      splitBetween: ["Claudia", "Sohrab"],
      trip: "Summer Trip",
      date: "2025-06-15",
      createdAt: new Date("2024-12-02"),
    },
    {
      id: "3",
      description: "Welcome dinner",
      amount: 180,
      currency: "USD",
      category: "food",
      paidBy: "Sohrab",
      splitBetween: ["Claudia", "Sohrab", "Adrian", "Kevin"],
      trip: "Summer Trip",
      date: "2025-06-15",
      createdAt: new Date("2024-12-03"),
    },
    {
      id: "4",
      description: "Ski passes",
      amount: 280,
      currency: "USD",
      category: "activities",
      paidBy: "Adrian",
      splitBetween: ["Claudia", "Adrian"],
      trip: "Winter Getaway",
      date: "2025-01-20",
      createdAt: new Date("2024-12-04"),
    },
    {
      id: "5",
      description: "Car rental",
      amount: 150,
      currency: "EUR",
      category: "transport",
      paidBy: "Claudia",
      splitBetween: ["Claudia", "Sohrab", "Adrian"],
      trip: "Summer Trip",
      date: "2025-06-16",
      createdAt: new Date("2024-12-05"),
    },
    {
      id: "6",
      description: "Museum tickets",
      amount: 60,
      currency: "USD",
      category: "activities",
      paidBy: "Kevin",
      splitBetween: ["Claudia", "Sohrab", "Adrian", "Kevin"],
      trip: "Summer Trip",
      date: "2025-06-17",
      createdAt: new Date("2024-12-05"),
    },
  ]);

  // New expense form state
  const [newDescription, setNewDescription] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const [newCurrency, setNewCurrency] = useState("USD");
  const [newCategory, setNewCategory] = useState<ExpenseCategory>("food");
  const [newPaidBy, setNewPaidBy] = useState("");
  const [newSplitBetween, setNewSplitBetween] = useState<string[]>([]);
  const [newTrip, setNewTrip] = useState("");
  const [newDate, setNewDate] = useState("");

  // Convert amount to base currency
  const convertToBase = (amount: number, fromCurrency: string): number => {
    const rate = exchangeRates[fromCurrency] || 1;
    return amount * rate;
  };

  // Get filtered expenses
  const filteredExpenses = useMemo(() => {
    let filtered = expenses;
    if (selectedTrip !== "All") {
      filtered = filtered.filter((e) => e.trip === selectedTrip);
    }
    if (selectedCategory !== "All") {
      filtered = filtered.filter((e) => e.category === selectedCategory);
    }
    return filtered.sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }, [expenses, selectedTrip, selectedCategory]);

  // Calculate totals
  const totals = useMemo(() => {
    const byCategory: { [key in ExpenseCategory]: number } = {
      lodging: 0,
      transport: 0,
      food: 0,
      activities: 0,
      other: 0,
    };

    let total = 0;

    filteredExpenses.forEach((expense) => {
      const converted = convertToBase(expense.amount, expense.currency);
      byCategory[expense.category] += converted;
      total += converted;
    });

    return { byCategory, total };
  }, [filteredExpenses]);

  // Calculate balances for current user
  const balances = useMemo(() => {
    const balanceMap: { [person: string]: number } = {};
    teamMembers.forEach((member) => {
      balanceMap[member] = 0;
    });

    const expensesToCalculate =
      selectedTrip === "All"
        ? expenses
        : expenses.filter((e) => e.trip === selectedTrip);

    expensesToCalculate.forEach((expense) => {
      const converted = convertToBase(expense.amount, expense.currency);
      const sharePerPerson = converted / expense.splitBetween.length;

      // The payer is owed by everyone in the split
      expense.splitBetween.forEach((person) => {
        if (person !== expense.paidBy) {
          // This person owes the payer
          if (person === currentUser) {
            balanceMap[expense.paidBy] -= sharePerPerson; // I owe them
          } else if (expense.paidBy === currentUser) {
            balanceMap[person] += sharePerPerson; // They owe me
          }
        }
      });
    });

    const result: Balance[] = Object.entries(balanceMap)
      .filter(([person]) => person !== currentUser && Math.abs(balanceMap[person]) > 0.01)
      .map(([person, balance]) => ({ person, balance }))
      .sort((a, b) => b.balance - a.balance);

    return result;
  }, [expenses, selectedTrip, currentUser, teamMembers]);

  // Calculate suggested settlements
  const settlements = useMemo((): Settlement[] => {
    const netBalances: { [person: string]: number } = {};
    teamMembers.forEach((member) => {
      netBalances[member] = 0;
    });

    const expensesToCalculate =
      selectedTrip === "All"
        ? expenses
        : expenses.filter((e) => e.trip === selectedTrip);

    expensesToCalculate.forEach((expense) => {
      const converted = convertToBase(expense.amount, expense.currency);
      const sharePerPerson = converted / expense.splitBetween.length;

      // Payer paid full amount, but should only pay their share
      netBalances[expense.paidBy] += converted - sharePerPerson;

      // Everyone in split owes their share (except payer, handled above)
      expense.splitBetween.forEach((person) => {
        if (person !== expense.paidBy) {
          netBalances[person] -= sharePerPerson;
        }
      });
    });

    // Simplify debts
    const debtors = Object.entries(netBalances)
      .filter(([_, balance]) => balance < -0.01)
      .map(([person, balance]) => ({ person, amount: -balance }))
      .sort((a, b) => b.amount - a.amount);

    const creditors = Object.entries(netBalances)
      .filter(([_, balance]) => balance > 0.01)
      .map(([person, balance]) => ({ person, amount: balance }))
      .sort((a, b) => b.amount - a.amount);

    const result: Settlement[] = [];

    let d = 0;
    let c = 0;
    while (d < debtors.length && c < creditors.length) {
      const debtor = debtors[d];
      const creditor = creditors[c];
      const amount = Math.min(debtor.amount, creditor.amount);

      if (amount > 0.01) {
        result.push({
          from: debtor.person,
          to: creditor.person,
          amount: amount,
        });
      }

      debtor.amount -= amount;
      creditor.amount -= amount;

      if (debtor.amount < 0.01) d++;
      if (creditor.amount < 0.01) c++;
    }

    return result;
  }, [expenses, selectedTrip, teamMembers]);

  // My total balance
  const myTotalBalance = useMemo(() => {
    return balances.reduce((sum, b) => sum + b.balance, 0);
  }, [balances]);

  // Add expense
  const addExpense = () => {
    if (
      !newDescription.trim() ||
      !newAmount ||
      !newPaidBy ||
      newSplitBetween.length === 0 ||
      !newTrip
    ) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    const amount = parseFloat(newAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert("Error", "Please enter a valid amount");
      return;
    }

    const newExpense: Expense = {
      id: Date.now().toString(),
      description: newDescription.trim(),
      amount,
      currency: newCurrency,
      category: newCategory,
      paidBy: newPaidBy,
      splitBetween: newSplitBetween,
      trip: newTrip,
      date: newDate || new Date().toISOString().split("T")[0],
      createdAt: new Date(),
    };

    setExpenses([...expenses, newExpense]);
    resetForm();
    setShowAddModal(false);
  };

  const resetForm = () => {
    setNewDescription("");
    setNewAmount("");
    setNewCurrency("USD");
    setNewCategory("food");
    setNewPaidBy("");
    setNewSplitBetween([]);
    setNewTrip("");
    setNewDate("");
  };

  const deleteExpense = (id: string) => {
    Alert.alert(
      "Delete Expense",
      "Are you sure you want to delete this expense?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => setExpenses(expenses.filter((e) => e.id !== id)),
        },
      ]
    );
  };

  const toggleSplitMember = (member: string) => {
    if (newSplitBetween.includes(member)) {
      setNewSplitBetween(newSplitBetween.filter((m) => m !== member));
    } else {
      setNewSplitBetween([...newSplitBetween, member]);
    }
  };

  const selectAllMembers = () => {
    setNewSplitBetween([...teamMembers]);
  };

  const formatCurrency = (amount: number, currency: string = baseCurrency) => {
    const currencyData = currencies.find((c) => c.code === currency);
    const symbol = currencyData?.symbol || "$";
    return `${symbol}${amount.toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  // Render bar chart
  const renderBarChart = () => {
    const categories = Object.keys(categoryConfig) as ExpenseCategory[];
    const maxValue = Math.max(...Object.values(totals.byCategory), 1);

    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Spending by Category</Text>
        <View style={styles.barChart}>
          {categories.map((category) => {
            const value = totals.byCategory[category];
            const percentage = (value / maxValue) * 100;
            const config = categoryConfig[category];

            return (
              <View key={category} style={styles.barRow}>
                <View style={styles.barLabelContainer}>
                  <Text style={styles.barIcon}>{config.icon}</Text>
                  <Text style={styles.barLabel}>{config.label}</Text>
                </View>
                <View style={styles.barContainer}>
                  <View
                    style={[
                      styles.bar,
                      {
                        width: `${Math.max(percentage, 2)}%`,
                        backgroundColor: config.color,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.barValue}>
                  {formatCurrency(value)}
                </Text>
              </View>
            );
          })}
        </View>

        {/* Donut-style summary */}
        <View style={styles.donutContainer}>
          <View style={styles.donutCenter}>
            <Text style={styles.donutTotal}>
              {formatCurrency(totals.total)}
            </Text>
            <Text style={styles.donutLabel}>Total Spent</Text>
          </View>
          <View style={styles.donutRing}>
            {categories.map((category, index) => {
              const value = totals.byCategory[category];
              const percentage = totals.total > 0 ? (value / totals.total) * 100 : 0;
              if (percentage < 1) return null;

              return (
                <View
                  key={category}
                  style={[
                    styles.donutSegment,
                    {
                      backgroundColor: categoryConfig[category].color,
                      flex: percentage,
                    },
                  ]}
                />
              );
            })}
          </View>
        </View>

        {/* Legend */}
        <View style={styles.legend}>
          {categories.map((category) => {
            const value = totals.byCategory[category];
            const percentage = totals.total > 0 ? (value / totals.total) * 100 : 0;
            const config = categoryConfig[category];

            return (
              <View key={category} style={styles.legendItem}>
                <View
                  style={[styles.legendDot, { backgroundColor: config.color }]}
                />
                <Text style={styles.legendLabel}>{config.label}</Text>
                <Text style={styles.legendPercent}>
                  {percentage.toFixed(0)}%
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  // Render summary view
  const renderSummary = () => (
    <View style={styles.summaryContainer}>
      {/* Your balance card */}
      <View style={styles.balanceCard}>
        <View style={styles.balanceHeader}>
          <Text style={styles.balanceTitle}>Your Balance</Text>
          <View
            style={[
              styles.balanceIndicator,
              {
                backgroundColor:
                  myTotalBalance > 0
                    ? colors.positive + "20"
                    : myTotalBalance < 0
                      ? colors.negative + "20"
                      : colors.neutral + "20",
              },
            ]}
          >
            <Text
              style={[
                styles.balanceIndicatorText,
                {
                  color:
                    myTotalBalance > 0
                      ? colors.positive
                      : myTotalBalance < 0
                        ? colors.negative
                        : colors.neutral,
                },
              ]}
            >
              {myTotalBalance > 0
                ? "You're owed"
                : myTotalBalance < 0
                  ? "You owe"
                  : "Settled up"}
            </Text>
          </View>
        </View>
        <Text
          style={[
            styles.balanceAmount,
            {
              color:
                myTotalBalance > 0
                  ? colors.positive
                  : myTotalBalance < 0
                    ? colors.negative
                    : colors.text,
            },
          ]}
        >
          {formatCurrency(Math.abs(myTotalBalance))}
        </Text>
      </View>

      {/* Individual balances */}
      {balances.length > 0 && (
        <View style={styles.balancesSection}>
          <Text style={styles.sectionTitle}>Balances</Text>
          {balances.map((balance) => (
            <View key={balance.person} style={styles.balanceRow}>
              <View style={styles.balancePersonInfo}>
                <View style={styles.avatarCircle}>
                  <Text style={styles.avatarText}>
                    {balance.person.charAt(0)}
                  </Text>
                </View>
                <View>
                  <Text style={styles.balancePerson}>{balance.person}</Text>
                  <Text style={styles.balanceDescription}>
                    {balance.balance > 0 ? "owes you" : "you owe"}
                  </Text>
                </View>
              </View>
              <Text
                style={[
                  styles.balanceRowAmount,
                  {
                    color:
                      balance.balance > 0 ? colors.positive : colors.negative,
                  },
                ]}
              >
                {balance.balance > 0 ? "+" : "-"}
                {formatCurrency(Math.abs(balance.balance))}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Suggested settlements */}
      {settlements.length > 0 && (
        <View style={styles.settlementsSection}>
          <Text style={styles.sectionTitle}>Suggested Settlements</Text>
          {settlements.map((settlement, index) => (
            <View key={index} style={styles.settlementRow}>
              <View style={styles.settlementPeople}>
                <View style={styles.smallAvatar}>
                  <Text style={styles.smallAvatarText}>
                    {settlement.from.charAt(0)}
                  </Text>
                </View>
                <View style={styles.settlementArrow}>
                  <Text style={styles.settlementArrowText}>→</Text>
                </View>
                <View style={styles.smallAvatar}>
                  <Text style={styles.smallAvatarText}>
                    {settlement.to.charAt(0)}
                  </Text>
                </View>
              </View>
              <View style={styles.settlementInfo}>
                <Text style={styles.settlementNames}>
                  {settlement.from} pays {settlement.to}
                </Text>
                <Text style={styles.settlementAmount}>
                  {formatCurrency(settlement.amount)}
                </Text>
              </View>
              <TouchableOpacity style={styles.settleButton}>
                <Text style={styles.settleButtonText}>Settle</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      {balances.length === 0 && settlements.length === 0 && (
        <View style={styles.allSettledCard}>
          <Text style={styles.allSettledIcon}>🎉</Text>
          <Text style={styles.allSettledText}>All settled up!</Text>
          <Text style={styles.allSettledSubtext}>
            No outstanding balances
          </Text>
        </View>
      )}
    </View>
  );

  // Render expenses list
  const renderExpenses = () => (
    <View style={styles.expensesContainer}>
      {filteredExpenses.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>💰</Text>
          <Text style={styles.emptyText}>No expenses yet</Text>
          <Text style={styles.emptySubtext}>
            Tap + to add your first expense
          </Text>
        </View>
      ) : (
        filteredExpenses.map((expense) => {
          const config = categoryConfig[expense.category];
          const myShare =
            expense.splitBetween.includes(currentUser)
              ? convertToBase(expense.amount, expense.currency) /
              expense.splitBetween.length
              : 0;
          const iPaid = expense.paidBy === currentUser;

          return (
            <TouchableOpacity
              key={expense.id}
              style={styles.expenseCard}
              onLongPress={() => deleteExpense(expense.id)}
            >
              <View
                style={[
                  styles.expenseIcon,
                  { backgroundColor: config.color + "20" },
                ]}
              >
                <Text style={styles.expenseIconText}>{config.icon}</Text>
              </View>
              <View style={styles.expenseContent}>
                <View style={styles.expenseHeader}>
                  <Text style={styles.expenseDescription} numberOfLines={1}>
                    {expense.description}
                  </Text>
                  <Text style={styles.expenseTotal}>
                    {formatCurrency(expense.amount, expense.currency)}
                  </Text>
                </View>
                <View style={styles.expenseMeta}>
                  <View style={styles.expenseMetaItem}>
                    <Text style={styles.expenseMetaLabel}>Paid by</Text>
                    <View
                      style={[
                        styles.paidByBadge,
                        iPaid && styles.paidByBadgeMine,
                      ]}
                    >
                      <Text
                        style={[
                          styles.paidByText,
                          iPaid && styles.paidByTextMine,
                        ]}
                      >
                        {iPaid ? "You" : expense.paidBy}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.expenseMetaItem}>
                    <Text style={styles.expenseMetaLabel}>Your share</Text>
                    <Text style={styles.expenseShare}>
                      {myShare > 0
                        ? formatCurrency(myShare)
                        : "—"}
                    </Text>
                  </View>
                </View>
                <View style={styles.expenseFooter}>
                  <Text style={styles.expenseDate}>
                    {formatDate(expense.date)}
                  </Text>
                  <View style={styles.splitInfo}>
                    <Text style={styles.splitText}>
                      Split {expense.splitBetween.length} ways
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.tripBadge,
                      { borderColor: config.color + "60" },
                    ]}
                  >
                    <Text style={styles.tripBadgeText}>{expense.trip}</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          );
        })
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.headerTitleSection}>
            <Text style={styles.headerTitle}>Budget</Text>
            <TouchableOpacity
              style={styles.currencySelector}
              onPress={() => setShowCurrencyModal(true)}
            >
              <Text style={styles.currencySelectorText}>{baseCurrency}</Text>
              <Text style={styles.currencySelectorArrow}>▼</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.totalBadge}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>
              {formatCurrency(totals.total)}
            </Text>
          </View>
        </View>
      </View>

      {/* View Mode Tabs */}
      <View style={styles.viewTabs}>
        <TouchableOpacity
          style={[styles.viewTab, viewMode === "expenses" && styles.viewTabActive]}
          onPress={() => setViewMode("expenses")}
          accessibilityRole="tab"
          accessibilityState={{ selected: viewMode === "expenses" }}
          accessibilityLabel="Expenses view"
        >
          <Text
            style={[
              styles.viewTabText,
              viewMode === "expenses" && styles.viewTabTextActive,
            ]}
          >
            Expenses
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.viewTab, viewMode === "summary" && styles.viewTabActive]}
          onPress={() => setViewMode("summary")}
          accessibilityRole="tab"
          accessibilityState={{ selected: viewMode === "summary" }}
          accessibilityLabel="Balances view"
        >
          <Text
            style={[
              styles.viewTabText,
              viewMode === "summary" && styles.viewTabTextActive,
            ]}
          >
            Balances
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.viewTab, viewMode === "chart" && styles.viewTabActive]}
          onPress={() => setViewMode("chart")}
          accessibilityRole="tab"
          accessibilityState={{ selected: viewMode === "chart" }}
          accessibilityLabel="Charts view"
        >
          <Text
            style={[
              styles.viewTabText,
              viewMode === "chart" && styles.viewTabTextActive,
            ]}
          >
            Charts
          </Text>
        </TouchableOpacity>
      </View>

      {/* Filters */}
      <View style={styles.filterBar}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            selectedTrip !== "All" && styles.filterButtonActive,
          ]}
          onPress={() => setShowTripFilter(true)}
        >
          <Text
            style={[
              styles.filterButtonText,
              selectedTrip !== "All" && styles.filterButtonTextActive,
            ]}
          >
            {selectedTrip === "All" ? "All Trips" : selectedTrip}
          </Text>
          <Text style={styles.filterArrow}>▼</Text>
        </TouchableOpacity>

        {viewMode === "expenses" && (
          <TouchableOpacity
            style={[
              styles.filterButton,
              selectedCategory !== "All" && styles.filterButtonActive,
            ]}
            onPress={() => setShowCategoryFilter(true)}
          >
            <Text
              style={[
                styles.filterButtonText,
                selectedCategory !== "All" && styles.filterButtonTextActive,
              ]}
            >
              {selectedCategory === "All"
                ? "All Categories"
                : categoryConfig[selectedCategory as ExpenseCategory].label}
            </Text>
            <Text style={styles.filterArrow}>▼</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {viewMode === "expenses" && renderExpenses()}
        {viewMode === "summary" && renderSummary()}
        {viewMode === "chart" && renderBarChart()}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowAddModal(true)}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel="Add new expense"
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      {/* Trip Filter Modal */}
      <Modal
        visible={showTripFilter}
        transparent
        animationType="fade"
        onRequestClose={() => setShowTripFilter(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowTripFilter(false)}
        >
          <View style={styles.filterModal}>
            <Text style={styles.filterModalTitle}>Select Trip</Text>
            {["All", ...trips].map((trip) => (
              <TouchableOpacity
                key={trip}
                style={[
                  styles.filterOption,
                  selectedTrip === trip && styles.filterOptionSelected,
                ]}
                onPress={() => {
                  setSelectedTrip(trip);
                  setShowTripFilter(false);
                }}
              >
                <Text
                  style={[
                    styles.filterOptionText,
                    selectedTrip === trip && styles.filterOptionTextSelected,
                  ]}
                >
                  {trip === "All" ? "All Trips" : trip}
                </Text>
                {selectedTrip === trip && (
                  <Text style={styles.filterCheck}>✓</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Category Filter Modal */}
      <Modal
        visible={showCategoryFilter}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCategoryFilter(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowCategoryFilter(false)}
        >
          <View style={styles.filterModal}>
            <Text style={styles.filterModalTitle}>Select Category</Text>
            <TouchableOpacity
              style={[
                styles.filterOption,
                selectedCategory === "All" && styles.filterOptionSelected,
              ]}
              onPress={() => {
                setSelectedCategory("All");
                setShowCategoryFilter(false);
              }}
            >
              <Text
                style={[
                  styles.filterOptionText,
                  selectedCategory === "All" && styles.filterOptionTextSelected,
                ]}
              >
                All Categories
              </Text>
              {selectedCategory === "All" && (
                <Text style={styles.filterCheck}>✓</Text>
              )}
            </TouchableOpacity>
            {(Object.keys(categoryConfig) as ExpenseCategory[]).map(
              (category) => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.filterOption,
                    selectedCategory === category && styles.filterOptionSelected,
                  ]}
                  onPress={() => {
                    setSelectedCategory(category);
                    setShowCategoryFilter(false);
                  }}
                >
                  <View style={styles.categoryFilterItem}>
                    <Text style={styles.categoryFilterIcon}>
                      {categoryConfig[category].icon}
                    </Text>
                    <Text
                      style={[
                        styles.filterOptionText,
                        selectedCategory === category &&
                        styles.filterOptionTextSelected,
                      ]}
                    >
                      {categoryConfig[category].label}
                    </Text>
                  </View>
                  {selectedCategory === category && (
                    <Text style={styles.filterCheck}>✓</Text>
                  )}
                </TouchableOpacity>
              )
            )}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Currency Selector Modal */}
      <Modal
        visible={showCurrencyModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCurrencyModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowCurrencyModal(false)}
        >
          <View style={styles.filterModal}>
            <Text style={styles.filterModalTitle}>Base Currency</Text>
            {currencies.map((currency) => (
              <TouchableOpacity
                key={currency.code}
                style={[
                  styles.filterOption,
                  baseCurrency === currency.code && styles.filterOptionSelected,
                ]}
                onPress={() => {
                  setBaseCurrency(currency.code);
                  setShowCurrencyModal(false);
                }}
              >
                <View style={styles.currencyOption}>
                  <Text style={styles.currencySymbol}>{currency.symbol}</Text>
                  <View>
                    <Text
                      style={[
                        styles.filterOptionText,
                        baseCurrency === currency.code &&
                        styles.filterOptionTextSelected,
                      ]}
                    >
                      {currency.code}
                    </Text>
                    <Text style={styles.currencyName}>{currency.name}</Text>
                  </View>
                </View>
                {baseCurrency === currency.code && (
                  <Text style={styles.filterCheck}>✓</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Add Expense Modal */}
      <Modal
        visible={showAddModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.addModalOverlay}
        >
          <View style={styles.addModalContent}>
            <View style={styles.addModalHeader}>
              <Text style={styles.addModalTitle}>Add Expense</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Text style={styles.addModalClose}>×</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.addModalScroll}>
              <Text style={styles.inputLabel}>Description *</Text>
              <TextInput
                style={styles.input}
                placeholder="What was this expense for?"
                value={newDescription}
                onChangeText={setNewDescription}
                placeholderTextColor={colors.textMuted}
              />

              <View style={styles.amountRow}>
                <View style={styles.amountInputContainer}>
                  <Text style={styles.inputLabel}>Amount *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="0.00"
                    value={newAmount}
                    onChangeText={setNewAmount}
                    keyboardType="decimal-pad"
                    placeholderTextColor={colors.textMuted}
                  />
                </View>
                <View style={styles.currencyInputContainer}>
                  <Text style={styles.inputLabel}>Currency</Text>
                  <View style={styles.currencyPicker}>
                    {currencies.slice(0, 3).map((currency) => (
                      <TouchableOpacity
                        key={currency.code}
                        style={[
                          styles.currencyPickerOption,
                          newCurrency === currency.code &&
                          styles.currencyPickerOptionSelected,
                        ]}
                        onPress={() => setNewCurrency(currency.code)}
                      >
                        <Text
                          style={[
                            styles.currencyPickerText,
                            newCurrency === currency.code &&
                            styles.currencyPickerTextSelected,
                          ]}
                        >
                          {currency.symbol}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>

              <Text style={styles.inputLabel}>Category *</Text>
              <View style={styles.categoryPicker}>
                {(Object.keys(categoryConfig) as ExpenseCategory[]).map(
                  (category) => (
                    <TouchableOpacity
                      key={category}
                      style={[
                        styles.categoryOption,
                        newCategory === category && {
                          backgroundColor: categoryConfig[category].color + "20",
                          borderColor: categoryConfig[category].color,
                        },
                      ]}
                      onPress={() => setNewCategory(category)}
                    >
                      <Text style={styles.categoryOptionIcon}>
                        {categoryConfig[category].icon}
                      </Text>
                      <Text
                        style={[
                          styles.categoryOptionText,
                          newCategory === category && {
                            color: categoryConfig[category].color,
                            fontWeight: "600",
                          },
                        ]}
                      >
                        {categoryConfig[category].label}
                      </Text>
                    </TouchableOpacity>
                  )
                )}
              </View>

              <Text style={styles.inputLabel}>Paid By *</Text>
              <View style={styles.memberPicker}>
                {teamMembers.map((member) => (
                  <TouchableOpacity
                    key={member}
                    style={[
                      styles.memberOption,
                      newPaidBy === member && styles.memberOptionSelected,
                    ]}
                    onPress={() => setNewPaidBy(member)}
                  >
                    <Text
                      style={[
                        styles.memberOptionText,
                        newPaidBy === member && styles.memberOptionTextSelected,
                      ]}
                    >
                      {member === currentUser ? "You" : member}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.splitHeader}>
                <Text style={styles.inputLabel}>Split Between *</Text>
                <TouchableOpacity onPress={selectAllMembers}>
                  <Text style={styles.selectAllText}>Select All</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.memberPicker}>
                {teamMembers.map((member) => (
                  <TouchableOpacity
                    key={member}
                    style={[
                      styles.memberOption,
                      newSplitBetween.includes(member) &&
                      styles.memberOptionSelected,
                    ]}
                    onPress={() => toggleSplitMember(member)}
                  >
                    <Text
                      style={[
                        styles.memberOptionText,
                        newSplitBetween.includes(member) &&
                        styles.memberOptionTextSelected,
                      ]}
                    >
                      {member === currentUser ? "You" : member}
                    </Text>
                    {newSplitBetween.includes(member) && (
                      <Text style={styles.memberCheck}>✓</Text>
                    )}
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.inputLabel}>Trip *</Text>
              <View style={styles.tripPicker}>
                {trips.map((trip) => (
                  <TouchableOpacity
                    key={trip}
                    style={[
                      styles.tripOption,
                      newTrip === trip && styles.tripOptionSelected,
                    ]}
                    onPress={() => setNewTrip(trip)}
                  >
                    <Text
                      style={[
                        styles.tripOptionText,
                        newTrip === trip && styles.tripOptionTextSelected,
                      ]}
                    >
                      {trip}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.inputLabel}>Date</Text>
              <TextInput
                style={styles.input}
                placeholder="YYYY-MM-DD (optional)"
                value={newDate}
                onChangeText={setNewDate}
                placeholderTextColor={colors.textMuted}
              />

              <TouchableOpacity
                style={styles.addButton}
                onPress={addExpense}
              >
                <Text style={styles.addButtonText}>Add Expense</Text>
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
    backgroundColor: colors.surface,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitleSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: colors.text,
    letterSpacing: -0.5,
  },
  currencySelector: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.cardBg,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  currencySelectorText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textSecondary,
    marginRight: 4,
  },
  currencySelectorArrow: {
    fontSize: 8,
    color: colors.textMuted,
  },
  totalBadge: {
    alignItems: "flex-end",
  },
  totalLabel: {
    fontSize: 11,
    fontWeight: "500",
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  totalValue: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.primary,
    letterSpacing: -0.5,
  },
  viewTabs: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    gap: 8,
  },
  viewTab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
    backgroundColor: colors.cardBg,
  },
  viewTabActive: {
    backgroundColor: colors.primary,
  },
  viewTabText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  viewTabTextActive: {
    color: colors.textInverse,
  },
  filterBar: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
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
  },
  filterButtonActive: {
    backgroundColor: colors.primary + "15",
    borderColor: colors.primary,
  },
  filterButtonText: {
    fontSize: 13,
    fontWeight: "500",
    color: colors.textSecondary,
    marginRight: 6,
  },
  filterButtonTextActive: {
    color: colors.primary,
    fontWeight: "600",
  },
  filterArrow: {
    fontSize: 9,
    color: colors.textMuted,
  },
  content: {
    flex: 1,
  },
  bottomSpacer: {
    height: 100,
  },

  // Expenses styles
  expensesContainer: {
    padding: 16,
  },
  expenseCard: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  expenseIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  expenseIconText: {
    fontSize: 22,
  },
  expenseContent: {
    flex: 1,
  },
  expenseHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  expenseDescription: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    flex: 1,
    marginRight: 12,
  },
  expenseTotal: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.text,
    letterSpacing: -0.3,
  },
  expenseMeta: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 10,
  },
  expenseMetaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  expenseMetaLabel: {
    fontSize: 12,
    color: colors.textMuted,
  },
  paidByBadge: {
    backgroundColor: colors.cardBg,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  paidByBadgeMine: {
    backgroundColor: colors.accent + "20",
  },
  paidByText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  paidByTextMine: {
    color: colors.accent,
  },
  expenseShare: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  expenseFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  expenseDate: {
    fontSize: 12,
    color: colors.textMuted,
  },
  splitInfo: {
    backgroundColor: colors.cardBg,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  splitText: {
    fontSize: 11,
    color: colors.textMuted,
  },
  tripBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tripBadgeText: {
    fontSize: 11,
    fontWeight: "500",
    color: colors.textSecondary,
  },

  // Summary styles
  summaryContainer: {
    padding: 16,
  },
  balanceCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  balanceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  balanceTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  balanceIndicator: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  balanceIndicatorText: {
    fontSize: 12,
    fontWeight: "600",
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: "800",
    letterSpacing: -1,
  },
  balancesSection: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 12,
  },
  balanceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  balancePersonInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary + "20",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.primary,
  },
  balancePerson: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.text,
  },
  balanceDescription: {
    fontSize: 12,
    color: colors.textMuted,
  },
  balanceRowAmount: {
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: -0.3,
  },
  settlementsSection: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  settlementRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  settlementPeople: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 12,
  },
  smallAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.cardBg,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: colors.surface,
  },
  smallAvatarText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  settlementArrow: {
    marginHorizontal: -4,
    zIndex: 1,
  },
  settlementArrowText: {
    fontSize: 16,
    color: colors.textMuted,
  },
  settlementInfo: {
    flex: 1,
  },
  settlementNames: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.text,
  },
  settlementAmount: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.primary,
    marginTop: 2,
  },
  settleButton: {
    backgroundColor: colors.accent,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  settleButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textInverse,
  },
  allSettledCard: {
    backgroundColor: colors.positive + "15",
    borderRadius: 16,
    padding: 32,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.positive + "30",
  },
  allSettledIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  allSettledText: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.positive,
    marginBottom: 4,
  },
  allSettledSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
  },

  // Chart styles
  chartContainer: {
    padding: 16,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 20,
  },
  barChart: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  barRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  barLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: 100,
  },
  barIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  barLabel: {
    fontSize: 13,
    fontWeight: "500",
    color: colors.textSecondary,
  },
  barContainer: {
    flex: 1,
    height: 24,
    backgroundColor: colors.cardBg,
    borderRadius: 6,
    marginHorizontal: 12,
    overflow: "hidden",
  },
  bar: {
    height: "100%",
    borderRadius: 6,
    minWidth: 4,
  },
  barValue: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.text,
    width: 70,
    textAlign: "right",
  },
  donutContainer: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 24,
    marginBottom: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  donutCenter: {
    alignItems: "center",
    marginBottom: 20,
  },
  donutTotal: {
    fontSize: 32,
    fontWeight: "800",
    color: colors.text,
    letterSpacing: -1,
  },
  donutLabel: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 4,
  },
  donutRing: {
    flexDirection: "row",
    width: "100%",
    height: 12,
    borderRadius: 6,
    overflow: "hidden",
    backgroundColor: colors.cardBg,
  },
  donutSegment: {
    height: "100%",
  },
  legend: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  legendLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
    color: colors.text,
  },
  legendPercent: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textSecondary,
  },

  // Empty state
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.textSecondary,
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textMuted,
  },

  // FAB
  fab: {
    position: "absolute",
    right: 20,
    bottom: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  fabText: {
    fontSize: 32,
    color: colors.textInverse,
    fontWeight: "300",
    lineHeight: 32,
  },

  // Modals
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  filterModal: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 8,
    width: "100%",
    maxWidth: 340,
    maxHeight: "80%",
  },
  filterModalTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.text,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  filterOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderRadius: 10,
    marginHorizontal: 8,
    marginVertical: 2,
  },
  filterOptionSelected: {
    backgroundColor: colors.primary + "12",
  },
  filterOptionText: {
    fontSize: 15,
    fontWeight: "500",
    color: colors.text,
  },
  filterOptionTextSelected: {
    color: colors.primary,
    fontWeight: "600",
  },
  filterCheck: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.primary,
  },
  categoryFilterItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  categoryFilterIcon: {
    fontSize: 18,
  },
  currencyOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  currencySymbol: {
    fontSize: 20,
    fontWeight: "600",
    color: colors.textSecondary,
    width: 28,
    textAlign: "center",
  },
  currencyName: {
    fontSize: 12,
    color: colors.textMuted,
  },

  // Add Modal
  addModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  addModalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "90%",
    paddingBottom: 40,
  },
  addModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  addModalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.text,
  },
  addModalClose: {
    fontSize: 32,
    color: colors.textMuted,
    fontWeight: "300",
    lineHeight: 32,
  },
  addModalScroll: {
    padding: 20,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textSecondary,
    marginBottom: 8,
    marginTop: 16,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: colors.cardBg,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  amountRow: {
    flexDirection: "row",
    gap: 12,
  },
  amountInputContainer: {
    flex: 2,
  },
  currencyInputContainer: {
    flex: 1,
  },
  currencyPicker: {
    flexDirection: "row",
    gap: 8,
  },
  currencyPickerOption: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: colors.cardBg,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  currencyPickerOptionSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  currencyPickerText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  currencyPickerTextSelected: {
    color: colors.textInverse,
  },
  categoryPicker: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  categoryOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: colors.cardBg,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 6,
  },
  categoryOptionIcon: {
    fontSize: 16,
  },
  categoryOptionText: {
    fontSize: 13,
    fontWeight: "500",
    color: colors.textSecondary,
  },
  memberPicker: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  memberOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: colors.cardBg,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 6,
  },
  memberOptionSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  memberOptionText: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.textSecondary,
  },
  memberOptionTextSelected: {
    color: colors.textInverse,
  },
  memberCheck: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.textInverse,
  },
  splitHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
    marginBottom: 8,
  },
  selectAllText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.primary,
  },
  tripPicker: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tripOption: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: colors.cardBg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tripOptionSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  tripOptionText: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.textSecondary,
  },
  tripOptionTextSelected: {
    color: colors.textInverse,
  },
  addButton: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    padding: 18,
    alignItems: "center",
    marginTop: 28,
  },
  addButtonText: {
    color: colors.textInverse,
    fontSize: 17,
    fontWeight: "700",
  },
});

