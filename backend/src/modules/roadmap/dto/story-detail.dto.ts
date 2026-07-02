/**
 * Activity timeline entry for a story.
 */
export class ActivityItemDto {
  action: string;
  user: string;
  date: string;
}

/**
 * Full story detail response DTO.
 */
export class StoryDetailDto {
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
  assignee: string;
  dueDate: string;
  activity: ActivityItemDto[];
}

/**
 * Detail response DTO wrapper.
 */
export class StoryDetailResponseDto {
  statusCode: number;
  message: string;
  data: StoryDetailDto;
}
