import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function CustomHeader({ onMenuPress }) {
  
  const handleComingSoon = (feature) => {
    Alert.alert("Coming Soon", `${feature} will be available soon!`);
  };

  return (
    <View style={styles.headerContainer}>
      <TouchableOpacity onPress={onMenuPress} style={styles.menuIcon}>
        <Ionicons name="menu-outline" size={32} color="#1a1a1a" />
      </TouchableOpacity>

      <View style={styles.logoWrapper}>
        <Ionicons name="chatbubbles" size={24} color="#0088cc" style={styles.logoIcon} />
        <Text style={styles.logoTextBase}>
          Qu<Text style={styles.logoTextHighlight}>rious</Text>
        </Text>
      </View>

      <TouchableOpacity style={styles.messageBtn} onPress={() => handleComingSoon('Messages')}>
        <Ionicons name="chatbubble-ellipses-outline" size={26} color="#1a1a1a" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  menuIcon: {
    paddingRight: 10,
  },
  logoWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
  },
  logoIcon: {
    marginRight: 4,
    marginTop: 2,
  },
  logoTextBase: {
    fontSize: 26,
    fontWeight: '900',
    color: '#1a1a1a', 
    letterSpacing: -1,
  },
  logoTextHighlight: {
    color: '#0088cc',
  },
  messageBtn: {
    paddingLeft: 10,
  }
});