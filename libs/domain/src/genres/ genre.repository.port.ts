import { Genre } from './genre.entity';

export interface IGenreRepository {
  create(genre: Genre): Promise<void>;
  update(genre: Genre): Promise<void>;
  delete(id: string): Promise<void>;
  findById(id: string): Promise<Genre | null>;
  findByName(name: string): Promise<Genre | null>;
  listAll(): Promise<Genre[]>;
}
