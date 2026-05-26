import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, KeyboardAvoidingView, Platform, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import api from '../services/api'; // Your configured axios
import { AuthContext } from '../context/AuthContext';

export default function CreateScreen({ navigation }) {
  const { userToken } = useContext(AuthContext);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('Social'); // Default
  const [image, setImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pick an image from phone gallery
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets.uri);
    }
  };

  const handlePost = async () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert('Hold up!', 'Please enter a title and content.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Because we have an image, we MUST use FormData
      const formData = new FormData();
      formData.append('title', title);
      formData.append('content', content);
      formData.append('category', category);

      if (image) {
        let filename = image.split('/').pop();
        let match = /\.(\w+)$/.exec(filename);
        let type = match ? `image/${match[1]}` : `image`;
        formData.append('postImage', { uri: image, name: filename, type });
      }

      await api.post('/post/create', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${userToken}`
        },
      });

      Alert.alert('Success!', 'Your post is live.');
      setTitle('');
      setContent('');
      setImage(null);
      navigation.navigate('Home'); // Go back to feed
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to create post');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Create Post</Text>
            <TouchableOpacity onPress={handlePost} disabled={isSubmitting} style={styles.postBtn}>
              {isSubmitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.postBtnText}>Post</Text>}
            </TouchableOpacity>
          </View>

          {/* Category Selector */}
          <View style={styles.categoryRow}>
            {['Social', 'Health'].map((cat) => (
              <TouchableOpacity 
                key={cat} 
                style={[styles.catBadge, category === cat && styles.catBadgeActive]}
                onPress={() => setCategory(cat)}
              >
                <Text style={[styles.catText, category === cat && styles.catTextActive]}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </View>

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
            placeholder="Share your thoughts, ask a question..."
            placeholderTextColor="#9CA3AF"
            multiline
            value={content}
            onChangeText={setContent}
            textAlignVertical="top"
          />

          {image && (
            <View style={styles.imagePreviewContainer}>
              <Image source={{ uri: image }} style={styles.imagePreview} />
              <TouchableOpacity style={styles.removeImageBtn} onPress={() => setImage(null)}>
                <Ionicons name="close-circle" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>

        {/* Bottom Toolbar for Gallery */}
        <View style={styles.toolbar}>
          <TouchableOpacity style={styles.toolBtn} onPress={pickImage}>
            <Ionicons name="image-outline" size={28} color="#0088cc" />
            <Text style={styles.toolText}>Add Photo</Text>
          </TouchableOpacity>
        </View>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  scrollContent: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 100 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#111827' },
  postBtn: { backgroundColor: '#0088cc', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20 },
  postBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  categoryRow: { flexDirection: 'row', marginBottom: 20 },
  catBadge: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#F3F4F6', marginRight: 10 },
  catBadgeActive: { backgroundColor: '#0088cc' },
  catText: { color: '#6B7280', fontWeight: '600' },
  catTextActive: { color: '#ffffff' },
  titleInput: { fontSize: 22, fontWeight: '700', color: '#111827', marginBottom: 15 },
  contentInput: { fontSize: 18, color: '#374151', minHeight: 150, lineHeight: 26 },
  imagePreviewContainer: { marginTop: 20, position: 'relative' },
  imagePreview: { width: '100%', height: 250, borderRadius: 16 },
  removeImageBtn: { position: 'absolute', top: 10, right: 10, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 15 },
  toolbar: { position: 'absolute', bottom: 0, width: '100%', backgroundColor: '#fff', borderTopWidth: 1, borderColor: '#E5E7EB', padding: 15, flexDirection: 'row' },
  toolBtn: { flexDirection: 'row', alignItems: 'center' },
  toolText: { marginLeft: 8, fontSize: 16, color: '#0088cc', fontWeight: '600' }
});