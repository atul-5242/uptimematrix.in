declare namespace NodeJS {
  interface ProcessEnv {
    DATABASE_URL: string;
    REDIS_URL: string;
    JWT_SECRET: string;
    GROUP_NAME: string;
    CONSUMER_NAME: string;
    SMTP_HOST: string;
    SMTP_PORT: string;
    SMTP_SECURE: string;
    SMTP_USER: string;
    SMTP_PASS: string;
    EMAIL_FROM: string;
    INVITATION_SECRET: string;
    FRONTEND_URL: string;
  }
}
