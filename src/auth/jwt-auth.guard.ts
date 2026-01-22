import { Injectable, ExecutionContext, UnauthorizedException, Logger } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    private readonly logger = new Logger('JwtAuthGuard');

    canActivate(context: ExecutionContext) {
        this.logger.debug('JwtAuthGuard TRIGGERED');
        const req = context.switchToHttp().getRequest();
        this.logger.debug(`Auth Header: ${req.headers.authorization}`);
        return super.canActivate(context);
    }

    // surface and log passport errors to make debugging token failures easier
    handleRequest(err: any, user: any, info: any) {
        if (err) {
            this.logger.error('JWT verification error', err);
            throw err;
        }

        if (!user) {
            // `info` typically contains token verification error (TokenExpiredError / JsonWebTokenError)
            this.logger.warn('JWT authentication failed', info?.message || info);
            throw new UnauthorizedException(info?.message || 'Unauthorized');
        }

        return user;
    }
}
