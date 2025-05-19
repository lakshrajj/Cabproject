// This is a minimal debug version of the app
import React from 'react';
import { SafeAreaView, Text, View, StyleSheet, StatusBar } from 'react-native';

// Minimal app component for debugging
const DebugApp = () => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.content}>
        <Text style={styles.title}>Debugging Mode</Text>
        <Text style={styles.text}>
          If you can see this, the app is loading correctly without theme errors.
        </Text>
      </View>
    </SafeAreaView>
  );
};

// Basic styles without theme dependencies
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#1E88E5',
  },
  text: {
    fontSize: 16,
    textAlign: 'center',
    color: '#212121',
  },
});

export default DebugApp;