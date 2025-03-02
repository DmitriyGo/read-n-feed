import { Author } from './author.entity';

export interface IAuthorRepository {
  create(author: Author): Promise<void>;
  update(author: Author): Promise<void>;
  delete(authorId: string): Promise<void>;
  findById(authorId: string): Promise<Author | null>;
  findByName(name: string): Promise<Author[]>;
  findAll(): Promise<Author[]>;
}
