import { IsEmail, IsInt, IsNotEmpty, IsString, MinLength } from 'class-validator';


export class CreateUserDto {
@IsNotEmpty()
@IsString()
name: string;


@IsNotEmpty()
@IsEmail()
email: string;


@IsNotEmpty()
@IsString()
@MinLength(8)
password: string;

@IsNotEmpty()
@IsInt()
roleId: number;
}