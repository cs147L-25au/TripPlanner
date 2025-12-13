const TIMEZONE_API_BASE = 'https://worldtimeapi.org/api';

export interface TimezoneInfo {
  timezone: string;
  datetime: string;
  utc_offset: string;
  abbreviation: string;
  city?: string;
  country?: string;
}

export async function getTimezoneInfo(timezone: string): Promise<TimezoneInfo | null> {
  try {
    const response = await fetch(`${TIMEZONE_API_BASE}/timezone/${timezone}`);
    
    if (!response.ok) {
      throw new Error(`Timezone API error: ${response.status}`);
    }

    const data = await response.json();
    
    return {
      timezone: data.timezone,
      datetime: data.datetime,
      utc_offset: data.utc_offset,
      abbreviation: data.abbreviation,
    };
  } catch (error) {
    console.error('Error fetching timezone info:', error);
    return null;
  }
}

const CITY_TIMEZONES: { [key: string]: string } = {
  'New York': 'America/New_York',
  'Los Angeles': 'America/Los_Angeles',
  'Chicago': 'America/Chicago',
  'London': 'Europe/London',
  'Paris': 'Europe/Paris',
  'Tokyo': 'Asia/Tokyo',
  'Sydney': 'Australia/Sydney',
  'Dubai': 'Asia/Dubai',
  'Mumbai': 'Asia/Kolkata',
  'Singapore': 'Asia/Singapore',
  'Hong Kong': 'Asia/Hong_Kong',
  'Bangkok': 'Asia/Bangkok',
  'Seoul': 'Asia/Seoul',
  'Beijing': 'Asia/Shanghai',
  'Moscow': 'Europe/Moscow',
  'Berlin': 'Europe/Berlin',
  'Rome': 'Europe/Rome',
  'Madrid': 'Europe/Madrid',
  'Amsterdam': 'Europe/Amsterdam',
  'Toronto': 'America/Toronto',
  'Vancouver': 'America/Vancouver',
  'Mexico City': 'America/Mexico_City',
  'São Paulo': 'America/Sao_Paulo',
  'Buenos Aires': 'America/Argentina/Buenos_Aires',
  'Cairo': 'Africa/Cairo',
  'Johannesburg': 'Africa/Johannesburg',
};

export async function getCityTimezone(cityName: string): Promise<TimezoneInfo | null> {
  const timezone = CITY_TIMEZONES[cityName];
  
  if (!timezone) {
    console.warn(`Timezone not found for city: ${cityName}`);
    return null;
  }

  return getTimezoneInfo(timezone);
}

export async function getAvailableTimezones(): Promise<string[]> {
  try {
    const response = await fetch(`${TIMEZONE_API_BASE}/timezone`);
    
    if (!response.ok) {
      throw new Error(`Timezone API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching timezones:', error);
    return [];
  }
}

export function formatTimezoneOffset(utcOffset: string): string {
  const sign = utcOffset.startsWith('-') ? '-' : '+';
  const offset = utcOffset.replace(/[+-]/, '');
  return `UTC${sign}${offset}`;
}
