import React from 'react';
import { StyleSheet, View, Image, StatusBar, SafeAreaView } from 'react-native';
import { Text } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import AppButton from '../../components/AppButton';
import { AuthStackParamList } from '../../navigation/AuthNavigator';
// Use hardcoded values instead of importing from theme
const COLORS = {
  primary: '#1E88E5',
  secondary: '#26A69A',
  accent: '#FF5722',
  background: '#FFFFFF',
  surface: '#F5F5F5',
  text: '#212121',
  placeholder: '#757575',
};

type WelcomeScreenProps = NativeStackScreenProps<AuthStackParamList, 'Welcome'>;

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      
      <View style={styles.logoContainer}>
        {/* Replace with your actual logo */}
        <Image 
          source={require('../../../assets/placeholder-logo.png')} 
          style={styles.logo}
          resizeMode="contain" 
        />
        <Text style={styles.appName}>RideShare</Text>
        <Text style={styles.tagline}>Connect with drivers and riders in your area</Text>
      </View>
      
      <View style={styles.buttonContainer}>
        <AppButton 
          mode="contained" 
          onPress={() => navigation.navigate('Login')}
          style={styles.button}
        >
          Login
        </AppButton>
        
        <AppButton 
          mode="outlined" 
          onPress={() => navigation.navigate('Register')}
          style={styles.button}
        >
          Register as Rider
        </AppButton>
        
        <AppButton 
          mode="outlined" 
          onPress={() => navigation.navigate('RegisterDriver')}
          style={styles.button}
          color={COLORS.secondary}
        >
          Register as Driver
        </AppButton>
        
        <AppButton 
          mode="text" 
          onPress={() => navigation.navigate('ServerStatus')}
          style={styles.diagButton}
          color={COLORS.text}
        >
          Check Server Connection
        </AppButton>
      </View>
      
      <Text style={styles.termsText}>
        By continuing, you agree to our Terms of Service and Privacy Policy
      </Text>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: 20,
  },
  logoContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 120,
    height: 120,
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    marginTop: 20,
    color: COLORS.primary,
  },
  tagline: {
    fontSize: 16,
    color: COLORS.text,
    marginTop: 10,
    textAlign: 'center',
  },
  buttonContainer: {
    marginBottom: 40,
  },
  button: {
    marginVertical: 8,
  },
  diagButton: {
    marginTop: 20,
    marginBottom: 5,
  },
  termsText: {
    textAlign: 'center',
    color: COLORS.placeholder,
    marginBottom: 20,
    fontSize: 12,
  },
});

export default WelcomeScreen;