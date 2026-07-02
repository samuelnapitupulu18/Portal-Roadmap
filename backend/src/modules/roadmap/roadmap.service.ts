import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { StoryListQueryDto, StorySummaryDto, StoryItemDto } from './dto/story-list.dto';
import { StoryDetailDto } from './dto/story-detail.dto';

@Injectable()
export class RoadmapService {
  private readonly logger = new Logger(RoadmapService.name);
  private cache: Map<string, { data: any; expiresAt: number }> = new Map();
  private readonly cacheTtlMs: number;

  constructor(private readonly configService: ConfigService) {
    this.cacheTtlMs = this.configService.get<number>('CACHE_TTL_SECONDS', 300) * 1000;
  }

  findAll(query: StoryListQueryDto) {
    const startTime = Date.now();
    const allStories = this.getStoriesFromSource();
    
    const summary = this.computeSummary(allStories);
    const filtered = this.applyFilters(allStories, query);
    const stories = this.transformToListItems(filtered);
    const filterOptions = this.extractFilterOptions(allStories);

    return this.wrapResponse('Stories retrieved successfully', {
      summary,
      filterOptions,
      stories,
      meta: {
        total: allStories.length,
        filtered: stories.length,
        executionTimeMs: Date.now() - startTime,
      },
    });
  }

  findOne(id: string) {
    const allStories = this.getStoriesFromSource();
    const story = this.findStoryById(allStories, id);

    if (!story) {
      throw new NotFoundException(`Story with ID "${id}" not found`);
    }

    return this.wrapResponse('Story detail retrieved successfully', this.enrichStoryDetail(story));
  }

  private getStoriesFromSource(): StoryDetailDto[] {
    const cacheKey = 'roadmap:stories:all';
    const cached = this.getFromCache<StoryDetailDto[]>(cacheKey);
    if (cached) return cached;

    const data = this.getMockStories();
    this.setCache(cacheKey, data);
    return data;
  }

  private findStoryById(stories: StoryDetailDto[], id: string): StoryDetailDto | undefined {
    return stories.find((s) => s.id.toUpperCase() === id.trim().toUpperCase());
  }

  private applyFilters(stories: StoryDetailDto[], query: StoryListQueryDto): StoryDetailDto[] {
    let result = [...stories];
    if (query.status) result = result.filter(s => s.status.toLowerCase() === query.status!.toLowerCase());
    if (query.project) result = result.filter(s => s.tag.toLowerCase() === query.project!.toLowerCase());
    if (query.search) {
      const q = query.search.toLowerCase().trim();
      result = result.filter(s => this.getSearchableText(s).includes(q));
    }
    return result;
  }

  private getSearchableText(story: StoryDetailDto): string {
    return [story.id, story.title, story.tag, story.description, story.assignee, story.status]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
  }

  private computeSummary(stories: StoryDetailDto[]): StorySummaryDto {
    return {
      total: stories.length,
      planned: this.countByStatus(stories, 'Planned'),
      inProgress: this.countByStatus(stories, 'In Progress'),
      testing: this.countByStatus(stories, 'Testing'),
      done: this.countByStatus(stories, 'Released / Done'),
    };
  }

  private countByStatus(stories: StoryDetailDto[], status: string): number {
    return stories.filter((s) => s.status === status).length;
  }

  private extractFilterOptions(stories: StoryDetailDto[]) {
    return {
      statuses: [...new Set(stories.map((s) => s.status))].sort(),
      projects: [...new Set(stories.map((s) => s.tag))].sort(),
    };
  }

  private transformToListItems(stories: StoryDetailDto[]): StoryItemDto[] {
    return stories.map(({ activity, assignee, dueDate, ...rest }) => rest);
  }

  private enrichStoryDetail(story: StoryDetailDto) {
    return {
      ...story,
      durationDays: this.calculateDurationDays(story.startDate, story.endDate),
      isOverdue: this.checkIfOverdue(story),
      activityCount: story.activity?.length ?? 0,
      lastActivity: story.activity?.[0] ?? null,
    };
  }

