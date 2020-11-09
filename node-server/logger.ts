import * as winston from 'winston';
import * as DailyRotateFile from 'winston-daily-rotate-file';

const logger: winston.Logger = winston.createLogger({
  transports: [
    // new winston.transports.Console({
    //   level: 'info',
    //   format: winston.format.printf(info => `${new Date().toLocaleString()} - ${info.level} - ${info.message}`)
    // }),
    new DailyRotateFile({
      level: 'info',
      format: winston.format.printf(info => `${new Date().toLocaleString()} - ${info.level} - ${info.message}`),
      frequency: '1d',
      filename: './logs/info-%DATE%.log',
      datePattern: 'YYYY-MM-DD-HH',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '7d'
    })
  ]
});

export default logger;
