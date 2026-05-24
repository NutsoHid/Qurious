import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Modal, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { DEMO_USERS } from '../constants/demoData'; 

export default function PostCard({ authorId, time, caption, image }) {
  const navigation = useNavigation();
  const user = DEMO_USERS[authorId] || DEMO_USERS['rambabu']; 
  
  const [voteStatus, setVoteStatus] = useState('none');
  const [isImageVisible, setIsImageVisible] = useState(false);

  const handleProfilePress = () => {
    navigation.navigate('You', { userId: authorId }); 
  };

  const handleLike = () => setVoteStatus(voteStatus === 'liked' ? 'none' : 'liked');
  const handleDislike = () => setVoteStatus(voteStatus === 'disliked' ? 'none' : 'disliked');

  return (
    <View style={styles.cardContainer}>
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.userInfo} onPress={handleProfilePress}>
          <Image source={{ uri: user.profileImage }} style={styles.userPhoto} />
          <View>
            <View style={styles.nameRow}>
              <Text style={styles.username}>{user.username}</Text>
              {user.role === 'admin' && (
                <Ionicons name="shield-checkmark" size={14} color="#0088cc" style={{marginLeft: 4}} />
              )}
            </View>
            <Text style={styles.followerMini}>{user.followers} followers</Text>
          </View>
          <Text style={styles.time}>· {time}</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.caption}>{caption}</Text>

      {image && (
        <TouchableOpacity activeOpacity={0.9} onPress={() => setIsImageVisible(true)}>
          <Image source={{ uri: image }} style={styles.mediaImage} resizeMode="cover" />
        </TouchableOpacity>
      )}
   
      <Modal visible={isImageVisible} transparent={true} animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setIsImageVisible(false)}>
          <Ionicons name="close" size={30} color="#fff" style={styles.closeIcon} />
          <Image source={{ uri: image }} style={styles.fullScreenImage} resizeMode="contain" />
        </Pressable>
      </Modal>

      <View style={styles.actionRow}>
        <View style={styles.voteGroup}>
          <TouchableOpacity style={styles.voteButton} onPress={handleLike}>
            <Ionicons name={voteStatus === 'liked' ? "thumbs-up" : "thumbs-up-outline"} size={18} color={voteStatus === 'liked' ? "#0088cc" : "#000"} />
          </TouchableOpacity>
          <View style={styles.voteDivider} />
          <TouchableOpacity style={styles.voteButton} onPress={handleDislike}>
            <Ionicons name={voteStatus === 'disliked' ? "thumbs-down" : "thumbs-down-outline"} size={18} color={voteStatus === 'disliked' ? "#e63946" : "#000"} />
          </TouchableOpacity>
        </View>
        <View style={styles.rightActions}>
          <TouchableOpacity style={styles.actionIcon}><Ionicons name="chatbubble-outline" size={22} color="#000" /></TouchableOpacity>
          <TouchableOpacity style={styles.actionIcon}><Ionicons name="paper-plane-outline" size={22} color="#000" /></TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: { backgroundColor: '#fff', paddingVertical: 12, borderBottomWidth: 8, borderBottomColor: '#f2f2f2' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, marginBottom: 8 },
  userInfo: { flexDirection: 'row', alignItems: 'center' },
  userPhoto: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#eee' },
  nameRow: { flexDirection: 'row', alignItems: 'center' },
  username: { fontWeight: 'bold', marginLeft: 8, fontSize: 14 },
  followerMini: { fontSize: 11, color: '#0088cc', marginLeft: 8, fontWeight: '600' },
  time: { color: '#888', marginLeft: 4, fontSize: 12 },
  caption: { paddingHorizontal: 16, fontSize: 15, fontWeight: 'bold', marginBottom: 12, color: '#1a1a1a' },
  mediaImage: { width: '92%', height: 300, borderRadius: 16, alignSelf: 'center', marginBottom: 12, backgroundColor: '#f9f9f9' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center' },
  fullScreenImage: { width: '100%', height: '80%' },
  closeIcon: { position: 'absolute', top: 50, right: 20, zIndex: 1 },
  actionRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 24, alignItems: 'center' },
  voteGroup: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 20 },
  voteButton: { paddingHorizontal: 14, paddingVertical: 6 },
  voteDivider: { width: 1, height: 18, backgroundColor: '#e0e0e0' },
  rightActions: { flexDirection: 'row' },
  actionIcon: { marginLeft: 22 }
});