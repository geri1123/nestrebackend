// repositories/city/CityRepository.ts
import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../infrastructure/prisma/prisma.service";

import { ILocationRepository } from "./Ilocation.repository";
@Injectable()
export class LoationRepository implements ILocationRepository{
  constructor(private prisma: PrismaService) {}

  // get all countries
  async getAllCountries() {
    return this.prisma.country.findMany({
      orderBy: { name: "asc" },
    });
  }

  // get cities by country code (e.g. "AL")
  async getCitiesByCountry(countryCode: string) {
    return this.prisma.city.findMany({
      where: {
        country: {
          code: {
            equals: countryCode,
          
          },
        },
      },
      orderBy: { name: "asc" },
    });
  }
}
