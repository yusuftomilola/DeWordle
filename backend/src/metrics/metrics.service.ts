import { Injectable, OnModuleInit } from '@nestjs/common';
import * as Prometheus from 'prom-client';

@Injectable()
export class MetricsService implements OnModuleInit {
  private readonly register: Prometheus.Registry;

  constructor() {
    this.register = new Prometheus.Registry();
    
    Prometheus.collectDefaultMetrics({
      register: this.register,
      prefix: 'api_',
    });
  }

  onModuleInit() {
    console.log('Metrics service initialized');
  }

  async getMetrics(): Promise<string> {
    return await this.register.metrics();
  }

  getContentType(): string {
    return this.register.contentType;
  }
}