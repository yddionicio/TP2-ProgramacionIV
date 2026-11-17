import { IsIn, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CrearPublicacionDto {
  @IsString() @IsNotEmpty({ message: 'El título es obligatorio' }) @MaxLength(100) titulo: string;
  @IsString() @IsNotEmpty({ message: 'El mensaje es obligatorio' }) @MaxLength(500) mensaje: string;
  @IsOptional()
  @IsIn(['idea', 'proyecto', 'consejo', 'solucion'], {
    message: 'La categoría debe ser idea, proyecto, consejo o solucion',
  })
  categoria?: string;
}