import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppConfigModule } from '../config/config.module';
import { AppConfigService } from '../config/config.service';
import { MongoCheckService } from './mongo-check.service';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [AppConfigModule],
      inject: [AppConfigService],
      useFactory: (config: AppConfigService) => ({
        uri: config.mongoUri,       
        dbName: 'analyticsdb',   
       
      }),
    }),
  ],
  providers: [MongoCheckService],
  exports: [MongooseModule],
})
export class DatabaseModule {}