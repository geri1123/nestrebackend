import { ApiProperty } from '@nestjs/swagger';

export class AttributeValueDto {
  @ApiProperty({ example: 4 })
  id!: number;

  @ApiProperty({ example: '2-rooms' })  
  value_code!: string;

  @ApiProperty({ example: '2 Dhoma' })
  name!: string;
}

export class AttributeDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 'rooms' }) 
  code!: string;

  @ApiProperty({ 
    example: 'select',
    enum: ['text', 'number', 'select', 'multiselect', 'checkbox', 'radio'],
    description: 'Type of input control'
  })
  inputType!: string;

  @ApiProperty({ example: 'Dhoma' })
  name!: string;

  @ApiProperty({ type: [AttributeValueDto] })
  values!: AttributeValueDto[];
}

export class AttributesResponseDto {
  @ApiProperty({ example: true })
  success!: boolean;

  @ApiProperty({ type: [AttributeDto] })
  attributes!: AttributeDto[];
}