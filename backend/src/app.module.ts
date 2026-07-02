import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import appConfig from './config/app.config';
import jiraConfig from './config/jira.config';
import securityConfig from './config/security.config';
import { RoadmapModule } from './modules/roadmap/roadmap.module';
import { HealthModule } from './modules/health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, jiraConfig, securityConfig],
      envFilePath: '.env',
    }),
    HealthModule,
    RoadmapModule,
  ],
})
export class AppModule {}
