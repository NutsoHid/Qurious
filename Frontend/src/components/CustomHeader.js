import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function CustomHeader({ onMenuPress, onCreatePress }) {
  return (
    <View style={styles.headerContainer}>
      
      {/* Menu/Hamburger Button */}
      <TouchableOpacity onPress={onMenuPress} style={styles.iconBtn}>
        <Ionicons name="menu" size={28} color="#111827" />
      </TouchableOpacity>

      {/* App Title */}
      <Text style={styles.headerTitle}>Qurious</Text>

      {/* Create Post Icon Header Interface */}
      <TouchableOpacity style={styles.iconBtn} onPress={onCreatePress}>
        <Ionicons name="add-circle-outline" size={28} color="#111827" />
      </TouchableOpacity>
      
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 16, 
    paddingVertical: 12, 
    backgroundColor: '#fff', 
    borderBottomWidth: 1, 
    borderBottomColor: '#f3f4f6' 
  },
  headerTitle: { 
    fontSize: 22, 
    fontWeight: '800', 
    color: '#0088cc',
    letterSpacing: -0.5
  },
  iconBtn: {
    padding: 4
  }
});