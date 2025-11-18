import { BadRequestException, Delete, ForbiddenException, Injectable, Req } from "@nestjs/common";
import { UpdateAgencyDto } from "./dto/update-agency.dto";
import { AgencyRepository } from "../../repositories/agency/agency.repository";
import { validate } from "class-validator";
import { throwValidationErrors } from "../../common/helpers/validation.helper";
import { SupportedLang, t } from "../../locales";
import multer from "multer";
import { ImageUtilsService } from "../../common/utils/image-utils.service";
import { FirebaseService } from "../../infrastructure/firebase/firebase.service";
import {type RequestWithUser } from "../../common/types/request-with-user.interface";

@Injectable()

export class ManageAgencyService{
  constructor(
    private readonly agencyRepo:AgencyRepository,
   private readonly imageUtilsService:ImageUtilsService,
   private readonly firebaseService:FirebaseService,
  ){}


async updateAgencyFields(dto: UpdateAgencyDto, language: SupportedLang, agencyId: number) {
 
  const errors = await validate(dto);
  if (errors.length > 0) {
    throwValidationErrors(errors, language);
  }

 
  const dataToUpdate: any = {};

  if (dto.agency_name !== undefined) dataToUpdate.agency_name = dto.agency_name;
  if (dto.agency_email !== undefined) dataToUpdate.agency_email = dto.agency_email;
  if (dto.phone !== undefined) dataToUpdate.phone = dto.phone;
  if (dto.address !== undefined) dataToUpdate.address = dto.address;
  if (dto.website !== undefined) dataToUpdate.website = dto.website;


  if (Object.keys(dataToUpdate).length === 0) {
    return {
      success: false,
      message: "No fields provided.",
    };
  }

  
  const updatedAgency = await this.agencyRepo.updateAgencyFields(agencyId, dataToUpdate);

  
  return {
    success: true,
    message: "Agency updated successfully.",
    data: updatedAgency,
  };
}

async uploadLogo(agencyId:number , file: Express.Multer.File,language:SupportedLang){

     this.imageUtilsService.validateFile(file, language);

  
    const agency = await this.agencyRepo.findLogoById(agencyId);
    const oldImagePath = agency?.logo;


    if (oldImagePath && !this.imageUtilsService.isDefaultImage(oldImagePath)) {
      try {
        await this.firebaseService.deleteFile(oldImagePath);
        console.log(` Deleted old profile image: ${oldImagePath}`);
      } catch (error) {
        console.warn(` Failed to delete old profile image:`, error);
      }
    }

   
    const destination = `agency-logo/${agencyId}`;
    const uploadedPath = await this.firebaseService.uploadFile(file, destination);
    
    if (!uploadedPath) {
      throw new BadRequestException({
        success: false,
        message: t('imageUploadFailed', language),
      });
    }

   

   
    try {
      await this.agencyRepo.updateAgencyFields(agencyId, { logo: uploadedPath });
    } catch (error) {
      // Rollback: delete uploaded image
      await this.firebaseService.deleteFile(uploadedPath);
      throw new BadRequestException({
        success: false,
        message:t('failedToUpdateAgencyLogo',language),
      });
    }

 
    return this.firebaseService.getPublicUrl(uploadedPath)!;
}
async deletelogo(agencyId:number, language:SupportedLang){
const agency = await this.agencyRepo.findLogoById(agencyId);
    const oldImagePath = agency?.logo;

    if (!oldImagePath) {
      throw new BadRequestException({
        success: false,
        message: t('noimagetodelete' , language),
      });
    }
 
    try {
      await this.firebaseService.deleteFile(oldImagePath);
    } catch (error) {
      console.warn(`Failed to delete profile image from storage:`, error);
    }

    
    await this.agencyRepo.deleteLogo(agencyId);
}
}