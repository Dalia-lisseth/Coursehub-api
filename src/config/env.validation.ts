const requiredVariables = [
  'DATABASE_HOST',
  'DATABASE_PORT',
  'DATABASE_NAME',
  'DATABASE_USER',
  'DATABASE_PASSWORD',
] as const;

export function validateEnvironment(
  config: Record<string, unknown>,
): Record<string, unknown> {
  const missingVariables = requiredVariables.filter(
    (variable) =>
      config[variable] === undefined || config[variable] === null,
  );

  if (missingVariables.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVariables.join(', ')}`,
    );
  }

  const port = Number(config.PORT ?? 3001);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('PORT must be an integer between 1 and 65535');
  }

  const databasePort = Number(config.DATABASE_PORT);
  if (
    !Number.isInteger(databasePort) ||
    databasePort < 1 ||
    databasePort > 65535
  ) {
    throw new Error('DATABASE_PORT must be an integer between 1 and 65535');
  }

  const synchronize = config.DATABASE_SYNCHRONIZE ?? 'true';
  if (synchronize !== 'true' && synchronize !== 'false') {
    throw new Error('DATABASE_SYNCHRONIZE must be either true or false');
  }

  return {
    ...config,
    NODE_ENV: config.NODE_ENV ?? 'development',
    PORT: port,
    DATABASE_PORT: databasePort,
    DATABASE_SYNCHRONIZE: synchronize,
  };
}
