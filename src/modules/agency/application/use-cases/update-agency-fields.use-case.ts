import { Inject, Injectable } from '@nestjs/common';
import {AGENCY_REPO, type IAgencyDomainRepository } from '../../domain/repositories/agency.repository.interface';
import { GetAgencyByIdUseCase } from './get-agency-by-id.use-case';
import { SupportedLang } from '../../../../locales';

export interface UpdateAgencyFieldsData {
  agencyName?: string;
  agencyEmail?: string;
  phone?: string;
  address?: string;
  website?: string;
}

@Injectable()
export class UpdateAgencyFieldsUseCase {
  constructor(
    @Inject(AGENCY_REPO)
    private readonly agencyRepository: IAgencyDomainRepository,
    private readonly getAgencyById: GetAgencyByIdUseCase,
  ) {}

async execute(
  agencyId: number,
  data: UpdateAgencyFieldsData,
  language: SupportedLang = 'al',
): Promise<{ success: boolean; message: string; data: any }> {

  const agency = await this.getAgencyById.execute(agencyId, language);

  agency.updateFields({
    agencyName: data.agencyName,
    agencyEmail: data.agencyEmail,
    phone: data.phone,
    address: data.address,
    website: data.website,
  });


  if (
    data.agencyName === undefined &&
    data.agencyEmail === undefined &&
    data.phone === undefined &&
    data.address === undefined &&
    data.website === undefined
  ) {
    return {
      success: false,
      message: 'No fields provided.',
      data: null,
    };
  }

  
  const updatedAgency = await this.agencyRepository.updateFields(
    agencyId,
    data
  );

  return {
    success: true,
    message: 'Agency updated successfully.',
    data: updatedAgency,
  };
}
}