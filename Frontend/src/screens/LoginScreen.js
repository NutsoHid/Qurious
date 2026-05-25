import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';

export default function LoginScreen({ navigation }) {
  const { login } = useContext(AuthContext); 
  
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async () => {
    if (!identifier || !password) {
      Alert.alert('Hold up!', 'Please fill in both fields.');
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
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
        
        <View style={styles.headerContainer}>
          <View style={styles.iconCircle}>
            <Ionicons name="chatbubbles" size={40} color="#fff" />
          </View>
          <Text style={styles.brandText}>Welcome to Qurious</Text>
          <Text style={styles.subText}>Sign in to continue your journey.</Text>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputWrapper}>
            <Ionicons name="person-outline" size={22} color="#6B7280" style={styles.icon} />
            <TextInput 
              style={styles.input}
              placeholder="Username or Email"
              placeholderTextColor="#9CA3AF"
              autoCapitalize="none"
              value={identifier}
              onChangeText={setIdentifier}
            />
          </View>

          <View style={styles.inputWrapper}>
            <Ionicons name="lock-closed-outline" size={22} color="#6B7280" style={styles.icon} />
            <TextInput 
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#9CA3AF"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
              <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={22} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.loginBtn} onPress={handleLogin} disabled={isSubmitting}>
            {isSubmitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.loginText}>Sign In</Text>
            )}
          </TouchableOpacity>

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
  container: { flex: 1, backgroundColor: '#ffffff' },
  keyboardView: { flex: 1, justifyContent: 'center', paddingHorizontal: 32 },
  headerContainer: { alignItems: 'center', marginBottom: 50 },
  iconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#0088cc', justifyContent: 'center', alignItems: 'center', marginBottom: 20, shadowColor: '#0088cc', shadowOpacity: 0.3, shadowRadius: 10, shadowOffset: { width: 0, height: 5 }, elevation: 8 },
  brandText: { fontSize: 28, fontWeight: '800', color: '#111827', letterSpacing: -0.5 },
  subText: { fontSize: 16, color: '#6B7280', marginTop: 8 },
  formContainer: { width: '100%' },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', borderRadius: 16, marginBottom: 16, paddingHorizontal: 16, height: 60, borderWidth: 1, borderColor: '#E5E7EB' },
  icon: { marginRight: 12 },
  input: { flex: 1, fontSize: 16, color: '#111827' },
  eyeBtn: { padding: 8 },
  loginBtn: { backgroundColor: '#0088cc', borderRadius: 16, height: 60, justifyContent: 'center', alignItems: 'center', marginTop: 10, shadowColor: '#0088cc', shadowOpacity: 0.3, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 5 },
  loginText: { color: '#ffffff', fontSize: 18, fontWeight: '700' },
  footerRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 30 },
  footerText: { color: '#6B7280', fontSize: 15 },
  signupText: { color: '#0088cc', fontSize: 15, fontWeight: '700' }
});