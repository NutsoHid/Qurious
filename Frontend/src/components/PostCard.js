import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function PostCard({ username, profileImage, caption, image }) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Image 
          source={{ uri: profileImage || 'https://via.placeholder.com/150' }} 
          style={styles.avatar} 
        />
        {/* If the username prop exists, it shows; otherwise, it defaults to Anonymous */}
        <Text style={styles.username}>{username || 'Anonymous'}</Text>
      </View>
      
      <Text style={styles.caption}>{caption}</Text>
      
      {image && <Image source={{ uri: image }} style={styles.postImage} />}
      
      <View style={styles.actions}>
        <Ionicons name="thumbs-up-outline" size={24} color="#555" />
        <Ionicons name="chatbubble-outline" size={24} color="#555" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', padding: 15, borderBottomWidth: 1, borderBottomColor: '#eee' },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  avatar: { width: 40, height: 40, borderRadius: 20, marginRight: 10 },
  username: { fontWeight: 'bold', fontSize: 16, color: '#1a1a1a' },
  caption: { fontSize: 15, marginBottom: 10 },
  postImage: { width: '100%', height: 200, borderRadius: 10, marginBottom: 10 },
  actions: { flexDirection: 'row', gap: 20 }
});