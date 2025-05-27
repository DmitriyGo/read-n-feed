import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Button,
  ActivityIndicator,
} from 'react-native';

import { axiosInstance } from '../lib/axios';
import { RootStackParamList } from '../types/navigation';
import { validateLoginForm, LoginFormData } from '../utils/validation';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function HomeLogin() {
  const navigation = useNavigation<NavigationProp>();
  const [formData, setFormData] = React.useState<LoginFormData>({
    email: '',
    password: '',
  });
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = React.useState<boolean>(false);

  const pressHandler = async (): Promise<void> => {
    const { isValid, errors: validationErrors } = validateLoginForm(formData);
    setErrors(validationErrors);

    if (isValid) {
      setIsLoading(true);
      try {
        const response = await axiosInstance.post('/auth/login', formData);

        if (response.data.accessToken) {
          await AsyncStorage.setItem('token', response.data.accessToken);
          navigation.reset({
            index: 0,
            routes: [{ name: 'Main' }],
          });
        }
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || 'Login failed';
        alert(errorMessage);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const goToRegister = (): void => {
    AsyncStorage.clear();
    navigation.navigate('Auth', { screen: 'HomeRegister' });
  };

  const handleInputChange = (field: keyof LoginFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.formContainer}>
        <Text style={styles.title}>Ласкаво просимо</Text>

        <View style={styles.inputContainer}>
          <TextInput
            placeholder="Email"
            autoCapitalize="none"
            value={formData.email}
            style={[styles.input, errors.email && styles.inputError]}
            onChangeText={(text) => handleInputChange('email', text)}
          />
          {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

          <TextInput
            placeholder="Пароль"
            autoCapitalize="none"
            secureTextEntry
            value={formData.password}
            style={[styles.input, errors.password && styles.inputError]}
            onChangeText={(text) => handleInputChange('password', text)}
          />
          {errors.password && (
            <Text style={styles.errorText}>{errors.password}</Text>
          )}

          <TouchableOpacity
            style={styles.button}
            onPress={pressHandler}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Увійти</Text>
            )}
          </TouchableOpacity>
        </View>

        <Button title="Немає акаунту? Зареєструватися" onPress={goToRegister} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  formContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#333',
  },
  inputContainer: {
    width: '100%',
  },
  input: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  inputError: {
    borderColor: '#ff6b6b',
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 12,
    marginBottom: 10,
    marginLeft: 5,
  },
  button: {
    backgroundColor: '#4a90e2',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
