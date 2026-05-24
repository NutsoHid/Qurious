import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import BottomTabNavigator from './BottomTabNavigator';

const Drawer = createDrawerNavigator();

export default function DrawerNavigator() {
  return (
    <Drawer.Navigator screenOptions={{ headerShown: false }}>
      <Drawer.Screen name="Trending" component={BottomTabNavigator} />
      <Drawer.Screen name="Health" component={BottomTabNavigator} />
      <Drawer.Screen name="Social" component={BottomTabNavigator} />
    </Drawer.Navigator>
  );
}