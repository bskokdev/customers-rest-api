import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as process from 'node:process';
import * as dotenv from 'dotenv';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ApiExceptionFilterFilter } from './api-exception-filter/api-exception-filter.filter';

dotenv.config();

const port = process.env.PORT || 3000;

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new ApiExceptionFilterFilter());
  const config = new DocumentBuilder()
    .setTitle('Customers API')
    .setDescription('Basic customer CRUD demo')
    .setVersion('1.0')
    .addTag('customers')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  await app.listen(port);
}

bootstrap().then(() => {
  console.log(`App running at port: ${port}`);
});
