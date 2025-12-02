// // src/attributes/dto/attribute-value.dto.ts
// import { ApiProperty } from '@nestjs/swagger';

// export class AttributeValueDto {
//   @ApiProperty({ example: 4 })
//   id: number;

//   @ApiProperty({ example: '1 Dhome' })
//   name: string;

//   @ApiProperty({ example: '1-dhome', nullable: true })
//   slug: string | null;
// }



// export class AttributeDto {
//   @ApiProperty({ example: 1 })
//   id: number;

//   @ApiProperty({ example: 'number' })
//   inputType: string;

//   @ApiProperty({ example: 'Dhoma' })
//   name: string;

//   @ApiProperty({ example: 'dhoma', nullable: true })
//   slug: string | null;

//   @ApiProperty({ type: [AttributeValueDto] })
//   values: AttributeValueDto[];
// }
// export class AttributesResponseDto {
//   @ApiProperty({ example: true })
//   success: boolean;

//   @ApiProperty({ type: [AttributeDto] })
//   attributes: AttributeDto[];
// }



import { ApiProperty } from '@nestjs/swagger';

export class AttributeValueDto {
  @ApiProperty({ example: 4 })
  id: number;

  @ApiProperty({ example: '1 Dhome' })
  name: string;

  @ApiProperty({ example: '1-dhome', nullable: true })
  slug: string | null;
}

export class AttributeDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ 
    example: 'select',
    enum: ['text', 'number', 'select', 'multiselect', 'checkbox', 'radio'],
    description: 'Type of input control'
  })
  inputType: string;

  @ApiProperty({ example: 'Dhoma' })
  name: string;

  @ApiProperty({ example: 'dhoma', nullable: true })
  slug: string | null;

  @ApiProperty({ type: [AttributeValueDto] })
  values: AttributeValueDto[];
}

export class AttributesResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ type: [AttributeDto] })
  attributes: AttributeDto[];
}