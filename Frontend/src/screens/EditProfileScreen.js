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
  const { user } = useContext(AuthContext);

  const [name, setName] = useState(user?.name || '');
  const [userName, setUserName] = useState(user?.userName || '');
  const [oldPassword, setOldPassword] = useState('');
  const [password, setPassword] = useState('');
  const [image, setImage] = useState(user?.profileUrl || null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImagePicker = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'], // FIX 1: Clears the yellow warning
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    
    // FIX 2: assets is an array, you must use
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImage(result.assets.uri);
    }
  };

  const handleSave = async () => {
    if (password && !oldPassword) {
      Alert.alert("Error", "Please enter your current password to set a new one.");
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      
      formData.append('name', name);
      formData.append('userName', userName);
      
      if (password && oldPassword) {
        formData.append('password', password);
        formData.append('oldPassword', oldPassword);
      }

      if (image && image !== user?.profileUrl) {
        let filename = image.split('/').pop();
        let match = /\.(\w+)$/.exec(filename);
        let type = match ? `image/${match[1]}` : `image/jpeg`;
        
        formData.append('profileUrl', { 
          uri: image, 
          name: filename, 
          type: type 
        });
      }

      const token = await AsyncStorage.getItem('userToken');
      const baseURL = api.defaults.baseURL; // Dynamically grab your IP from api.js

      // FIX 3: Bulletproof Fetch bypassing Axios for file uploads
      const response = await fetch(`${baseURL}/user/update-profile`, {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          // NO CONTENT-TYPE HEADER! Fetch adds the boundary automatically.
        },
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || "Failed to update profile");
      }

      Alert.alert("Success", "Profile updated successfully!");
      navigation.goBack();
    } catch (error) {
      console.error("Upload Error:", error);
      Alert.alert("Error", error.message || "Could not save changes");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} disabled={isSubmitting}>
          <Ionicons name="close-outline" size={32} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit profile</Text>
        <TouchableOpacity onPress={handleSave} disabled={isSubmitting}>
          {isSubmitting ? <ActivityIndicator color="#0088cc" /> : <Ionicons name="checkmark" size={32} color="#0088cc" />}
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          
          <View style={styles.avatarContainer}>
            <TouchableOpacity onPress={handleImagePicker} style={styles.avatarBox}>
              <Image source={{ uri: image || 'https://via.placeholder.com/150' }} style={styles.avatar} />
              <View style={styles.cameraIcon}>
                <Ionicons name="camera" size={18} color="#fff" />
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setImage(null)}>
              <Text style={styles.removeText}>Remove photo</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Name</Text>
              <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Your name" />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Username</Text>
              <TextInput style={styles.input} value={userName} onChangeText={setUserName} placeholder="Your username" autoCapitalize="none" />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Current Password</Text>
              <TextInput 
                style={styles.input} 
                value={oldPassword} 
                onChangeText={setOldPassword} 
                placeholder="Required to change password" 
                secureTextEntry 
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>New Password</Text>
              <TextInput 
                style={styles.input} 
                value={password} 
                onChangeText={setPassword} 
                placeholder="Leave blank to keep current" 
                secureTextEntry 
              />
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
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#000' },
  scrollContent: { paddingBottom: 40 },
  avatarContainer: { alignItems: 'center', marginTop: 30, marginBottom: 20 },
  avatarBox: { position: 'relative' },
  avatar: { width: 110, height: 110, borderRadius: 55, backgroundColor: '#eee' },
  cameraIcon: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#0088cc', borderRadius: 16, padding: 6, borderWidth: 3, borderColor: '#fff' },
  removeText: { color: '#ff4444', marginTop: 15, fontSize: 16, fontWeight: '600' },
  form: { paddingHorizontal: 20, marginTop: 10 },
  inputGroup: { marginBottom: 25, borderBottomWidth: 1, borderBottomColor: '#e0e0e0', paddingBottom: 5 },
  label: { color: '#888', fontSize: 12, fontWeight: '600', marginBottom: 5 },
  input: { fontSize: 16, color: '#000', paddingVertical: 5 },
});