import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { Reflector } from '@nestjs/core';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { OrganizationMember } from '../organization-members/organization-member.entity';
import { Permission } from './permission.entity';
import { Project } from '../projects/project.entity';
import { Task } from '../tasks/task.entity';
import { Team } from '../teams/team.entity';

import { PERMISSION_KEY } from './permission.decorator';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,

    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    const requiredPermission =
      this.reflector.getAllAndOverride<{
        module: string;
        action: string;
      }>(PERMISSION_KEY, [
        context.getHandler(),
        context.getClass(),
      ]);

    if (!requiredPermission) {
      return true;
    }

    const request =
      context.switchToHttp().getRequest();

    const userId =
      request.user?.userId;

    if (!userId) {
      throw new UnauthorizedException(
        'User is not authenticated.',
      );
    }

    const organizationId =
      await this.getOrganizationId(request);

    if (!organizationId) {
      throw new ForbiddenException(
        'Organization ID could not be determined.',
      );
    }

    request.permissionOrganizationId =
      organizationId;

    const memberRepository =
      this.dataSource.getRepository(
        OrganizationMember,
      );

    const membership =
      await memberRepository.findOne({
        where: {
          user_id: Number(userId),
          organization_id: organizationId,
          status: 'ACTIVE',
        },
        relations: ['role'],
      });

    if (!membership) {
      throw new ForbiddenException(
        'You are not a member of this organization.',
      );
    }

    // =========================================================
    // ORGANIZATION OWNER
    // =========================================================

    if (
      membership.role?.name ===
      'Organization Owner'
    ) {
      return true;
    }

    // =========================================================
    // PERMISSION
    // =========================================================

    const permissionRepository =
      this.dataSource.getRepository(
        Permission,
      );

    const permission =
      await permissionRepository.findOne({
        where: {
          module: requiredPermission.module,
          action: requiredPermission.action,
        },
        relations: ['rolePermissions'],
      });

    if (!permission) {
      throw new ForbiddenException(
        `Required permission does not exist: ${requiredPermission.module}.${requiredPermission.action}`,
      );
    }

    const hasPermission =
      permission.rolePermissions?.some(
        rolePermission =>
          Number(rolePermission.role_id) ===
          Number(membership.role_id),
      );

    if (!hasPermission) {
      throw new ForbiddenException(
        `Permission denied: ${requiredPermission.module}.${requiredPermission.action}`,
      );
    }

    return true;
  }

  private async getOrganizationId(
    request: any,
  ): Promise<number | null> {
    const path =
      request.path ||
      request.originalUrl ||
      '';

    // =========================================================
    // ORGANIZATION ROUTES
    // =========================================================

    const organizationIdParam =
      request.params?.organizationId;

    if (organizationIdParam) {
      return this.toPositiveInteger(
        organizationIdParam,
      );
    }

    // /organizations/:id
    if (
      this.isSingleOrganizationRoute(path) &&
      request.params?.id
    ) {
      return this.toPositiveInteger(
        request.params.id,
      );
    }

    // =========================================================
    // BODY - ORGANIZATION ID
    // =========================================================

    if (request.body?.organization_id) {
      return this.toPositiveInteger(
        request.body.organization_id,
      );
    }

    if (request.body?.organizationId) {
      return this.toPositiveInteger(
        request.body.organizationId,
      );
    }

    const bodyProjectId =
      request.body?.project_id ??
      request.body?.projectId;

    if (bodyProjectId) {
      const projectId =
        this.toPositiveInteger(
          bodyProjectId,
        );

      if (!projectId) {
        return null;
      }

      const projectRepository =
        this.dataSource.getRepository(
          Project,
        );

      const project =
        await projectRepository.findOne({
          where: {
            project_id: projectId,
          },
        });

      if (!project) {
        throw new ForbiddenException(
          'Project not found.',
        );
      }

      if (!project.organization_id) {
        throw new ForbiddenException(
          'Project is not assigned to an organization.',
        );
      }

      return Number(
        project.organization_id,
      );
    }

    // =========================================================
    // QUERY
    // =========================================================

    const queryOrganizationId =
      request.query?.organizationId ??
      request.query?.organization_id;

    if (queryOrganizationId) {
      return this.toPositiveInteger(
        queryOrganizationId,
      );
    }

    // =========================================================
    // PROJECT
    // =========================================================

    if (this.isProjectRoute(path)) {
      const projectId =
        request.params?.id ??
        request.params?.projectId;

      if (!projectId) {
        return null;
      }

      const projectRepository =
        this.dataSource.getRepository(
          Project,
        );

      const project =
        await projectRepository.findOne({
          where: {
            project_id: Number(projectId),
          },
        });

      if (!project) {
        throw new ForbiddenException(
          'Project not found.',
        );
      }

      if (!project.organization_id) {
        throw new ForbiddenException(
          'Project is not assigned to an organization.',
        );
      }

      return Number(
        project.organization_id,
      );
    }

    // =========================================================
    // TASK
    // =========================================================

    if (this.isTaskRoute(path)) {
      const taskId =
        request.params?.id ??
        request.params?.taskId;

      if (!taskId) {
        return null;
      }

      const taskRepository =
        this.dataSource.getRepository(
          Task,
        );

      const task =
        await taskRepository.findOne({
          where: {
            task_id: Number(taskId),
          },
          relations: ['project'],
        });

      if (!task) {
        throw new ForbiddenException(
          'Task not found.',
        );
      }

      if (
        !task.project ||
        !task.project.organization_id
      ) {
        throw new ForbiddenException(
          'Task project is not assigned to an organization.',
        );
      }

      return Number(
        task.project.organization_id,
      );
    }

    // =========================================================
    // TEAM
    // =========================================================

    if (this.isTeamRoute(path)) {
      const teamId =
        request.params?.id ??
        request.params?.teamId;

      if (!teamId) {
        return null;
      }

      const teamRepository =
        this.dataSource.getRepository(
          Team,
        );

      const team =
        await teamRepository.findOne({
          where: {
            team_id: Number(teamId),
          },
        });

      if (!team) {
        throw new ForbiddenException(
          'Team not found.',
        );
      }

      if (!team.organization_id) {
        throw new ForbiddenException(
          'Team is not assigned to an organization.',
        );
      }

      return Number(
        team.organization_id,
      );
    }

    return null;
  }

  private toPositiveInteger(
    value: any,
  ): number | null {
    const numberValue = Number(value);

    if (
      !Number.isInteger(numberValue) ||
      numberValue <= 0
    ) {
      return null;
    }

    return numberValue;
  }

  private isSingleOrganizationRoute(
    path: string,
  ): boolean {
    return /^\/organizations\/\d+$/.test(
      path,
    );
  }

  private isProjectRoute(
    path: string,
  ): boolean {
    return (
      path === '/projects' ||
      path.startsWith('/projects/')
    );
  }

  private isTaskRoute(
    path: string,
  ): boolean {
    return (
      path === '/tasks' ||
      path.startsWith('/tasks/')
    );
  }

  private isTeamRoute(
    path: string,
  ): boolean {
    return (
      path === '/teams' ||
      path.startsWith('/teams/')
    );
  }
}
