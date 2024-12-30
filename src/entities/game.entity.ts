import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('games')
export class Game {
  @PrimaryGeneratedColumn('uuid')
  id: string; // Identificador único del juego

  @Column()
  gameAccountPublicKey: string; // Dirección de la cuenta del juego

  @Column()
  player1PublicKey: string; // Dirección del jugador 1

  @Column()
  entryPrice: number; // Precio de entrada del juego

  @Column({ default: false })
  isClosed: boolean; // Estado del juego (abierto o cerrado)
}
