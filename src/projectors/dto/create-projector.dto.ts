import { IsInt, IsNotEmpty, IsString, Min, ValidateIf } from 'class-validator';

export class CreateProjectorDto {
  @IsString()
  @IsNotEmpty()
  brand!: string;

  @IsInt()
  @Min(1)
  high!: number;

  @IsInt()
  @Min(1)
  width!: number;

  @ValidateIf((_object, value: unknown) => value !== undefined)
  @IsInt()
  @Min(1)
  theaterId?: number;
}
