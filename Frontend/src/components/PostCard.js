import React, { useContext } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext'; // 🔥 Import context for smart routing

export default function PostCard({ post, disableProfileClick = false }) {
  const navigation = useNavigation();
  const { user: currentUser } = useContext(AuthContext);

  const authorName = post.anonymous ? 'Anonymous' : (post.user?.name || 'Unknown User');
  const authorHandle = post.anonymous ? '@hidden' : (post.user?.userName || 'unknown');
  const profileImage = post.anonymous || !post.user?.profileUrl 
    ? 'https://via.placeholder.com/150' 
    : post.user.profileUrl;

  // 🔥 Smart Routing Function
  const handleProfileClick = () => {
    if (disableProfileClick || post.anonymous || !post.user) return;

    if (post.user._id === currentUser?._id) {
      // If it's my own post, go to my dashboard
      navigation.navigate('YouTab'); 
    } else {
      // If it's someone else, open their public profile
      navigation.navigate('OtherUserProfile', { userName: post.user.userName });
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        {/* Wrap the author info in a TouchableOpacity */}
        <TouchableOpacity 
          style={styles.authorInfo} 
          onPress={handleProfileClick}
          activeOpacity={disableProfileClick ? 1 : 0.6}
        >
          <Image source={{ uri: profileImage }} style={styles.avatar} />
          <View>
            <Text style={styles.name}>{authorName}</Text>
            <Text style={styles.handle}>@{authorHandle}</Text>
          </View>
        </TouchableOpacity>
        
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{post.category || 'Social'}</Text>
        </View>
      </View>

      <View style={styles.contentContainer}>
        <Text style={styles.title}>{post.title}</Text>
        <Text style={styles.content}>{post.content}</Text>
      </View>

      {post.imageUrl && (
        <Image 
          source={{ uri: post.imageUrl }} 
          style={styles.postImage} 
          resizeMode="cover"
        />
      )}

      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.actionBtn}>
          <Ionicons name="heart-outline" size={24} color="#666" />
          <Text style={styles.actionText}>Like</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionBtn}>
          <Ionicons name="chatbubble-outline" size={22} color="#666" />
          <Text style={styles.actionText}>{post.comments?.length || 0} Comments</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtn}>
          <Ionicons name="share-social-outline" size={22} color="#666" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', marginBottom: 10, paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 15, marginBottom: 12 },
  authorInfo: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 44, height: 44, borderRadius: 22, marginRight: 12, backgroundColor: '#eee' },
  name: { fontSize: 16, fontWeight: '700', color: '#1a1a1a' },
  handle: { fontSize: 14, color: '#888' },
  categoryBadge: { backgroundColor: '#e6f4ff', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  categoryText: { color: '#0088cc', fontSize: 12, fontWeight: '600' },
  contentContainer: { paddingHorizontal: 15, marginBottom: 12 },
  title: { fontSize: 18, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 6 },
  content: { fontSize: 15, color: '#444', lineHeight: 22 },
  postImage: { width: '100%', height: 250, marginBottom: 12 },
  actionRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, paddingTop: 5 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', marginRight: 25 },
  actionText: { marginLeft: 6, fontSize: 14, color: '#666', fontWeight: '500' }
});