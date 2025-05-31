import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as DocumentPicker from 'expo-document-picker';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  View,
  StyleSheet,
  ScrollView,
  TextInput,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { z } from 'zod';

import { axiosInstance } from '../lib/axios';
import { RootStackParamList } from '../types/navigation';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

type FormData = {
  title: string;
  description: string;
  authorNames: string;
  genreNames: string;
  publicationDate: string;
  publisher: string;
  tagLabels: string;
  filename: string;
};

const formSchema = (t: (key: string) => string) =>
  z.object({
    title: z
      .string()
      .min(1, t('bookRequests.form.titleCannotBeEmpty') || 'Required'),
    description: z.string().optional(),
    authorNames: z.string().optional(),
    genreNames: z.string().optional(),
    publicationDate: z.string().optional(),
    publisher: z.string().optional(),
    tagLabels: z.string().optional(),
    filename: z.string().optional(),
  });

export const CreateBookRequestScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp>();
  const [file, setFile] = useState<DocumentPicker.DocumentPickerAsset | null>(
    null,
  );
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    authorNames: '',
    genreNames: '',
    publicationDate: '',
    publisher: '',
    tagLabels: '',
    filename: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>(
    {},
  );
  const [isLoading, setIsLoading] = useState(false);

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });
      if (result.canceled) return;
      setFile(result.assets[0]);
      setFormData((prev) => ({ ...prev, filename: result.assets[0].name }));
    } catch (err) {
      // handle error
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const validatedData = formSchema(t).parse(formData);
      setErrors({});
      if (!file) {
        setErrors((prev) => ({
          ...prev,
          filename: t('bookRequests.form.fileIsRequired'),
        }));
        setIsLoading(false);
        return;
      }
      const fileExtension = file.name.split('.').pop()?.toUpperCase();
      if (
        !fileExtension ||
        !['PDF', 'EPUB', 'FB2', 'MOBI', 'AZW3'].includes(fileExtension)
      ) {
        setErrors((prev) => ({
          ...prev,
          filename: t('bookRequests.form.invalidFileFormat'),
        }));
        setIsLoading(false);
        return;
      }
      const data = new FormData();
      for (const [key, value] of Object.entries(validatedData)) {
        if (key !== 'file' && value) {
          data.append(key, String(value));
        }
      }
      if (file) {
        data.append('file', {
          uri: file.uri,
          type: file.mimeType,
          name: file.name,
        } as unknown as File);
        data.append('fileFormat', fileExtension);
      }
      await axiosInstance.post('book-requests', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      navigation.goBack();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Partial<Record<keyof FormData, string>> = {};
        error.errors.forEach((err) => {
          const field = err.path[0] as keyof FormData;
          fieldErrors[field] = err.message;
        });
        setErrors(fieldErrors);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.formContainer}>
        <Text style={styles.title}>{t('bookRequests.createRequest')}</Text>
        <View style={styles.inputContainer}>
          <TextInput
            placeholder={t('bookRequests.form.titlePlaceholder')}
            value={formData.title}
            style={[styles.input, errors.title && styles.inputError]}
            onChangeText={(text) =>
              setFormData((prev) => ({ ...prev, title: text }))
            }
          />
          {errors.title && <Text style={styles.errorText}>{errors.title}</Text>}

          <TextInput
            placeholder={t('bookRequests.form.descriptionPlaceholder')}
            value={formData.description}
            style={styles.input}
            onChangeText={(text) =>
              setFormData((prev) => ({ ...prev, description: text }))
            }
            multiline
            numberOfLines={4}
          />

          <TextInput
            placeholder={t('bookRequests.form.authorsPlaceholder')}
            value={formData.authorNames}
            style={styles.input}
            onChangeText={(text) =>
              setFormData((prev) => ({ ...prev, authorNames: text }))
            }
          />

          <TextInput
            placeholder={t('bookRequests.form.genresPlaceholder')}
            value={formData.genreNames}
            style={styles.input}
            onChangeText={(text) =>
              setFormData((prev) => ({ ...prev, genreNames: text }))
            }
          />

          <TextInput
            placeholder={t('bookRequests.form.publicationDatePlaceholder')}
            value={formData.publicationDate}
            style={styles.input}
            onChangeText={(text) =>
              setFormData((prev) => ({ ...prev, publicationDate: text }))
            }
          />

          <TextInput
            placeholder={t('bookRequests.form.publisherPlaceholder')}
            value={formData.publisher}
            style={styles.input}
            onChangeText={(text) =>
              setFormData((prev) => ({ ...prev, publisher: text }))
            }
          />

          <TextInput
            placeholder={t('bookRequests.form.tagsPlaceholder')}
            value={formData.tagLabels}
            style={styles.input}
            onChangeText={(text) =>
              setFormData((prev) => ({ ...prev, tagLabels: text }))
            }
          />

          <TouchableOpacity
            style={[styles.fileButton, errors.filename && styles.inputError]}
            onPress={handlePickDocument}
          >
            <Text style={styles.fileButtonText}>
              {file ? file.name : t('bookRequests.form.selectFile')}
            </Text>
          </TouchableOpacity>
          {errors.filename && (
            <Text style={styles.errorText}>{errors.filename}</Text>
          )}

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.button}
              onPress={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>
                  {t('bookRequests.form.submit')}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

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
    borderWidth: 2,
    borderColor: '#b0b6be',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 2,
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
  fileButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginBottom: 10,
  },
  fileButtonText: {
    color: '#4a90e2',
    fontWeight: 'bold',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginTop: 10,
  },
  button: {
    backgroundColor: '#4a90e2',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 100,
    flex: 1,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
