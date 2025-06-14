import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BookResponseDto, BookFileResponseDto } from '@read-n-feed/application';
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  Button,
  Modal,
  Pressable,
  Platform,
  ScrollView,
} from 'react-native';

import { axiosInstance } from '../lib/axios';
import { RootStackParamList } from '../types/navigation';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const [books, setBooks] = useState<BookResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [bookFiles, setBookFiles] = useState<
    Record<string, BookFileResponseDto[]>
  >({});

  // Filter state
  const [filters, setFilters] = useState({
    title: '',
    authorName: '',
    genreId: '',
    tagId: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [genres, setGenres] = useState<{ id: string; name: string }[]>([]);
  const [tags, setTags] = useState<{ id: string; label: string }[]>([]);

  // Fetch genres and tags on mount
  useEffect(() => {
    (async () => {
      try {
        const genresRes = await axiosInstance.get('/genres');
        setGenres(genresRes.data);
        const tagsRes = await axiosInstance.get('/tags');
        setTags(tagsRes.data);
      } catch (e) {
        // ignore for now
      }
    })();
  }, []);

  const fetchBooks = async (isRefreshing = false, customFilters = filters) => {
    try {
      if (isRefreshing) {
        setPage(1);
        setHasMore(true);
      }
      if (!hasMore && !isRefreshing) return;
      const params: any = {
        ...customFilters,
        page: isRefreshing ? 1 : page,
        limit: 10,
      };
      // Remove empty filter values
      Object.keys(params).forEach((k) =>
        params[k] === '' ? delete params[k] : undefined,
      );
      const response = await axiosInstance.get('/books', { params });
      const data = response.data;
      if (isRefreshing) {
        setBooks(data.items);
      } else {
        setBooks((prev) => [...prev, ...data.items]);
      }
      setHasMore(data.page < data.totalPages);
      // Fetch files for each book
      const newBookFiles: Record<string, BookFileResponseDto[]> = {};
      await Promise.all(
        data.items.map(async (book: BookResponseDto) => {
          try {
            const filesResponse = await axiosInstance.get(
              `/book-files/book/${book.id}`,
            );
            newBookFiles[book.id] = filesResponse.data;
          } catch (error) {
            newBookFiles[book.id] = [];
          }
        }),
      );
      setBookFiles((prev) => ({ ...prev, ...newBookFiles }));
      if (!isRefreshing) {
        setPage((prev) => prev + 1);
      }
    } catch (error) {
      console.error('Error fetching books:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBooks(true, filters);
  }, [filters]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchBooks(true, filters);
  };

  const applyFilters = () => {
    setShowFilters(false);
    setPage(1);
    setHasMore(true);
    setLoading(true);
    fetchBooks(true, filters);
  };
  const clearFilters = () => {
    setFilters({
      title: '',
      authorName: '',
      genreId: '',
      tagId: '',
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });
    setShowFilters(false);
    setPage(1);
    setHasMore(true);
    setLoading(true);
    fetchBooks(true, {
      title: '',
      authorName: '',
      genreId: '',
      tagId: '',
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });
  };

  const renderBookItem = ({ item: book }: { item: BookResponseDto }) => {
    const files = bookFiles[book.id] || [];
    const hasReadableFile = files.some(
      (file) => file.format === 'PDF' || file.format === 'EPUB',
    );

    return (
      <TouchableOpacity
        style={styles.bookCard}
        onPress={() => {
          if (hasReadableFile) {
            const firstReadableFile = files.find(
              (file) => file.format === 'PDF' || file.format === 'EPUB',
            );
            if (firstReadableFile) {
              navigation.navigate('BookReader', {
                bookId: book.id,
                fileId: firstReadableFile.id,
              });
            }
          }
        }}
      >
        {book.coverImageUrl && (
          <Image
            source={{ uri: book.coverImageUrl }}
            style={styles.coverImage}
            resizeMode="cover"
          />
        )}
        <View style={styles.bookInfo}>
          <Text style={styles.title} numberOfLines={2}>
            {book.title}
          </Text>
          {book.authors && book.authors.length > 0 && (
            <Text style={styles.author} numberOfLines={1}>
              {book.authors.map((a) => a.name).join(', ')}
            </Text>
          )}
          {book.description && (
            <Text style={styles.description} numberOfLines={3}>
              {book.description}
            </Text>
          )}
          <View style={styles.tagsContainer}>
            {book.genres?.slice(0, 2).map((genre) => (
              <View key={genre.id} style={styles.tag}>
                <Text style={styles.tagText}>{genre.name}</Text>
              </View>
            ))}
            {book.tags?.slice(0, 2).map((tag) => (
              <View key={tag.id} style={styles.tag}>
                <Text style={styles.tagText}>{tag.label}</Text>
              </View>
            ))}
          </View>
          {hasReadableFile && (
            <TouchableOpacity
              style={styles.readButton}
              onPress={() => {
                const firstReadableFile = files.find(
                  (file) => file.format === 'PDF' || file.format === 'EPUB',
                );
                if (firstReadableFile) {
                  navigation.navigate('BookReader', {
                    bookId: book.id,
                    fileId: firstReadableFile.id,
                  });
                }
              }}
            >
              <Text style={styles.readButtonText}>Read</Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>No books available</Text>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.filterButton}
        onPress={() => setShowFilters((v) => !v)}
      >
        <Text style={styles.filterButtonText}>Filters</Text>
      </TouchableOpacity>
      {showFilters && (
        <ScrollView
          style={styles.filterPanel}
          contentContainerStyle={{ paddingBottom: 16 }}
        >
          <Text style={styles.filterLabel}>Title</Text>
          <TextInput
            placeholder="Title"
            value={filters.title}
            onChangeText={(text) => setFilters((f) => ({ ...f, title: text }))}
            style={styles.input}
          />
          <Text style={styles.filterLabel}>Author</Text>
          <TextInput
            placeholder="Author"
            value={filters.authorName}
            onChangeText={(text) =>
              setFilters((f) => ({ ...f, authorName: text }))
            }
            style={styles.input}
          />
          <Text style={styles.filterLabel}>Genre</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={filters.genreId}
              onValueChange={(value: string) =>
                setFilters((f) => ({ ...f, genreId: value }))
              }
              style={styles.picker}
            >
              <Picker.Item label="All Genres" value="" />
              {genres.map((g) => (
                <Picker.Item key={g.id} label={g.name} value={g.id} />
              ))}
            </Picker>
          </View>
          <Text style={styles.filterLabel}>Tag</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={filters.tagId}
              onValueChange={(value: string) =>
                setFilters((f) => ({ ...f, tagId: value }))
              }
              style={styles.picker}
            >
              <Picker.Item label="All Tags" value="" />
              {tags.map((t) => (
                <Picker.Item key={t.id} label={t.label} value={t.id} />
              ))}
            </Picker>
          </View>
          <Text style={styles.filterLabel}>Sort By</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={filters.sortBy}
              onValueChange={(value: string) =>
                setFilters((f) => ({ ...f, sortBy: value }))
              }
              style={styles.picker}
            >
              <Picker.Item label="Newest" value="createdAt" />
              <Picker.Item label="Title" value="title" />
              <Picker.Item label="Publication Date" value="publicationDate" />
            </Picker>
          </View>
          <Text style={styles.filterLabel}>Sort Order</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={filters.sortOrder}
              onValueChange={(value: string) =>
                setFilters((f) => ({ ...f, sortOrder: value }))
              }
              style={styles.picker}
            >
              <Picker.Item label="Descending" value="desc" />
              <Picker.Item label="Ascending" value="asc" />
            </Picker>
          </View>
          <View style={styles.filterActions}>
            <Button title="Apply" onPress={applyFilters} />
            <Button title="Clear" onPress={clearFilters} color="red" />
          </View>
        </ScrollView>
      )}
      <FlatList
        data={books}
        renderItem={renderBookItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        onEndReached={() => fetchBooks()}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={!loading ? renderEmptyComponent : null}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
  },
  bookCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  coverImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#e0e0e0',
  },
  bookInfo: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#333',
  },
  author: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  tag: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 12,
    color: '#666',
  },
  readButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  readButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
  filterButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignSelf: 'flex-end',
  },
  filterButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  filterPanel: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    margin: 16,
  },
  input: {
    marginBottom: 12,
  },
  filterActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
    marginTop: 8,
    color: '#333',
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: '#fafafa',
  },
  picker: {
    width: '100%',
  },
});

export default HomeScreen;
