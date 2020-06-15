import * as winston from 'winston';

const logger: winston.Logger = winston.createLogger({
  transports: [
    new winston.transports.Console({
      level: 'info',
      format: winston.format.simple()
    }),
    // new winston.transports.File({
    //   level: 'debug',
    //   filename: 'debug.log'
    // }),
    new winston.transports.File({
      format: winston.format.simple(),
      level: 'warn',
      filename: 'warning.log'
    })
  ]
});

export default logger;
