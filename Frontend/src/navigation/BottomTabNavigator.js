import React, { useRef, useEffect } from 'react';
import { Animated, View, StyleSheet, Platform, TouchableOpacity } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

// Import screens using your exact folder path structure
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import NotificationScreen from '../screens/NotificationScreen';
import CreateScreen from '../screens/CreateScreen'; 
import OtherUserProfileScreen from '../screens/OtherUserProfileScreen'; 

const Tab = createBottomTabNavigator();
const ProfileStack = createStackNavigator();
const RootStack = createStackNavigator(); 

function ProfileStackNavigator() {
  return (
    <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
      <ProfileStack.Screen name="ProfileMain" component={ProfileScreen} />
      <ProfileStack.Screen name="EditProfile" component={EditProfileScreen} />
    </ProfileStack.Navigator>
  );
}

// 1. FIXED ANIMATION COMPONENT
// 1. FIXED ANIMATION COMPONENT
const PaytmTabButton = (props) => {
  const { children, onPress, accessibilityState } = props;
  const focused = accessibilityState?.selected ?? false;
  
  // Initialize Animated Value safely
  const animationValue = useRef(new Animated.Value(focused ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(animationValue, {
      toValue: focused ? 1 : 0,
      useNativeDriver: true, // MUST be true for transform animations (translateY)
      friction: 6,
      tension: 45,
    }).start();
  }, [focused, animationValue]);

  // The lines that were throwing the error are now safe and fixed
  const translateY = animationValue.interpolate({
    inputRange:[0,0], // Added the missing array here
    outputRange: [0, -12], 
  });

  return (
    <TouchableOpacity activeOpacity={1} onPress={onPress} style={styles.containerButton}>
      <Animated.View 
        style={[
          focused ? styles.activeWhiteCircle : styles.inactiveIconWrapper,
          { transform: [{ translateY }] }
        ]}
      >
        {children}
      </Animated.View>
    </TouchableOpacity>
  );
};

function MainTabNavigator() {
  return (
    <Tab.Navigator 
      screenOptions={{ 
        headerShown: false, 
        tabBarShowLabel: false,
        tabBarStyle: styles.tabBar,
      }}
    >
      <Tab.Screen 
        name="HomeTab" 
        component={HomeScreen} 
        options={{ 
          tabBarIcon: ({ focused }) => (
            <Ionicons 
              name={focused ? "home" : "home-outline"} 
              size={24} 
              color={focused ? "#0088cc" : "#9CA3AF"} 
            />
          ),
          // 2. FIXED: Removed inline function to prevent unmounting crashes
          tabBarButton: PaytmTabButton
        }} 
      />

      <Tab.Screen 
        name="YouTab" 
        component={ProfileStackNavigator} 
        options={{ 
          tabBarIcon: ({ focused }) => (
            <Ionicons 
              name={focused ? "person" : "person-outline"} 
              size={25} 
              color={focused ? "#0088cc" : "#9CA3AF"} 
            />
          ),
          tabBarButton: PaytmTabButton
        }} 
      />

      <Tab.Screen 
        name="MessageTab" 
        component={NotificationScreen} 
        options={{ 
          tabBarIcon: ({ focused }) => (
            <Ionicons 
              name={focused ? "chatbubbles" : "chatbubbles-outline"} 
              size={24} 
              color={focused ? "#0088cc" : "#9CA3AF"} 
            />
          ),
          tabBarButton: PaytmTabButton
        }} 
      />
    </Tab.Navigator>
  );
}

export default function BottomTabNavigator() {
  return (
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      <RootStack.Screen name="MainTabs" component={MainTabNavigator} />
      <RootStack.Screen 
        name="CreateScreen" 
        component={CreateScreen} 
        options={{ presentation: 'modal' }} 
      />
      <RootStack.Screen 
        name="OtherUserProfile" 
        component={OtherUserProfileScreen} 
      />
    </RootStack.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    height: Platform.OS === 'ios' ? 88 : 74,
    paddingBottom: Platform.OS === 'ios' ? 24 : 14,
    paddingTop: 8,
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'visible',
    elevation: 25,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
  },
  containerButton: { flex: 1, justifyContent: 'center', alignItems: 'center', overflow: 'visible' },
  activeWhiteCircle: { width: 54, height: 54, borderRadius: 27, backgroundColor: '#ffffff', justifyContent: 'center', alignItems: 'center', elevation: 6, shadowColor: '#000000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 6, borderWidth: 1, borderColor: '#F3F4F6' },
  inactiveIconWrapper: { width: 50, height: 50, justifyContent: 'center', alignItems: 'center', marginBottom: Platform.OS === 'ios' ? 0 : 4 }
});