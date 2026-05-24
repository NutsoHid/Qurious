import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'; 
import { Ionicons } from '@expo/vector-icons';

export default function CustomDrawer({ visible, onClose, onSelectCategory }) {
  const handleCategoryPress = (category) => {
    if (onSelectCategory) {
      onSelectCategory(category);
    } else {
      onClose(); 
    }
  };

  const handleComingSoon = (featureName) => {
    Alert.alert("Coming Soon", `${featureName} will be available soon!`);
    onClose();
  };

  return (
    <Modal visible={visible} transparent={true} animationType="fade">
      <View style={styles.overlay}>
        <Pressable style={styles.backgroundDimmer} onPress={onClose} />
        
        <SafeAreaView style={styles.drawerContainer} edges={['top', 'bottom', 'left']}>
          
          <View style={styles.header}>
            <View style={styles.logoWrapper}>
              <Ionicons name="chatbubbles" size={28} color="#0088cc" style={styles.logoIcon} />
              <Text style={styles.logoTextBase}>
                Qu<Text style={styles.logoTextHighlight}>rious</Text>
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} activeOpacity={0.6}>
              <Ionicons name="close" size={28} color="#a0a0a0" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.menuItem} onPress={() => handleCategoryPress('All')} activeOpacity={0.6}>
            <Ionicons name="trending-up-outline" size={26} color="#222" />
            <Text style={styles.menuText}>Trending (All)</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => handleCategoryPress('Latest')} activeOpacity={0.6}>
            <Ionicons name="time-outline" size={26} color="#222" />
            <Text style={styles.menuText}>Latest</Text>
          </TouchableOpacity>

          <Text style={styles.sectionTitle}>TOPICS</Text>
          
          <TouchableOpacity style={styles.menuItem} onPress={() => handleCategoryPress('Health')} activeOpacity={0.6}>
            <Ionicons name="fitness-outline" size={26} color="#222" />
            <Text style={styles.menuText}>Health</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => handleCategoryPress('Social')} activeOpacity={0.6}>
            <Ionicons name="people-outline" size={26} color="#222" />
            <Text style={styles.menuText}>Social</Text>
          </TouchableOpacity>

          <Text style={styles.sectionTitle}>ABOUT</Text>
          
          <TouchableOpacity style={styles.menuItem} onPress={() => handleComingSoon('Rules & Policy')} activeOpacity={0.6}>
            <Ionicons name="document-text-outline" size={26} color="#222" />
            <Text style={styles.menuText}>Rules & Policy</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => handleComingSoon('Contact Us')} activeOpacity={0.6}>
            <Ionicons name="call-outline" size={26} color="#222" />
            <Text style={styles.menuText}>Contact Us</Text>
          </TouchableOpacity>

        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { 
    flex: 1, 
    flexDirection: 'row' 
  },
  backgroundDimmer: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.5)'
  },
  drawerContainer: {
    width: '78%',
    backgroundColor: '#ffffff',
    height: '100%',
    position: 'absolute',
    left: 0,
    paddingHorizontal: 28, 
    paddingTop: 20,
    shadowColor: '#000',
    shadowOpacity: 0.15, 
    shadowRadius: 20,
    elevation: 10,
    borderTopRightRadius: 24, 
    borderBottomRightRadius: 24,
  },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 45 
  },
  logoWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoIcon: {
    marginRight: 6,
    marginTop: 2,
  },
  logoTextBase: {
    fontSize: 28, 
    fontWeight: '900',
    color: '#1a1a1a', 
    letterSpacing: -1,
  },
  logoTextHighlight: {
    color: '#0088cc',
  },
 
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#a0a0a0', 
    letterSpacing: 1.5,
    marginTop: 35, 
    marginBottom: 15,
    marginLeft: 2,
  },
  menuItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingVertical: 14,
  },
  menuText: { 
    fontSize: 17, 
    marginLeft: 20,
    fontWeight: '700', 
    color: '#222'
  }
});