import React, { useState, useContext } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, Image, 
  KeyboardAvoidingView, Platform, Alert, ActivityIndicator, ScrollView, Switch 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import api from '../services/api'; 
import { AuthContext } from '../context/AuthContext';

export default function CreateScreen({ navigation }) {
  const { user } = useContext(AuthContext);
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('Social'); // Default
  const [image, setImage] = useState(null);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pick an image from phone gallery
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImage(result.assets[0].uri);
    }
  };

  const handlePost = async () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert('Hold up!', 'Please enter a title and content.');
      return;
    }

    setIsSubmitting(true);
    try {
      // We MUST use FormData because we are sending a physical image file to Cloudinary
      const formData = new FormData();
      formData.append('title', title);
      formData.append('content', content);
      formData.append('category', category);
      
      // Convert boolean to string for FormData
      formData.append('anonymous', String(isAnonymous));

      // Append image if user selected one
      if (image) {
        let filename = image.split('/').pop();
        let match = /\.(\w+)$/.exec(filename);
        let type = match ? `image/${match[1]}` : `image`;

        // 'postImage' matches your backend configuration
        formData.append('postImage', { uri: image, name: filename, type });
      }

      await api.post('/post/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // ✅ FIX: Clear all input states immediately on success before navigating away
      setTitle('');
      setContent('');
      setImage(null);
      setIsAnonymous(false);
      setCategory('Social');

      Alert.alert('Success!', 'Your post is live.');
      navigation.goBack(); // Return to Feed
    } catch (error) {
      console.log(error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to create post');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Determine what avatar/name to show based on Anonymous toggle
  const displayAvatar = isAnonymous 
    ? 'https://cdn-icons-png.flaticon.com/512/149/149071.png' 
    : (user?.profileUrl || 'https://via.placeholder.com/150');
  
  const displayName = isAnonymous ? 'Anonymous' : (user?.name || 'User');

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      
      {/* 1. PREMIUM HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
          <Ionicons name="close" size={28} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Post</Text>
        <TouchableOpacity 
          onPress={handlePost} 
          disabled={isSubmitting || !title.trim() || !content.trim()} 
          style={[styles.postBtn, (!title.trim() || !content.trim()) && styles.postBtnDisabled]}
        >
          {isSubmitting ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.postBtnText}>Post</Text>}
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          
          {/* 2. USER INFO & ANONYMOUS TOGGLE */}
          <View style={styles.userRow}>
            <View style={styles.userInfo}>
              <Image source={{ uri: displayAvatar }} style={styles.avatar} />
              <View>
                <Text style={styles.userName}>{displayName}</Text>
                <Text style={styles.userHandle}>{isAnonymous ? 'Identity Hidden' : 'Public Post'}</Text>
              </View>
            </View>
            
            <View style={styles.anonymousToggle}>
              <Text style={styles.anonymousText}>Anonymous</Text>
              <Switch
                trackColor={{ false: "#D1D5DB", true: "#0088cc" }}
                thumbColor={"#ffffff"}
                ios_backgroundColor="#D1D5DB"
                onValueChange={() => setIsAnonymous(!isAnonymous)}
                value={isAnonymous}
              />
            </View>
          </View>

          {/* 3. CATEGORY SELECTOR (SCROLLABLE PILLS) */}
          <View style={styles.categoryContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {['Social', 'Health', 'Education', 'Trending'].map((cat) => (
                <TouchableOpacity 
                  key={cat} 
                  style={[styles.catBadge, category === cat && styles.catBadgeActive]}
                  onPress={() => setCategory(cat)}
                >
                  <Text style={[styles.catText, category === cat && styles.catTextActive]}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* 4. SEAMLESS TEXT INPUTS */}
          <TextInput
            style={styles.titleInput}
            placeholder="An interesting title..."
            placeholderTextColor="#9CA3AF"
            value={title}
            onChangeText={setTitle}
            maxLength={100}
          />

          <TextInput
            style={styles.contentInput}
            placeholder="What do you want to talk about?"
            placeholderTextColor="#9CA3AF"
            multiline
            value={content}
            onChangeText={setContent}
            textAlignVertical="top"
          />

          {/* 5. BEAUTIFUL IMAGE PREVIEW */}
          {image && (
            <View style={styles.imagePreviewContainer}>
              <Image source={{ uri: image }} style={styles.imagePreview} />
              <TouchableOpacity style={styles.removeImageBtn} onPress={() => setImage(null)}>
                <Ionicons name="close-circle" size={28} color="#fff" />
              </TouchableOpacity>
            </View>
          )}

        </ScrollView>

        {/* 6. BOTTOM TOOLBAR FOR GALLERY */}
        <View style={styles.toolbar}>
          <TouchableOpacity style={styles.toolBtn} onPress={pickImage}>
            <Ionicons name="image-outline" size={26} color="#0088cc" />
            <Text style={styles.toolText}>Add Photo</Text>
          </TouchableOpacity>
        </View>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 15, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  iconBtn: { padding: 5 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
  postBtn: { backgroundColor: '#0088cc', paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  postBtnDisabled: { backgroundColor: '#93C5FD' },
  postBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  
  scrollContent: { paddingHorizontal: 20, paddingTop: 15, paddingBottom: 100 },
  
  userRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  userInfo: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 46, height: 46, borderRadius: 23, marginRight: 12, backgroundColor: '#F3F4F6' },
  userName: { fontSize: 16, fontWeight: '700', color: '#111827' },
  userHandle: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  anonymousToggle: { alignItems: 'center' },
  anonymousText: { fontSize: 11, fontWeight: '600', color: '#6B7280', marginBottom: 4 },

  categoryContainer: { marginBottom: 20, marginRight: -20 },
  catBadge: { paddingHorizontal: 18, paddingVertical: 8, borderRadius: 20, backgroundColor: '#F3F4F6', marginRight: 10 },
  catBadgeActive: { backgroundColor: '#0088cc' },
  catText: { color: '#6B7280', fontWeight: '600', fontSize: 14 },
  catTextActive: { color: '#ffffff' },

  titleInput: { fontSize: 24, fontWeight: '800', color: '#111827', marginBottom: 15 },
  contentInput: { fontSize: 18, color: '#374151', minHeight: 150, lineHeight: 26 },
  
  imagePreviewContainer: { marginTop: 15, position: 'relative', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 },
  imagePreview: { width: '100%', height: 250, borderRadius: 16 },
  removeImageBtn: { position: 'absolute', top: 10, right: 10, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 15 },
  
  toolbar: { borderTopWidth: 1, borderColor: '#F3F4F6', backgroundColor: '#fff', padding: 15, flexDirection: 'row', alignItems: 'center' },
  toolBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F0F9FF', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20 },
  toolText: { marginLeft: 8, fontSize: 15, color: '#0088cc', fontWeight: '700' }
});