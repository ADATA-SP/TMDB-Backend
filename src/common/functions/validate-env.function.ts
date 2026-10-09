const REQUIRED_ENV_VARS = [
	'DATABASE_URL',
	'APP_PORT',
	'JWT_AT_SECRET',
	'JWT_AT_EXPIRES',
	'JWT_RT_SECRET',
	'JWT_RT_EXPIRES',
	'SSO_PORTAL_API_URL',
	'SSO_API_KEY',
	'SSO_SYSTEM_ID',
	'SSO_FRONTEND_ORIGIN',
];

const INSECURE_DEFAULTS = ['at-secret', 'rt-secret', 'secret', 'changeme'];

export const validateEnv = () => {
	const missing = REQUIRED_ENV_VARS.filter((key) => !process.env[key]);

	if (missing.length)
		throw new Error(
			`Variáveis de ambiente obrigatórias não definidas: ${missing.join(', ')}`,
		);

	if (!Number.isInteger(Number(process.env.SSO_SYSTEM_ID)))
		throw new Error(
			'SSO_SYSTEM_ID deve ser o id numérico do TMDB no Portal.',
		);

	if (
		new URL(process.env.SSO_FRONTEND_ORIGIN).origin !==
		process.env.SSO_FRONTEND_ORIGIN
	)
		throw new Error(
			'SSO_FRONTEND_ORIGIN deve conter apenas protocolo, host e porta do front, sem barra final. Ex.: http://localhost:3000',
		);

	if (process.env.NODE_ENV !== 'production') return;

	const weakSecrets = ['JWT_AT_SECRET', 'JWT_RT_SECRET'].filter((key) =>
		INSECURE_DEFAULTS.includes(process.env[key]),
	);

	if (weakSecrets.length)
		throw new Error(
			`Segredos de exemplo não podem ser usados em produção: ${weakSecrets.join(', ')}`,
		);

	if (process.env.SSO_API_KEY === 'sandbox-api-key')
		throw new Error(
			'SSO_API_KEY está com a chave do sandbox. Use a chave fornecida pelo Portal ADATA.',
		);

	if (process.env.CORS_ORIGIN === '*')
		throw new Error(
			'CORS_ORIGIN não pode ser "*" em produção. Defina as origens permitidas.',
		);
};
