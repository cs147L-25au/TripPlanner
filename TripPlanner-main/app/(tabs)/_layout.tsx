import { Tabs } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function TabsLayout() {
    return (
        <>
            <StatusBar style="auto" />
            <Tabs
                screenOptions={{
                    headerStyle: {
                        backgroundColor: '#b2d8d8',
                    },
                    headerTintColor: '#006666',
                    headerTitleStyle: {
                        fontWeight: 'bold',
                        fontSize: 28,
                    },
                    tabBarActiveTintColor: '#E67E5A',
                    tabBarInactiveTintColor: '#8B6F5E',
                }}
            >
                <Tabs.Screen
                    name="index"
                    options={{
                        title: 'Home',
                        tabBarLabel: 'Home',
                    }}
                />
                <Tabs.Screen
                    name="collab_planner_147"
                    options={{
                        title: 'Planner',
                        tabBarLabel: 'Planner',
                    }}
                />
                <Tabs.Screen
                    name="budget_tracker"
                    options={{
                        title: 'Budget',
                        tabBarLabel: 'Budget',
                    }}
                />
            </Tabs>
        </>
    );
}

