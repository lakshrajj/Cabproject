import React from 'react';
import { StyleSheet, View, ScrollView, Image, TouchableOpacity } from 'react-native';
import { Text, Card, Divider, List, useTheme as usePaperTheme } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import AppButton from '../../components/AppButton';
import ThemeToggle from '../../components/ThemeToggle';
// Temporarily disabled theme: import { useTheme } from '../../context/BasicThemeContext';
import useAuth from '../../hooks/useAuth';
import { DriverStackParamList } from '../../navigation/DriverNavigator';
import { RiderStackParamList } from '../../navigation/RiderNavigator';

type NavigationProp = NativeStackNavigationProp<
  DriverStackParamList | RiderStackParamList,
  'EditProfile'
>;

const ProfileScreen = () => {
  const { user, logout } = useAuth();
  const navigation = useNavigation<NavigationProp>();
  // Temporarily disabled theme
  // const { colors, isDarkMode } = useTheme();
  const colors = {
    primary: '#1E88E5',
    background: '#FFFFFF',
    card: '#FFFFFF',
    text: '#212121',
    subtext: '#616161',
    border: '#BDBDBD',
    divider: '#E0E0E0',
    success: '#388E3C',
    disabled: '#9E9E9E',
    surface: '#F5F5F5',
    surfaceVariant: '#EEEEEE',
  };
  const isDarkMode = false;
  const paperTheme = usePaperTheme();
  
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Create a container style for the loading state
  const loadingContainer = {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  };

  if (!user) {
    return (
      <View style={loadingContainer}>
        <Text style={{ color: colors.text }}>Loading profile...</Text>
      </View>
    );
  }

  // Dynamic styles based on the current theme
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      alignItems: 'center',
      paddingVertical: 25,
      backgroundColor: colors.primary,
      borderBottomLeftRadius: 15,
      borderBottomRightRadius: 15,
    },
    profileImageContainer: {
      marginBottom: 12,
    },
    profileImage: {
      width: 110,
      height: 110,
      borderRadius: 55,
      borderWidth: 4,
      borderColor: colors.card,
    },
    profileImagePlaceholder: {
      width: 110,
      height: 110,
      borderRadius: 55,
      backgroundColor: colors.disabled,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 4,
      borderColor: colors.card,
    },
    name: {
      fontSize: 26,
      fontWeight: 'bold',
      color: isDarkTheme ? colors.text : '#ffffff',
      marginTop: 8,
    },
    role: {
      fontSize: 16,
      color: isDarkTheme ? colors.text : '#ffffff',
      opacity: 0.9,
      marginBottom: 12,
    },
    editButton: {
      marginTop: 12,
      borderColor: isDarkTheme ? colors.text : '#ffffff',
      paddingHorizontal: 16,
    },
    card: {
      marginHorizontal: 16,
      marginTop: -20,
      borderRadius: 12,
      backgroundColor: colors.card,
      ...isDarkTheme 
        ? { borderWidth: 1, borderColor: colors.border }
        : {
            elevation: 4,
            shadowColor: colors.shadow,
            shadowOpacity: 0.1,
            shadowRadius: 10,
            shadowOffset: { width: 0, height: 5 },
          },
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginVertical: 12,
      color: colors.text,
    },
    divider: {
      marginVertical: 12,
      backgroundColor: colors.divider,
      height: 1,
    },
    settingsContainer: {
      marginHorizontal: 16,
      marginTop: 24,
      backgroundColor: isDarkTheme ? colors.surfaceVariant : colors.card,
      borderRadius: 12,
      padding: 16,
      ...isDarkTheme 
        ? { borderWidth: 1, borderColor: colors.border }
        : {
            elevation: 2,
            shadowColor: colors.shadow,
            shadowOpacity: 0.05,
            shadowRadius: 5,
            shadowOffset: { width: 0, height: 3 },
          },
    },
    settingItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 15,
      borderBottomWidth: 1,
      borderBottomColor: colors.divider,
    },
    settingText: {
      flex: 1,
      marginLeft: 15,
      fontSize: 16,
      color: colors.text,
    },
    logoutButton: {
      marginHorizontal: 16,
      marginTop: 30,
      backgroundColor: paperTheme.colors.error,
    },
    versionContainer: {
      alignItems: 'center',
      marginTop: 20,
      marginBottom: 30,
    },
    versionText: {
      color: colors.placeholder,
    },
  });

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.profileImageContainer}>
          {user.profilePicture ? (
            <Image
              source={{ uri: user.profilePicture }}
              style={styles.profileImage}
            />
          ) : (
            <View style={styles.profileImagePlaceholder}>
              <Icon name="account" size={60} color={isDarkTheme ? colors.primary : colors.background} />
            </View>
          )}
        </View>
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.role}>{user.role === 'driver' ? 'Driver' : 'Rider'}</Text>
        
        <AppButton 
          mode="outlined" 
          icon="account-edit" 
          onPress={() => navigation.navigate('EditProfile')}
          style={styles.editButton}
          textColor={isDarkTheme ? colors.text : '#ffffff'}
        >
          Edit Profile
        </AppButton>
      </View>

      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          
          <List.Item
            title="Email"
            description={user.email}
            left={props => <List.Icon {...props} icon="email" color={colors.primary} />}
            titleStyle={{ color: colors.text }}
            descriptionStyle={{ color: colors.subtext }}
          />
          
          <Divider style={styles.divider} />
          
          <List.Item
            title="Phone"
            description={user.phone}
            left={props => <List.Icon {...props} icon="phone" color={colors.primary} />}
            titleStyle={{ color: colors.text }}
            descriptionStyle={{ color: colors.subtext }}
          />

          {user.role === 'driver' && user.driverDetails && (
            <>
              <Divider style={styles.divider} />
              
              <Text style={styles.sectionTitle}>Vehicle Information</Text>
              
              <List.Item
                title="Car Model"
                description={user.driverDetails.carModel}
                left={props => <List.Icon {...props} icon="car" color={colors.secondary} />}
                titleStyle={{ color: colors.text }}
                descriptionStyle={{ color: colors.subtext }}
              />
              
              <Divider style={styles.divider} />
              
              <List.Item
                title="Car Color"
                description={user.driverDetails.carColor}
                left={props => <List.Icon {...props} icon="palette" color={colors.secondary} />}
                titleStyle={{ color: colors.text }}
                descriptionStyle={{ color: colors.subtext }}
              />
              
              <Divider style={styles.divider} />
              
              <List.Item
                title="License Plate"
                description={user.driverDetails.licensePlate}
                left={props => <List.Icon {...props} icon="card-account-details" color={colors.secondary} />}
                titleStyle={{ color: colors.text }}
                descriptionStyle={{ color: colors.subtext }}
              />
            </>
          )}
        </Card.Content>
      </Card>

      <View style={styles.settingsContainer}>
        <Text style={styles.sectionTitle}>Settings</Text>
        
        <TouchableOpacity 
          style={styles.settingItem}
          onPress={() => navigation.navigate('UserRatings')}
        >
          <Icon name="star-outline" size={24} color={colors.text} />
          <Text style={styles.settingText}>My Ratings</Text>
          <Icon name="chevron-right" size={24} color={colors.disabled} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.settingItem}
          onPress={() => navigation.navigate('Notifications')}
        >
          <Icon name="bell-outline" size={24} color={colors.text} />
          <Text style={styles.settingText}>Notifications</Text>
          <Icon name="chevron-right" size={24} color={colors.disabled} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.settingItem}
          onPress={() => navigation.navigate('ServerStatus')}
        >
          <Icon name="server-network" size={24} color={colors.text} />
          <Text style={styles.settingText}>Server Status</Text>
          <Icon name="chevron-right" size={24} color={colors.disabled} />
        </TouchableOpacity>
        
        <View style={styles.settingItem}>
          <Icon name="theme-light-dark" size={24} color={colors.text} />
          <Text style={styles.settingText}>Dark Mode</Text>
          <ThemeToggle compact={true} />
        </View>
      </View>
      
      <AppButton 
        mode="contained" 
        onPress={handleLogout}
        style={styles.logoutButton}
        icon="logout"
      >
        Logout
      </AppButton>
      
      <View style={styles.versionContainer}>
        <Text style={styles.versionText}>Version 1.0.0</Text>
      </View>
    </ScrollView>
  );
};

export default ProfileScreen;