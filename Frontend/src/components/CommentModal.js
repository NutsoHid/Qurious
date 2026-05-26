import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, FlatList, KeyboardAvoidingView, Platform, ActivityIndicator, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';

export default function CommentModal({ visible, onClose, postId, onCommentAdded }) {
  const { user } = useContext(AuthContext);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // 👇 NEW: State to track if we are editing
  const [editingCommentId, setEditingCommentId] = useState(null);

  useEffect(() => {
    if (visible && postId) {
      fetchComments();
    } else {
      setNewComment('');
      setEditingCommentId(null);
    }
  }, [visible, postId]);

  const fetchComments = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/comment/getAllComment/${postId}`);
      // Filter out soft-deleted comments
      const activeComments = response.data.comments.filter(c => c.content !== "[Deleted]");
      setComments(activeComments || []);
    } catch (error) {
      setComments([]); 
    } finally {
      setLoading(false);
    }
  };

  const handlePostComment = async () => {
    if (!newComment.trim()) return;
    setIsSubmitting(true);
    try {
      if (editingCommentId) {
        // EDIT MODE
        await api.put(`/comment/editComment/${postId}/${editingCommentId}`, { content: newComment });
        setComments(comments.map(c => c._id === editingCommentId ? { ...c, content: newComment } : c));
        setEditingCommentId(null);
      } else {
        // CREATE MODE
        await api.post(`/comment/postComment/${postId}`, { content: newComment });
        if (onCommentAdded) onCommentAdded();
        fetchComments(); 
      }
      setNewComment('');
    } catch (error) {
      Alert.alert("Error", "Failed to save comment.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    Alert.alert("Delete Comment", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      { 
        text: "Delete", 
        style: "destructive", 
        onPress: async () => {
          try {
            await api.delete(`/comment/deleteComment/${commentId}`);
            setComments(comments.filter(c => c._id !== commentId));
          } catch (error) {
            Alert.alert("Error", "Failed to delete comment.");
          }
        }
      }
    ]);
  };

  const initiateEdit = (comment) => {
    setEditingCommentId(comment._id);
    setNewComment(comment.content);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.overlay}>
        <TouchableOpacity style={styles.dimmer} onPress={onClose} activeOpacity={1} />
        
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>{editingCommentId ? "Edit Comment" : "Comments"}</Text>
            {editingCommentId && (
              <TouchableOpacity onPress={() => { setEditingCommentId(null); setNewComment(''); }}>
                 <Text style={styles.cancelEdit}>Cancel Edit</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close-circle" size={28} color="#9CA3AF" />
            </TouchableOpacity>
          </View>

          {loading ? (
            <ActivityIndicator style={{ marginTop: 20 }} color="#0088cc" />
          ) : (
            <FlatList
              data={comments}
              keyExtractor={(item) => item._id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContent}
              renderItem={({ item }) => (
                <View style={styles.commentRow}>
                  <Image source={{ uri: item.user?.profileUrl || 'https://via.placeholder.com/150' }} style={styles.avatar} />
                  <View style={styles.commentBubble}>
                    <View style={styles.commentHeaderRow}>
                      <Text style={styles.commentUser}>@{item.user?.userName || 'user'}</Text>
                      
                      {/* 👇 NEW: Show Edit/Delete if it's the user's comment */}
                      {(user?._id === item.user?._id || user?.accountType === 'admin') && (
                        <View style={styles.commentActions}>
                          <TouchableOpacity onPress={() => initiateEdit(item)} style={{ marginRight: 10 }}>
                            <Ionicons name="pencil" size={14} color="#6B7280" />
                          </TouchableOpacity>
                          <TouchableOpacity onPress={() => handleDeleteComment(item._id)}>
                            <Ionicons name="trash" size={14} color="#EF4444" />
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                    <Text style={styles.commentText}>{item.content}</Text>
                  </View>
                </View>
              )}
              ListEmptyComponent={<Text style={styles.emptyText}>No comments yet. Be the first!</Text>}
            />
          )}

          <View style={styles.inputContainer}>
            <Image source={{ uri: user?.profileUrl || 'https://via.placeholder.com/150' }} style={styles.inputAvatar} />
            <TextInput
              style={styles.input}
              placeholder={editingCommentId ? "Update your comment..." : "Add a comment..."}
              placeholderTextColor="#9CA3AF"
              value={newComment}
              onChangeText={setNewComment}
              multiline
            />
            <TouchableOpacity 
               style={[styles.postBtn, !newComment.trim() && { opacity: 0.5 }]} 
               onPress={handlePostComment}
               disabled={!newComment.trim() || isSubmitting}
            >
              {isSubmitting ? <ActivityIndicator color="#fff" size="small" /> : <Ionicons name={editingCommentId ? "checkmark" : "send"} size={20} color="#fff" />}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  dimmer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: { backgroundColor: '#fff', height: '70%', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, elevation: 10 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15, borderBottomWidth: 1, borderBottomColor: '#F3F4F6', paddingBottom: 15 },
  title: { fontSize: 18, fontWeight: '800', color: '#111827' },
  cancelEdit: { color: '#EF4444', fontWeight: '600', marginRight: 10 },
  listContent: { paddingBottom: 20 },
  commentRow: { flexDirection: 'row', marginBottom: 15 },
  avatar: { width: 36, height: 36, borderRadius: 18, marginRight: 10 },
  commentBubble: { flex: 1, backgroundColor: '#F3F4F6', padding: 12, borderRadius: 16, borderTopLeftRadius: 4 },
  commentHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  commentActions: { flexDirection: 'row' },
  commentUser: { fontSize: 13, fontWeight: '700', color: '#374151' },
  commentText: { fontSize: 15, color: '#111827', lineHeight: 20 },
  emptyText: { textAlign: 'center', color: '#9CA3AF', marginTop: 30, fontSize: 15 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingTop: 15, marginTop: 'auto' },
  inputAvatar: { width: 40, height: 40, borderRadius: 20, marginRight: 10 },
  input: { flex: 1, backgroundColor: '#F3F4F6', borderRadius: 20, paddingHorizontal: 15, paddingTop: 12, paddingBottom: 12, fontSize: 15, color: '#111827', maxHeight: 100 },
  postBtn: { backgroundColor: '#0088cc', width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginLeft: 10 }
});