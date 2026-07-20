import axios, { AxiosInstance } from 'axios';
import * as https from 'https';

const httpsAgent = new https.Agent({
	rejectUnauthorized: false,
});

const apiDataCollection: AxiosInstance = axios.create({
	baseURL: process.env.DATA_COLLECTION_API_URL || '',
	headers: {},
	timeout: 8000,
	httpsAgent,
});

export default apiDataCollection;
