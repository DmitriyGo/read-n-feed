import * as UAParserModule from 'ua-parser-js';

export function parseUserAgent(userAgent: string): string {
  const parser = new UAParserModule.UAParser(userAgent);
  const result = parser.getResult();

  const deviceType =
    result.device && result.device.type ? result.device.type : 'desktop';

  const browserName = result.browser?.name || 'unknown browser';
  const browserVersion = result.browser?.version || '';

  const osName = result.os?.name || 'unknown OS';
  const osVersion = result.os?.version || '';

  return `Device: ${deviceType}, Browser: ${browserName} ${browserVersion}, OS: ${osName} ${osVersion}`;
}
