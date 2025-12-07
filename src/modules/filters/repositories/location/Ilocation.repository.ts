import { city, country } from '@prisma/client';
export const LOCATION_REPO = Symbol('LOCATION_REPO');

export interface ILocationRepository{
  getAllCountries(): Promise<country[]>;

  getCitiesByCountry(countryCode: string): Promise<city[]>;
}