import AsyncStorage from '@react-native-async-storage/async-storage';
import * as React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';

import { axiosInstance } from '../lib/axios';

interface UserProfile {
  username: string;
  email: string;
  createdAt: string;
  firstName?: string | null;
  lastName?: string | null;
  avatarUrl?: string | null;
  roles: string[];
  isBlocked: boolean;
}

export default function HomeProfile({ navigation }: { navigation: any }) {
  const [profile, setProfile] = React.useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [isUpdating, setIsUpdating] = React.useState<boolean>(false);

  const getProfile = async (): Promise<void> => {
    try {
      const response = await axiosInstance.get('/users/me');
      setProfile(response.data);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || 'Failed to load profile';
      Alert.alert('Error', errorMessage);
      navigation.reset({
        index: 0,
        routes: [{ name: 'Auth' }],
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async (): Promise<void> => {
    try {
      await axiosInstance.post('/auth/logout');
      await AsyncStorage.clear();
      navigation.reset({
        index: 0,
        routes: [{ name: 'Auth' }],
      });
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to logout';
      Alert.alert('Error', errorMessage);
    }
  };

  const handleUpdateProfile = async (): Promise<void> => {
    Alert.prompt(
      'Update Profile',
      'Enter your first name',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Next',
          onPress: async (firstName) => {
            Alert.prompt(
              'Update Profile',
              'Enter your last name',
              [
                {
                  text: 'Cancel',
                  style: 'cancel',
                },
                {
                  text: 'Update',
                  onPress: async (lastName) => {
                    try {
                      setIsUpdating(true);
                      await axiosInstance.patch('/users/me', {
                        firstName,
                        lastName,
                      });
                      await getProfile();
                      Alert.alert('Success', 'Profile updated successfully');
                    } catch (err: any) {
                      const errorMessage =
                        err.response?.data?.message ||
                        'Failed to update profile';
                      Alert.alert('Error', errorMessage);
                    } finally {
                      setIsUpdating(false);
                    }
                  },
                },
              ],
              'plain-text',
              profile?.lastName || '',
            );
          },
        },
      ],
      'plain-text',
      profile?.firstName || '',
    );
  };

  React.useEffect(() => {
    getProfile();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4a90e2" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} scrollIndicatorInsets={{ right: 1 }}>
      <View style={styles.profileContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Your Profile</Text>
        </View>

        <View style={styles.avatarContainer}>
          {profile?.avatarUrl ? (
            <Image source={{ uri: profile.avatarUrl }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarPlaceholderText}>
                {profile?.username?.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.sectionTitle}>Essential Data</Text>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Email</Text>
            <Text style={styles.value}>{profile?.email}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Username</Text>
            <Text style={styles.value}>{profile?.username}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>First Name</Text>
            <Text style={styles.value}>{profile?.firstName || 'Not set'}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Last Name</Text>
            <Text style={styles.value}>{profile?.lastName || 'Not set'}</Text>
          </View>
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.sectionTitle}>Additional Data</Text>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Status</Text>
            <View
              style={[
                styles.statusBadge,
                profile?.isBlocked ? styles.blockedBadge : styles.activeBadge,
              ]}
            >
              <Text style={styles.statusText}>
                {profile?.isBlocked ? 'Blocked' : 'Active'}
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Roles</Text>
            <View style={styles.rolesContainer}>
              {profile?.roles.map((role) => (
                <View key={role} style={styles.roleBadge}>
                  <Text style={styles.roleText}>{role}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Member Since</Text>
            <Text style={styles.value}>
              {profile?.createdAt
                ? new Date(profile.createdAt).toLocaleDateString()
                : 'N/A'}
            </Text>
          </View>
        </View>

        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={handleUpdateProfile}
            disabled={isUpdating}
          >
            <Text style={styles.buttonText}>
              {isUpdating ? 'Updating...' : 'Update Profile'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.warningButton]}
            onPress={handleLogout}
          >
            <Text style={styles.buttonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  profileContainer: {
    padding: 20,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarPlaceholderText: {
    fontSize: 48,
    color: '#666',
  },
  infoContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  label: {
    fontSize: 16,
    color: '#666',
  },
  value: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  activeBadge: {
    backgroundColor: '#e6f4ea',
  },
  blockedBadge: {
    backgroundColor: '#fce8e6',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  rolesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  roleBadge: {
    backgroundColor: '#e8f0fe',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  roleText: {
    fontSize: 14,
    color: '#1a73e8',
    fontWeight: '500',
  },
  actionsContainer: {
    gap: 12,
  },
  button: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#1a73e8',
  },
  warningButton: {
    backgroundColor: '#dc3545',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
