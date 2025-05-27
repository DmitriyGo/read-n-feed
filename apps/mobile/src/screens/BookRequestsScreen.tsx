import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  BookFileResponseDto,
  BookRequestResponseDto,
} from '@read-n-feed/application';
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  View,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { Text, Button, Card, useTheme, Chip } from 'react-native-paper';

import { axiosInstance } from '../lib/axios';
import { RootStackParamList } from '../types/navigation';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

type RequestWithFiles = BookRequestResponseDto & {
  files: BookFileResponseDto[];
};

interface PaginatedResponse {
  items: RequestWithFiles[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const STATUSES = ['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const;
type Status = (typeof STATUSES)[number];

export const BookRequestsScreen = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigation = useNavigation<NavigationProp>();

  const [requests, setRequests] = React.useState<RequestWithFiles[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [selectedStatus, setSelectedStatus] = React.useState<Status>('ALL');

  const fetchRequests = async (status: Status = 'ALL') => {
    try {
      const response = await axiosInstance.get<PaginatedResponse>(
        'book-requests/my-requests',
        {
          params: {
            status: status === 'ALL' ? undefined : status,
            limit: 100, // Increased limit to load more items at once
          },
        },
      );

      setRequests(response.data.items);
    } catch (error) {
      console.error('Error fetching requests:', error);
      setRequests([]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      setIsLoading(true);
      fetchRequests(selectedStatus);
    }, [selectedStatus]),
  );

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchRequests(selectedStatus);
  };

  const handleStatusChange = (status: Status) => {
    setSelectedStatus(status);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return theme.colors.primary;
      case 'PENDING':
        return '#FFA000'; // Material Design amber-700
      case 'REJECTED':
        return theme.colors.error;
      default:
        return theme.colors.onSurface;
    }
  };

  const renderRequestItem = ({ item }: { item: RequestWithFiles }) => (
    <Card
      style={styles.card}
      mode="elevated"
      onPress={() => {
        if (item.status === 'PENDING') {
          navigation.navigate('EditBookRequest', { bookRequest: item });
        }
      }}
    >
      <Card.Content>
        <Text variant="titleLarge" style={styles.title}>
          {item.title}
        </Text>
        <Text variant="bodyMedium" style={styles.description}>
          {item.description}
        </Text>
        <View style={styles.metadata}>
          {item.authorNames && (
            <View style={styles.metadataRow}>
              <Text variant="labelMedium" style={styles.metadataLabel}>
                {t('bookRequests.authors')}:
              </Text>
              <Text variant="bodySmall" style={styles.metadataValue}>
                {Array.isArray(item.authorNames)
                  ? item.authorNames.join(', ')
                  : item.authorNames || ''}
              </Text>
            </View>
          )}
          {item.genreNames && (
            <View style={styles.metadataRow}>
              <Text variant="labelMedium" style={styles.metadataLabel}>
                {t('bookRequests.genres')}:
              </Text>
              <Text variant="bodySmall" style={styles.metadataValue}>
                {Array.isArray(item.genreNames)
                  ? item.genreNames.join(', ')
                  : item.genreNames || ''}
              </Text>
            </View>
          )}
        </View>
        <View style={styles.statusContainer}>
          <Text
            variant="labelMedium"
            style={[
              styles.status,
              {
                color: getStatusColor(item.status),
              },
            ]}
          >
            {t(`bookRequests.status.${item.status.toLowerCase()}`)}
          </Text>
        </View>
      </Card.Content>
      <Card.Actions style={styles.cardActions}>
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
            style={styles.readButton}
            buttonColor={theme.colors.primary}
            textColor={theme.colors.onPrimary}
          >
            {t('bookRequests.read')}
          </Button>
        )}
      </Card.Actions>
    </Card>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.filterWrapper}>
          <Button
            mode="contained"
            onPress={() => navigation.navigate('CreateBookRequest')}
            style={styles.createButton}
            contentStyle={styles.createButtonContent}
            buttonColor={theme.colors.primary}
            textColor={theme.colors.onPrimary}
            icon="plus"
            compact
          >
            {t('bookRequests.createRequest')}
          </Button>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterContainer}
          >
            {STATUSES.map((status) => (
              <Chip
                key={status}
                selected={selectedStatus === status}
                onPress={() => handleStatusChange(status)}
                style={[
                  styles.filterChip,
                  selectedStatus === status && {
                    backgroundColor: theme.colors.primary,
                    borderColor: theme.colors.primary,
                  },
                ]}
                textStyle={[
                  styles.filterChipText,
                  selectedStatus === status && {
                    color: theme.colors.onPrimary,
                  },
                ]}
                showSelectedCheck={false}
                mode="outlined"
              >
                {t(`bookRequests.status.${status.toLowerCase()}`)}
              </Chip>
            ))}
          </ScrollView>
        </View>
      </View>

      {isLoading && !isRefreshing ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <FlatList
          data={requests}
          renderItem={renderRequestItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              colors={[theme.colors.primary]}
            />
          }
          ListEmptyComponent={
            <View style={styles.center}>
              <Text variant="titleMedium" style={styles.emptyText}>
                {t('bookRequests.noRequests')}
              </Text>
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
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  filterWrapper: {
    padding: 16,
    gap: 12,
  },
  filterContainer: {
    paddingVertical: 4,
    gap: 8,
    paddingRight: 8,
  },
  filterChip: {
    marginRight: 8,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '500',
  },
  createButton: {
    borderRadius: 8,
    elevation: 2,
    minWidth: 120,
    alignSelf: 'center',
  },
  createButtonContent: {
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  list: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
    borderRadius: 12,
    elevation: 2,
  },
  title: {
    marginBottom: 8,
    fontWeight: '600',
  },
  description: {
    marginBottom: 12,
    color: '#666',
  },
  metadata: {
    marginTop: 8,
    gap: 8,
  },
  metadataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metadataLabel: {
    color: '#666',
  },
  metadataValue: {
    flex: 1,
    color: '#333',
  },
  statusContainer: {
    marginTop: 12,
    marginBottom: 4,
  },
  status: {
    fontWeight: '600',
  },
  cardActions: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    justifyContent: 'flex-end',
  },
  readButton: {
    borderRadius: 8,
    elevation: 2,
    minWidth: 100,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
  },
});
