import React, { useState, useEffect } from 'react';
import { View, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomHeader from '../components/CustomHeader';
import PostCard from '../components/PostCard';
import api from '../services/api';

export default function HomeScreen() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPosts = async () => {
    try {
      const response = await api.get('/post/allPost');
      // Set the posts from backend
      setPosts(response.data.posts);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <CustomHeader />
      {loading ? (
        <ActivityIndicator size="large" color="#0088cc" />
      ) : (
              <FlatList
        data={posts}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <PostCard 
            username={item.user?.userName}  // item.user is populated now
            profileImage={item.user?.profileUrl}
            caption={item.content}
            image={item.imageUrl}
          />
        )}
      />
      )}
    </SafeAreaView>
  );
}