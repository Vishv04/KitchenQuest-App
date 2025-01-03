import { Module } from '@nestjs/common';
import { ScraperService } from './scraper.service';
import { ScraperController } from './scraper.controller';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [ScheduleModule.forRoot()], // Schedule module to manage cron jobs
  providers: [ScraperService], // ScraperService is added to providers
  controllers: [ScraperController], // ScraperController is added to controllers
})
export class ScraperModule {}
