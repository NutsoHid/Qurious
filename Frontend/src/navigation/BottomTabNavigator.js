import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

// Import all your screens
import HomeScreen from '../screens/HomeScreen';
import CreateScreen from '../screens/CreateScreen';
import NotificationScreen from '../screens/NotificationScreen';
import ProfileScreen from '../screens/ProfileScreen';
import EditProfileScreen from '../screens/EditProfileScreen'; // MUST IMPORT THIS

const Tab = createBottomTabNavigator();
const ProfileStack = createStackNavigator(); // ADD A STACK JUST FOR PROFILE

// Create a mini-navigator for the Profile section
function ProfileStackNavigator() {
  return (
    <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
      <ProfileStack.Screen name="ProfileMain" component={ProfileScreen} />
      <ProfileStack.Screen name="EditProfile" component={EditProfileScreen} />
    </ProfileStack.Navigator>
  );
}

export default function BottomTabNavigator() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false, tabBarActiveTintColor: '#0088cc' }}>
      <Tab.Screen 
        name="HomeTab" 
        component={HomeScreen} 
        options={{ tabBarIcon: ({color}) => <Ionicons name="home-outline" size={24} color={color} />, tabBarLabel: 'Home' }} 
      />
      <Tab.Screen 
        name="CreateTab" 
        component={CreateScreen} 
        options={{ tabBarIcon: ({color}) => <Ionicons name="add-circle" size={28} color={color} />, tabBarLabel: 'Create' }} 
      />
      <Tab.Screen 
        name="InboxTab" 
        component={NotificationScreen} 
        options={{ tabBarIcon: ({color}) => <Ionicons name="notifications-outline" size={24} color={color} />, tabBarLabel: 'Inbox' }} 
      />
      {/* USE THE STACK HERE, NOT JUST PROFILESCREEN */}
      <Tab.Screen 
        name="YouTab" 
        component={ProfileStackNavigator} 
        options={{ tabBarIcon: ({color}) => <Ionicons name="person-circle-outline" size={28} color={color} />, tabBarLabel: 'You' }} 
      />
    </Tab.Navigator>
  );
}