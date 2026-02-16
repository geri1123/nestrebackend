import { City, Country } from "@prisma/client";

export const LOCATION_REPO = Symbol('LOCATION_REPO');

export interface ILocationRepository{
  getAllCountries(): Promise<Country[]>;

  getCitiesByCountry(countryCode: string): Promise<City[]>;
}