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
  const [category, setCategory] = useState('Social'); 
  const [image, setImage] = useState(null);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      const formData = new FormData();
      formData.append('title', title);
      formData.append('content', content);
      formData.append('category', category);
      formData.append('anonymous', String(isAnonymous));

      if (image) {
        let filename = image.split('/').pop();
        let match = /\.(\w+)$/.exec(filename);
        let type = match ? `image/${match[1]}` : `image`;
        formData.append('postImage', { uri: image, name: filename, type });
      }

      // Your api.js interceptor automatically handles the Bearer token authorization header!
      await api.post('/post/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setTitle('');
      setContent('');
      setImage(null);
      setIsAnonymous(false);
      setCategory('Social');

      Alert.alert('Success!', 'Your post is live.');
      navigation.goBack(); 
    } catch (error) {
      console.log(error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to create post');
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayAvatar = isAnonymous 
    ? 'https://cdn-icons-png.flaticon.com/512/149/149071.png' 
    : (user?.profileUrl || 'https://via.placeholder.com/150');
  
  const displayName = isAnonymous ? 'Anonymous' : (user?.name || 'User');

  const getCategoryActiveStyle = (cat) => {
    if (category !== cat) return {};
    switch(cat) {
      case 'Health': return { backgroundColor: '#EF4444', borderColor: '#EF4444' };
      case 'Education': return { backgroundColor: '#0088cc', borderColor: '#0088cc' };
      case 'Social': return { backgroundColor: '#10B981', borderColor: '#10B981' };
      default: return { backgroundColor: '#0088cc', borderColor: '#0088cc' };
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
          <Ionicons name="close" size={26} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Post</Text>
        <TouchableOpacity 
          onPress={handlePost} 
          disabled={isSubmitting || !title.trim() || !content.trim()} 
          style={[styles.postBtn, (!title.trim() || !content.trim()) && styles.postBtnDisabled]}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.postBtnText}>Post</Text>
          )}
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={styles.keyboardView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
      >
        <ScrollView 
          showsVerticalScrollIndicator={false} 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* USER INFO & ANONYMOUS TOGGLE */}
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
                style={{ transform: [{ scaleX: 0.85 }, { scaleY: 0.85 }] }} 
              />
            </View>
          </View>

          {/* CATEGORY SELECTOR */}
          <View style={styles.categoryContainer}>
            <Text style={styles.sectionLabel}>TOPIC</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
              {['Social', 'Health', 'Education'].map((cat) => {
                const isActive = category === cat;
                return (
                  <TouchableOpacity 
                    key={cat} 
                    style={[styles.catBadge, isActive && getCategoryActiveStyle(cat)]}
                    onPress={() => setCategory(cat)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.catText, isActive && styles.catTextActive]}>{cat}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* TEXT INPUTS */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.titleInput}
              placeholder="An interesting title..."
              placeholderTextColor="#D1D5DB"
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
          </View>

          {/* IMAGE PREVIEW */}
          {image && (
            <View style={styles.imagePreviewContainer}>
              <Image source={{ uri: image }} style={styles.imagePreview} />
              <TouchableOpacity style={styles.removeImageBtn} onPress={() => setImage(null)}>
                <Ionicons name="close" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>

        {/* BOTTOM TOOLBAR */}
        <View style={styles.toolbar}>
          <TouchableOpacity style={styles.toolBtn} onPress={pickImage} activeOpacity={0.7}>
            <Ionicons name="image" size={22} color="#0088cc" />
            <Text style={styles.toolText}>Add Photo</Text>
          </TouchableOpacity>
          <Text style={styles.charCount}>{title.length}/100</Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  keyboardView: { flex: 1, justifyContent: 'space-between' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F3F4F6', backgroundColor: '#ffffff', zIndex: 10 },
  iconBtn: { padding: 4, marginLeft: -4 },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#111827' },
  postBtn: { backgroundColor: '#0088cc', paddingHorizontal: 20, paddingVertical: 8, borderRadius: 24, justifyContent: 'center', alignItems: 'center', minWidth: 70 },
  postBtnDisabled: { backgroundColor: '#93C5FD' },
  postBtnText: { color: '#ffffff', fontWeight: '700', fontSize: 14 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 },
  userRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 },
  userInfo: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 44, height: 44, borderRadius: 22, marginRight: 12, backgroundColor: '#F3F4F6' },
  userName: { fontSize: 16, fontWeight: '700', color: '#111827', letterSpacing: 0.2 },
  userHandle: { fontSize: 13, color: '#6B7280', marginTop: 2, fontWeight: '500' },
  anonymousToggle: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: '#F3F4F6' },
  anonymousText: { fontSize: 13, fontWeight: '600', color: '#374151', marginRight: 8 },
  categoryContainer: { marginBottom: 24 },
  sectionLabel: { fontSize: 11, fontWeight: '700', color: '#9CA3AF', letterSpacing: 1.2, marginBottom: 12 },
  categoryScroll: { marginRight: -20, paddingRight: 20 },
  catBadge: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#F3F4F6', marginRight: 10, borderWidth: 1, borderColor: '#F3F4F6' },
  catText: { color: '#6B7280', fontWeight: '600', fontSize: 13 },
  catTextActive: { color: '#ffffff' },
  inputContainer: { marginBottom: 20 },
  titleInput: { fontSize: 22, fontWeight: '700', color: '#111827', marginBottom: 12, lineHeight: 28 }, 
  contentInput: { fontSize: 16, color: '#374151', minHeight: 160, lineHeight: 24, fontWeight: '400' }, 
  imagePreviewContainer: { marginTop: 10, position: 'relative', borderRadius: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 3 },
  imagePreview: { width: '100%', height: 260, borderRadius: 16, backgroundColor: '#F3F4F6' },
  removeImageBtn: { position: 'absolute', top: 12, right: 12, backgroundColor: 'rgba(17, 24, 39, 0.7)', borderRadius: 20, padding: 6 },
  toolbar: { borderTopWidth: 1, borderColor: '#F3F4F6', backgroundColor: '#ffffff', paddingHorizontal: 16, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  toolBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F0F9FF', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  toolText: { marginLeft: 6, fontSize: 14, color: '#0088cc', fontWeight: '700' },
  charCount: { fontSize: 12, color: '#9CA3AF', fontWeight: '600' }
});