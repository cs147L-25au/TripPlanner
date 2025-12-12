import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

interface TaskTimerProps {
    completeBy: string;
    completed: boolean;
}

export default function TaskTimer({ completeBy, completed }: TaskTimerProps) {
    const [timeRemaining, setTimeRemaining] = useState<string>('');
    const [isOverdue, setIsOverdue] = useState(false);
    const pulseAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        const calculateTimeRemaining = () => {
            if (completed || completeBy === 'TBD') {
                setTimeRemaining('');
                pulseAnim.setValue(1);
                return;
            }

            const parseDate = (dateString: string): Date => {
                if (dateString.includes('/')) {
                    const [month, day, year] = dateString.split('/');
                    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
                }
                return new Date(dateString);
            };

            const dueDate = parseDate(completeBy);
            const now = new Date();
            const diff = dueDate.getTime() - now.getTime();

            if (diff < 0) {
                setIsOverdue(true);
                const daysOverdue = Math.floor(Math.abs(diff) / (1000 * 60 * 60 * 24));
                setTimeRemaining(`${daysOverdue}d overdue`);

                // Start pulsing animation for overdue items
                Animated.loop(
                    Animated.sequence([
                        Animated.timing(pulseAnim, {
                            toValue: 1.1,
                            duration: 1000,
                            useNativeDriver: true,
                        }),
                        Animated.timing(pulseAnim, {
                            toValue: 1,
                            duration: 1000,
                            useNativeDriver: true,
                        }),
                    ])
                ).start();
            } else {
                setIsOverdue(false);
                pulseAnim.setValue(1);
                const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

                if (days > 0) {
                    setTimeRemaining(`${days}d ${hours}h`);
                } else if (hours > 0) {
                    setTimeRemaining(`${hours}h`);
                } else {
                    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                    setTimeRemaining(`${minutes}m`);
                }
            }
        };

        calculateTimeRemaining();
        const interval = setInterval(calculateTimeRemaining, 60000); // Update every minute

        return () => {
            clearInterval(interval);
            pulseAnim.stopAnimation();
        };
    }, [completeBy, completed, pulseAnim]);

    if (!timeRemaining) return null;

    return (
        <Animated.View
            style={[
                styles.container,
                isOverdue && styles.overdue,
                {
                    transform: [{ scale: pulseAnim }],
                },
            ]}
            accessibilityLabel={`Time remaining: ${timeRemaining}`}
            accessibilityRole="text"
        >
            <Text style={[styles.text, isOverdue && styles.overdueText]}>
                ⏱ {timeRemaining}
            </Text>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        backgroundColor: '#5B9A8B20',
    },
    overdue: {
        backgroundColor: '#D87A7A20',
    },
    text: {
        fontSize: 11,
        fontWeight: '600',
        color: '#5B9A8B',
    },
    overdueText: {
        color: '#D87A7A',
    },
});

