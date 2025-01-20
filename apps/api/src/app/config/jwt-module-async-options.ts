import { ConfigService } from '@nestjs/config';
import { JwtModuleAsyncOptions, JwtModuleOptions } from '@nestjs/jwt';
import * as fs from 'fs';

const jwtModuleOptions = (config: ConfigService): JwtModuleOptions => {
  const privateKeyPath = config.getOrThrow('JWT_PRIVATE_KEY');
  const publicKeyPath = config.getOrThrow('JWT_PUBLIC_KEY');

  return {
    privateKey: fs.readFileSync(privateKeyPath, 'utf-8'),
    publicKey: fs.readFileSync(publicKeyPath, 'utf-8'),
    signOptions: {
      algorithm: 'RS256',
      expiresIn: config.get('JWT_EXP', '5m'),
    },
  };
};

export const options = (): JwtModuleAsyncOptions => ({
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => jwtModuleOptions(configService),
});
