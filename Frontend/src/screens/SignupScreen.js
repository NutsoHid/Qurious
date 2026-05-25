import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, 
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api'; 

export default function SignupScreen({ navigation }) {
  const [name, setName] = useState('');
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSignup = async () => {
    if (!name || !userName || !email || !password) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await api.post('/user/signup', {
        name,
        userName,
        email,
        password
      });

      setIsSubmitting(false);
      
      Alert.alert('Success!', 'Account created perfectly. Please sign in.', [
        { text: 'OK', onPress: () => navigation.navigate('Login') }
      ]);

    } catch (error) {
      setIsSubmitting(false);
      Alert.alert(
        'Signup Failed', 
        error.response?.data?.message || 'Could not connect to the server.'
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={styles.keyboardView}
      >
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color="#1a1a1a" />
        </TouchableOpacity>

        <View style={styles.headerContainer}>
          <Text style={styles.brandText}>Create Account</Text>
          <Text style={styles.subText}>Join the Qurious community today.</Text>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputWrapper}>
            <Ionicons name="person-outline" size={20} color="#888" style={styles.icon} />
            <TextInput 
              style={styles.input} placeholder="Full Name" placeholderTextColor="#a0a0a0"
              value={name} onChangeText={setName}
            />
          </View>

          <View style={styles.inputWrapper}>
            <Ionicons name="at-outline" size={20} color="#888" style={styles.icon} />
            <TextInput 
              style={styles.input} placeholder="Username" placeholderTextColor="#a0a0a0"
              autoCapitalize="none" value={userName} onChangeText={setUserName}
            />
          </View>

          <View style={styles.inputWrapper}>
            <Ionicons name="mail-outline" size={20} color="#888" style={styles.icon} />
            <TextInput 
              style={styles.input} placeholder="Email" placeholderTextColor="#a0a0a0"
              keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail}
            />
          </View>

          <View style={styles.inputWrapper}>
            <Ionicons name="lock-closed-outline" size={20} color="#888" style={styles.icon} />
            <TextInput 
              style={styles.input} placeholder="Password" placeholderTextColor="#a0a0a0"
              secureTextEntry value={password} onChangeText={setPassword}
            />
          </View>

          <TouchableOpacity 
            style={styles.signupBtn} 
            onPress={handleSignup} 
            disabled={isSubmitting}
          >
            {isSubmitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.signupText}>Sign Up</Text>}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  keyboardView: { flex: 1, justifyContent: 'center', paddingHorizontal: 30 },
  backButton: { position: 'absolute', top: 20, left: 20, zIndex: 10 },
  headerContainer: { marginBottom: 40, marginTop: 40 },
  brandText: { fontSize: 36, fontWeight: '900', color: '#1a1a1a', letterSpacing: -1 },
  subText: { fontSize: 16, color: '#888', marginTop: 8 },
  formContainer: { width: '100%' },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#f5f5f5',
    borderRadius: 12, marginBottom: 15, paddingHorizontal: 15, height: 55,
  },
  icon: { marginRight: 10 },
  input: { flex: 1, fontSize: 16, color: '#1a1a1a' },
  signupBtn: {
    backgroundColor: '#0088cc', borderRadius: 12, height: 55,
    justifyContent: 'center', alignItems: 'center', marginTop: 10,
    shadowColor: '#0088cc', shadowOpacity: 0.3, shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 }, elevation: 5,
  },
  signupText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});