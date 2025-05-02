import { Request, Response, NextFunction } from 'express';

export function logger(req: Request, res: Response, next: NextFunction) {
  const { method, originalUrl, ip } = req;
  
  console.log(`[${new Date().toISOString()}] ${method} ${originalUrl} - ${ip}`);

  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(
      `[${new Date().toISOString()}] ${method} ${originalUrl} ${res.statusCode} - ${duration}ms`,
    );
  });

  next();
}
