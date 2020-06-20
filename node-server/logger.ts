import * as winston from 'winston';

const logger: winston.Logger = winston.createLogger({
  transports: [
    // new winston.transports.Console({
    //   level: 'debug',
    //   format: winston.format.simple()
    // }),
    new winston.transports.File({
      level: 'info',
      filename: './logs/info.log'
    }),
    new winston.transports.File({
      format: winston.format.simple(),
      level: 'warn',
      filename: './logs/warning.log'
    })
  ]
});

export default logger;
