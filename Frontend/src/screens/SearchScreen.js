import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import PostCard from '../components/PostCard';

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  
 
  const filteredPosts = DEMO_POSTS.filter(post => 
    post.caption.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.searchHeader}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#888" style={styles.searchIcon} />
          <TextInput
            style={styles.input}
            placeholder="Ask anything about Health or Social..."
            value={searchQuery}
            onChangeText={(text) => setSearchQuery(text)}
            autoFocus={true}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#888" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <FlatList
        data={filteredPosts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <PostCard 
            authorId={item.authorId}
            time={item.time}
            caption={item.caption}
            image={item.image}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>
              {searchQuery.length > 0 ? "No discussions found for your search." : "Try searching for 'Health', 'Parks', or 'Exam'"}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  searchHeader: { padding: 15, borderBottomWidth: 1, borderBottomColor: '#eee' },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 45
  },
  searchIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 16, color: '#000' },
  emptyState: { padding: 50, alignItems: 'center' },
  emptyText: { color: '#888', textAlign: 'center', fontSize: 16 }
});