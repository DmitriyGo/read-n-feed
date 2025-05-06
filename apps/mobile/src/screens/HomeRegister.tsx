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
import { validateRegisterForm, RegisterFormData } from '../utils/validation';

export default function HomeRegister({ navigation }: { navigation: any }) {
  const [formData, setFormData] = React.useState<RegisterFormData>({
    email: '',
    username: '',
    password: '',
  });
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = React.useState<boolean>(false);

  const pressHandler = async (): Promise<void> => {
    const { isValid, errors: validationErrors } =
      validateRegisterForm(formData);
    setErrors(validationErrors);

    if (isValid) {
      setIsLoading(true);
      try {
        const response = await axiosInstance.post('/auth/register', formData);

        if (response.status === 201) {
          alert('Registration successful! Please check your email.');
          navigation.navigate('HomeLogin');
        }
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.message || 'Registration failed';
        alert(errorMessage);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const goToLogin = (): void => {
    navigation.navigate('HomeLogin');
  };

  const handleInputChange = (field: keyof RegisterFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Remove the error for the field being changed
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.formContainer}>
        <Text style={styles.title}>Welcome - Register</Text>

        <View style={styles.inputContainer}>
          <TextInput
            placeholder="Username"
            autoCapitalize="none"
            value={formData.username}
            style={[styles.input, errors.username && styles.inputError]}
            onChangeText={(text) => handleInputChange('username', text)}
          />
          {errors.username && (
            <Text style={styles.errorText}>{errors.username}</Text>
          )}

          <TextInput
            placeholder="Email"
            autoCapitalize="none"
            value={formData.email}
            style={[styles.input, errors.email && styles.inputError]}
            onChangeText={(text) => handleInputChange('email', text)}
          />
          {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

          <TextInput
            placeholder="Password"
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
              <Text style={styles.buttonText}>Register</Text>
            )}
          </TouchableOpacity>
        </View>

        <Button title="Already have an account? Login" onPress={goToLogin} />
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
