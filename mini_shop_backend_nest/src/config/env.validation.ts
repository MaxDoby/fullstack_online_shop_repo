import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  DATABASE_URL: Joi.string().required(),
  JWT_SECRET: Joi.string().required(),
  PORT: Joi.number().default(3000),
  S3_ENDPOINT: Joi.string().required(),
  S3_REGION: Joi.string().required(),
  S3_ACCESS_KEY: Joi.string().required(),
  S3_SECRET_KEY: Joi.string().required(),
  S3_BUCKET: Joi.string().required(),
  S3_FORCE_PATH_STYLE: Joi.boolean().default(true),
  RABBITMQ_URL: Joi.string().required(),
  RABBITMQ_SCRAPER_QUEUE: Joi.string().required(),
  GNEWS_API_KEY: Joi.string().optional(),
  SCRAPER_INSECURE_IMAGE_HOSTS: Joi.string().allow('').optional(),
});
