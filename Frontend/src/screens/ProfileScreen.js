import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, Image, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native'; // 1. IMPORT NAVIGATION
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import PostCard from '../components/PostCard';

export default function ProfileScreen() {
  const navigation = useNavigation(); // 2. INITIALIZE NAVIGATION
  const { user, logout } = useContext(AuthContext); 
  const [myPosts, setMyPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyPosts = async () => {
      try {
        const response = await api.get('/post/allPost');
        const allPosts = response.data.posts || [];
        const filtered = allPosts.filter(p => p.user?._id === user?._id);
        setMyPosts(filtered);
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMyPosts();
  }, [user?._id]);

  if (loading) return <ActivityIndicator size="large" color="#0088cc" style={{ flex: 1 }} />;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.topNav}>
        <Text style={styles.headerTitle}>My Profile</Text>
        <View style={styles.iconGroup}>
          <Ionicons name="search" size={24} color="#000" style={styles.icon} />
          <Ionicons name="settings-outline" size={24} color="#000" />
        </View>
      </View>

      <FlatList
        data={myPosts}
        keyExtractor={(item) => item._id}
        ListHeaderComponent={() => (
          <View style={styles.header}>
            <Image source={{ uri: user?.profileUrl || 'https://via.placeholder.com/150' }} style={styles.avatar} />
            <Text style={styles.name}>{user?.name || 'User Name'}</Text>
            <Text style={styles.handle}>@{user?.userName || 'username'}</Text>
            
            <TouchableOpacity style={styles.statsContainer}>
              <Text style={styles.statsText}>{user?.friends?.length || 0} Friends</Text>
            </TouchableOpacity>
            
            <Text style={styles.bio}>{user?.profession || 'Health expert & AI enthusiast'}</Text>
            
            <View style={styles.buttonRow}>
              {/* 3. THE FIX IS HERE -> navigation.navigate('EditProfile') */}
              <TouchableOpacity 
                style={styles.editBtn} 
                onPress={() => navigation.navigate('EditProfile')}
              >
                <Text style={styles.editBtnText}>Edit Profile</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
                <Ionicons name="log-out-outline" size={22} color="#ff4444" />
              </TouchableOpacity>
            </View>

            <View style={styles.tabContainer}>
              <Text style={styles.tabActive}>Posts ({myPosts.length})</Text>
              <Text style={styles.tabInactive}>Comments</Text>
            </View>
          </View>
        )}
        renderItem={({ item }) => (
          <PostCard username={item.user?.userName} caption={item.content} image={item.imageUrl} />
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>No posts yet.</Text>}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  topNav: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: 'bold' },
  iconGroup: { flexDirection: 'row' },
  icon: { marginRight: 20 },
  header: { alignItems: 'center', paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#eee' },
  avatar: { width: 100, height: 100, borderRadius: 50, marginBottom: 12 },
  name: { fontSize: 24, fontWeight: '900', color: '#1a1a1a' },
  handle: { fontSize: 16, color: '#666', marginBottom: 10 },
  statsContainer: { marginBottom: 10 },
  statsText: { fontSize: 16, fontWeight: 'bold', color: '#0088cc' },
  bio: { fontSize: 16, color: '#444', textAlign: 'center', marginBottom: 20, paddingHorizontal: 20 },
  buttonRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  editBtn: { backgroundColor: '#f0f0f0', paddingVertical: 12, paddingHorizontal: 100, borderRadius: 8, marginRight: 10 },
  editBtnText: { fontWeight: 'bold', fontSize: 16, color: '#000' },
  logoutBtn: { backgroundColor: '#fff0f0', padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#ff4444' },
  tabContainer: { flexDirection: 'row', width: '100%', justifyContent: 'space-around', marginTop: 10 },
  tabActive: { fontWeight: 'bold', fontSize: 16, borderBottomWidth: 2, borderBottomColor: '#0088cc', paddingBottom: 5 },
  tabInactive: { fontWeight: 'bold', fontSize: 16, color: '#888' },
  emptyText: { textAlign: 'center', marginTop: 20, color: '#888' }
});