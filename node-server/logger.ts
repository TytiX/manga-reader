import * as winston from 'winston';

const logger: winston.Logger = winston.createLogger({
  level: 'debug',
  transports: [
    new winston.transports.Console({
      format: winston.format.simple()
    }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

export default logger;
