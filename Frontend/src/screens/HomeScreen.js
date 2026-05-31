import React, { useState, useEffect, useContext } from 'react';
import { View, FlatList, ActivityIndicator, RefreshControl, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomHeader from '../components/CustomHeader';
import CustomDrawer from '../components/CustomDrawer';
import PostCard from '../components/PostCard';
import CommentModal from '../components/CommentModal';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

export default function HomeScreen({ navigation }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');
  
  const [activePostId, setActivePostId] = useState(null);
  const [isCommentModalVisible, setCommentModalVisible] = useState(false);

  // currentUser extraction used for validating headers & processing data interactions cleanly
  const { user: currentUser } = useContext(AuthContext);

  const fetchPosts = async () => {
    try {
      const response = await api.get(`/post/allPost?category=${activeCategory}`);
      setPosts(response.data.posts || []);
    } catch (error) {
      console.error("Error fetching posts:", error);
      // Fallback response parsing protecting view modules from sudden empty server rendering anomalies
      if (error.response && error.response.status === 401) {
        console.warn("Unauthorized API call. Verification token missing or expired.");
      }
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

  // Optimistic core array recalculation engine mapping array fields cleanly
  const handleVote = async (postId, isLikeRequested) => {
    const currentUserId = currentUser?._id;
    if (!currentUserId) return;

    let previousPosts = [...posts];

    setPosts((currentPosts) =>
      currentPosts.map((post) => {
        if (post._id !== postId) return post;

        let likes = Array.isArray(post.likes) ? [...post.likes] : [];
        let dislikes = Array.isArray(post.dislikes) ? [...post.dislikes] : [];

        const hasLiked = likes.includes(currentUserId);
        const hasDisliked = dislikes.includes(currentUserId);

        if (isLikeRequested) {
          if (hasLiked) {
            likes = likes.filter((id) => id !== currentUserId);
          } else {
            likes.push(currentUserId);
            dislikes = dislikes.filter((id) => id !== currentUserId);
          }
        } else {
          if (hasDisliked) {
            dislikes = dislikes.filter((id) => id !== currentUserId);
          } else {
            dislikes.push(currentUserId);
            likes = likes.filter((id) => id !== currentUserId);
          }
        }

        return {
          ...post,
          likes,
          dislikes,
        };
      })
    );

    try {
      await api.post(`/vote/toggleVote/Post/${postId}`, { isLike: isLikeRequested });
    } catch (error) {
      console.error("Voting submission failed:", error);
      setPosts(previousPosts);
    }
  };

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
      <CustomHeader 
        onMenuPress={() => setIsDrawerVisible(true)} 
        onCreatePress={() => navigation.navigate('CreateScreen')}
      />
      
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
              onPostDeleted={(deletedId) => {
                setPosts(prev => prev.filter(p => p._id !== deletedId));
              }}
              onVote={(isLike) => handleVote(item._id, isLike)}
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
          contentContainerStyle={styles.listPadding}
        />
      )}

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
  emptyText: { fontSize: 16, color: '#888', fontWeight: '500' },
  listPadding: { paddingBottom: 95 } // Keeps content safely scrolled away from overlapping absolute navigators
});