import { IsIn, IsNotEmpty } from 'class-validator';
import { RegisterDto } from '../../auth/dto/register.dto';

export class CrearUsuarioDto extends RegisterDto {
  @IsIn(['usuario', 'administrador'], {
    message: 'El perfil debe ser usuario o administrador',
  })
  @IsNotEmpty({ message: 'El perfil es obligatorio' })
  perfil: 'usuario' | 'administrador';
}
