import axios, { AxiosInstance } from 'axios';
import * as https from 'https';

const httpsAgent = new https.Agent({
	rejectUnauthorized: false,
});

const apiMesSystem: AxiosInstance = axios.create({
	baseURL: process.env.MES_API_URL || '',
	headers: {},
	timeout: 8000,
	httpsAgent,
});

export default apiMesSystem;
