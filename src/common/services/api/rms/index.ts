import axios, { AxiosInstance } from 'axios';
import * as https from 'https';

const httpsAgent = new https.Agent({
	rejectUnauthorized: false,
});

const apiRmsSystem: AxiosInstance = axios.create({
	baseURL: process.env.RMS_API_URL || '',
	headers: {},
	timeout: 15000,
	httpsAgent,
});

export default apiRmsSystem;
