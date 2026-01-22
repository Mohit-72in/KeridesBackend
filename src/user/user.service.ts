import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../schemas/user.schema';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateUserOperatingAreaDto } from './dto/update-operating-area.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) { }

  // Called by AuthService during registration
  async create(dto: any): Promise<User> {
    return this.userModel.create(dto);
  }

  // Used by AuthService during login
  async findByEmail(email: string) {
    return this.userModel.findOne({ email });
  }

  async findById(id: string) {
    return this.userModel.findById(id).select('-password');
  }

  async update(id: string, updateDto: UpdateUserDto) {
    return this.userModel.findByIdAndUpdate(
      id,
      updateDto,
      { new: true }
    ).select('-password');
  }
}
