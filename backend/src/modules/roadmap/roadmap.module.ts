import { Module } from '@nestjs/common';
import { RoadmapController } from './controllers/roadmap.controller';
import { RoadmapService } from './services/roadmap.service';

@Module({
  controllers: [RoadmapController],
  providers: [RoadmapService],
  exports: [RoadmapService],
})
export class RoadmapModule {}
