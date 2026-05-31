import React, { useState, useEffect, useContext } from 'react';
import { 
  View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, 
  FlatList, TextInput, KeyboardAvoidingView, Platform, Alert, Image, Keyboard
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import api from '../services/api';
import PostCard from '../components/PostCard'; 
import { AuthContext } from '../context/AuthContext'; 

export default function SinglePostScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { user } = useContext(AuthContext);
  
  const { postId } = route.params || {};

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!postId) {
      setLoading(false);
      return;
    }

    const fetchPostAndComments = async () => {
      try {
        const [postRes, commentsRes] = await Promise.all([
          api.get(`/post/singlePost/${postId}`),
          api.get(`/comment/getAllComment/${postId}`).catch(() => ({ data: { comments: [] } })) 
        ]);
        
        setPost(postRes.data.singlePost || postRes.data.post || postRes.data);
        setComments(commentsRes.data.comments || commentsRes.data.allComments || []);

      } catch(error) {
        console.error("Failed to load post data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPostAndComments();
  }, [postId]);

  // Handle posting a new comment
  const handlePostComment = async () => {
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await api.post(`/comment/postComment/${postId}`, {
        content: newComment.trim()
      });

      const addedComment = response.data.comment || {
        _id: Math.random().toString(), 
        content: newComment.trim(),
        user: user, 
        createdAt: new Date().toISOString()
      };

      setComments(prev => [addedComment, ...prev]);
      setNewComment(""); 
      Keyboard.dismiss(); 

    } catch (error) {
      console.error("Failed to post comment:", error.response?.data || error.message);
      Alert.alert("Error", "Could not post your comment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render individual comment UI
  const renderComment = ({ item }) => {
    const avatar = item.user?.profileUrl || 'https://via.placeholder.com/150';
    const dateText = item.createdAt 
      ? new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) 
      : 'Just now';

    return (
      <View style={styles.commentRow}>
        <Image source={{ uri: avatar }} style={styles.commentAvatar} />
        <View style={styles.commentBubble}>
          <View style={styles.commentHeader}>
            <Text style={styles.commentName}>{item.user?.name || item.user?.userName || 'User'}</Text>
            <Text style={styles.commentDate}>{dateText}</Text>
          </View>
          <Text style={styles.commentText}>{item.content}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      
      {/* 
        🔥 FIX FOR ANDROID: Set behavior to 'height'. This forces the container
        to physically shrink when the Android keyboard pops up.
      */}
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        
        {/* Top Navigation Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={28} color="#1a1a1a" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Post</Text>
          <View style={{ width: 28 }} />
        </View>

        {/* Main Content */}
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#0088cc" />
          </View>
        ) : post ? (
          <>
            {/* Feed List */}
            <FlatList
              data={comments}
              keyExtractor={(item) => item._id?.toString()}
              showsVerticalScrollIndicator={false}
              
              // Ensures button taps inside the PostCard are registered!
              keyboardShouldPersistTaps="handled" 
              
              ListHeaderComponent={
                <View style={styles.postWrapper}>
                  <PostCard post={post} disableProfileClick={false} />
                  
                  <View style={styles.commentsDivider}>
                    <Text style={styles.commentsCountTitle}>
                      Comments ({comments.length})
                    </Text>
                  </View>
                </View>
              }
              renderItem={renderComment}
              contentContainerStyle={styles.listContent}
              ListEmptyComponent={
                <View style={styles.emptyComments}>
                  <Text style={styles.emptyCommentsText}>No comments yet. Be the first to reply!</Text>
                </View>
              }
            />

            {/* Comment Input Bar */}
            <View style={styles.inputContainer}>
              <Image 
                source={{ uri: user?.profileUrl || 'https://via.placeholder.com/150' }} 
                style={styles.inputAvatar} 
              />
              <TextInput
                style={styles.textInput}
                placeholder="Add a comment..."
                placeholderTextColor="#9CA3AF"
                value={newComment}
                onChangeText={setNewComment}
                multiline
                maxLength={300}
              />
              <TouchableOpacity 
                style={[styles.sendBtn, !newComment.trim() && styles.sendBtnDisabled]} 
                onPress={handlePostComment}
                disabled={!newComment.trim() || isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Ionicons name="send" size={18} color={newComment.trim() ? "#fff" : "#9CA3AF"} />
                )}
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <View style={styles.center}>
            <Ionicons name="alert-circle-outline" size={50} color="#ccc" />
            <Text style={styles.errorText}>Post not found or deleted.</Text>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 15, paddingVertical: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E5E7EB', zIndex: 10 },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#1a1a1a' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { marginTop: 10, fontSize: 16, color: '#888' },
  
  listContent: { paddingBottom: 20 },
  postWrapper: { backgroundColor: '#fff', borderBottomWidth: 8, borderBottomColor: '#F3F4F6' },
  commentsDivider: { paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  commentsCountTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },

  commentRow: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F9FAFB' },
  commentAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#E5E7EB', marginRight: 12 },
  commentBubble: { flex: 1, backgroundColor: '#F9FAFB', padding: 12, borderRadius: 12, borderTopLeftRadius: 2 },
  commentHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  commentName: { fontSize: 14, fontWeight: '700', color: '#111827' },
  commentDate: { fontSize: 12, color: '#9CA3AF' },
  commentText: { fontSize: 14, color: '#374151', lineHeight: 20 },
  emptyComments: { padding: 30, alignItems: 'center' },
  emptyCommentsText: { color: '#9CA3AF', fontSize: 14 },

  inputContainer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#E5E7EB' },
  inputAvatar: { width: 36, height: 36, borderRadius: 18, marginRight: 10, backgroundColor: '#E5E7EB' },
  textInput: { flex: 1, backgroundColor: '#F3F4F6', borderRadius: 20, paddingHorizontal: 16, paddingTop: 10, paddingBottom: 10, maxHeight: 100, minHeight: 40, fontSize: 15, color: '#111827' },
  sendBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#0088cc', justifyContent: 'center', alignItems: 'center', marginLeft: 10 },
  sendBtnDisabled: { backgroundColor: '#E5E7EB' }
});