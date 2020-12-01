import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

const logger: winston.Logger = winston.createLogger({
  level: 'debug',
  format: winston.format.printf(info => `${new Date().toLocaleString()} - ${info.level} - ${info.message}`),
  transports: [
    // new winston.transports.Console(),
    new DailyRotateFile({
      filename: './logs/info-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true
    })
  ],
  exceptionHandlers: [
    new winston.transports.File({
      filename: './logs/rejections.log'
    })
  ]
});

export default logger;
