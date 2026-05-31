import React, { useState, useEffect, useCallback, useContext } from 'react';
import { View, Text, StyleSheet, Image, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import api from '../services/api';
import PostCard from '../components/PostCard';

// 1. Import AuthContext to get the logged-in user's ID
import { AuthContext } from '../context/AuthContext';

export default function OtherUserProfileScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  
  const { userName } = route.params || {};

  // 2. Extract the current logged-in user
  const { user: currentUser } = useContext(AuthContext);

  const [profileUser, setProfileUser] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0); 
  const [followLoading, setFollowLoading] = useState(false);

  useEffect(() => {
    if (!userName) {
      Alert.alert("Error", "User name is missing.");
      navigation.goBack();
      return;
    }

    const fetchUserAndPosts = async () => {
      try {
        const [profileRes, postRes] = await Promise.all([
          api.get(`/user/profile/${userName}`),
          api.get('/post/allPost')
        ]);

        const fetchedUser = profileRes.data.profile;
        const allPosts = postRes.data.posts || [];
        
        setProfileUser(fetchedUser);
        setUserPosts(allPosts.filter(p => p.user?._id === fetchedUser._id));
        
        setFollowerCount(fetchedUser.followers?.length || 0);

        // 3. THE FIX: Check if the current user is already in the followers list
        if (currentUser && currentUser._id && fetchedUser.followers) {
          const alreadyFollowing = fetchedUser.followers.includes(currentUser._id);
          setIsFollowing(alreadyFollowing);
        }

      } catch (error) {
        console.error("Error fetching other user profile:", error);
        Alert.alert("Error", "Could not load user profile.");
        navigation.goBack();
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserAndPosts();
  }, [userName, currentUser, navigation]); // Added currentUser to dependencies

  const handleFollowToggle = async () => {
    if (!profileUser?._id) return;

    const originalFollowState = isFollowing;
    const originalFollowerCount = followerCount;

    setIsFollowing(!originalFollowState);
    setFollowerCount(prevCount => !originalFollowState ? prevCount + 1 : Math.max(0, prevCount - 1));
    setFollowLoading(true);

    try {
      const endpoint = `/follow/followRequest/${profileUser._id}`;
      const response = await api.post(endpoint);
      
      setIsFollowing(response.data.isFollowing);

    } catch (error) {
      console.error("Follow action failed:", error.response?.data || error.message);
      
      setIsFollowing(originalFollowState);
      setFollowerCount(originalFollowerCount);
      
      Alert.alert(
        "Error", 
        error.response?.data?.message || "Could not complete the follow action. Please try again."
      );
    } finally {
      setFollowLoading(false);
    }
  };

  const renderHeader = useCallback(() => {
    if (!profileUser) return null;

    return (
      <View style={styles.header}>
        <View style={styles.profileRow}>
          <Image source={{ uri: profileUser.profileUrl || 'https://via.placeholder.com/150' }} style={styles.avatar} />
          <View style={styles.statsContainer}>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{userPosts.length}</Text>
              <Text style={styles.statLabel}>Posts</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{followerCount}</Text>
              <Text style={styles.statLabel}>Followers</Text>
            </View>
          </View>
        </View>

        <View style={styles.bioContainer}>
          <Text style={styles.name}>{profileUser.name || 'Unknown'}</Text>
          <Text style={styles.bio}>{profileUser.profession || ''}</Text>
        </View>
        
        <View style={styles.buttonRow}>
          <TouchableOpacity 
            style={[styles.actionBtn, isFollowing ? styles.followingBtn : styles.followBtn]} 
            onPress={handleFollowToggle}
            disabled={followLoading}
          >
            {followLoading ? (
              <ActivityIndicator size="small" color={isFollowing ? "#1a1a1a" : "#fff"} />
            ) : (
              <Text style={[styles.btnText, isFollowing ? styles.followingText : styles.followText]}>
                {isFollowing ? 'Following' : 'Follow'}
              </Text>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionBtnOutline}
            onPress={() => Alert.alert("Coming Soon", "Messaging will be available soon!")}
          >
            <Text style={styles.btnTextOutline}>Message</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.tabContainer}>
          <View style={styles.tabActive}>
            <Ionicons name="grid-outline" size={24} color="#0088cc" />
          </View>
        </View>
      </View>
    );
  }, [profileUser, userPosts.length, isFollowing, followLoading, followerCount]);

  if (loading) {
    return (
      <View style={styles.loadingCenter}>
        <ActivityIndicator size="large" color="#0088cc" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.topNav}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={28} color="#1a1a1a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{profileUser?.userName}</Text>
        <TouchableOpacity style={styles.moreIcon}>
          <Ionicons name="ellipsis-horizontal" size={24} color="#1a1a1a" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={userPosts}
        keyExtractor={(item) => item._id}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={renderHeader}
        renderItem={({ item }) => <PostCard post={item} disableProfileClick={true} />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="camera-outline" size={50} color="#ccc" />
            <Text style={styles.emptyText}>No posts yet.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  loadingCenter: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  topNav: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 15, paddingVertical: 12, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  backBtn: { padding: 4 },
  moreIcon: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#1a1a1a' },
  header: { padding: 20, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  profileRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  avatar: { width: 90, height: 90, borderRadius: 45, backgroundColor: '#eee', borderWidth: 2, borderColor: '#e0e0e0' },
  statsContainer: { flexDirection: 'row', flex: 1, justifyContent: 'space-evenly', marginLeft: 20 },
  statBox: { alignItems: 'center' },
  statNumber: { fontSize: 20, fontWeight: 'bold', color: '#1a1a1a' },
  statLabel: { fontSize: 14, color: '#666', marginTop: 2 },
  bioContainer: { marginTop: 15, paddingHorizontal: 5 },
  name: { fontSize: 16, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 4 },
  bio: { fontSize: 15, color: '#444', lineHeight: 20 },
  buttonRow: { flexDirection: 'row', marginTop: 20, gap: 10 },
  actionBtn: { flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  followBtn: { backgroundColor: '#0088cc' },
  followingBtn: { backgroundColor: '#f0f0f0' },
  followText: { fontWeight: '700', fontSize: 15, color: '#fff' },
  followingText: { fontWeight: '700', fontSize: 15, color: '#1a1a1a' },
  actionBtnOutline: { flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#d0d0d0', backgroundColor: '#fff' },
  btnTextOutline: { fontWeight: '700', fontSize: 15, color: '#1a1a1a' },
  tabContainer: { flexDirection: 'row', width: '100%', justifyContent: 'space-around', marginTop: 20, borderTopWidth: 1, borderTopColor: '#f0f0f0', paddingTop: 15 },
  tabActive: { borderBottomWidth: 2, borderBottomColor: '#0088cc', paddingBottom: 10, width: 60, alignItems: 'center' },
  emptyState: { alignItems: 'center', marginTop: 50 },
  emptyText: { color: '#888', fontSize: 16, marginTop: 10, fontWeight: '500' }
});