  private calculateDurationDays(startDate: string, endDate: string): number {
    return Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / 86400000);
  }

  private checkIfOverdue(story: StoryDetailDto): boolean {
    if (story.status === 'Released / Done') return false;
    return new Date(story.endDate) < new Date();
  }

  private wrapResponse(message: string, data: any) {
    return { statusCode: 200, message, data, timestamp: new Date().toISOString() };
  }

  private getFromCache<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    return entry.data as T;
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, { data, expiresAt: Date.now() + this.cacheTtlMs });
  }

  public invalidateCache(): void {
    this.cache.clear();
  }

  private getMockStories(): StoryDetailDto[] {
    return [
      {
        id: 'IS-11644',
        tag: 'TRACK2TICKET',
        tagColor: '#63b3ed',
        title: 'Enterprise invoice disputes are hard to track',
        description: "Currently there's no centralized way to track and manage enterprise-level invoice disputes.",
        status: 'Planned',
        statusColor: '#ed8936',
        date: '24 Apr 2026',
        startDate: '2026-04-01',
        endDate: '2026-04-30',
        images: false,
        assignee: 'TRACK2TICKET',
        dueDate: '24 Apr 2026',
        activity: [
          { action: 'Changed status from In Progress to Testing', user: 'Sean Dore', date: '12 Mar 2026' },
          { action: 'Changed status from Planned to In Progress', user: 'Sean Dore', date: '1 Feb 2026' },
        ],
      },
      {
        id: 'IS-11645',
        tag: 'IS-FINANCE MAN',
        tagColor: '#d69e2e',
        title: 'Customers miss shipped improvements',
        description: 'Users are unaware of new features and improvements.',
        status: 'In Progress',
        statusColor: '#3182ce',
        date: '24 Mei 2026',
        startDate: '2026-05-01',
        endDate: '2026-05-31',
        images: false,
        assignee: 'IS-FINANCE MAN',
        dueDate: '24 Mei 2026',
        activity: [
          { action: 'Changed status from Planned to In Progress', user: 'Sean Dore', date: '1 Apr 2026' },
        ],
      },
      {
        id: 'IS-11646',
        tag: 'FORM REGISTRASI IS5',
        tagColor: '#68d391',
        title: 'Customers cannot self-manage subscription changes',
        description: 'Customer portal lacks functionality for users to manage subscriptions.',
        status: 'In Progress',
        statusColor: '#3182ce',
        date: '29 Mei 2026',
        startDate: '2026-05-10',
        endDate: '2026-06-15',
        images: false,
        assignee: 'FORM REGISTRASI IS5',
        dueDate: '29 Mei 2026',
        activity: [
          { action: 'Changed status from Planned to In Progress', user: 'Sean Dore', date: '10 Mar 2026' },
        ],
      },
      {
        id: 'IS-11647',
        tag: 'IS - TOP MANAGEMENT',
        tagColor: '#ed8936',
        title: 'Duplicate feedback lowers signal quality',
        description: '',
        status: 'Planned',
        statusColor: '#ed8936',
        date: '26 Apr 2026',
        startDate: '2026-04-10',
        endDate: '2026-05-15',
        images: true,
        assignee: 'IS - TOP MANAGEMENT',
        dueDate: '26 Apr 2026',
        activity: [
          { action: 'Changed status from In Progress to Testing', user: 'Sean Dore', date: '15 Mar 2026' },
          { action: 'Changed status from Planned to In Progress', user: 'Sean Dore', date: '1 Feb 2026' },
        ],
      },
      {
        id: 'IS-11648',
        tag: 'TRACK2TICKET',
        tagColor: '#63b3ed',
        title: 'Sales Opportunity List Enhancement - Funnel',
        description: 'Funnel to display Opportunity Count and Expected Amount.',
        status: 'Released / Done',
        statusColor: '#48bb78',
        date: '28 Aug 2026',
        startDate: '2026-07-01',
        endDate: '2026-08-28',
        images: false,
        assignee: 'TRACK2TICKET',
        dueDate: '28 Aug 2026',
        activity: [
          { action: 'Changed status from Testing to Done', user: 'Sean Dore', date: '28 Aug 2026' },
          { action: 'Changed status from In Progress to Testing', user: 'Sean Dore', date: '15 Jul 2026' },
          { action: 'Changed status from Planned to In Progress', user: 'Sean Dore', date: '1 Jul 2026' },
        ],
      },
      {
        id: 'IS-11643',
        tag: 'TTB DIGITAL',
        tagColor: '#ed64a6',
        title: 'GPS Tracking Enhancements',
        description: '-',
        status: 'Released / Done',
        statusColor: '#48bb78',
        date: '24 Jun 2026',
        startDate: '2026-06-01',
        endDate: '2026-06-24',
        images: false,
        assignee: 'TTB DIGITAL',
        dueDate: '24 Jun 2026',
        activity: [
          { action: 'Changed status from Testing to Done', user: 'Sean Dore', date: '24 Jun 2026' },
          { action: 'Changed status from In Progress to Testing', user: 'Sean Dore', date: '10 Jun 2026' },
          { action: 'Changed status from Planned to In Progress', user: 'Sean Dore', date: '1 Jun 2026' },
        ],
      },
    ];
  }
}
