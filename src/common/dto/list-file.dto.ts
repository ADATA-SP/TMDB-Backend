import { Transform, Type } from 'class-transformer';
import {
	IsArray,
	IsDate,
	IsEnum,
	IsInt,
	IsOptional,
	IsString,
} from 'class-validator';

export enum ExportType {
	PDF = 'pdf',
	EXCEL = 'excel',
}

export class ExportDto {
	@IsEnum(ExportType, {
		message: 'Tipo de exportação deve ser "pdf" ou "excel"',
	})
	type: ExportType = ExportType.PDF;

	@IsOptional()
	@IsOptional()
	@IsString()
	start?: string;

	@IsOptional()
	@IsString()
	end?: string;

	@IsOptional()
	@IsArray()
	@Transform(({ value }) => {
		if (value === undefined) return [];
		if (Array.isArray(value)) return value.map(Number);
		return [Number(value)];
	})
	@IsInt({ each: true })
	status?: number[];
}
