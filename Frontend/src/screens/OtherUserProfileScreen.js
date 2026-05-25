import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import api from '../services/api';
import PostCard from '../components/PostCard';

export default function OtherUserProfileScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  
  // We grab the userName passed from the PostCard
  const { userName } = route.params;

  const [profileUser, setProfileUser] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    const fetchUserAndPosts = async () => {
      try {
        // 1. Fetch the specific user's profile from your friend's backend
        const profileRes = await api.get(`/user/profile/${userName}`);
        const fetchedUser = profileRes.data.profile;
        setProfileUser(fetchedUser);

        // 2. Fetch all posts and filter out only this user's posts
        const postRes = await api.get('/post/allPost');
        const allPosts = postRes.data.posts || [];
        setUserPosts(allPosts.filter(p => p.user?._id === fetchedUser._id));

      } catch (error) {
        console.error("Error fetching other user profile:", error);
        Alert.alert("Error", "Could not load user profile.");
        navigation.goBack();
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserAndPosts();
  }, [userName]);

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
        ListHeaderComponent={() => (
          <View style={styles.header}>
            <View style={styles.profileRow}>
              <Image source={{ uri: profileUser?.profileUrl || 'https://via.placeholder.com/150' }} style={styles.avatar} />
              <View style={styles.statsContainer}>
                <View style={styles.statBox}>
                  <Text style={styles.statNumber}>{userPosts.length}</Text>
                  <Text style={styles.statLabel}>Posts</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statNumber}>{profileUser?.friends?.length || 0}</Text>
                  <Text style={styles.statLabel}>Followers</Text>
                </View>
              </View>
            </View>

            <View style={styles.bioContainer}>
              <Text style={styles.name}>{profileUser?.name || 'Unknown'}</Text>
              <Text style={styles.bio}>{profileUser?.profession || 'Explorer of the Qurious world'}</Text>
            </View>
            
            <View style={styles.buttonRow}>
              <TouchableOpacity 
                style={[styles.actionBtn, isFollowing ? styles.followingBtn : styles.followBtn]} 
                onPress={() => setIsFollowing(!isFollowing)}
              >
                <Text style={[styles.btnText, isFollowing ? styles.followingText : styles.followText]}>
                  {isFollowing ? 'Following' : 'Follow'}
                </Text>
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
        )}
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
  actionBtn: { flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  followBtn: { backgroundColor: '#0088cc' },
  followingBtn: { backgroundColor: '#f0f0f0' },
  followText: { fontWeight: '700', fontSize: 15, color: '#fff' },
  followingText: { fontWeight: '700', fontSize: 15, color: '#1a1a1a' },
  actionBtnOutline: { flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: '#d0d0d0', backgroundColor: '#fff' },
  btnTextOutline: { fontWeight: '700', fontSize: 15, color: '#1a1a1a' },
  tabContainer: { flexDirection: 'row', width: '100%', justifyContent: 'space-around', marginTop: 20, borderTopWidth: 1, borderTopColor: '#f0f0f0', paddingTop: 15 },
  tabActive: { borderBottomWidth: 2, borderBottomColor: '#0088cc', paddingBottom: 10, width: 60, alignItems: 'center' },
  emptyState: { alignItems: 'center', marginTop: 50 },
  emptyText: { color: '#888', fontSize: 16, marginTop: 10, fontWeight: '500' }
});