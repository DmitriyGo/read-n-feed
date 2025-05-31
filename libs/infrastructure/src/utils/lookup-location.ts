import * as geoip from 'geoip-lite';

export function lookupLocation(ip: string): string | null {
  const geo = geoip.lookup(ip);

  if (!geo) return null;
  const { city, region, country } = geo;
  return [city, region, country].filter(Boolean).join(', ');
}
