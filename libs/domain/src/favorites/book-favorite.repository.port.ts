import { BookFavorite } from './book-favorite.entity';
import { Book } from '../books/book.entity';

export interface IBookFavoriteRepository {
  add(favorite: BookFavorite): Promise<void>;
  remove(userId: string, bookId: string): Promise<void>;
  find(userId: string, bookId: string): Promise<BookFavorite | null>;
  findByUser(userId: string): Promise<BookFavorite[]>;
}
