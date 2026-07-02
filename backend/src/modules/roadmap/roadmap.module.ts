import { Module } from '@nestjs/common';
import { RoadmapController } from './roadmap.controller';
import { RoadmapService } from './roadmap.service';

/**
 * RoadmapModule
 *
 * Domain module for roadmap stories and task groups.
 * Encapsulates the Controller and Service layers.
 */
@Module({
  controllers: [RoadmapController],
  providers: [RoadmapService],
  exports: [RoadmapService],
})
export class RoadmapModule {}
