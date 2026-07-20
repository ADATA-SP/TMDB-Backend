import {
	BadRequestException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import * as Minio from 'minio';
import { v4 as uuidv4 } from 'uuid';
import { BufferedFile } from './file.model';

@Injectable()
export class MinioService {
	private readonly minioClient: Minio.Client;
	private readonly bucketName: string = process.env.MINIO_BUCKET;

	constructor() {
		this.minioClient = new Minio.Client({
			endPoint: process.env.MINIO_ENDPOINT || null,
			port: parseInt(process.env.MINIO_PORT, 10) || 9001,
			useSSL: process.env.MINIO_USE_SSL === 'true' || false,
			accessKey: process.env.MINIO_ACCESS_KEY || null,
			secretKey: process.env.MINIO_SECRET_KEY || null,
		});
	}

	public async upload(
		file: BufferedFile,
		bucketName = this.bucketName,
		folderName: string = '',
	) {
		if (!file) {
			return null;
		}

		const maxSizeInBytes = 10 * 1024 * 1024;

		if (file.size > maxSizeInBytes) {
			throw new BadRequestException(
				'Tamanho máximo permitido deve ser de 10MB',
			);
		}

		const allowedMimeTypes = ['image/jpg', 'image/png', 'image/jpeg'];
		if (!allowedMimeTypes.includes(file.mimetype)) {
			throw new BadRequestException('Sua foto deve ser JPG ou PNG');
		}

		const extension = file.originalname.substring(
			file.originalname.lastIndexOf('.'),
			file.originalname.length,
		);
		const hash = uuidv4();

		const fileName = folderName
			? `${folderName}/${hash}${extension}`.toLowerCase()
			: `${hash}${extension}`.toLowerCase();

		bucketName = bucketName ?? this.bucketName;

		try {
			await this.minioClient.putObject(bucketName, fileName, file.buffer);
			return fileName;
		} catch (err) {
			console.error('Erro ao fazer upload no MinIO:', err);
			throw new BadRequestException('Erro ao fazer upload no MinIO');
		}
	}

	public async delete(objectName: string, bucketName = this.bucketName) {
		try {
			await this.minioClient.removeObject(bucketName, objectName);
		} catch (err) {
			if (err.code === 'NoSuchKey') {
				throw new NotFoundException(
					'O arquivo não foi encontrado para exclusão',
				);
			}
			console.error('Erro ao excluir arquivo do MinIO:', err);
			throw err;
		}
	}

	public async fileExists(
		objectName: string,
		bucketName = this.bucketName,
	): Promise<boolean> {
		try {
			await this.minioClient.statObject(bucketName, objectName);
			return true;
		} catch (error) {
			if (error.code === 'NotFound' || error.code === 'NoSuchKey') {
				return false;
			}
			throw error;
		}
	}

	public buildUrl(objectName: string, bucketName = this.bucketName): string {
		const baseUrl = process.env.MINIO_API_URL;
		return `${baseUrl}/${bucketName}/${objectName}`;
	}
}
