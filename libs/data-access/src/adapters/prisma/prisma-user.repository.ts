import { Injectable } from '@nestjs/common';
import { User as UserFromDb } from '@prisma/client';
import { IUserRepository, User } from '@read-n-feed/domain';

import { PrismaService } from './prisma.service';

@Injectable()
export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string): Promise<User | null> {
    const record = await this.prisma.user.findUnique({ where: { email } });
    if (!record) return null;
    return this.toDomain(record);
  }

  async findById(userId: string): Promise<User | null> {
    const record = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!record) return null;
    return this.toDomain(record);
  }

  async save(user: User): Promise<User> {
    const props = user.toPrimitives();
    const upserted = await this.prisma.user.upsert({
      where: { id: props.id },
      update: { ...props },
      create: { ...props },
    });
    return this.toDomain(upserted);
  }

  private toDomain(record: UserFromDb): User {
    return new User({ ...record });
  }
}
