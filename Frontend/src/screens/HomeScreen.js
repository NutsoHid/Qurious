import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PostCard from '../components/PostCard';
import CustomHeader from '../components/CustomHeader';
import CustomDrawer from '../components/CustomDrawer';
import { DEMO_POSTS } from '../constants/demoData';

export default function HomeScreen() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');

  const filteredPosts = activeCategory === 'All' 
    ? DEMO_POSTS 
    : DEMO_POSTS.filter(post => post.category === activeCategory);

  return (
    <SafeAreaView style={styles.container}>
      <CustomHeader onMenuPress={() => setIsDrawerOpen(true)} />

    
      <CustomDrawer 
        visible={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
        onSelectCategory={(category) => {
          setActiveCategory(category); 
          setIsDrawerOpen(false);     
        }}
      />

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={{ paddingBottom: 100 }}
      >
       
        {activeCategory !== 'All' && (
          <Text style={styles.categoryTitle}>{activeCategory} Discussions</Text>
        )}

        <View style={styles.feedContainer}>
          {filteredPosts.map((post) => (
            <PostCard
              key={post.id}
              authorId={post.authorId}
              time={post.time}
              caption={post.caption}
              image={post.image}
            />
          ))}
          
         
          {filteredPosts.length === 0 && (
            <Text style={styles.emptyText}>No posts found in this category yet.</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  feedContainer: { flex: 1, paddingTop: 10 },
  categoryTitle: { 
    fontSize: 18, 
    fontWeight: '800', 
    color: '#0088cc', 
    marginLeft: 16, 
    marginTop: 15,
    marginBottom: 5
  },
  emptyText: {
    textAlign: 'center',
    color: '#888',
    marginTop: 40,
    fontSize: 16
  }
});