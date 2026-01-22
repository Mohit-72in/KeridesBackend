import { Body, Controller, Patch, Get, Post, UseGuards, Request, UploadedFile, UseInterceptors, BadRequestException, NotFoundException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { RoleRequired } from '../common/decorators/role.decorator';
import { Role } from '../common/enums/role.enum';
import { S3Service } from '../common/services/s3.service';

@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly s3Service: S3Service,
  ) { }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @RoleRequired(Role.USER)
  @Get('profile')
  async profile(@Request() req) {
    const user = await this.userService.findById(req.user.id);
    if (!user) throw new NotFoundException('User not found');
    return {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      address: user.address,
      profileImage: user.profileImage,
      role: user.role,
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @RoleRequired(Role.USER)
  @Patch('update')
  update(@Request() req, @Body() dto: UpdateUserDto) {
    return this.userService.update(req.user.id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @RoleRequired(Role.USER)
  @Post('upload-document')
  @UseInterceptors(FileInterceptor('file'))
  async uploadDocument(
    @Request() req,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    try {
      const { url, key } = await this.s3Service.uploadFile(
        file,
        `users/${req.user.id}/documents`,
      );

      // Update user with profile image
      const updatedUser = await this.userService.update(req.user.id, {
        profileImage: url,
      });

      return {
        message: 'Document uploaded successfully',
        url,
        key,
        size: file.size,
        type: file.mimetype,
        user: updatedUser,
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
