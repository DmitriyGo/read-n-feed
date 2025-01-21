import { Global, Module } from '@nestjs/common';

import { PrismaTokenRepository } from './adapters/prisma/prisma-token.repository';
import { PrismaUserRepository } from './adapters/prisma/prisma-user.repository';
import { PrismaService } from './adapters/prisma/prisma.service';

@Global()
@Module({
  providers: [PrismaService, PrismaUserRepository, PrismaTokenRepository],
  exports: [PrismaService, PrismaUserRepository, PrismaTokenRepository],
})
export class DataAccessModule {}
