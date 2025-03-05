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
            let logLevel = appConfig.get(ConfigKeys.PINO_LOG_LEVEL);

            if (!isProduction && logLevel === 'info') {
              console.log(
                'Overriding log level to "debug" in development environment',
              );
              logLevel = 'debug';
            }

            console.log(`Logger initialized with level: ${logLevel}`);

            return {
              pinoHttp: [
                {
                  autoLogging: false,
                  level: logLevel,
                  transport: !isProduction
                    ? {
                        target: 'pino-pretty',
                        options: {
                          colorize: true,
                          translateTime: true,
                          ignore: 'pid,hostname',
                          levelFirst: true,
                          customLevels:
                            'trace:10,debug:20,info:30,warn:40,error:50,fatal:60',
                        },
                      }
                    : undefined,
                  serializers: {
                    req: (req) => ({
                      id: req.id,
                      method: req.method,
                      url: req.url,
                      auth: req.headers?.authorization
                        ? 'Bearer token present'
                        : 'No auth header',
                    }),
                    res: (res) => ({
                      statusCode: res.statusCode,
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
