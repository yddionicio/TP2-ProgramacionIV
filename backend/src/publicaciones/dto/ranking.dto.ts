import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, Max, Min } from 'class-validator';

export class RankingDto {
  @IsOptional()
  @IsIn(['semana', 'mes', 'total'], {
    message: 'El período debe ser semana, mes o total',
  })
  periodo: 'semana' | 'mes' | 'total' = 'semana';

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(20)
  limit: number = 10;
}
