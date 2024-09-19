import dotenv from 'dotenv';

dotenv.config();

function ensureEnvVariable(variable: string | undefined, name: string): string {
  if (!variable) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return variable;
}

export const config = {
  port: process.env.PORT || 3000,

  db: {
    host: ensureEnvVariable(process.env.DB_HOST, 'DB_HOST'),
    user: ensureEnvVariable(process.env.DB_USER, 'DB_USER'),
    database: ensureEnvVariable(process.env.DB_DATABASE, 'DB_DATABASE'),
    password: ensureEnvVariable(process.env.DB_PASSWORD, 'DB_PASSWORD'),
    port: Number(process.env.DB_PORT) || 5432,
    ssl: {
      rejectUnauthorized: false, // Necessary for certain cloud-hosted databases
    },
  },

  jwtSecret: ensureEnvVariable(process.env.JWT_SECRET, 'JWT_SECRET'),

  mailTrap: {
    host: ensureEnvVariable(process.env.MAILTRAP_HOST, 'MAILTRAP_HOST'),
    port: Number(process.env.MAILTRAP_PORT) || 2525,
    user: ensureEnvVariable(process.env.MAILTRAP_USER, 'MAILTRAP_USER'),
    pass: ensureEnvVariable(process.env.MAILTRAP_PASS, 'MAILTRAP_PASS'),
  },

  saltRounds: Number(process.env.SALT_ROUNDS) || 10,

  // Google OAuth Config
  google: {
    clientID: ensureEnvVariable(process.env.GOOGLE_CLIENT_ID, 'GOOGLE_CLIENT_ID'),
    clientSecret: ensureEnvVariable(process.env.GOOGLE_CLIENT_SECRET, 'GOOGLE_CLIENT_SECRET'),
    callbackURL: ensureEnvVariable(process.env.GOOGLE_CALLBACK_URL, 'GOOGLE_CALLBACK_URL'),
  },

  // GitHub OAuth Config
  github: {
    clientID: ensureEnvVariable(process.env.GITHUB_CLIENT_ID, 'GITHUB_CLIENT_ID'),
    clientSecret: ensureEnvVariable(process.env.GITHUB_CLIENT_SECRET, 'GITHUB_CLIENT_SECRET'),
    callbackURL: ensureEnvVariable(process.env.GITHUB_CALLBACK_URL, 'GITHUB_CALLBACK_URL'),
  },

  sessionSecret: process.env.SESSION_SECRET || 'defaultSecret', // Ensure this line is added
};
