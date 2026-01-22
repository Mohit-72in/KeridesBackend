import {
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Injectable,
    Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../enums/role.enum';

@Injectable()
export class RolesGuard implements CanActivate {
    private logger = new Logger('RolesGuard');

    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.get<Role | Role[]>('role', context.getHandler());
        if (!requiredRoles) return true;

        const req = context.switchToHttp().getRequest();
        const user = req.user;

        // Support both single role and array of roles
        const rolesArray = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];

        this.logger.debug(`Checking access - Required: ${rolesArray.join(',')}, User role: ${user?.role}`);

        if (!user || !rolesArray.includes(user.role)) {
            this.logger.warn(`Access denied for user with role: ${user?.role}, required one of: ${rolesArray.join(',')}`);
            throw new ForbiddenException('Access denied: Insufficient permissions');
        }

        return true;
    }
}
