import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Image, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

export default function CreateScreen() {
  const navigation = useNavigation();
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const [category, setCategory] = useState('Social'); // Default category
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImage(result.assets.uri);
    }
  };

  const handlePost = async () => {
    if (!title || !content) {
      Alert.alert('Hold on', 'Title and Content are required to post.');
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('content', content);
      formData.append('category', category);
      formData.append('anonymous', isAnonymous.toString());

      if (image) {
        let filename = image.split('/').pop();
        let match = /\.(\w+)$/.exec(filename);
        let type = match ? `image/${match[1]}` : `image/jpeg`;
        
        // CRITICAL: The backend route expects "postImage"
        formData.append('postImage', { 
          uri: image, 
          name: filename || 'photo.jpg', 
          type: type 
        });
      }

      const token = await AsyncStorage.getItem('userToken');
      const baseURL = api.defaults.baseURL;

      // Bulletproof fetch to bypass Axios file-upload issues
      const response = await fetch(`${baseURL}/post/upload`, {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || "Failed to upload post");
      }

      Alert.alert('Success', 'Your post is live!');
      navigation.goBack();
    } catch (error) {
      console.error("Upload Error:", error);
      Alert.alert('Upload Failed', error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} disabled={isSubmitting}>
          <Ionicons name="close" size={32} color="#1a1a1a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Post</Text>
        <TouchableOpacity style={styles.postBtn} onPress={handlePost} disabled={isSubmitting}>
          {isSubmitting ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.postBtnText}>Post</Text>}
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          
          <TextInput 
            style={styles.titleInput} 
            placeholder="Write a catchy title..." 
            placeholderTextColor="#888"
            value={title} 
            onChangeText={setTitle} 
            maxLength={100}
          />

          <TextInput 
            style={styles.contentInput} 
            placeholder="What do you want to discuss?" 
            placeholderTextColor="#a0a0a0"
            value={content} 
            onChangeText={setContent} 
            multiline 
            textAlignVertical="top"
          />

          {/* Image Preview & Picker */}
          {image && (
            <View style={styles.imageContainer}>
              <Image source={{ uri: image }} style={styles.preview} />
              <TouchableOpacity style={styles.removeImageBtn} onPress={() => setImage(null)}>
                <Ionicons name="close-circle" size={28} color="#fff" />
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.toolsRow}>
            <TouchableOpacity style={styles.toolBtn} onPress={pickImage}>
              <Ionicons name="image-outline" size={24} color="#0088cc" />
              <Text style={styles.toolText}>Add Photo</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.toolBtn, isAnonymous && styles.toolBtnActive]} 
              onPress={() => setIsAnonymous(!isAnonymous)}
            >
              <Ionicons name="eye-off-outline" size={24} color={isAnonymous ? "#fff" : "#888"} />
              <Text style={isAnonymous ? styles.toolTextActive : styles.toolTextMuted}>Anonymous</Text>
            </TouchableOpacity>
          </View>

          {/* Category Selector */}
          <Text style={styles.sectionLabel}>Select Topic:</Text>
          <View style={styles.categoryRow}>
            {['Social', 'Health', 'Education'].map((cat) => (
              <TouchableOpacity 
                key={cat}
                style={[styles.catBadge, category === cat && styles.catBadgeActive]}
                onPress={() => setCategory(cat)}
              >
                <Text style={[styles.catText, category === cat && styles.catTextActive]}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 15, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#eee' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#1a1a1a' },
  postBtn: { backgroundColor: '#0088cc', paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20 },
  postBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  scrollContent: { padding: 20 },
  titleInput: { fontSize: 24, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 15 },
  contentInput: { fontSize: 18, color: '#333', minHeight: 120, marginBottom: 20, lineHeight: 26 },
  imageContainer: { position: 'relative', marginBottom: 20 },
  preview: { width: '100%', height: 250, borderRadius: 12 },
  removeImageBtn: { position: 'absolute', top: 10, right: 10, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 15 },
  toolsRow: { flexDirection: 'row', marginBottom: 30, gap: 15 },
  toolBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f0f8ff', paddingHorizontal: 15, paddingVertical: 10, borderRadius: 12 },
  toolBtnActive: { backgroundColor: '#333' },
  toolText: { marginLeft: 8, color: '#0088cc', fontWeight: '600' },
  toolTextMuted: { marginLeft: 8, color: '#888', fontWeight: '600' },
  toolTextActive: { marginLeft: 8, color: '#fff', fontWeight: '600' },
  sectionLabel: { fontSize: 16, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 12 },
  categoryRow: { flexDirection: 'row', gap: 10 },
  catBadge: { borderWidth: 1, borderColor: '#ddd', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  catBadgeActive: { backgroundColor: '#0088cc', borderColor: '#0088cc' },
  catText: { color: '#666', fontWeight: '600' },
  catTextActive: { color: '#fff', fontWeight: '600' }
});