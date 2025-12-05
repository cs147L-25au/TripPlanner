import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Modal,
} from "react-native";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";

// Categories with icons
const categories = {
  food: { icon: "🍽️", label: "Food", color: "#F4A259" },
  transport: { icon: "✈️", label: "Transport", color: "#4ECDC4" },
  lodging: { icon: "🏠", label: "Lodging", color: "#E85D4C" },
  activities: { icon: "🎯", label: "Activities", color: "#9B5DE5" },
  other: { icon: "📦", label: "Other", color: "#6B6560" },
};

type Category = keyof typeof categories;

// Simple expense type
interface Expense {
  id: string;
  description: string;
  amount: number;
  paidBy: string;
  date: string;
  category: Category;
}

// Colors
const colors = {
  primary: "#E85D4C",
  background: "#FFFAF6",
  surface: "#FFFFFF",
  text: "#2D2A26",
  textLight: "#6B6560",
  border: "#E8E0D8",
  accent: "#4ECDC4",
};

export default function BudgetTrackerScreen() {
  const [expenses, setExpenses] = useState<Expense[]>([
    { id: "1", description: "Airbnb", amount: 450, paidBy: "Kevin", date: "Jun 15", category: "lodging" },
    { id: "2", description: "Flight tickets", amount: 320, paidBy: "Claudia", date: "Jun 15", category: "transport" },
    { id: "3", description: "Dinner", amount: 180, paidBy: "Sohrab", date: "Jun 16", category: "food" },
    { id: "4", description: "Ski passes", amount: 280, paidBy: "Adrian", date: "Jun 17", category: "activities" },
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newDescription, setNewDescription] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const [newPaidBy, setNewPaidBy] = useState("");
  const [newCategory, setNewCategory] = useState<Category>("food");

  const teamMembers = ["Claudia", "Sohrab", "Adrian", "Kevin"];

  const total = expenses.reduce((sum, e) => sum + e.amount, 0);

  const addExpense = () => {
    if (!newDescription || !newAmount || !newPaidBy) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }

    const expense: Expense = {
      id: Date.now().toString(),
      description: newDescription,
      amount: parseFloat(newAmount),
      paidBy: newPaidBy,
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      category: newCategory,
    };

    setExpenses([...expenses, expense]);
    setNewDescription("");
    setNewAmount("");
    setNewPaidBy("");
    setNewCategory("food");
    setShowAddModal(false);
  };

  const deleteExpense = (id: string) => {
    Alert.alert("Delete", "Remove this expense?", [
      { text: "Cancel" },
      { text: "Delete", style: "destructive", onPress: () => setExpenses(expenses.filter(e => e.id !== id)) },
    ]);
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Budget</Text>
          <View style={styles.totalBox}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalAmount}>${total.toFixed(2)}</Text>
          </View>
        </View>

        <ScrollView style={styles.list}>
          {expenses.map((expense) => (
            <TouchableOpacity
              key={expense.id}
              style={styles.expenseCard}
              onLongPress={() => deleteExpense(expense.id)}
            >
              <View style={[styles.categoryIcon, { backgroundColor: categories[expense.category].color + "20" }]}>
                <Text style={styles.categoryEmoji}>{categories[expense.category].icon}</Text>
              </View>
              <View style={styles.expenseLeft}>
                <Text style={styles.expenseDescription}>{expense.description}</Text>
                <Text style={styles.expenseMeta}>Paid by {expense.paidBy} • {expense.date}</Text>
              </View>
              <Text style={styles.expenseAmount}>${expense.amount.toFixed(2)}</Text>
            </TouchableOpacity>
          ))}

          <View style={styles.breakdownSection}>
            <Text style={styles.sectionTitle}>Per Person</Text>
            {teamMembers.map((member) => {
              const paid = expenses.filter(e => e.paidBy === member).reduce((sum, e) => sum + e.amount, 0);
              const share = total / teamMembers.length;
              const balance = paid - share;
              
              return (
                <View key={member} style={styles.personRow}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{member[0]}</Text>
                  </View>
                  <Text style={styles.personName}>{member}</Text>
                  <Text style={[styles.personBalance, { color: balance >= 0 ? colors.accent : colors.primary }]}>
                    {balance >= 0 ? "+" : ""}{balance.toFixed(2)}
                  </Text>
                </View>
              );
            })}
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>

       <TouchableOpacity style={styles.fab} onPress={() => setShowAddModal(true)}>
          <Text style={styles.fabText}>+</Text>
        </TouchableOpacity>


        <Modal visible={showAddModal} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Add Expense</Text>
                <TouchableOpacity onPress={() => setShowAddModal(false)}>
                  <Text style={styles.modalClose}>✕</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.label}>Description</Text>
              <TextInput
                style={styles.input}
                placeholder="What was it for?"
                value={newDescription}
                onChangeText={setNewDescription}
              />

              <Text style={styles.label}>Amount</Text>
              <TextInput
                style={styles.input}
                placeholder="0.00"
                value={newAmount}
                onChangeText={setNewAmount}
                keyboardType="decimal-pad"
              />

              <Text style={styles.label}>Category</Text>
              <View style={styles.categoryPicker}>
                {(Object.keys(categories) as Category[]).map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.categoryBtn,
                      newCategory === cat && { backgroundColor: categories[cat].color + "20", borderColor: categories[cat].color }
                    ]}
                    onPress={() => setNewCategory(cat)}
                  >
                    <Text style={styles.categoryBtnIcon}>{categories[cat].icon}</Text>
                    <Text style={[styles.categoryBtnText, newCategory === cat && { color: categories[cat].color }]}>
                      {categories[cat].label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>Paid By</Text>
              <View style={styles.memberPicker}>
                {teamMembers.map((member) => (
                  <TouchableOpacity
                    key={member}
                    style={[styles.memberBtn, newPaidBy === member && styles.memberBtnActive]}
                    onPress={() => setNewPaidBy(member)}
                  >
                    <Text style={[styles.memberBtnText, newPaidBy === member && styles.memberBtnTextActive]}>
                      {member}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity style={styles.addBtn} onPress={addExpense}>
                <Text style={styles.addBtnText}>Add Expense</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: colors.text,
  },
  totalBox: {
    alignItems: "flex-end",
  },
  totalLabel: {
    fontSize: 12,
    color: colors.textLight,
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.primary,
  },
  list: {
    flex: 1,
    padding: 16,
  },
  expenseCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  categoryEmoji: {
    fontSize: 22,
  },
  expenseLeft: {
    flex: 1,
  },
  expenseDescription: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 4,
  },
  expenseMeta: {
    fontSize: 13,
    color: colors.textLight,
  },
  expenseAmount: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
  },
  breakdownSection: {
    marginTop: 20,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 12,
  },
  personRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary + "20",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.primary,
  },
  personName: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
  },
  personBalance: {
    fontSize: 16,
    fontWeight: "bold",
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 30,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  fabText: {
    fontSize: 28,
    color: "#fff",
    fontWeight: "300",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.text,
  },
  modalClose: {
    fontSize: 20,
    color: colors.textLight,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textLight,
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    backgroundColor: colors.background,
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryPicker: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  categoryBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: colors.background,
    borderWidth: 1.5,
    borderColor: colors.border,
    gap: 6,
  },
  categoryBtnIcon: {
    fontSize: 16,
  },
  categoryBtnText: {
    fontSize: 13,
    fontWeight: "500",
    color: colors.textLight,
  },
  memberPicker: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  memberBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  memberBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  memberBtnText: {
    fontSize: 14,
    color: colors.textLight,
  },
  memberBtnTextActive: {
    color: "#fff",
  },
  addBtn: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginTop: 24,
  },
  addBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});