import {
  IsDateString,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';

export const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*\d).{8,}$/;

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsString()
  @IsNotEmpty()
  apellido: string;

  @IsEmail({}, { message: 'El correo no es válido' })
  correo: string;

  @Matches(/^[a-zA-Z0-9_.]{3,20}$/, {
    message: 'El usuario debe tener entre 3 y 20 caracteres (letras, números, _ o .)',
  })
  nombreUsuario: string;

  @Matches(PASSWORD_REGEX, {
    message: 'La contraseña debe tener mínimo 8 caracteres, una mayúscula y un número',
  })
  password: string;

  @IsString()
  @IsNotEmpty()
  repetirPassword: string;

  @IsDateString({}, { message: 'La fecha de nacimiento no es válida' })
  fechaNacimiento: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  descripcion?: string;
}