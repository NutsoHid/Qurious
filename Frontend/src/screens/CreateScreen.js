import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Image, Alert, ActivityIndicator, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import api from '../services/api';

export default function CreateScreen() {
  const navigation = useNavigation();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });
    if (!result.canceled) setImage(result.assets.uri);
  };

  const handlePost = async () => {
    if (!title || !content) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('content', content);
      if (image) {
        let filename = image.split('/').pop();
        let match = /\.(\w+)$/.exec(filename);
        let type = match ? `image/${match[1]}` : `image`;
        formData.append('imageUrl', { uri: image, name: filename, type });
      }

      await api.post('/post/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      Alert.alert('Success', 'Post uploaded!');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Upload Failed', 'Check your backend logs');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Ionicons name="close" size={28} /></TouchableOpacity>
        <TouchableOpacity style={styles.postBtn} onPress={handlePost} disabled={isSubmitting}>
          {isSubmitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Post</Text>}
        </TouchableOpacity>
      </View>
      <TextInput style={styles.title} placeholder="Title" value={title} onChangeText={setTitle} />
      <TextInput style={styles.content} placeholder="What's happening?" value={content} onChangeText={setContent} multiline />
      {image && <Image source={{ uri: image }} style={styles.preview} />}
      <TouchableOpacity style={styles.gallery} onPress={pickImage}><Text style={styles.btnText}>Select Image</Text></TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  postBtn: { backgroundColor: '#0088cc', padding: 10, borderRadius: 20 },
  btnText: { color: '#fff', fontWeight: 'bold' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
  content: { fontSize: 18, marginBottom: 20 },
  preview: { width: '100%', height: 200, borderRadius: 10, marginBottom: 10 },
  gallery: { backgroundColor: '#333', padding: 15, alignItems: 'center', borderRadius: 10 }
});