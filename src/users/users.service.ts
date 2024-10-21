import {
  ConflictException,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schema/user.schema';
import { Model } from 'mongoose';
import { faker } from '@faker-js/faker';

@Injectable()
export class UsersService implements OnModuleInit {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async onModuleInit() {
    const countUser = await this.userModel.countDocuments();
    if (countUser === 0) {
      const newUser = [];
      for (let i = 0; i < 30000; i++) {
        newUser.push({
          name: faker.internet.userName(),
          email: faker.internet.email(),
          age: faker.number.int({ min: 18, max: 80 }),
        });
      }
      await this.userModel.insertMany(newUser);
    }
  }

  async create(createUserDto: CreateUserDto) {
    try {
      return await new this.userModel(createUserDto).save();
    } catch (error) {
      if (error.code === 11000) {
        throw new ConflictException('Email must be unique');
      }
      throw error;
    }
  }

  findAll() {
    return this.userModel.find();
  }

  find(queryParams) {
    const { age, ageFrom, ageTo, page, take } = queryParams;
    if (age) {
      return this.userModel
        .find({ age: age })
        .skip(page * take)
        .limit(take);
    }

    if (ageFrom && ageTo) {
      return this.userModel
        .find({ age: { $gte: ageFrom, $lte: ageTo } })
        .skip(page * take)
        .limit(take);
    }
    return this.userModel
      .find()
      .skip((page - 1) * take)
      .limit(take);
  }

  async findOne(id: string) {
    try {
      return await this.userModel.findById(id);
    } catch (error) {
      if (error)
        throw new NotFoundException(
          'Not found. Id is incorrect or user does not exist',
        );
    }
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    try {
      return await this.userModel.findByIdAndUpdate(id, updateUserDto, {
        new: true,
      });
    } catch (error) {
      if (error)
        throw new NotFoundException(
          'Not found. Id is incorrect or user does not exist',
        );
    }
  }

  async remove(id: string) {
    try {
      const deletedUser = this.userModel.findByIdAndDelete(id);
      return deletedUser;
    } catch (error) {
      if (error)
        throw new NotFoundException(
          'Not found. Id is incorrect or user already deleted',
        );
    }
  }
}
