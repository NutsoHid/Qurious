import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, 
  ActivityIndicator, KeyboardAvoidingView, Platform, Alert, 
  ScrollView, LayoutAnimation, Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import api from '../services/api';

export default function SignupScreen({ navigation }) {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [profession, setProfession] = useState('');
  const [proofDocument, setProofDocument] = useState(null);
  
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const isStrongPassword = (pass) => {
    // Requires min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special character
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
    return passwordRegex.test(pass);
  };

  const handleProfessionChange = (text) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setProfession(text);
    if (text.length === 0) {
      setProofDocument(null);
    }
  };

const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*', 
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      if (result.assets && result.assets.length > 0) {
        // FIX 1: Access the first element of the assets array
        const file = result.assets[0]; 
        
        let mimeType = file.mimeType || 'application/pdf';
        
        // FIX 2: Get the second part of the split array ([1])
        let extension = mimeType.split('/')[1] || 'pdf'; 
        
        // Clean up common mime type naming issues
        if (extension === 'jpeg') extension = 'jpg';
        if (extension === 'vnd.openxmlformats-officedocument.wordprocessingml.document') extension = 'docx';

        setProofDocument({
          uri: file.uri, 
          // If the file already has a valid name, keep it! Otherwise, generate one.
          name: file.name && file.name.includes('.') 
                  ? file.name 
                  : `verification_${Date.now()}.${extension}`, 
          mimeType: mimeType
        });
      }
    } catch (err) {
      console.log("Document Picker Error:", err);
      Alert.alert("Error", "Failed to pick document.");
    }
  };

  const handleSignup = async () => {
    if (!name.trim() || !username.trim() || !email.trim() || !password.trim()) {
      Alert.alert("Missing Fields", "Please fill in all mandatory fields.");
      return;
    }

    if (!isStrongPassword(password)) {
      Alert.alert(
        "Weak Password", 
        "Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character."
      );
      return;
    }

    if (profession && !proofDocument) {
      Alert.alert("Verification Required", "Please upload a proof document for your profession.");
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('userName', username);
      formData.append('email', email);
      formData.append('password', password);
      
// Inside handleSignup...
if (profession && proofDocument) {
  formData.append('profession', profession);
  
  // FIX 3: Changed key from 'verificationDoc' to 'document' to match your backend
  formData.append('document', {
    uri: Platform.OS === 'android' ? proofDocument.uri : proofDocument.uri.replace('file://', ''),
    name: proofDocument.name,
    type: proofDocument.mimeType
  });
}

      // 🔥 FIXED: Removed the broken transformRequest. 
      // Simply setting Content-Type to multipart/form-data allows Axios to safely build the file packet.
      await api.post('/user/signup', formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
        }
      });

      Alert.alert("Success", "Account created successfully! Please log in.");
      navigation.navigate('Login');
    } catch (error) {
      console.log("Signup Error Full:", error);
      
      if (!error.response) {
        Alert.alert(
          "Connection Failed", 
          "Network Error. Please verify your backend server is currently running (it may have crashed during previous errors) and your IP address is correct."
        );
      } else {
        const backendMessage = error.response?.data?.message || error.response?.data?.error || "Registration failed. Please try again.";
        Alert.alert("Signup Failed", backendMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={styles.keyboardView}
      >
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          
          <View style={styles.headerContainer}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#111827" />
            </TouchableOpacity>
            
            <Text style={styles.brandLogoText}>QURIOUS</Text>
            
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join the Qurious community today</Text>
          </View>

          <View style={styles.formContainer}>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name *</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="person-outline" size={20} color="#6B7280" style={styles.icon} />
                <TextInput style={styles.input} placeholder="John Doe" placeholderTextColor="#9CA3AF" value={name} onChangeText={setName} />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Username *</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="at-outline" size={20} color="#6B7280" style={styles.icon} />
                <TextInput style={styles.input} placeholder="johndoe123" placeholderTextColor="#9CA3AF" autoCapitalize="none" value={username} onChangeText={setUsername} />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address *</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="mail-outline" size={20} color="#6B7280" style={styles.icon} />
                <TextInput style={styles.input} placeholder="name@example.com" placeholderTextColor="#9CA3AF" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password *</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="lock-closed-outline" size={20} color="#6B7280" style={styles.icon} />
                <TextInput style={styles.input} placeholder="Strong password" placeholderTextColor="#9CA3AF" secureTextEntry={!showPassword} value={password} onChangeText={setPassword} />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                  <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#6B7280" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.divider}>
              <View style={styles.line} />
              <Text style={styles.dividerText}>Optional Verification</Text>
              <View style={styles.line} />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Profession</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="briefcase-outline" size={20} color="#6B7280" style={styles.icon} />
                <TextInput style={styles.input} placeholder="e.g. Doctor, Software Engineer" placeholderTextColor="#9CA3AF" value={profession} onChangeText={handleProfessionChange} />
              </View>
            </View>

            {profession.length > 0 && (
              <View style={styles.uploadContainer}>
                <Text style={styles.label}>Profession Proof (JPG, PNG, PDF, DOC)</Text>
                
                {proofDocument ? (
                  <TouchableOpacity style={styles.previewBox} onPress={pickDocument}>
                    {proofDocument.mimeType && proofDocument.mimeType.startsWith('image/') ? (
                      <Image source={{ uri: proofDocument.uri }} style={styles.imagePreview} />
                    ) : (
                      <Ionicons name="document-text" size={40} color="#0088cc" />
                    )}
                    <Text style={styles.previewText} numberOfLines={1} ellipsizeMode="middle">
                      {proofDocument.name}
                    </Text>
                    <Text style={styles.changeFileText}>Tap to change file</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity style={styles.uploadBox} onPress={pickDocument}>
                    <Ionicons name="cloud-upload-outline" size={32} color="#0088cc" />
                    <Text style={styles.uploadText}>Tap to select verification document</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            <TouchableOpacity style={styles.signupButton} onPress={handleSignup} disabled={isLoading}>
              {isLoading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.signupButtonText}>Create Account</Text>}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  keyboardView: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingHorizontal: 24, paddingVertical: 20 },
  headerContainer: { marginBottom: 30 },
  backButton: { width: 40, height: 40, justifyContent: 'center', marginBottom: 5 },
  brandLogoText: {
    fontSize: 28,
    fontWeight: '900',
    color: '#0088cc',
    letterSpacing: 3,
    marginBottom: 20,
    textShadowColor: 'rgba(0, 136, 204, 0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  title: { fontSize: 32, fontWeight: '800', color: '#111827', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#6B7280' },
  formContainer: { marginBottom: 30 },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  icon: { marginRight: 10 },
  input: { flex: 1, paddingVertical: 14, fontSize: 16, color: '#111827' },
  eyeIcon: { padding: 4 },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 20 },
  line: { flex: 1, height: 1, backgroundColor: '#E5E7EB' },
  dividerText: { marginHorizontal: 10, color: '#9CA3AF', fontSize: 12, fontWeight: '600', textTransform: 'uppercase' },
  uploadContainer: { marginBottom: 20 },
  uploadBox: {
    borderWidth: 2,
    borderColor: '#E0F2FE',
    borderStyle: 'dashed',
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    paddingVertical: 24,
    alignItems: 'center',
    justifyContent: 'center'
  },
  uploadText: { marginTop: 10, fontSize: 14, color: '#0284C7', fontWeight: '500', textAlign: 'center', paddingHorizontal: 20 },
  previewBox: {
    borderWidth: 1,
    borderColor: '#0088cc',
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center'
  },
  imagePreview: { width: 80, height: 80, borderRadius: 8, marginBottom: 10 },
  previewText: { fontSize: 14, fontWeight: '700', color: '#111827', marginTop: 5, textAlign: 'center', paddingHorizontal: 10 },
  changeFileText: { fontSize: 12, color: '#0088cc', marginTop: 6, fontWeight: '600' },
  signupButton: {
    backgroundColor: '#0088cc',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#0088cc',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  signupButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});