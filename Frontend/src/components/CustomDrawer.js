import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

export default function CustomDrawer({ visible, onClose, onSelectCategory }) {
  
  // Added 'Education' to the topics list!
  const categories = [
    { name: 'All', icon: 'home-outline' },
    { name: 'Health', icon: 'medkit-outline' },
    { name: 'Education', icon: 'school-outline' },
    { name: 'Social', icon: 'people-outline' },
  ];

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        {/* Dark Background Dimmer */}
        <TouchableOpacity style={styles.dimmer} onPress={onClose} activeOpacity={1} />
        
        {/* Sliding Drawer Panel */}
        <View style={styles.drawer}>
          <View style={styles.header}>
            <Text style={styles.brand}>Qurious.</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={28} color="#111827" />
            </TouchableOpacity>
          </View>

          <Text style={styles.sectionTitle}>Topics</Text>

          {categories.map((cat) => (
            <TouchableOpacity 
              key={cat.name} 
              style={styles.menuItem}
              onPress={() => onSelectCategory(cat.name)}
            >
              <Ionicons name={cat.icon} size={24} color="#6B7280" style={styles.icon} />
              <Text style={styles.menuText}>{cat.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, flexDirection: 'row' },
  dimmer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
  drawer: { 
    position: 'absolute', 
    left: 0, 
    top: 0, 
    width: width * 0.75, 
    height: '100%', 
    backgroundColor: '#fff', 
    paddingTop: 60, 
    paddingHorizontal: 20, 
    shadowColor: '#000', 
    shadowOpacity: 0.3, 
    shadowRadius: 15, 
    elevation: 20 
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 },
  brand: { fontSize: 26, fontWeight: '800', color: '#0088cc' },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase', marginBottom: 15, letterSpacing: 1 },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 15, borderRadius: 12, marginBottom: 5 },
  icon: { marginRight: 15 },
  menuText: { fontSize: 17, color: '#4B5563', fontWeight: '600' }
});