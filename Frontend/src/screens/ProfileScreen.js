import React, { useState, useContext, useEffect } from 'react';
import { 
  View, Text, StyleSheet, Image, TouchableOpacity, FlatList, 
  ActivityIndicator, RefreshControl, Modal, TextInput, KeyboardAvoidingView, Platform, Alert, ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import PostCard from '../components/PostCard'; 

export default function ProfileScreen({ navigation }) {
  // Make sure you have a logout function in your AuthContext!
  const { user, setUser, logout } = useContext(AuthContext); 
  
  const [myPosts, setMyPosts] = useState([]);
  const [myComments, setMyComments] = useState([]);
  const [activeTab, setActiveTab] = useState('posts'); // 'posts' or 'comments'
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Edit Profile State
  const [isEditModalVisible, setEditModalVisible] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [editProfession, setEditProfession] = useState(user?.profession || '');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newAvatar, setNewAvatar] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    setLoading(true);
    try {
      // We fetch both Posts and Comments at the same time!
      const [postsRes, commentsRes] = await Promise.all([
        api.get('/user/myPosts'),
        api.get('/comment/myComments') // This hits the route your friend made earlier!
      ]);
      setMyPosts(postsRes.data.posts || []);
      setMyComments(commentsRes.data.comments || []);
    } catch (error) {
      console.log("Error fetching profile data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      { 
        text: "Logout", 
        style: "destructive", 
        onPress: () => {
          if (logout) {
            logout();
          } else {
            console.log("Please add logout() to your AuthContext!");
          }
        }
      }
    ]);
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets.length > 0) {
      setNewAvatar(result.assets[0].uri);
    }
  };

 const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const formData = new FormData();
      
      // Append text data safely
      if (editName && editName !== user.name) formData.append('name', editName);
      if (editProfession && editProfession !== user.profession) formData.append('profession', editProfession);
      
      // Append password data
      if (newPassword) {
        if (!oldPassword) {
          Alert.alert("Error", "Please enter your old password to set a new one.");
          setIsSaving(false);
          return;
        }
        formData.append('oldPassword', oldPassword);
        formData.append('newPassword', newPassword);
      }

      if (newAvatar) {
        let filename = newAvatar.split('/').pop();
        let match = /\.(\w+)$/.exec(filename);
        
        // ✅ FIX: Added [1] to properly grab the extension string!
        let type = match ? `image/${match[1]}` : `image/jpeg`;

        // Standardize jpg to jpeg (Multer prefers jpeg)
        if (type === 'image/jpg') type = 'image/jpeg';

        formData.append('profileImage', {
          uri: Platform.OS === 'ios' ? newAvatar.replace('file://', '') : newAvatar,
          name: filename,
          type: type
        });
      }

      const response = await api.post('/user/profile', formData, {
        headers: { 
          'Accept': 'application/json',
          'Content-Type': 'multipart/form-data' 
        },
      });

      // Update local context/state so UI refreshes immediately
      if (setUser) setUser(response.data.user);
      
      Alert.alert("Success", "Profile updated successfully!");
      setEditModalVisible(false);
      
      // Clear password fields for security
      setOldPassword('');
      setNewPassword('');
      setNewAvatar(null);
      fetchUserData(); 
    } catch (error) {
      console.log("Upload Error Details: ", error.response?.data || error.message);
      Alert.alert("Error", error.response?.data?.message || "Failed to update profile.");
    } finally {
      setIsSaving(false);
    }
  };

  // --- UI COMPONENTS ---

  const renderComment = ({ item }) => (
    <View style={styles.commentCard}>
      <View style={styles.commentHeader}>
        <Ionicons name="chatbubble" size={16} color="#0088cc" />
        <Text style={styles.commentPostTitle} numberOfLines={1}>
          Commented on: {item.post?.title || 'Unknown Post'}
        </Text>
      </View>
      <Text style={styles.commentContent}>{item.content}</Text>
    </View>
  );

  const ProfileHeader = () => (
    <View style={styles.headerContainer}>
      <View style={styles.topRow}>
        <Image 
          source={{ uri: user?.profileUrl || 'https://via.placeholder.com/150' }} 
          style={styles.profileAvatar} 
        />
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{myPosts.length}</Text>
            <Text style={styles.statLabel}>Posts</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{myComments.length}</Text>
            <Text style={styles.statLabel}>Comments</Text>
          </View>
        </View>
      </View>
      
      <Text style={styles.profileName}>{user?.name}</Text>
      <Text style={styles.profileHandle}>@{user?.userName}</Text>
      {user?.profession ? <Text style={styles.profileBio}>{user.profession}</Text> : null}

      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.editBtn} onPress={() => setEditModalVisible(true)}>
          <Text style={styles.editBtnText}>Edit Profile</Text>
        </TouchableOpacity>
        {/* 👇 Added the Logout Button here! */}
      </View>

      {/* 👇 Added the Posts vs Comments Tab System! */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'posts' && styles.activeTab]} 
          onPress={() => setActiveTab('posts')}
        >
          <Text style={[styles.tabText, activeTab === 'posts' && styles.activeTabText]}>My Posts</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'comments' && styles.activeTab]} 
          onPress={() => setActiveTab('comments')}
        >
          <Text style={[styles.tabText, activeTab === 'comments' && styles.activeTabText]}>My Comments</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      
      <View style={styles.navBar}>
        <Text style={styles.navTitle}>{user?.userName}</Text>
        <TouchableOpacity onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={28} color="#EF4444" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#0088cc" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={activeTab === 'posts' ? myPosts : myComments}
          keyExtractor={(item) => item._id}
          ListHeaderComponent={ProfileHeader}
          renderItem={activeTab === 'posts' ? ({ item }) => <PostCard post={item} /> : renderComment}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchUserData} tintColor="#0088cc" />}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name={activeTab === 'posts' ? "create-outline" : "chatbubbles-outline"} size={48} color="#D1D5DB" />
              <Text style={styles.emptyText}>
                {activeTab === 'posts' ? "You haven't posted anything yet." : "You haven't commented on anything yet."}
              </Text>
            </View>
          }
        />
      )}

      {/* --- EDIT PROFILE MODAL --- */}
      <Modal visible={isEditModalVisible} animationType="slide" presentationStyle="pageSheet">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1, backgroundColor: '#fff' }}>
          
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setEditModalVisible(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Edit Profile</Text>
            <TouchableOpacity onPress={handleSaveProfile} disabled={isSaving}>
              {isSaving ? <ActivityIndicator size="small" color="#0088cc" /> : <Text style={styles.saveText}>Save</Text>}
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            <View style={styles.avatarEditContainer}>
              <Image 
                source={{ uri: newAvatar || user?.profileUrl || 'https://via.placeholder.com/150' }} 
                style={styles.avatarEdit} 
              />
              <TouchableOpacity onPress={pickImage} style={styles.changePhotoBtn}>
                <Text style={styles.changePhotoText}>Change Profile Photo</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.sectionLabel}>BASIC INFO</Text>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Name</Text>
              <TextInput style={styles.input} value={editName} onChangeText={setEditName} />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Profession/Bio</Text>
              <TextInput style={styles.input} value={editProfession} onChangeText={setEditProfession} placeholder="What do you do?" />
            </View>

            <Text style={[styles.sectionLabel, { marginTop: 20 }]}>SECURITY (Leave blank to keep current)</Text>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Old Password</Text>
              <TextInput style={styles.input} value={oldPassword} onChangeText={setOldPassword} secureTextEntry placeholder="Required to change password" />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>New Password</Text>
              <TextInput style={styles.input} value={newPassword} onChangeText={setNewPassword} secureTextEntry placeholder="New secure password" />
            </View>

          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  navBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 15, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  navTitle: { fontSize: 20, fontWeight: '800', color: '#111827' },
  
  headerContainer: { backgroundColor: '#fff', paddingTop: 20, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  topRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15, paddingHorizontal: 20 },
  profileAvatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#eee' },
  statsContainer: { flex: 1, flexDirection: 'row', justifyContent: 'space-evenly', marginLeft: 20 },
  statBox: { alignItems: 'center' },
  statNumber: { fontSize: 18, fontWeight: '800', color: '#111827' },
  statLabel: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  
  profileName: { fontSize: 18, fontWeight: '800', color: '#111827', paddingHorizontal: 20 },
  profileHandle: { fontSize: 15, color: '#6B7280', marginTop: 2, paddingHorizontal: 20 },
  profileBio: { fontSize: 15, color: '#374151', marginTop: 10, lineHeight: 22, paddingHorizontal: 20 },
  
  actionButtons: { flexDirection: 'row', marginTop: 15, paddingHorizontal: 20 },
  editBtn: { flex: 1, backgroundColor: '#F3F4F6', paddingVertical: 8, borderRadius: 8, alignItems: 'center', marginRight: 10 },
  editBtnText: { color: '#111827', fontWeight: '700', fontSize: 14 },
  logoutBtn: { flex: 1, backgroundColor: '#FEF2F2', paddingVertical: 8, borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: '#FECACA' },
  logoutBtnText: { color: '#EF4444', fontWeight: '700', fontSize: 14 },

  // Tabs
  tabContainer: { flexDirection: 'row', marginTop: 20, borderTopWidth: 1, borderTopColor: '#F3F4F6' },
  tab: { flex: 1, paddingVertical: 15, alignItems: 'center' },
  activeTab: { borderBottomWidth: 2, borderBottomColor: '#0088cc' },
  tabText: { fontSize: 15, fontWeight: '600', color: '#6B7280' },
  activeTabText: { color: '#0088cc', fontWeight: '800' },

  // Comment Card
  commentCard: { backgroundColor: '#fff', padding: 15, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  commentHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  commentPostTitle: { fontSize: 13, fontWeight: '600', color: '#6B7280', marginLeft: 6, flex: 1 },
  commentContent: { fontSize: 15, color: '#111827', lineHeight: 22 },

  emptyState: { alignItems: 'center', marginTop: 50 },
  emptyText: { marginTop: 10, color: '#9CA3AF', fontSize: 16 },

  // Modal Styles
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  cancelText: { fontSize: 16, color: '#111827' },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
  saveText: { fontSize: 16, color: '#0088cc', fontWeight: '700' },
  modalBody: { padding: 20 },
  
  avatarEditContainer: { alignItems: 'center', marginVertical: 20 },
  avatarEdit: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#eee', marginBottom: 10 },
  changePhotoBtn: { padding: 5 },
  changePhotoText: { color: '#0088cc', fontWeight: '600', fontSize: 15 },
  
  sectionLabel: { fontSize: 13, fontWeight: '700', color: '#9CA3AF', marginBottom: 10, letterSpacing: 1 },
  inputGroup: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#F3F4F6', paddingVertical: 12 },
  inputLabel: { width: 120, fontSize: 16, color: '#111827' },
  input: { flex: 1, fontSize: 16, color: '#374151' }
});