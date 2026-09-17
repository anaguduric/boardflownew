import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { UserProfilesModule } from './userprofiles/userprofiles.module';
import { RolesModule } from './roles/role.module';
import { OrganizationsModule } from './organizations/organizations.module';
import { OrganizationRolesModule } from './organization-roles/organization-roles.module';
import { OrganizationMembersModule } from './organization-members/organization-members.module';
import { PermissionsModule } from './permissions/permissions.module';
import { RolePermissionsModule } from './role-permissions/role-permissions.module';
import { GoogleCalendarModule } from './google-calendar/google-calendar.module';
import { ProjectsModule } from './projects/project.module';
import { TasksModule } from './tasks/tasks.module';
import { RegistrationRequestsModule } from './registration/registration-requests.module';
import { AuthModule } from './auth/auth.module';
import { OrganizationInvitationsModule } from './organization-invitations/organization-invitations.module';
import { TaskCommentsModule } from './task-comments/task-comments.module';
import { TeamsModule } from './teams/teams.module';
import { TeamMembersModule } from './team-members/team-members.module';
import { RoleMembersModule } from './role-members/role-members.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),  // .env globalno
    TypeOrmModule.forRoot({                     // konekcija na MySQL
      type: 'mysql',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '3306'),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      autoLoadEntities: true,
      synchronize: false, // u produkciji stavi false
      //logging: ['query', 'error', 'schema'],
    }),
    UsersModule,
    UserProfilesModule,
    RolesModule,
    OrganizationsModule,
    OrganizationRolesModule,
    OrganizationMembersModule,
    PermissionsModule,
    RolePermissionsModule,
    GoogleCalendarModule,
    ProjectsModule,
    TasksModule,
    RegistrationRequestsModule,
    OrganizationInvitationsModule,
    TaskCommentsModule,
    TeamsModule,
    TeamMembersModule,
    RoleMembersModule,
    AuthModule,
  ],
})
export class AppModule {}
