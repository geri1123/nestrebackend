
import { ApiProperty } from "@nestjs/swagger";

export class CountryDto {
  @ApiProperty({ example: 4 })
  id!: number;

  @ApiProperty({ example: 'Albania' })
  name!: string;

  @ApiProperty({ example: "AL" })
  code!: string;
}

export class CityDto {  
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: "Tirana" })
  name!: string;

  @ApiProperty({ example: 2 })
  countryId!: number;
}

export class CountriesResponseDto {
  @ApiProperty({ example: true })
  success!: boolean;

  @ApiProperty({ type: [CountryDto] })
  countries!: CountryDto[];
}

export class CitiesResponseDto {
  @ApiProperty({ example: true })
  success!: boolean;

  @ApiProperty({ type: [CityDto] })
  cities!: CityDto[];
}