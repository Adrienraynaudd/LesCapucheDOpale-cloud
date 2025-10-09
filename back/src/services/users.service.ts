import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { hashPassword, comparePassword } from '../utils/password.util';
import { JwtService } from '@nestjs/jwt';


@Injectable()
export class UsersService {
constructor(private prisma: PrismaService, private jwtService: JwtService) {}


 async create(createUserDto: CreateUserDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: createUserDto.email } });
    if (existing) {
      throw new ConflictException('Email already in use');
    }

    const hashed = await hashPassword(createUserDto.password);

    const user = await this.prisma.user.create({
      data: {
        name: createUserDto.name,
        email: createUserDto.email,
        password: hashed,
        roleId: createUserDto.roleId,
      },
      select: { id: true, name: true, email: true, roleId: true },
    });

    const payload = { sub: user.id, email: user.email, roleId: user.roleId };
    let token: string;

    if (user.roleId === 1) { // Admin
      token = await this.jwtService.signAsync(payload, {
        secret: process.env.JWT_SECRET_ADMIN,
        expiresIn: '4h',
      });
    } else {
      token = await this.jwtService.signAsync(payload, {
        secret: process.env.JWT_SECRET,
        expiresIn: '1h',
      });
    }

    return { user, access_token: token };
  }


async findAll() {
return this.prisma.user.findMany({ select: { id: true, name: true, email: true } });
}


async findOne(id: number) {
const user = await this.prisma.user.findUnique({ where: { id }, select: { id: true, name: true, email: true } });
if (!user) throw new NotFoundException('User not found');
return user;
}


async update(id: number, updateUserDto: UpdateUserDto) {


const data: UpdateUserDto  = { ...updateUserDto };
if (updateUserDto.password) {
data.password = await hashPassword(updateUserDto.password);
}


try {
const updated = await this.prisma.user.update({ where: { id }, data, select: { id: true, name: true, email: true } });
return updated;
} catch (err) {
throw new NotFoundException('User not found');
}
}


async remove(id: number) {
try {
await this.prisma.user.delete({ where: { id } });
return { deleted: true };
} catch (err) {
throw new NotFoundException('User not found');
}
}


async validateUserByEmailPassword(email: string, plainPassword: string) {
const user = await this.prisma.user.findUnique({ where: { email } });
if (!user) return null;
const matched = await comparePassword(plainPassword, user.password);
if (!matched) return null;

const { password, ...rest } = user;
return rest;
}
}