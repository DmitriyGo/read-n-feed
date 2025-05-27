import { useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
import React, { useState } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { WebView } from 'react-native-webview';

import { axiosInstance } from '../lib/axios';
import { RootStackParamList } from '../types/navigation';

export const BookReaderScreen = () => {
  const route = useRoute<RouteProp<RootStackParamList, 'BookReader'>>();
  const { fileId } = route.params;
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    React.useCallback(() => {
      let isMounted = true;
      setIsLoading(true);
      setError(null);
      axiosInstance
        .get<{ url: string }>(`book-files/url/${fileId}`)
        .then((response) => {
          if (isMounted) {
            if (response.data.url) {
              setFileUrl(response.data.url);
            } else {
              setError('No download URL available for this file.');
            }
          }
        })
        .catch((err) => {
          if (isMounted) {
            setError('Failed to load file');
          }
        })
        .finally(() => {
          if (isMounted) setIsLoading(false);
        });
      return () => {
        isMounted = false;
      };
    }, [fileId]),
  );

  if (error) {
    return (
      <View style={styles.center}>
        <Text>{error}</Text>
      </View>
    );
  }

  if (isLoading || !fileUrl) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <WebView
        source={{ uri: fileUrl }}
        startInLoadingState
        renderLoading={() => (
          <ActivityIndicator
            color="#4a90e2"
            size="large"
            style={StyleSheet.absoluteFill}
          />
        )}
        style={styles.pdf}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pdf: {
    flex: 1,
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
});
