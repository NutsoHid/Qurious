import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api'; 

export default function PostCard({ post, disableProfileClick = false, onOpenComments, onPostDeleted }) {
  const navigation = useNavigation();
  const { user: currentUser } = useContext(AuthContext);
  
  const initialIsLiked = post.likes?.includes(currentUser?._id) || false;
  const initialLikesCount = post.likes?.length || 0;

  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [likesCount, setLikesCount] = useState(initialLikesCount);
  const [isLiking, setIsLiking] = useState(false);

  const authorName = post.anonymous ? 'Anonymous' : (post.user?.name || 'Unknown User');
  const authorHandle = post.anonymous ? '@hidden' : (post.user?.userName || 'unknown');
  const profileImage = post.anonymous || !post.user?.profileUrl
    ? 'https://via.placeholder.com/150'
    : post.user.profileUrl;

  const isOwner = currentUser?._id === post.user?._id;
  const isAdmin = currentUser?.accountType === 'admin';

  const handleProfileClick = () => {
    if (disableProfileClick || post.anonymous || !post.user) return;
    if (isOwner) {
      navigation.navigate('YouTab');
    } else {
      navigation.navigate('OtherUserProfile', { userName: post.user.userName });
    }
  };

  const handleLike = async () => {
    setIsLiked(!isLiked);
    setLikesCount(isLiked ? likesCount - 1 : likesCount + 1);
    setIsLiking(true);

    try {
      await api.post(`/post/like/${post._id}`);
    } catch (error) {
      console.log("Error liking post:", error);
      setIsLiked(isLiked);
      setLikesCount(likesCount);
    } finally {
      setIsLiking(false);
    }
  };

  // 👇 NEW: Options Menu (Delete or Report)
  const handleOptions = () => {
    if (isOwner || isAdmin) {
      Alert.alert("Post Options", "What would you like to do?", [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete Post", 
          style: "destructive", 
          onPress: async () => {
            try {
              await api.delete(`/post/deletePost/${post._id}`);
              if(onPostDeleted) onPostDeleted(post._id); // Instantly removes it from the screen
              Alert.alert("Deleted", "Your post has been removed.");
            } catch (error) {
              Alert.alert("Error", "Could not delete post.");
            }
          } 
        }
      ]);
    } else {
      Alert.alert("Report Post", "Do you want to report this post to admins?", [
        { text: "Cancel", style: "cancel" },
        { text: "Spam", onPress: () => sendReport("Spam") },
        { text: "Inappropriate Content", onPress: () => sendReport("Inappropriate Content"), style: "destructive" }
      ]);
    }
  };

  const sendReport = async (reason) => {
    try {
      await api.post(`/post/report/${post._id}`, { reason });
      Alert.alert("Reported", "Thank you. Our admins will review this post.");
    } catch (error) {
      Alert.alert("Error", "Could not submit report.");
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
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
        
        <View style={styles.rightHeader}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{post.category || 'Social'}</Text>
          </View>
          {/* 👇 NEW: Three Dots Icon */}
          <TouchableOpacity onPress={handleOptions} style={styles.optionsBtn}>
            <Ionicons name="ellipsis-vertical" size={20} color="#888" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.contentContainer}>
        <Text style={styles.title}>{post.title}</Text>
        <Text style={styles.content}>{post.content}</Text>
      </View>

      {post.imageUrl ? (
        <Image source={{ uri: post.imageUrl }} style={styles.postImage} resizeMode="cover" />
      ) : null}

      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.actionBtn} onPress={handleLike} disabled={isLiking}>
          <Ionicons name={isLiked ? "heart" : "heart-outline"} size={24} color={isLiked ? "#E0245E" : "#666"} />
          <Text style={[styles.actionText, isLiked && { color: "#E0245E" }]}>
             {likesCount} {likesCount === 1 ? 'Like' : 'Likes'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtn} onPress={onOpenComments}>
          <Ionicons name="chatbubble-outline" size={22} color="#666" />
          <Text style={styles.actionText}>Comment</Text>
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
  rightHeader: { flexDirection: 'row', alignItems: 'center' },
  optionsBtn: { paddingLeft: 10 },
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