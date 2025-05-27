import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  BookFileResponseDto,
  BookRequestResponseDto,
} from '@read-n-feed/application';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { View, StyleSheet, FlatList } from 'react-native';
import { Text, Button, Card } from 'react-native-paper';

import { axiosInstance } from '../lib/axios';
import { RootStackParamList } from '../types/navigation';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

type RequestWithFiles = BookRequestResponseDto & {
  files: BookFileResponseDto[];
};

export const BookRequestsScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp>();

  const [requests, setRequests] = React.useState<RequestWithFiles[] | null>(
    null,
  );
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    axiosInstance
      .get<{ items: RequestWithFiles[] }>('book-requests/my-requests')
      .then((response) => {
        if (isMounted) {
          setRequests(response.data.items);
        }
      })
      .catch(() => {
        if (isMounted) setRequests(null);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const renderRequestItem = ({ item }: { item: RequestWithFiles }) => (
    <Card style={styles.card} mode="outlined">
      <Card.Content>
        <Text variant="titleLarge">{item.title}</Text>
        <Text variant="bodyMedium">{item.description}</Text>
        <View style={styles.metadata}>
          {item.authorNames && (
            <Text variant="bodySmall">
              {t('authors')}: {item.authorNames.join(', ')}
            </Text>
          )}
          {item.genreNames && (
            <Text variant="bodySmall">
              {t('genres')}: {item.genreNames.join(', ')}
            </Text>
          )}
        </View>
        <View style={styles.statusContainer}>
          <Text
            variant="labelMedium"
            style={[
              styles.status,
              {
                color:
                  item.status === 'APPROVED'
                    ? 'green'
                    : item.status === 'PENDING'
                      ? 'orange'
                      : 'red',
              },
            ]}
          >
            {t(item.status.toLowerCase())}
          </Text>
        </View>
      </Card.Content>
      <Card.Actions>
        {item.files.length > 0 && (
          <Button
            mode="contained"
            onPress={() => {
              const firstFile = item.files[0];
              navigation.navigate('BookReader', {
                fileId: firstFile.id,
                bookId: item.id,
              });
            }}
          >
            {t('read')}
          </Button>
        )}
      </Card.Actions>
    </Card>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineMedium">{t('myBookRequests')}</Text>
        <Button
          mode="contained"
          onPress={() => navigation.navigate('CreateBookRequest')}
        >
          {t('createRequest')}
        </Button>
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <Text>{t('loading')}</Text>
        </View>
      ) : (
        <FlatList
          data={requests}
          renderItem={renderRequestItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.center}>
              <Text>{t('noRequests')}</Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  list: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
  },
  metadata: {
    marginTop: 8,
    gap: 4,
  },
  statusContainer: {
    marginTop: 8,
  },
  status: {
    fontWeight: 'bold',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
