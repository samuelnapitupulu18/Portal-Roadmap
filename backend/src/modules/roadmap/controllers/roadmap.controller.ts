import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { RoadmapService } from '../services/roadmap.service';
import { StoryListQueryDto } from '../dto/story-list.dto';
import { IpWhitelistGuard } from '../../../common/guards/ip-whitelist.guard';

@Controller('roadmap')
@UseGuards(IpWhitelistGuard)
export class RoadmapController {
  constructor(private readonly roadmapService: RoadmapService) {}

  @Get('stories')
  findAll(@Query() query: StoryListQueryDto) {
    return this.roadmapService.findAll(query);
  }

  @Get('stories/:id')
  findOne(@Param('id') id: string) {
    return this.roadmapService.findOne(id);
  }
}
