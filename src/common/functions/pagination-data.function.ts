// use apenas para paginar dados externos que não possuem paginacao!!!
import { QueryPaginationDto } from '../dto/pagination-data.dto';

export interface IPaginationMeta {
	currentPage: number;
	perPage: number;
	totalPage: number;
	total: number;
}

export interface IResponsePaginate {
	meta: IPaginationMeta;
	data: any[];
}

export const paginationData = (
	data: any[],
	query: QueryPaginationDto,
): IResponsePaginate => {
	const page = Number(query.page) || 1;
	const quantity = Number(query.offset) || data.length;
	const total = data.length;
	const totalPage = Math.ceil(total / quantity);

	const startIndex = (page - 1) * quantity;
	const endIndex = startIndex + quantity;

	const response = data.slice(startIndex, endIndex);

	return {
		data: response,
		meta: {
			currentPage: page,
			perPage: quantity,
			totalPage,
			total: total,
		},
	};
};
