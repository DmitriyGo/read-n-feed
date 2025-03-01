import { Global, Module } from '@nestjs/common';

import { PrismaService } from './adapters/prisma/prisma.service';
import { PrismaSessionRepository } from './adapters/prisma/session.repository';
import { PrismaUserRepository } from './adapters/prisma/user.repository';

@Global()
@Module({
  providers: [PrismaService, PrismaUserRepository, PrismaSessionRepository],
  exports: [PrismaService, PrismaUserRepository, PrismaSessionRepository],
})
export class DataAccessModule {}
