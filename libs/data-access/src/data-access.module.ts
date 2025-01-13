import { Global, Module } from '@nestjs/common';

import { PrismaUserRepository } from './adapters/prisma/prisma-user.repository';
import { PrismaService } from './adapters/prisma/prisma.service';

@Global()
@Module({
  providers: [PrismaService, PrismaUserRepository],
  exports: [PrismaUserRepository],
})
export class DataAccessModule {}
