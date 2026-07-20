import axios, { AxiosInstance } from 'axios';
import * as https from 'https';

const httpsAgent = new https.Agent({
	rejectUnauthorized: false,
});

const apiDataBffCollection: AxiosInstance = axios.create({
	baseURL: process.env.DATA_COLLECTION_BFF_API_URL || '',
	headers: {},
	timeout: 8000,
	httpsAgent,
});

export default apiDataBffCollection;
