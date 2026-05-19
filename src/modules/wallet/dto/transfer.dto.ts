import { IsNumber, IsString, Min } from "class-validator";

export class TransferDto {
  @IsString()
  receiverWalletId!: string;

  @IsNumber()
  @Min(1)
  amount!: number;
}