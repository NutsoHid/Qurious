import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';

export default function SignupScreen({ navigation }) {
  const { signup } = useContext(AuthContext);

  const [name, setName] = useState('');
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [profession, setProfession] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSignup = async () => {
    if (!name || !userName || !email || !password) {
      Alert.alert('Missing Fields', 'Please fill in all required fields.');
      return;
    }

    setIsSubmitting(true);
    const result = await signup(name, userName, email, profession, password);
    setIsSubmitting(false);
    
    // THE FIX: If successful, show an alert and redirect to Login!
    if (result.success) {
      Alert.alert(
        'Account Created!', 
        'Your account has been created successfully. Please log in.',
        [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
      );
    } else {
      Alert.alert('Signup Failed', result.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={28} color="#111827" />
          </TouchableOpacity>

          <View style={styles.headerContainer}>
            <Text style={styles.brandText}>Create Account</Text>
            <Text style={styles.subText}>Join the Qurious community today.</Text>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.inputWrapper}>
              <Ionicons name="person-outline" size={22} color="#6B7280" style={styles.icon} />
              <TextInput style={styles.input} placeholder="Full Name" placeholderTextColor="#9CA3AF" value={name} onChangeText={setName} />
            </View>

            <View style={styles.inputWrapper}>
              <Ionicons name="at-outline" size={22} color="#6B7280" style={styles.icon} />
              <TextInput style={styles.input} placeholder="Username" placeholderTextColor="#9CA3AF" autoCapitalize="none" value={userName} onChangeText={setUserName} />
            </View>

            <View style={styles.inputWrapper}>
              <Ionicons name="mail-outline" size={22} color="#6B7280" style={styles.icon} />
              <TextInput style={styles.input} placeholder="Email Address" placeholderTextColor="#9CA3AF" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} />
            </View>

            <View style={styles.inputWrapper}>
              <Ionicons name="briefcase-outline" size={22} color="#6B7280" style={styles.icon} />
              <TextInput style={styles.input} placeholder="Profession (e.g. Health Expert)" placeholderTextColor="#9CA3AF" value={profession} onChangeText={setProfession} />
            </View>

            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={22} color="#6B7280" style={styles.icon} />
              <TextInput style={styles.input} placeholder="Password" placeholderTextColor="#9CA3AF" secureTextEntry={!showPassword} value={password} onChangeText={setPassword} />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={22} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.signupBtn} onPress={handleSignup} disabled={isSubmitting}>
              {isSubmitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.signupText}>Sign Up</Text>}
            </TouchableOpacity>
          </View>

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginText}>Sign In</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  scrollContent: { flexGrow: 1, paddingHorizontal: 32, paddingBottom: 40, paddingTop: 10 },
  backButton: { alignSelf: 'flex-start', marginBottom: 20 },
  headerContainer: { marginBottom: 40 },
  brandText: { fontSize: 32, fontWeight: '800', color: '#111827', letterSpacing: -0.5 },
  subText: { fontSize: 16, color: '#6B7280', marginTop: 8 },
  formContainer: { width: '100%' },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', borderRadius: 16, marginBottom: 16, paddingHorizontal: 16, height: 60, borderWidth: 1, borderColor: '#E5E7EB' },
  icon: { marginRight: 12 },
  input: { flex: 1, fontSize: 16, color: '#111827' },
  eyeBtn: { padding: 8 },
  signupBtn: { backgroundColor: '#0088cc', borderRadius: 16, height: 60, justifyContent: 'center', alignItems: 'center', marginTop: 10, shadowColor: '#0088cc', shadowOpacity: 0.3, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 5 },
  signupText: { color: '#ffffff', fontSize: 18, fontWeight: '700' },
  footerRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 30 },
  footerText: { color: '#6B7280', fontSize: 15 },
  loginText: { color: '#0088cc', fontSize: 15, fontWeight: '700' }
});