import React, { useState, useContext } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Image, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function EditProfileScreen() {
  const navigation = useNavigation();
  const { user, setUser } = useContext(AuthContext);

  const [name, setName] = useState(user?.name || '');
  const [userName, setUserName] = useState(user?.userName || '');
  const [profession, setProfession] = useState(user?.profession || '');
  const [image, setImage] = useState(user?.profileUrl || null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImagePicker = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    
    if (!result.canceled && result.assets && result.assets.length > 0) {
      // FIX: Ensure you are grabbing the first item in the assets array
      setImage(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('userName', userName);
      formData.append('profession', profession);

      // Only append the image if it's a new local image (not the existing Cloudinary URL)
      if (image && image !== user?.profileUrl) {
        let filename = image.split('/').pop();
        let match = /\.(\w+)$/.exec(filename);
        let type = match ? `image/${match[1]}` : `image/jpeg`;
        
        // Standardize jpg to jpeg for Multer compatibility
        if (type === 'image/jpg') type = 'image/jpeg';

        formData.append('profileImage', { 
          // FIX: Strip 'file://' for iOS uploads to prevent FormData failures
          uri: Platform.OS === 'ios' ? image.replace('file://', '') : image, 
          name: filename || 'avatar.jpg', 
          type: type 
        });
      }

      // FIX: Use your API instance and the correct backend endpoint
      const response = await api.post('/user/profile', formData, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'multipart/form-data',
        },
      });

      // Globally update the app UI with the new data from MongoDB/Cloudinary
      if (response.data.user) {
        setUser(response.data.user);
        await AsyncStorage.setItem('userData', JSON.stringify(response.data.user));
      }

      Alert.alert("Success", "Profile updated perfectly!");
      navigation.goBack();
    } catch (error) {
      console.error("Update Error:", error.response?.data || error.message);
      Alert.alert("Error", error.response?.data?.message || "Could not save changes");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} disabled={isSubmitting}>
          <Ionicons name="close-outline" size={32} color="#1a1a1a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <TouchableOpacity onPress={handleSave} disabled={isSubmitting}>
          {isSubmitting ? <ActivityIndicator color="#0088cc" /> : <Ionicons name="checkmark" size={32} color="#0088cc" />}
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          <View style={styles.avatarContainer}>
            <TouchableOpacity onPress={handleImagePicker} style={styles.avatarBox}>
              <Image source={{ uri: image || 'https://via.placeholder.com/150' }} style={styles.avatar} />
              <View style={styles.cameraIcon}>
                <Ionicons name="camera" size={18} color="#fff" />
              </View>
            </TouchableOpacity>
            <Text style={styles.changePhotoText}>Edit picture</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Name</Text>
              <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Your full name" />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Username</Text>
              <TextInput style={styles.input} value={userName} onChangeText={setUserName} placeholder="username" autoCapitalize="none" />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Profession</Text>
              <TextInput style={styles.input} value={profession} onChangeText={setProfession} placeholder="What do you do?" />
            </View>
          </View>
          
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 15, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#1a1a1a' },
  scrollContent: { paddingBottom: 40 },
  avatarContainer: { alignItems: 'center', marginTop: 30, marginBottom: 30 },
  avatarBox: { position: 'relative' },
  avatar: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#eee', borderWidth: 1, borderColor: '#ddd' },
  cameraIcon: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#0088cc', borderRadius: 16, padding: 6, borderWidth: 3, borderColor: '#fff' },
  changePhotoText: { color: '#0088cc', marginTop: 12, fontSize: 16, fontWeight: '700' },
  form: { paddingHorizontal: 25 },
  inputGroup: { marginBottom: 25, borderBottomWidth: 1, borderBottomColor: '#e0e0e0', paddingBottom: 8 },
  label: { color: '#888', fontSize: 13, fontWeight: '600', marginBottom: 5 },
  input: { fontSize: 16, color: '#1a1a1a', paddingVertical: 0 },
});