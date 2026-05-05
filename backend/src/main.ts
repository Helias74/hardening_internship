import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import session from 'express-session';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.enableCors({
    origin: 'http://localhost:5173',  // URL du frontend Vue.js
    credentials: true,                // autorise l'envoi des cookies entre front et back (sinon bloqué par CORS) 
  });

  app.use(session({
    secret: process.env.SESSION_SECRET ?? 'default_secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,    // non accessible via JavaScript
      secure: false,     // false en dev, true en prod (HTTPS)
      maxAge: 1000 * 60 * 60 * 8,  // 8 heures voir si reduire après
    },
  }));

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();