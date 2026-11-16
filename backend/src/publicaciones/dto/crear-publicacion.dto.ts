import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CrearPublicacionDto {
  @IsString() @IsNotEmpty({ message: 'El título es obligatorio' }) @MaxLength(100) titulo: string;
  @IsString() @IsNotEmpty({ message: 'El mensaje es obligatorio' }) @MaxLength(500) mensaje: string;
}