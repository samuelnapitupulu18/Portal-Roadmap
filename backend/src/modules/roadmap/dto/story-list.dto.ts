import { IsOptional, IsString } from 'class-validator';

/**
 * Query parameters for listing stories.
 */
export class StoryListQueryDto {
  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  project?: string;

  @IsOptional()
  @IsString()
  search?: string;
}

/**
 * Summary statistics for all stories.
 */
export class StorySummaryDto {
  total: number;
  planned: number;
  inProgress: number;
  testing: number;
  done: number;
}

/**
 * Single story item in the list response.
 */
export class StoryItemDto {
  id: string;
  tag: string;
  tagColor: string;
  title: string;
  description: string;
  status: string;
  statusColor: string;
  date: string;
  startDate: string;
  endDate: string;
  images: boolean;
}

/**
 * Full list response DTO.
 */
export class StoryListResponseDto {
  statusCode: number;
  message: string;
  data: {
    summary: StorySummaryDto;
    stories: StoryItemDto[];
  };
}
