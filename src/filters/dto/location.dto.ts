import { ApiProperty, ApiResponse } from "@nestjs/swagger";

export class CountryDto{
     @ApiProperty({ example: 4 })
    id:number;
     @ApiProperty({ example: 'Albania' })
name:string;
@ApiProperty({example:"al"})
code:string;

    
}
export class cityDto{
    @ApiProperty({example:1})
    id:number;
    @ApiProperty({example:"Tirana"})
    name:string;
    @ApiProperty({example:2})
    countryId:number

}
export class countryResponseDto{
    @ApiProperty({ example: true })
  success: boolean;
  @ApiProperty({type:[CountryDto]})
  country:CountryDto[];
}
export class CityDtoResponse{
    @ApiProperty({example:true})
    success:boolean
    @ApiProperty({type:[cityDto]})
    cities:cityDto[]
    
    
}