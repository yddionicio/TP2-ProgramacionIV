import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  identificador: string; // correo o nombre de usuario

  @IsString()
  @IsNotEmpty()
  password: string;
}