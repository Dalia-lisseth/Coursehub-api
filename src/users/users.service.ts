import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { QueryFailedError, Repository } from 'typeorm';
import { RegisterUserDto } from './dto/register-user.dto.js';
import { User } from './entities/user.entity.js';

const BCRYPT_ROUNDS = 12;

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async register(registerUserDto: RegisterUserDto) {
    const email = registerUserDto.email.trim().toLowerCase();
    const existingUser = await this.usersRepository.findOneBy({ email });

    if (existingUser) {
      throw new ConflictException(`A user with email ${email} already exists`);
    }

    const user = this.usersRepository.create({
      name: registerUserDto.name.trim(),
      email,
      passwordHash: await bcrypt.hash(registerUserDto.password, BCRYPT_ROUNDS),
    });

    try {
      const savedUser = await this.usersRepository.save(user);
      return this.toPublicUser(savedUser);
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        (error as QueryFailedError & { driverError?: { code?: string } })
          .driverError?.code === '23505'
      ) {
        throw new ConflictException(
          `A user with email ${email} already exists`,
        );
      }
      throw error;
    }
  }

  async findByEmailWithPassword(email: string) {
    return this.usersRepository
      .createQueryBuilder('user')
      .addSelect('user.passwordHash')
      .where('user.email = :email', { email: email.trim().toLowerCase() })
      .getOne();
  }

  toPublicUser(user: User) {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    };
  }
}
