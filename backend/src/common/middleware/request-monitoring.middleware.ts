import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as Prometheus from 'prom-client';

@Injectable()
export class RequestMonitoringMiddleware implements NestMiddleware {
  private readonly logger = new Logger('RequestMonitoring');
  private httpRequestDuration: Prometheus.Histogram;
  private httpRequestsTotal: Prometheus.Counter;
  private httpRequestSizeBytes: Prometheus.Histogram;
  private httpResponseSizeBytes: Prometheus.Histogram;

  constructor() {
    this.httpRequestDuration = new Prometheus.Histogram({
      name: 'http_request_duration_seconds',
      help: 'Duration of HTTP requests in seconds',
      labelNames: ['method', 'route', 'status_code'],
      buckets: [0.01, 0.05, 0.1, 0.5, 1, 3, 5, 10],
    });

    this.httpRequestsTotal = new Prometheus.Counter({
      name: 'http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'route', 'status_code'],
    });

    this.httpRequestSizeBytes = new Prometheus.Histogram({
      name: 'http_request_size_bytes',
      help: 'Size of HTTP requests in bytes',
      labelNames: ['method', 'route'],
      buckets: [100, 1000, 10000, 100000, 1000000],
    });

    this.httpResponseSizeBytes = new Prometheus.Histogram({
      name: 'http_response_size_bytes',
      help: 'Size of HTTP responses in bytes',
      labelNames: ['method', 'route', 'status_code'],
      buckets: [100, 1000, 10000, 100000, 1000000],
    });
  }

  use(req: Request, res: Response, next: NextFunction) {
    const start = Date.now();
    const route = this.getRoutePattern(req);
    const contentLength = parseInt(req.get('content-length') || '0', 10);

    this.httpRequestSizeBytes.observe({ method: req.method, route }, contentLength);

    res.on('finish', () => {
      const responseLength = parseInt(res.get('content-length') || '0', 10);
      const statusCode = res.statusCode.toString();
      const duration = (Date.now() - start) / 1000;

      this.httpRequestDuration.observe(
        { method: req.method, route, status_code: statusCode },
        duration,
      );
      this.httpRequestsTotal.inc({ method: req.method, route, status_code: statusCode });
      this.httpResponseSizeBytes.observe(
        { method: req.method, route, status_code: statusCode },
        responseLength,
      );
    });

    next();
  }

  private getRoutePattern(req: Request): string {
    return req.route?.path || req.path;
  }
}