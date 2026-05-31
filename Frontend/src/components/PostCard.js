import React, { useContext, useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api'; 

const formatSocialDate = (dateInput) => {
  if (!dateInput) return '';
  const now = new Date();
  const posted = new Date(dateInput);
  const diffInSeconds = Math.floor((now - posted) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d`;

  return posted.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

export default function PostCard({ post, disableProfileClick = false, onOpenComments, onPostDeleted }) {
  const navigation = useNavigation();
  const { user: currentUser } = useContext(AuthContext);

  const [likes, setLikes] = useState(post.likes || []);
  const [dislikes, setDislikes] = useState(post.dislikes || []);

  useEffect(() => {
    setLikes(post.likes || []);
    setDislikes(post.dislikes || []);
  }, [post]);
  
  // Helper function to safely check arrays whether they contain strings OR objects
  const isUserInArray = (arr, userId) => {
    return arr.some(item => item === userId || item?._id === userId);
  };

  // Calculate states dynamically using the safe helper
  const voteState = isUserInArray(likes, currentUser?._id) 
    ? 'like' 
    : (isUserInArray(dislikes, currentUser?._id) ? 'dislike' : null);
  
  const likesCount = likes.length;
  const dislikesCount = dislikes.length;

  const authorName = post.anonymous ? 'Anonymous' : (post.user?.name || 'Unknown User');
  const authorHandle = post.anonymous ? '@hidden' : (post.user?.userName || 'unknown');
  const profileImage = post.anonymous || !post.user?.profileUrl
    ? 'https://via.placeholder.com/150'
    : post.user.profileUrl;

  const isOwner = currentUser?._id === post.user?._id;
  const isAdmin = currentUser?.accountType === 'admin';
  const totalComments = post.comments ? post.comments.length : 0;

  const getCategoryBadgeStyle = (cat) => {
    switch(cat) {
      case 'Health': return { bg: '#FEE2E2', text: '#EF4444' }; 
      case 'Education': return { bg: '#E0F2FE', text: '#0088cc' }; 
      case 'Social': return { bg: '#D1FAE5', text: '#10B981' }; 
      default: return { bg: '#E0F2FE', text: '#0088cc' }; 
    }
  };

  const badgeColors = getCategoryBadgeStyle(post.category);

  const handleProfileClick = () => {
    if (disableProfileClick || post.anonymous || !post.user) return;
    if (isOwner) {
      navigation.navigate('YouTab');
    } else {
      navigation.navigate('OtherUserProfile', { userName: post.user.userName });
    }
  };

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
              if(onPostDeleted) onPostDeleted(post._id); 
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

  const handleVote = async (isUpvote) => {
    if (!currentUser) return;
    
    const userId = currentUser._id;
    let newLikes = [...likes];
    let newDislikes = [...dislikes];

    // Safely filter out the user regardless of whether the state holds objects or strings
    if (isUpvote) {
      if (voteState === 'like') {
        newLikes = newLikes.filter(item => (item?._id || item) !== userId); 
      } else {
        newLikes.push(userId); 
        newDislikes = newDislikes.filter(item => (item?._id || item) !== userId);
      }
    } else {
      if (voteState === 'dislike') {
        newDislikes = newDislikes.filter(item => (item?._id || item) !== userId);
      } else {
        newDislikes.push(userId); 
        newLikes = newLikes.filter(item => (item?._id || item) !== userId); 
      }
    }

    setLikes(newLikes);
    setDislikes(newDislikes);

    try {
      // 🔥 FIX: Replaced 'action' with 'isLike' to match your Mongoose schema
      await api.post(`/vote/toggleVote/Post/${post._id}`, { 
        isLike: isUpvote 
      });
    } catch (error) {
      console.error("Vote failed:", error);
      setLikes(post.likes || []);
      setDislikes(post.dislikes || []);
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
            <View style={styles.titleInfoRow}>
              <Text style={styles.name} numberOfLines={1}>{authorName}</Text>
              <Text style={styles.dotDivider}>•</Text>
              <Text style={styles.timestamp}>{formatSocialDate(post.createdAt)}</Text>
            </View>
            <Text style={styles.handle}>@{authorHandle}</Text>
          </View>
        </TouchableOpacity>
        
        <View style={styles.rightHeader}>
          <View style={[styles.categoryBadge, { backgroundColor: badgeColors.bg }]}>
            <Text style={[styles.categoryText, { color: badgeColors.text }]}>
              {post.category || 'Social'}
            </Text>
          </View>

          <TouchableOpacity onPress={handleOptions} style={styles.optionsBtn}>
            <Ionicons name="ellipsis-vertical" size={18} color="#9CA3AF" />
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
        
        <TouchableOpacity 
          style={[styles.pillButton, voteState === 'like' && styles.activeLikePill]} 
          onPress={() => handleVote(true)} 
        >
          <Ionicons 
            name={voteState === 'like' ? "arrow-up-circle" : "arrow-up-circle-outline"} 
            size={20} 
            color={voteState === 'like' ? "#0088cc" : "#4B5563"} 
          />
          <Text style={[styles.pillText, voteState === 'like' && styles.activeLikeText]}>
             {likesCount}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.pillButton, voteState === 'dislike' && styles.activeDislikePill]} 
          onPress={() => handleVote(false)} 
        >
          <Ionicons 
            name={voteState === 'dislike' ? "arrow-down-circle" : "arrow-down-circle-outline"} 
            size={20} 
            color={voteState === 'dislike' ? "#EF4444" : "#4B5563"} 
          />
          <Text style={[styles.pillText, voteState === 'dislike' && styles.activeDislikeText]}>
             {dislikesCount}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.pillButton} onPress={onOpenComments}>
          <Ionicons name="chatbubble-ellipses-outline" size={18} color="#4B5563" />
          <Text style={styles.pillText}>{totalComments}</Text>
        </TouchableOpacity>
        
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', marginBottom: 10, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, marginBottom: 12 },
  rightHeader: { flexDirection: 'row', alignItems: 'center' },
  optionsBtn: { paddingLeft: 12 },
  authorInfo: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 42, height: 42, borderRadius: 21, marginRight: 12, backgroundColor: '#f3f4f6' },
  titleInfoRow: { flexDirection: 'row', alignItems: 'center' },
  name: { fontSize: 15, fontWeight: '700', color: '#111827', maxWidth: 140 },
  dotDivider: { fontSize: 14, color: '#6B7280', marginHorizontal: 6 },
  timestamp: { fontSize: 13, color: '#6B7280', fontWeight: '400' },
  handle: { fontSize: 13, color: '#6B7280', marginTop: 1 },
  
  categoryBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  categoryText: { fontSize: 12, fontWeight: '700' },
  
  contentContainer: { paddingHorizontal: 16, marginBottom: 12 },
  title: { fontSize: 17, fontWeight: '700', color: '#111827', marginBottom: 4 },
  content: { fontSize: 14.5, color: '#374151', lineHeight: 21 },
  postImage: { width: '100%', height: 260, marginBottom: 12 },
  actionRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 4 },
  pillButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f3f4f6', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, marginRight: 10 },
  pillText: { marginLeft: 6, fontSize: 13, color: '#374151', fontWeight: '600' },
  activeLikePill: { backgroundColor: '#e0f2fe' },
  activeLikeText: { color: '#0088cc' },
  activeDislikePill: { backgroundColor: '#fee2e2' },
  activeDislikeText: { color: '#ef4444' }
});