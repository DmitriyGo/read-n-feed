import { Injectable } from '@nestjs/common';
import { User as DbUser } from '@prisma/client';
import { UserRepositoryPort } from '@read-n-feed/application';
import { User } from '@read-n-feed/domain';

import { PrismaService } from './prisma.service';

@Injectable()
export class PrismaUserRepository implements UserRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async createUser(user: User): Promise<User> {
    const created = await this.prisma.user.create({
      data: {
        id: user.id,
        email: user.email,
        password: user.password,
        role: user.role,
      },
    });
    return this.toDomain(created);
  }

  async findUserById(id: string): Promise<User | null> {
    const found = await this.prisma.user.findUnique({ where: { id } });
    return found ? this.toDomain(found) : null;
  }

  async findUserByEmail(email: string): Promise<User | null> {
    const found = await this.prisma.user.findUnique({ where: { email } });
    return found ? this.toDomain(found) : null;
  }

  async updateUser(user: User): Promise<User> {
    const updated = await this.prisma.user.update({
      where: { id: user.id },
      data: {
        email: user.email,
        password: user.password,
        role: user.role,
        updatedAt: new Date(),
      },
    });
    return this.toDomain(updated);
  }

  async deleteUser(id: string): Promise<void> {
    await this.prisma.user.delete({ where: { id } });
  }

  private toDomain(prismaUser: DbUser): User {
    return new User(
      prismaUser.id,
      prismaUser.email,
      prismaUser.password,
      prismaUser.role,
      prismaUser.createdAt,
      prismaUser.updatedAt,
    );
  }
}
