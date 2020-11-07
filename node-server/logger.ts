import * as winston from 'winston';

const logger: winston.Logger = winston.createLogger({
  transports: [
    // new winston.transports.Console({
    //   level: 'info',
    //   format: winston.format.printf(info => `${new Date().toLocaleString()} - ${info.level} - ${info.message}`)
    // }),
    new winston.transports.File({
      level: 'info',
      filename: './logs/info.log',
      format: winston.format.printf(info => `${new Date().toLocaleString()} - ${info.level} - ${info.message}`)
    }),
    new winston.transports.File({
      level: 'warn',
      filename: './logs/warning.log',
      format: winston.format.printf(info => `${new Date().toLocaleString()} - ${info.level} - ${info.message}`)
    })
  ]
});

export default logger;
