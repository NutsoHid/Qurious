import React, { useState, useEffect } from 'react';
import { View, FlatList, ActivityIndicator, RefreshControl, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomHeader from '../components/CustomHeader';
import CustomDrawer from '../components/CustomDrawer';
import PostCard from '../components/PostCard';
import CommentModal from '../components/CommentModal';
import api from '../services/api';

export default function HomeScreen({ navigation }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');
  
  const [activePostId, setActivePostId] = useState(null);
  const [isCommentModalVisible, setCommentModalVisible] = useState(false);

  const fetchPosts = async () => {
    try {
      const response = await api.get(`/post/allPost?category=${activeCategory}`);
      setPosts(response.data.posts || []);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchPosts();
  }, [activeCategory]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchPosts();
  };

  // 👇 This updates the number instantly on your screen
  const handleCommentAdded = (postId) => {
    setPosts((currentPosts) => 
      currentPosts.map((post) => {
        if (post._id === postId) {
          const currentComments = post.comments || [];
          return { ...post, comments: [...currentComments, 'new_comment'] };
        }
        return post;
      })
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <CustomHeader onMenuPress={() => setIsDrawerVisible(true)} />
      
      <CustomDrawer 
        visible={isDrawerVisible} 
        onClose={() => setIsDrawerVisible(false)} 
        onSelectCategory={(category) => {
          setActiveCategory(category);
          setIsDrawerVisible(false);
        }}
      />

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#0088cc" />
        </View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <PostCard 
              post={item} 
              onOpenComments={() => {
                setActivePostId(item._id);
                setCommentModalVisible(true);
              }}
              // 👇 NEW: Instantly hide the post from the feed when deleted
              onPostDeleted={(deletedId) => {
                setPosts(prev => prev.filter(p => p._id !== deletedId));
              }}
            />
          )}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0088cc" />
          }
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={styles.emptyText}>No posts yet. Be the first to share!</Text>
            </View>
          }
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* 👇 Added onCommentAdded trigger */}
      <CommentModal 
        visible={isCommentModalVisible} 
        onClose={() => setCommentModalVisible(false)} 
        postId={activePostId} 
        onCommentAdded={() => handleCommentAdded(activePostId)} 
      />

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50 },
  emptyText: { fontSize: 16, color: '#888', fontWeight: '500' }
});