import { Tag } from './tag.entity';

export interface ITagRepository {
  create(tag: Tag): Promise<void>;
  findById(id: string): Promise<Tag | null>;
  findByLabel(label: string): Promise<Tag | null>;
  listAll(): Promise<Tag[]>;
}
