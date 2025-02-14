import { Global, Module } from '@nestjs/common';

import { PrismaSessionRepository } from './adapters/prisma/prisma-session.repository';
import { PrismaUserRepository } from './adapters/prisma/prisma-user.repository';
import { PrismaService } from './adapters/prisma/prisma.service';

@Global()
@Module({
  providers: [PrismaService, PrismaUserRepository, PrismaSessionRepository],
  exports: [PrismaService, PrismaUserRepository, PrismaSessionRepository],
})
export class DataAccessModule {}
