import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Author, AuthorProps, IAuthorRepository } from '@read-n-feed/domain';
import { v4 as uuidv4 } from 'uuid';

import { CreateAuthorDto, UpdateAuthorDto } from './author.dto';

@Injectable()
export class AuthorUseCase {
  constructor(
    @Inject('IAuthorRepository')
    private readonly authorRepo: IAuthorRepository,
  ) {}

  async createAuthor(dto: CreateAuthorDto): Promise<Author> {
    const author = new Author({
      id: uuidv4(),
      name: dto.name,
      bio: dto.bio ?? null,
      dateOfBirth: dto.dateOfBirth ?? null,
      dateOfDeath: dto.dateOfDeath ?? null,
    });

    await this.authorRepo.create(author);
    return author;
  }

  async updateAuthor(
    authorId: string,
    dto: UpdateAuthorDto,
  ): Promise<Author | null> {
    const author = await this.authorRepo.findById(authorId);
    if (!author) return null;

    const updatedProps: AuthorProps = {
      ...author.toPrimitives(),
      name: dto.name ?? author.name,
      bio: dto.bio !== undefined ? dto.bio : author.bio,
      dateOfBirth: dto.dateOfBirth ?? author.toPrimitives().dateOfBirth,
      dateOfDeath: dto.dateOfDeath ?? author.toPrimitives().dateOfDeath,
    };

    const updatedAuthor = new Author(updatedProps);
    await this.authorRepo.update(updatedAuthor);
    return updatedAuthor;
  }

  async getAuthor(authorId: string): Promise<Author | null> {
    return this.authorRepo.findById(authorId);
  }

  async searchAuthors(name?: string): Promise<Author[]> {
    if (!name) {
      return this.authorRepo.findAll();
    }
    return this.authorRepo.findByName(name);
  }

  async deleteAuthor(authorId: string): Promise<void> {
    const author = await this.authorRepo.findById(authorId);
    if (!author) {
      throw new NotFoundException(`Author with id=${authorId} not found`);
    }
    await this.authorRepo.delete(authorId);
  }
}
