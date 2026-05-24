import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
  KeyboardAvoidingView, 
  Platform 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
// 1. IMPORT NAVIGATION
import { useNavigation } from '@react-navigation/native'; 

export default function CreateScreen() {
  // 2. INITIALIZE NAVIGATION
  const navigation = useNavigation(); 
  
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [image, setImage] = useState(null);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'], 
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      // FIXED BUG: Added because assets is an array!
      setImage(result.assets.uri); 
    }
  };

  const handlePost = () => {
    if (title.trim() === '') {
      alert('Please add a title to your post!');
      return;
    }
    alert('Post published successfully!');
    setTitle('');
    setBody('');
    setImage(null);
    
  
    navigation.navigate('Home'); 
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={28} color="#1a1a1a" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.postButton} onPress={handlePost}>
          <Text style={styles.postButtonText}>Post</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView 
        style={styles.keyboardAware} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.titleInput}
            placeholder="Title"
            placeholderTextColor="#888"
            value={title}
            onChangeText={setTitle}
            autoFocus={true} 
          />
          
          <TextInput
            style={styles.bodyInput}
            placeholder="What's on your mind? (optional)"
            placeholderTextColor="#a0a0a0"
            multiline={true}
            value={body}
            onChangeText={setBody}
          />

          {image && (
            <View style={styles.imagePreviewContainer}>
              <Image source={{ uri: image }} style={styles.imagePreview} />
              <TouchableOpacity style={styles.removeImageBtn} onPress={() => setImage(null)}>
                <Ionicons name="close-circle" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.toolbar}>
          <TouchableOpacity style={styles.toolbarBtn} onPress={pickImage}>
            <Ionicons name="image-outline" size={24} color="#0088cc" />
            <Text style={styles.toolbarText}>Gallery</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.toolbarBtn}>
            <Ionicons name="link-outline" size={24} color="#555" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  keyboardAware: { flex: 1 },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 20, 
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
  },
  postButton: { 
    backgroundColor: '#0088cc', 
    paddingHorizontal: 20, 
    paddingVertical: 8, 
    borderRadius: 20 
  },
  postButtonText: { 
    color: '#fff', 
    fontWeight: 'bold', 
    fontSize: 16 
  },
  inputContainer: { flex: 1, paddingHorizontal: 20, paddingTop: 20 },
  titleInput: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    color: '#1a1a1a',
    marginBottom: 15 
  },
  bodyInput: { 
    fontSize: 18, 
    color: '#444', 
    lineHeight: 26,
    flex: 1,
    textAlignVertical: 'top' 
  },
  imagePreviewContainer: {
    marginTop: 20,
    marginBottom: 20,
    position: 'relative',
  },
  imagePreview: {
    width: '100%',
    height: 250,
    borderRadius: 12,
  },
  removeImageBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 15,
  },
  toolbar: { 
    flexDirection: 'row', 
    paddingHorizontal: 20, 
    paddingVertical: 15, 
    borderTopWidth: 1, 
    borderTopColor: '#f0f0f0',
    alignItems: 'center'
  },
  toolbarBtn: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginRight: 25 
  },
  toolbarText: { 
    marginLeft: 8, 
    fontSize: 16, 
    fontWeight: '600', 
    color: '#0088cc' 
  }
});