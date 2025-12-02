import { city, country } from '@prisma/client';

export interface ILocationRepository{
  getAllCountries(): Promise<country[]>;

  getCitiesByCountry(countryCode: string): Promise<city[]>;
}