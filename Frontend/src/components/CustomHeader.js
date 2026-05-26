import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function CustomHeader({ onMenuPress, onMessagePress }) {
  return (
    <View style={styles.headerContainer}>
      
      {/* Menu Button */}
      <TouchableOpacity onPress={onMenuPress} style={styles.iconBtn}>
        <Ionicons name="menu" size={28} color="#111827" />
      </TouchableOpacity>

      {/* App Title */}
      <Text style={styles.headerTitle}>Qurious</Text>

      {/* Message Button (Replaced Search) */}
      <TouchableOpacity style={styles.iconBtn} onPress={onMessagePress}>
        <Ionicons name="chatbubbles-outline" size={26} color="#111827" />
      </TouchableOpacity>
      
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 15, 
    paddingVertical: 12, 
    backgroundColor: '#fff', 
    borderBottomWidth: 1, 
    borderBottomColor: '#f0f0f0' 
  },
  headerTitle: { 
    fontSize: 22, 
    fontWeight: '800', 
    color: '#0088cc',
    letterSpacing: -0.5
  },
  iconBtn: {
    padding: 5
  }
});