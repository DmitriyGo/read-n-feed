import { Injectable } from '@nestjs/common';
import { Session as SessionFromDb } from '@prisma/client';
import { Session, ISessionRepository } from '@read-n-feed/domain';

import { PrismaService } from './prisma.service';

@Injectable()
export class PrismaSessionRepository implements ISessionRepository {
  constructor(private prisma: PrismaService) {}

  async create(session: Session): Promise<Session> {
    const data = session.toPrimitives();
    const created = await this.prisma.session.create({
      data: {
        id: data.id,
        userId: data.userId,
        refreshTokenHash: data.refreshTokenHash,
        userAgent: data.userAgent ?? null,
        deviceType: data.deviceType ?? null,
        ipAddress: data.ipAddress ?? null,
        locationMetadata: data.locationMetadata ?? null,
        expiresAt: data.expiresAt,
        revokedAt: data.revokedAt ?? null,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      },
    });
    return this.toDomain(created);
  }

  async findActiveByUserAndDevice(
    userId: string,
    userAgent: string,
    ipAddress: string,
  ): Promise<Session[]> {
    const now = new Date();
    const records = await this.prisma.session.findMany({
      where: {
        userId,
        userAgent,
        ipAddress,
        revokedAt: null,
        expiresAt: { gt: now },
      },
    });
    return records.map((r) => this.toDomain(r));
  }

  async findById(sessionId: string): Promise<Session | null> {
    const record = await this.prisma.session.findUnique({
      where: { id: sessionId },
    });
    if (!record) return null;
    return this.toDomain(record);
  }

  async findByUser(userId: string): Promise<Session[]> {
    const records = await this.prisma.session.findMany({
      where: { userId },
    });
    return records.map((r) => this.toDomain(r));
  }

  async update(session: Session): Promise<Session> {
    const data = session.toPrimitives();
    const updated = await this.prisma.session.update({
      where: { id: data.id },
      data: {
        refreshTokenHash: data.refreshTokenHash,
        userAgent: data.userAgent,
        deviceType: data.deviceType,
        ipAddress: data.ipAddress,
        locationMetadata: data.locationMetadata,
        expiresAt: data.expiresAt,
        revokedAt: data.revokedAt,
        updatedAt: data.updatedAt,
      },
    });
    return this.toDomain(updated);
  }

  async delete(sessionId: string): Promise<void> {
    await this.prisma.session.delete({ where: { id: sessionId } });
  }

  async deleteAllByUser(userId: string): Promise<void> {
    await this.prisma.session.deleteMany({ where: { userId } });
  }

  async countByUser(userId: string): Promise<number> {
    return this.prisma.session.count({ where: { userId } });
  }

  async findActiveByUser(userId: string): Promise<Session[]> {
    const now = new Date();
    const records = await this.prisma.session.findMany({
      where: {
        userId,
        revokedAt: null,
        expiresAt: { gt: now },
      },
    });
    return records.map((r) => this.toDomain(r));
  }

  private toDomain(record: SessionFromDb): Session {
    return new Session({ ...record });
  }
}
