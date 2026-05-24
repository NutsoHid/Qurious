import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'; 
import { Ionicons } from '@expo/vector-icons';
import PostCard from '../components/PostCard'; 
import { DEMO_POSTS, DEMO_USERS } from '../constants/demoData'; 

export default function ProfileScreen({ route }) {
  const [activeTab, setActiveTab] = useState('Posts'); 

  const userId = route?.params?.userId || 'rambabu'; 
  const user = DEMO_USERS[userId];
  

  const isMe = userId === 'rambabu';

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>User Profile Not Found</Text>
      </SafeAreaView>
    );
  }

  const myPosts = DEMO_POSTS.filter(post => post.authorId === userId);

  const handleEditProfile = () => {
    Alert.alert("Edit Profile", "This feature will be connected to the MongoDB backend soon!");
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topActionHeader}>
        <Text style={styles.headerTitle}>
          {isMe ? 'My Profile' : `${user.username}`}
        </Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="search-outline" size={22} color="#555" />
          </TouchableOpacity>
          {isMe && (
            <TouchableOpacity style={styles.iconButton} onPress={handleEditProfile}>
              <Ionicons name="settings-outline" size={22} color="#555" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        <View style={styles.profileCard}>
          <View style={styles.imagePlaceholder}>
             <Image source={{ uri: user.profileImage }} style={styles.profileImage} />
          </View>
          <View style={styles.textInfo}>
            <Text style={styles.username}>
              {user.username} {user.role === 'admin' && '🛡️'}
            </Text>
            <View style={styles.statsRow}> 
              <Text style={styles.userId}>{user.handle}</Text>
              <Text style={styles.dotSeparator}>•</Text>
              <Text style={styles.followerCount}>{user.followers} Followers</Text>
            </View>
          </View>
        </View>

        <View style={styles.bioContainer}>
          <Text style={styles.bioText}>{user.bio}</Text>
        </View>

        {isMe && (
          <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        )}

        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'Posts' && styles.activeTab]} 
            onPress={() => setActiveTab('Posts')}
          >
            <Text style={[styles.tabText, activeTab === 'Posts' && styles.activeTabText]}>
              Posts ({myPosts.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'Comments' && styles.activeTab]} 
            onPress={() => setActiveTab('Comments')}
          >
            <Text style={[styles.tabText, activeTab === 'Comments' && styles.activeTabText]}>
              Comments
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'Posts' ? (
          <View>
            {myPosts.map(post => (
              <PostCard 
                key={post.id}
                authorId={post.authorId}
                time={post.time} 
                caption={post.caption}
                image={post.image}
              />
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Text style={{ color: '#888' }}>No comments posted yet.</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  topActionHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    paddingHorizontal: 20, 
    paddingVertical: 15 
  },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  headerIcons: { flexDirection: 'row' },
  iconButton: { marginLeft: 20 },
  profileCard: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 20, 
    paddingTop: 10, 
    marginBottom: 10 
  },
  imagePlaceholder: { 
    width: 70, 
    height: 70, 
    borderRadius: 15, 
    overflow: 'hidden', 
    backgroundColor: '#eee' 
  },
  profileImage: { width: 70, height: 70 },
  textInfo: { marginLeft: 15 },
  username: { fontSize: 22, fontWeight: '800' },
  statsRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  userId: { fontSize: 14, color: '#888' },
  dotSeparator: { marginHorizontal: 6, color: '#ccc' },
  followerCount: { fontSize: 14, fontWeight: '600', color: '#0088cc' },
  bioContainer: { paddingHorizontal: 20, marginBottom: 15 },
  bioText: { color: '#444', lineHeight: 20 },
  
  editButton: {
    marginHorizontal: 20,
    backgroundColor: '#f0f0f0',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  editButtonText: {
    fontWeight: '700',
    color: '#333',
  },

  tabContainer: { 
    flexDirection: 'row', 
    borderBottomWidth: 1, 
    borderBottomColor: '#eee', 
    paddingHorizontal: 20 
  },
  tab: { 
    paddingVertical: 12, 
    marginRight: 30, 
    borderBottomWidth: 2, 
    borderBottomColor: 'transparent' 
  },
  activeTab: { borderBottomColor: '#0088cc' },
  tabText: { fontSize: 16, fontWeight: '600', color: '#888' },
  activeTabText: { color: '#000' },
  emptyState: { padding: 40, alignItems: 'center' },
  errorText: { padding: 20, color: 'red', textAlign: 'center' }
});