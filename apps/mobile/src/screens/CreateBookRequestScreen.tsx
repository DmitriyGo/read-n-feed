import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as DocumentPicker from 'expo-document-picker';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Button, TextInput, HelperText } from 'react-native-paper';
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
    title: z.string().min(1, t('titleCannotBeEmpty')),
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

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        return;
      }

      setFile(result.assets[0]);

      setFormData((prev) => ({
        ...prev,
        filename: result.assets[0].name,
      }));
    } catch (err) {
      console.error('Error picking document:', err);
    }
  };

  const handleSubmit = async () => {
    try {
      const validatedData = formSchema(t).parse(formData);
      setErrors({});

      if (!file) {
        setErrors((prev) => ({ ...prev, filename: t('fileIsRequired') }));
        return;
      }

      const fileExtension = file.name.split('.').pop()?.toUpperCase();

      if (
        !fileExtension ||
        !['PDF', 'EPUB', 'FB2', 'MOBI', 'AZW3'].includes(fileExtension)
      ) {
        setErrors((prev) => ({ ...prev, filename: t('invalidFileFormat') }));
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

      axiosInstance
        .post('book-requests', data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        .then(() => {
          navigation.goBack();
        })
        .catch((error) => {
          console.error('Error submitting request:', error);
        });
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.log('Validation error:', error.errors);
        const fieldErrors: Partial<Record<keyof FormData, string>> = {};
        error.errors.forEach((err) => {
          const field = err.path[0] as keyof FormData;
          fieldErrors[field] = err.message;
        });
        setErrors(fieldErrors);
      } else {
        console.error('Unexpected error:', error);
      }
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text variant="headlineMedium" style={styles.title}>
          {t('createBookRequest')}
        </Text>

        <TextInput
          label={t('bookTitle')}
          value={formData.title}
          onChangeText={(text) =>
            setFormData((prev) => ({ ...prev, title: text }))
          }
          error={!!errors.title}
          style={styles.input}
        />
        <HelperText type="error" visible={!!errors.title}>
          {errors.title}
        </HelperText>

        <TextInput
          label={t('description')}
          value={formData.description}
          onChangeText={(text) =>
            setFormData((prev) => ({ ...prev, description: text }))
          }
          multiline
          numberOfLines={4}
          style={styles.input}
        />

        <TextInput
          label={t('authors')}
          value={formData.authorNames}
          onChangeText={(text) =>
            setFormData((prev) => ({ ...prev, authorNames: text }))
          }
          placeholder={t('enterAuthorNamesSeparatedByCommas')}
          style={styles.input}
        />

        <TextInput
          label={t('genres')}
          value={formData.genreNames}
          onChangeText={(text) =>
            setFormData((prev) => ({ ...prev, genreNames: text }))
          }
          placeholder={t('enterGenresSeparatedByCommas')}
          style={styles.input}
        />

        <TextInput
          label={t('publicationDate')}
          value={formData.publicationDate}
          onChangeText={(text) =>
            setFormData((prev) => ({ ...prev, publicationDate: text }))
          }
          placeholder="YYYY-MM-DD"
          style={styles.input}
        />

        <TextInput
          label={t('publisher')}
          value={formData.publisher}
          onChangeText={(text) =>
            setFormData((prev) => ({ ...prev, publisher: text }))
          }
          style={styles.input}
        />

        <TextInput
          label={t('tags')}
          value={formData.tagLabels}
          onChangeText={(text) =>
            setFormData((prev) => ({ ...prev, tagLabels: text }))
          }
          placeholder={t('enterTagsSeparatedByCommas')}
          style={styles.input}
        />

        <Button
          mode="outlined"
          onPress={handlePickDocument}
          style={styles.fileButton}
          icon="file-upload"
        >
          {file ? file.name : t('selectFile')}
        </Button>
        <HelperText type="error" visible={!!errors.filename}>
          {errors.filename}
        </HelperText>

        <Button
          mode="contained"
          onPress={handleSubmit}
          style={styles.submitButton}
        >
          {t('submitRequest')}
        </Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 16,
  },
  title: {
    marginBottom: 24,
  },
  input: {
    marginBottom: 8,
  },
  fileButton: {
    marginTop: 16,
    marginBottom: 8,
  },
  submitButton: {
    marginTop: 24,
  },
});
