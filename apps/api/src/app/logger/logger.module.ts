import { DynamicModule } from '@nestjs/common';
import { LoggerModule as PinoLoggerModule } from 'nestjs-pino';
import { Options } from 'pino-http';
import { v4 as uuidv4 } from 'uuid';

import { ConfigKeys } from '../config/config-keys.enum';
import { ApiConfigService } from '../config/config.service';

export class LoggerModule {
  static forRoot({ global }: { global: boolean }): DynamicModule {
    return {
      module: LoggerModule,
      global,
      imports: [
        PinoLoggerModule.forRootAsync({
          inject: [ApiConfigService],
          useFactory: async (appConfig: ApiConfigService) => {
            const isProduction =
              appConfig.get(ConfigKeys.NODE_ENV) === 'production';

            return {
              pinoHttp: [
                {
                  autoLogging: false,
                  level: appConfig.get(ConfigKeys.PINO_LOG_LEVEL),
                  transport: !isProduction
                    ? {
                        target: 'pino-pretty',
                        options: {
                          colorize: true,
                          translateTime: true,
                          ignore: 'pid,hostname',
                        },
                      }
                    : undefined,
                  serializers: {
                    req: (req) => ({
                      id: req.id,
                      method: req.method,
                      url: req.url,
                    }),
                  },
                  formatters: {
                    // eslint-disable-next-line @typescript-eslint/no-empty-function
                    bindings: () => {},
                    level: (label) => {
                      return { level: label.toUpperCase() };
                    },
                  },
                  timestamp: () =>
                    `,"time":"${new Date(Date.now()).toISOString()}"`,
                  genReqId: (req, res) => {
                    const existingID = req.id || req.headers['x-request-id'];
                    if (existingID) {
                      return existingID;
                    }

                    const traceContext = req.headers['x-cloud-trace-context'];
                    if (traceContext) {
                      const traceId = traceContext.split('/')[0];
                      res.setHeader('x-request-id', traceId);
                      return traceId;
                    }

                    const id = uuidv4();
                    res.setHeader('x-request-id', id);
                    return id;
                  },
                },
              ] as Options,
            };
          },
        }),
      ],
    };
  }
}
