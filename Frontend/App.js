import 'react-native-gesture-handler';
import React, { useContext } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// Import our context
import { AuthProvider, AuthContext } from './src/context/AuthContext';

// Import Screens
import BottomTabNavigator from './src/navigation/BottomTabNavigator';
import SearchScreen from './src/screens/SearchScreen';
import LoginScreen from './src/screens/LoginScreen';
import SignupScreen from './src/screens/SignupScreen';

const Stack = createStackNavigator();

// We create a separate component to use the AuthContext
function RootNavigator() {
  const { user, isLoading } = useContext(AuthContext);

  if (isLoading) {
    // Show a loading spinner while checking if the user is logged in
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0088cc" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        // 🟢 IF USER IS LOGGED IN -> Show the Main App
        <>
          <Stack.Screen name="MainTabs" component={BottomTabNavigator} />
          <Stack.Screen 
            name="Search" 
            component={SearchScreen} 
            options={{ presentation: 'modal' }} 
          />
        </>
      ) : (
        // 🔴 IF USER IS NOT LOGGED IN -> Force them to Auth Screens
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Signup" component={SignupScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}

// Wrap the whole app in the AuthProvider
export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}