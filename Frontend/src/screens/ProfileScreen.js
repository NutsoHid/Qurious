import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, Image, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';
import PostCard from '../components/PostCard';

export default function ProfileScreen() {
  const navigation = useNavigation();
  const { user, logout } = useContext(AuthContext); 
  
  const [myPosts, setMyPosts] = useState([]);
  const [myComments, setMyComments] = useState([]); // 🔥 New State for Comments
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('posts'); // 🔥 Tab Switcher State

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        // 1. Fetch Posts
        const postRes = await api.get('/post/allPost');
        const allPosts = postRes.data.posts || [];
        setMyPosts(allPosts.filter(p => p.user?._id === user?._id));

        // 2. Fetch Comments (Wrapped in a safe try-catch just in case the backend isn't ready)
        try {
          const token = await AsyncStorage.getItem('userToken');
          const commentRes = await api.get('/comment/myComments', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setMyComments(commentRes.data.comments || []);
        } catch (commentErr) {
          console.log("Comments route not ready yet, skipping fetch.");
        }

      } catch (error) {
        console.error("Error fetching profile data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    const unsubscribe = navigation.addListener('focus', () => {
      fetchProfileData();
    });

    return unsubscribe;
  }, [navigation, user?._id]);

  // 🔥 Custom Component to make the comments look good in the list
  const renderCommentItem = ({ item }) => (
    <View style={styles.commentCard}>
      <View style={styles.commentHeader}>
        <Ionicons name="chatbubble-ellipses" size={16} color="#0088cc" />
        <Text style={styles.commentPostTitle} numberOfLines={1}>
          Commented on: {item.post?.title || "A post"}
        </Text>
      </View>
      <Text style={styles.commentBody}>"{item.content}"</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingCenter}>
        <ActivityIndicator size="large" color="#0088cc" />
      </View>
    );
  }

  // Choose what data to display based on the active tab
  const displayData = activeTab === 'posts' ? myPosts : myComments;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Top Bar */}
      <View style={styles.topNav}>
        <Text style={styles.headerTitle}>{user?.userName || 'Profile'}</Text>
        <TouchableOpacity onPress={logout} style={styles.logoutIcon}>
          <Ionicons name="log-out-outline" size={26} color="#ff4444" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={displayData}
        keyExtractor={(item) => item._id}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={() => (
          <View style={styles.header}>
            <View style={styles.profileRow}>
              <Image source={{ uri: user?.profileUrl || 'https://via.placeholder.com/150' }} style={styles.avatar} />
              <View style={styles.statsContainer}>
                <View style={styles.statBox}>
                  <Text style={styles.statNumber}>{myPosts.length}</Text>
                  <Text style={styles.statLabel}>Posts</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statNumber}>{user?.friends?.length || 0}</Text>
                  <Text style={styles.statLabel}>Friends</Text>
                </View>
              </View>
            </View>

            <View style={styles.bioContainer}>
              <Text style={styles.name}>{user?.name || 'Unknown User'}</Text>
              <Text style={styles.bio}>{user?.profession || 'Explorer of the Qurious world'}</Text>
            </View>
            
            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.editBtn} onPress={() => navigation.navigate('EditProfile')}>
                <Text style={styles.editBtnText}>Edit Profile</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.shareBtn}>
                <Ionicons name="share-social-outline" size={20} color="#1a1a1a" />
              </TouchableOpacity>
            </View>

            {/* 🔥 THE TAB SWITCHER */}
            <View style={styles.tabContainer}>
              <TouchableOpacity 
                style={[styles.tab, activeTab === 'posts' && styles.tabActive]} 
                onPress={() => setActiveTab('posts')}
              >
                <Text style={[styles.tabText, activeTab === 'posts' && styles.tabTextActive]}>Posts</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.tab, activeTab === 'comments' && styles.tabActive]} 
                onPress={() => setActiveTab('comments')}
              >
                <Text style={[styles.tabText, activeTab === 'comments' && styles.tabTextActive]}>Comments</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        // Dynamically choose how to render the list item
        renderItem={activeTab === 'posts' ? ({ item }) => <PostCard post={item} /> : renderCommentItem}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name={activeTab === 'posts' ? "camera-outline" : "chatbubbles-outline"} size={50} color="#ccc" />
            <Text style={styles.emptyText}>
              {activeTab === 'posts' ? "No posts yet." : "No comments yet."}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  loadingCenter: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  topNav: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 12, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#1a1a1a' },
  logoutIcon: { padding: 4 },
  header: { paddingHorizontal: 20, paddingTop: 20, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  profileRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  avatar: { width: 90, height: 90, borderRadius: 45, backgroundColor: '#eee', borderWidth: 2, borderColor: '#0088cc' },
  statsContainer: { flexDirection: 'row', flex: 1, justifyContent: 'space-evenly', marginLeft: 20 },
  statBox: { alignItems: 'center' },
  statNumber: { fontSize: 20, fontWeight: 'bold', color: '#1a1a1a' },
  statLabel: { fontSize: 14, color: '#666', marginTop: 2 },
  bioContainer: { marginTop: 15, paddingHorizontal: 5 },
  name: { fontSize: 16, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 4 },
  bio: { fontSize: 15, color: '#444', lineHeight: 20 },
  buttonRow: { flexDirection: 'row', marginTop: 20, gap: 10, marginBottom: 20 },
  editBtn: { flex: 1, backgroundColor: '#f0f0f0', paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  editBtnText: { fontWeight: '700', fontSize: 15, color: '#1a1a1a' },
  shareBtn: { backgroundColor: '#f0f0f0', paddingHorizontal: 15, paddingVertical: 10, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  
  /* Tab Styles */
  tabContainer: { flexDirection: 'row', width: '100%', borderTopWidth: 1, borderTopColor: '#f0f0f0' },
  tab: { flex: 1, paddingVertical: 15, alignItems: 'center' },
  tabActive: { borderBottomWidth: 2, borderBottomColor: '#0088cc' },
  tabText: { fontSize: 15, fontWeight: '600', color: '#888' },
  tabTextActive: { color: '#0088cc', fontWeight: 'bold' },
  
  /* Comment Card Styles */
  commentCard: { backgroundColor: '#f8f9fa', padding: 15, borderBottomWidth: 1, borderBottomColor: '#eee' },
  commentHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  commentPostTitle: { fontSize: 13, color: '#666', fontWeight: '600', marginLeft: 8, flex: 1 },
  commentBody: { fontSize: 15, color: '#1a1a1a', fontStyle: 'italic', lineHeight: 22 },

  emptyState: { alignItems: 'center', marginTop: 50 },
  emptyText: { color: '#888', fontSize: 16, marginTop: 10, fontWeight: '500' }
});