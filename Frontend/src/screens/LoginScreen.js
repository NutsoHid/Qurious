import React, { useState, useContext } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, 
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';

export default function LoginScreen({ navigation }) {
  const { login } = useContext(AuthContext); 
  
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async () => {
    if (!identifier || !password) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    setIsSubmitting(true);
    const result = await login(identifier, password);
    setIsSubmitting(false);

    if (!result.success) {
      Alert.alert('Login Failed', result.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={styles.keyboardView}
      >
        {/* Brand Header */}
        <View style={styles.headerContainer}>
          <Ionicons name="chatbubbles" size={50} color="#0088cc" />
          <Text style={styles.brandText}>
            Qu<Text style={styles.brandHighlight}>rious</Text>
          </Text>
          <Text style={styles.subText}>Sign in to join the discussion.</Text>
        </View>

        {/* Input Form */}
        <View style={styles.formContainer}>
          <View style={styles.inputWrapper}>
            <Ionicons name="person-outline" size={20} color="#888" style={styles.icon} />
            <TextInput 
              style={styles.input}
              placeholder="Username or Email"
              placeholderTextColor="#a0a0a0"
              autoCapitalize="none"
              value={identifier}
              onChangeText={setIdentifier}
            />
          </View>

          <View style={styles.inputWrapper}>
            <Ionicons name="lock-closed-outline" size={20} color="#888" style={styles.icon} />
            <TextInput 
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#a0a0a0"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          {/* Login Button */}
          <TouchableOpacity 
            style={styles.loginBtn} 
            onPress={handleLogin}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.loginText}>Sign In</Text>
            )}
          </TouchableOpacity>

          {/* Sign Up Link */}
          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Signup')}> 
              <Text style={styles.signupText}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  keyboardView: { flex: 1, justifyContent: 'center', paddingHorizontal: 30 },
  headerContainer: { alignItems: 'center', marginBottom: 50 },
  brandText: { fontSize: 42, fontWeight: '900', color: '#1a1a1a', letterSpacing: -1, marginTop: 10 },
  brandHighlight: { color: '#0088cc' },
  subText: { fontSize: 16, color: '#888', marginTop: 8 },
  formContainer: { width: '100%' },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    marginBottom: 15,
    paddingHorizontal: 15,
    height: 55,
  },
  icon: { marginRight: 10 },
  input: { flex: 1, fontSize: 16, color: '#1a1a1a' },
  loginBtn: {
    backgroundColor: '#0088cc',
    borderRadius: 12,
    height: 55,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#0088cc',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  loginText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  footerRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 25 },
  footerText: { color: '#888', fontSize: 15 },
  signupText: { color: '#0088cc', fontSize: 15, fontWeight: 'bold' }
});