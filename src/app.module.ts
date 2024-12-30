import { Module } from '@nestjs/common';
import { GameController } from './controllers/game/game.controller';
import { OracleController } from './controllers/oracle/oracle.controller';
import { GameService } from './services/game/game.service';
import { OracleService } from './services/oracle/oracle.service';

import { TypeOrmModule } from '@nestjs/typeorm';
import { CONFIG } from './config';

import { Game } from './entities/game.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: CONFIG.DATABASE.HOST,
      port: CONFIG.DATABASE.PORT,
      username: CONFIG.DATABASE.USERNAME,
      password: CONFIG.DATABASE.PASSWORD,
      database: CONFIG.DATABASE.NAME,
      autoLoadEntities: true, // Carga automáticamente las entidades
      synchronize: true, // ¡Usar solo en desarrollo!
    }),
    TypeOrmModule.forFeature([Game]), // Importa explícitamente la entidad Game
  ],
  controllers: [GameController, OracleController], // Registra los controladores
  providers: [GameService, OracleService], // Registra los servicios
})
export class AppModule {}
