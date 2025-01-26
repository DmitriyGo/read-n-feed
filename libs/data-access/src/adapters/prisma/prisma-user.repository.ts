import { Injectable } from '@nestjs/common';
import { IUserRepository, User } from '@read-n-feed/domain';

import { PrismaService } from './prisma.service';

@Injectable()
export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string): Promise<User | null> {
    const userModel = await this.prisma.user.findUnique({ where: { email } });
    if (!userModel) return null;
    return new User({ ...userModel });
  }

  async findById(userId: string): Promise<User | null> {
    const userModel = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!userModel) return null;
    return new User({ ...userModel });
  }

  async save(user: User): Promise<User> {
    const props = user.toPrimitives();
    const upserted = await this.prisma.user.upsert({
      where: { id: props.id },
      update: { ...props },
      create: { ...props },
    });
    return new User({ ...upserted });
  }
}
