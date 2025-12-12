import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Platform } from 'react-native';
import { Calendar } from 'react-native-calendars';

interface DatePickerProps {
    value: string;
    onChange: (date: string) => void;
    placeholder?: string;
    label?: string;
}

export default function DatePicker({ value, onChange, placeholder, label }: DatePickerProps) {
    const [showCalendar, setShowCalendar] = useState(false);
    const [selectedDate, setSelectedDate] = useState(value || '');

    const formatDate = (dateString: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const year = date.getFullYear();
        return `${month}/${day}/${year}`;
    };

    const handleDateSelect = (day: any) => {
        const dateStr = day.dateString;
        setSelectedDate(dateStr);
        onChange(dateStr);
        setShowCalendar(false);
    };

    return (
        <View style={styles.container}>
            {label && <Text style={styles.label}>{label}</Text>}
            <TouchableOpacity
                style={styles.input}
                onPress={() => setShowCalendar(true)}
            >
                <Text style={[styles.inputText, !selectedDate && styles.placeholder]}>
                    {selectedDate ? formatDate(selectedDate) : placeholder || 'Select date'}
                </Text>
                <Text style={styles.calendarIcon}>📅</Text>
            </TouchableOpacity>

            <Modal
                visible={showCalendar}
                transparent
                animationType="slide"
                onRequestClose={() => setShowCalendar(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Select Date</Text>
                            <TouchableOpacity onPress={() => setShowCalendar(false)}>
                                <Text style={styles.modalClose}>×</Text>
                            </TouchableOpacity>
                        </View>
                        <Calendar
                            onDayPress={handleDateSelect}
                            markedDates={{
                                [selectedDate]: {
                                    selected: true,
                                    selectedColor: '#E67E5A',
                                },
                            }}
                            theme={{
                                backgroundColor: '#FFFFFF',
                                calendarBackground: '#FFFFFF',
                                textSectionTitleColor: '#3D2F2A',
                                selectedDayBackgroundColor: '#E67E5A',
                                selectedDayTextColor: '#FFFFFF',
                                todayTextColor: '#E67E5A',
                                dayTextColor: '#3D2F2A',
                                textDisabledColor: '#A68B7A',
                                dotColor: '#E67E5A',
                                selectedDotColor: '#FFFFFF',
                                arrowColor: '#E67E5A',
                                monthTextColor: '#3D2F2A',
                                textDayFontWeight: '500',
                                textMonthFontWeight: 'bold',
                                textDayHeaderFontWeight: '600',
                                textDayFontSize: 16,
                                textMonthFontSize: 18,
                                textDayHeaderFontSize: 14,
                            }}
                        />
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 8,
    },
    label: {
        fontSize: 13,
        fontWeight: '600',
        color: '#3D2F2A',
        marginBottom: 8,
        marginTop: 16,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    input: {
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        padding: 14,
        fontSize: 15,
        borderWidth: 1,
        borderColor: '#E8D5C8',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    inputText: {
        fontSize: 15,
        color: '#3D2F2A',
        flex: 1,
    },
    placeholder: {
        color: '#8B6F5E',
    },
    calendarIcon: {
        fontSize: 20,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#E8D5C8',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#3D2F2A',
    },
    modalClose: {
        fontSize: 28,
        color: '#8B6F5E',
        fontWeight: '300',
        lineHeight: 28,
    },
});

