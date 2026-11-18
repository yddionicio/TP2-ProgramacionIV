import { IsDateString, IsOptional } from 'class-validator';

export class RangoEstadisticasDto {
  @IsOptional()
  @IsDateString({}, { message: 'La fecha desde debe tener formato YYYY-MM-DD' })
  desde?: string;

  @IsOptional()
  @IsDateString({}, { message: 'La fecha hasta debe tener formato YYYY-MM-DD' })
  hasta?: string;
}
