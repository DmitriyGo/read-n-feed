import { Author } from './author.entity';

export interface IAuthorRepository {
  create(author: Author): Promise<void>;
  update(author: Author): Promise<void>;
  findById(authorId: string): Promise<Author | null>;
  findByName(name: string): Promise<Author[]>;
}
