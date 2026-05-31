import React, { useState, useCallback, useContext } from 'react';
import { 
  View, Text, StyleSheet, Image, TouchableOpacity, FlatList, 
  ActivityIndicator, RefreshControl, Modal, TextInput, 
  KeyboardAvoidingView, Platform, Alert, ScrollView 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect } from '@react-navigation/native';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import PostCard from '../components/PostCard';

export default function ProfileScreen({ navigation }) {
  const { user, logout, updateUserContext } = useContext(AuthContext);
  
  // Data State
  const [localProfile, setLocalProfile] = useState(user); // 🔥 FIX: Local state for immediate UI updates
  const [myPosts, setMyPosts] = useState([]);
  const [myComments, setMyComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('posts'); 

  // Edit Profile State
  const [isEditModalVisible, setEditModalVisible] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [editProfession, setEditProfession] = useState(user?.profession || '');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newProfileImage, setNewProfileImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useFocusEffect(
    useCallback(() => {
      fetchUserData();
    }, [user?.userName])
  );

  const fetchUserData = async () => {
    try {
      const [postsRes, commentsRes, profileRes] = await Promise.all([
        api.get('/user/myPosts'),
        api.get('/comment/myComments'),
        api.get(`/user/profile/${user?.userName}`) 
      ]);

      setMyPosts(postsRes.data.posts || []);
      setMyComments(commentsRes.data.comments || []);

      const fetchedProfile = profileRes.data?.profile;
      if (fetchedProfile) {
        setLocalProfile(fetchedProfile); // 🔥 FIX: Update local state to instantly refresh followers count
        
        if (updateUserContext) {
          updateUserContext(fetchedProfile);
        }
      }
      
    } catch (error) {
      console.log("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchUserData();
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to log out of Qurious?", [
      { text: "Cancel", style: "cancel" },
      { text: "Logout", style: "destructive", onPress: () => logout() }
    ]);
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'], 
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setNewProfileImage(result.assets[0].uri);
    }
  };

  const handleUpdateProfile = async () => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      
      if (editName) formData.append('name', editName);
      if (editProfession) formData.append('profession', editProfession);
      
      if (oldPassword && newPassword) {
        formData.append('oldPassword', oldPassword);
        formData.append('newPassword', newPassword);
      } else if (oldPassword || newPassword) {
        Alert.alert("Hold up!", "Please enter both your old and new passwords to change it.");
        setIsSubmitting(false);
        return;
      }

      if (newProfileImage) {
        let filename = newProfileImage.split('/').pop();
        let match = /\.(\w+)$/.exec(filename);
        let type = match ? `image/${match[1]}` : `image/jpeg`;
        formData.append('profileImage', { uri: newProfileImage, name: filename, type });
      }

      const response = await api.post('/user/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (updateUserContext && response.data.user) {
        updateUserContext(response.data.user);
        setLocalProfile(response.data.user); // Update local profile after edit
      }

      Alert.alert("Success", "Your profile has been updated!");
      setEditModalVisible(false);
      
      setOldPassword('');
      setNewPassword('');
      setNewProfileImage(null);
      fetchUserData(); 
    } catch (error) {
      console.log("Profile update error:", error);
      Alert.alert("Error", error.response?.data?.message || "Failed to update profile.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCommentPress = (postId) => {
    if (!postId) {
      Alert.alert("Unavailable", "The original post has been deleted.");
      return;
    }
    navigation.navigate('SinglePostScreen', { postId });
  };

  const renderCommentItem = ({ item }) => {
    const dateText = item.createdAt 
      ? new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) 
      : '';

    return (
      <TouchableOpacity 
        style={styles.commentCard} 
        activeOpacity={0.7}
        onPress={() => handleCommentPress(item.post?._id)} 
      >
        <View style={styles.commentHeader}>
          <Ionicons name="chatbubble-outline" size={14} color="#6B7280" style={styles.commentIcon} />
          <Text style={styles.commentMetaText}>You replied to a post</Text>
          {dateText ? <Text style={styles.commentDate}> • {dateText}</Text> : null}
        </View>
        
        <View style={styles.referencedPostBox}>
          <Text style={styles.commentPostTitle} numberOfLines={1}>
            {item.post?.title || 'This post has been deleted'}
          </Text>
        </View>

        <View style={styles.commentBody}>
          <Text style={styles.commentText}>{item.content}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const displayAvatar = localProfile?.profileUrl || 'https://via.placeholder.com/150';

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* 1. DASHBOARD HEADER */}
      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          <Text style={styles.headerTitle}>My Dashboard</Text>
          
          <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
            <Ionicons name="log-out-outline" size={20} color="#E0245E" />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.profileInfoContainer}>
          <Image source={{ uri: displayAvatar }} style={styles.profileAvatar} />
          <View style={styles.profileTextContainer}>
            <Text style={styles.profileName}>{localProfile?.name || 'User'}</Text>
            <Text style={styles.profileHandle}>@{localProfile?.userName || 'username'}</Text>
            {localProfile?.profession ? (
              <View style={styles.professionBadge}>
                <Text style={styles.professionText}>{localProfile.profession}</Text>
              </View>
            ) : null}
          </View>
        </View>

        {/* FOLLOWERS & FOLLOWING STATS ROW */}
        <View style={styles.socialStatsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statCount}>{localProfile?.followers?.length || 0}</Text>
            <Text style={styles.statLabel}>Followers</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statCount}>{localProfile?.following?.length || 0}</Text>
            <Text style={styles.statLabel}>Following</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.editProfileBtn} onPress={() => setEditModalVisible(true)}>
          <Text style={styles.editProfileBtnText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>

      {/* 2. TAB NAVIGATOR (POSTS vs COMMENTS) */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tabBtn, activeTab === 'posts' && styles.activeTabBtn]} 
          onPress={() => setActiveTab('posts')}
        >
          <Text style={[styles.tabText, activeTab === 'posts' && styles.activeTabText]}>
            My Posts ({myPosts.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tabBtn, activeTab === 'comments' && styles.activeTabBtn]} 
          onPress={() => setActiveTab('comments')}
        >
          <Text style={[styles.tabText, activeTab === 'comments' && styles.activeTabText]}>
            My Comments ({myComments.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* 3. CONTENT FEED */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#0088cc" />
        </View>
      ) : (
        <FlatList
          data={activeTab === 'posts' ? myPosts : myComments}
          keyExtractor={(item) => item._id}
          renderItem={activeTab === 'posts' ? ({ item }) => <PostCard post={item} disableProfileClick={true} /> : renderCommentItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.feedScrollPadding}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0088cc" />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name={activeTab === 'posts' ? "document-text-outline" : "chatbubbles-outline"} size={48} color="#D1D5DB" />
              <Text style={styles.emptyText}>
                {activeTab === 'posts' ? "You haven't created any posts yet." : "You haven't made any comments yet."}
              </Text>
            </View>
          }
        />
      )}

      {/* 4. EDIT PROFILE MODAL */}
      <Modal visible={isEditModalVisible} animationType="slide" transparent={true}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Profile</Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <Ionicons name="close-circle" size={28} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalScroll}>
              <View style={styles.imageEditContainer}>
                <Image source={{ uri: newProfileImage || displayAvatar }} style={styles.editAvatar} />
                <TouchableOpacity style={styles.changePhotoBtn} onPress={pickImage}>
                  <Ionicons name="camera" size={20} color="#fff" />
                </TouchableOpacity>
              </View>

              <Text style={styles.inputLabel}>Name</Text>
              <TextInput style={styles.input} value={editName} onChangeText={setEditName} placeholder="Your Name" />

              <Text style={styles.inputLabel}>Profession</Text>
              <TextInput style={styles.input} value={editProfession} onChangeText={setEditProfession} placeholder="e.g. Software Engineer" />

              <View style={styles.divider} />
              <Text style={styles.sectionTitle}>Change Password</Text>
              
              <Text style={styles.inputLabel}>Old Password</Text>
              <TextInput style={styles.input} value={oldPassword} onChangeText={setOldPassword} secureTextEntry placeholder="Enter old password" />

              <Text style={styles.inputLabel}>New Password</Text>
              <TextInput style={styles.input} value={newPassword} onChangeText={setNewPassword} secureTextEntry placeholder="Enter new password" />

              <TouchableOpacity style={styles.saveBtn} onPress={handleUpdateProfile} disabled={isSubmitting}>
                {isSubmitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Save Changes</Text>}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50 },
  
  // Header Styles
  header: { backgroundColor: '#fff', paddingHorizontal: 20, paddingTop: 15, paddingBottom: 18, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  headerTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#111827' },
  
  logoutBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#FEF2F2', borderRadius: 20 },
  logoutText: { color: '#E0245E', fontWeight: '700', fontSize: 14, marginLeft: 6 },
  
  profileInfoContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  profileAvatar: { width: 74, height: 74, borderRadius: 37, backgroundColor: '#E5E7EB', marginRight: 15 },
  profileTextContainer: { flex: 1 },
  profileName: { fontSize: 20, fontWeight: '700', color: '#111827' },
  profileHandle: { fontSize: 15, color: '#6B7280', marginBottom: 6 },
  professionBadge: { alignSelf: 'flex-start', backgroundColor: '#E0F2FE', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  professionText: { color: '#0284C7', fontSize: 12, fontWeight: '700' },
  
  // Follower / Following Stats
  socialStatsRow: { flexDirection: 'row', backgroundColor: '#F9FAFB', paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: '#F3F4F6', marginBottom: 14, justifyContent: 'space-around', alignItems: 'center' },
  statBox: { flex: 1, alignItems: 'center' },
  statCount: { fontSize: 18, fontWeight: '800', color: '#111827' },
  statLabel: { fontSize: 13, color: '#6B7280', fontWeight: '500', marginTop: 2 },
  statDivider: { width: 1, height: 24, backgroundColor: '#E5E7EB' },

  editProfileBtn: { width: '100%', paddingVertical: 12, borderRadius: 10, borderWidth: 1, borderColor: '#D1D5DB', alignItems: 'center', backgroundColor: '#F9FAFB' },
  editProfileBtnText: { color: '#374151', fontSize: 15, fontWeight: '700' },

  // Tab Styles
  tabContainer: { flexDirection: 'row', backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  tabBtn: { flex: 1, paddingVertical: 15, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  activeTabBtn: { borderBottomColor: '#0088cc' },
  tabText: { fontSize: 15, fontWeight: '600', color: '#6B7280' },
  activeTabText: { color: '#0088cc' },

  feedScrollPadding: { paddingBottom: 110, paddingTop: 6 },

  emptyContainer: { alignItems: 'center', marginTop: 60, paddingHorizontal: 20 },
  emptyText: { fontSize: 16, color: '#9CA3AF', marginTop: 15, textAlign: 'center', fontWeight: '500' },

  // --- REDESIGNED COMMENT CARD STYLES ---
  commentCard: { 
    backgroundColor: '#fff', 
    padding: 16, 
    marginHorizontal: 16, 
    marginTop: 12, 
    borderRadius: 16, 
    borderWidth: 1, 
    borderColor: '#F3F4F6', 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.04, 
    shadowRadius: 4, 
    elevation: 2 
  },
  commentHeader: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 10 
  },
  commentIcon: { 
    marginRight: 6,
    marginTop: 1
  },
  commentMetaText: { 
    fontSize: 13, 
    color: '#6B7280', 
    fontWeight: '500' 
  },
  commentDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  referencedPostBox: { 
    borderLeftWidth: 3, 
    borderLeftColor: '#0088cc', 
    paddingLeft: 12, 
    marginBottom: 12,
    paddingVertical: 2
  },
  commentPostTitle: { 
    fontSize: 14, 
    color: '#4B5563', 
    fontWeight: '600',
    fontStyle: 'italic'
  },
  commentBody: { 
    marginTop: 2 
  },
  commentText: { 
    fontSize: 15, 
    color: '#111827', 
    lineHeight: 22 
  },

  // Modal Styles
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { backgroundColor: '#fff', height: '88%', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 20, paddingTop: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 22, fontWeight: '800', color: '#111827' },
  modalScroll: { paddingBottom: 40 },
  
  imageEditContainer: { alignSelf: 'center', position: 'relative', marginBottom: 25, marginTop: 10 },
  editAvatar: { width: 110, height: 110, borderRadius: 55, backgroundColor: '#E5E7EB' },
  changePhotoBtn: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#0088cc', width: 38, height: 38, borderRadius: 19, justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: '#fff' },
  
  divider: { height: 1, backgroundColor: '#E5E7EB', marginVertical: 25 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 15 },
  inputLabel: { fontSize: 13, fontWeight: '600', color: '#6B7280', marginBottom: 6 },
  input: { backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, paddingHorizontal: 15, paddingVertical: 14, fontSize: 15, color: '#111827', marginBottom: 16 },
  
  saveBtn: { backgroundColor: '#0088cc', paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginTop: 10, shadowColor: '#0088cc', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' }
});