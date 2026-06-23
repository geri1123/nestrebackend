import { Inject, Injectable } from "@nestjs/common";
import { WALLET_REPOSITORY_TOKENS } from "../../../wallet/domain/repositories/wallet.repository.token";
import { IWalletRepository } from "../../../wallet/domain/repositories/wallet.interface.repository";
import { GetAllWalletsDto } from "../dto/getallwallets.dto";

@Injectable()
export class GetAllWalletsUseCase {
  private readonly DEFAULT_LIMIT = 20;
  private readonly MAX_LIMIT = 50;

  constructor(
    @Inject(WALLET_REPOSITORY_TOKENS.WALLET_REPOSITORY)
    private readonly walletRepo: IWalletRepository,
  ) {}

  async execute(dto:GetAllWalletsDto) {
    const page = dto.page ?? 1;

    const limit = this.DEFAULT_LIMIT;

    return this.walletRepo.getAllWallets({
      ...dto,
      page,
      limit,
    });
  }
  }