import { Injectable } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Game } from '../../entities/game.entity';

import * as borsh from "borsh";

import {
  Connection,
  Keypair,
  TransactionInstruction,
  PublicKey,
  sendAndConfirmTransaction,
  Transaction,
  SystemProgram,
} from '@solana/web3.js';

import { CONFIG } from '../../config';

// Helper function to create a Keypair from a JSON file
function createKeypairFromFile(filePath: string): Keypair {
  const fs = require('fs');
  return Keypair.fromSecretKey(
    Buffer.from(JSON.parse(fs.readFileSync(filePath, 'utf-8')))
  );
}

@Injectable()
export class GameService {
  private connection: Connection;
  private payer: Keypair;
  private player2: Keypair;
  private escrowTokenAccount: PublicKey;
  private payerTokenAccount: PublicKey;
  private player2TokenAccount: PublicKey;
  private programId: PublicKey;
  private tokenProgramId: PublicKey;
  private usdcPriceAccount: PublicKey;

  constructor(@InjectRepository(Game)
  private readonly gameRepository: Repository<Game>,) {


    this.connection = new Connection(CONFIG.SOLANA_RPC, 'confirmed');
    this.payer = createKeypairFromFile(CONFIG.PATH_TO_YOUR_SOLANA_PAYER_JSON);
    this.player2 = createKeypairFromFile(CONFIG.PATH_TO_YOUR_SOLANA_PLAYER2_JSON);
    this.escrowTokenAccount = new PublicKey(CONFIG.SCROW_TOKEN_ACCOUNT);
    this.payerTokenAccount = new PublicKey(CONFIG.PAYER_TOKEN_ACCOUNT);
    this.player2TokenAccount = new PublicKey(CONFIG.PLAYER2_TOKEN_ACCOUNT);
    this.programId = new PublicKey(CONFIG.PROGRAM_SC);
    this.tokenProgramId = new PublicKey(CONFIG.TOKEN_PROGRAM_ID);
    this.usdcPriceAccount = new PublicKey(CONFIG.USDC_PRICE_ACCOUNT);
  }

  // getGameTest() {
  //   return { message: 'Game Service is Running!' };
  // }

  /**
   * Prepares dynamic game data based on instruction code and parameters.
   */
  private prepareGameData(instructionCode: number, params: Record<string, any>): Buffer {
    const buffers = [];

    // Add instruction code
    buffers.push(Buffer.from([instructionCode]));

    // Dynamically add parameters
    for (const [key, value] of Object.entries(params)) {
      if (typeof value === 'boolean') {
        buffers.push(Buffer.from([value ? 1 : 0]));
      } else if (typeof value === 'number') {
        const buffer = Buffer.alloc(8);
        buffer.writeBigUInt64LE(BigInt(value * 1e8)); // Assuming 8 decimal places
        buffers.push(buffer);
      } else if (Buffer.isBuffer(value)) {
        buffers.push(value);
      } else {
        throw new Error(`Unsupported parameter type for ${key}`);
      }
    }

    return Buffer.concat(buffers);
  }

  /**
   * Centralized method to send transactions.
   */
  private async sendTransaction(instruction: TransactionInstruction, signers: Keypair[]): Promise<string> {
    const transaction = new Transaction().add(instruction);
    const { blockhash } = await this.connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;

    try {
      const signature = await sendAndConfirmTransaction(this.connection, transaction, signers);
      return signature;
    } catch (error) {
      console.error('Transaction failed:', error.logs || error.message);
      throw new Error(`Transaction failed: ${error.message}`);
    }
  }

  /**
   * Checks if an account already exists.
   */
  private async isAccountExisting(publicKey: PublicKey): Promise<boolean> {
    const accountInfo = await this.connection.getAccountInfo(publicKey);
    return accountInfo !== null;
  }

  /**
  * Creates a new game.
  */
  async createGame(): Promise<{ gameId: string; transactionSignature: string }> {
    let gameAccount = Keypair.generate();

    // Ensure the account doesn't already exist
    while (await this.isAccountExisting(gameAccount.publicKey)) {
      gameAccount = Keypair.generate();
    }

    const data = this.prepareGameData(0, {
      player1_choice: false,
      entry_price: 2500,
    });

    const instruction = new TransactionInstruction({
      keys: [
        { pubkey: this.payer.publicKey, isSigner: true, isWritable: true },
        { pubkey: gameAccount.publicKey, isSigner: true, isWritable: true },
        { pubkey: this.escrowTokenAccount, isSigner: false, isWritable: true },
        { pubkey: this.payerTokenAccount, isSigner: false, isWritable: true },
        { pubkey: this.tokenProgramId, isSigner: false, isWritable: false },
        { pubkey: this.usdcPriceAccount, isSigner: false, isWritable: false },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ],
      programId: this.programId,
      data,
    });

    // Guardar el juego en la base de datos
    const newGame = this.gameRepository.create({
      gameAccountPublicKey: gameAccount.publicKey.toBase58(),
      player1PublicKey: this.payer.publicKey.toBase58(),
      entryPrice: 2500,
    });
    const savedGame = await this.gameRepository.save(newGame);

    // Ejecutar la transacción
    const transactionSignature = await this.sendTransaction(instruction, [this.payer, gameAccount]);

    // Retornar el ID del juego y el hash de la transacción
    return {
      gameId: savedGame.id,
      transactionSignature,
    };
  }


  /*
  Join a new player to the game
  */

  async joinGame(gameId: string, lastPrice: number): Promise<string> {
    // Buscar el juego en la base de datos
    const game = await this.gameRepository.findOne({
      where: { id: gameId },
    });

    if (!game) {
      throw new Error(`Game with ID ${gameId} not found.`);
    }

    // Obtener la clave pública del juego
    const gameAccountPublicKey = new PublicKey(game.gameAccountPublicKey);

    // Preparar los datos para la transacción
    const data = this.prepareGameData(2, { lastPrice });

    const instruction = new TransactionInstruction({
      keys: [
        { pubkey: this.player2.publicKey, isSigner: true, isWritable: true },
        { pubkey: gameAccountPublicKey, isSigner: false, isWritable: true }, // Usar la cuenta del juego desde la DB
        { pubkey: this.escrowTokenAccount, isSigner: false, isWritable: true },
        { pubkey: this.player2TokenAccount, isSigner: false, isWritable: true },
        { pubkey: this.tokenProgramId, isSigner: false, isWritable: false },
        { pubkey: this.usdcPriceAccount, isSigner: false, isWritable: false },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ],
      programId: this.programId,
      data,
    });

    return this.sendTransaction(instruction, [this.payer, this.player2]);
  }

  /**
   * Settles the game by distributing tokens based on the game outcome.
   */
  async settleGame(gameId: string, lastPrice: number): Promise<{ gameActive: boolean; winner: string }> {
    // Buscar el juego en la base de datos
    const game = await this.gameRepository.findOne({
      where: { id: gameId },
    });

    if (!game) {
      throw new Error(`Game with ID ${gameId} not found.`);
    }

    // Obtener la clave pública del juego desde la base de datos
    const gameAccountPublicKey = new PublicKey(game.gameAccountPublicKey);

    // Convertir el precio a micro USDC (asumiendo 8 decimales)
    const lastPriceInMicroUsdc = Math.round(lastPrice * 100_000_000);

    // Serializar el precio como u64 (8 bytes)
    const lastPriceBuffer = Buffer.alloc(8);
    lastPriceBuffer.writeBigUInt64LE(BigInt(lastPriceInMicroUsdc));

    // Preparar los datos para la instrucción
    const data = Buffer.concat([Buffer.from([3]), lastPriceBuffer]);

    // Crear la instrucción para el programa
    const instruction = new TransactionInstruction({
      keys: [
        { pubkey: gameAccountPublicKey, isSigner: false, isWritable: true }, // Cuenta del juego
        { pubkey: this.payerTokenAccount, isSigner: false, isWritable: true }, // Cuenta del jugador 1
        { pubkey: this.player2TokenAccount, isSigner: false, isWritable: true }, // Cuenta del jugador 2
        { pubkey: this.usdcPriceAccount, isSigner: false, isWritable: false }, // Cuenta del precio en USDC
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false }, // Programa del sistema
        { pubkey: this.payer.publicKey, isSigner: true, isWritable: true }, // Firmante
        { pubkey: this.tokenProgramId, isSigner: false, isWritable: false }, // Programa de tokens SPL
      ],
      programId: this.programId,
      data,
    });

    try {
      // Ejecutar la transacción
      const transactionSignature = await this.sendTransaction(instruction, [this.payer]);

      // Obtener información actualizada de la cuenta del juego
      const accountInfo = await this.connection.getAccountInfo(gameAccountPublicKey);



      const gameState = deserializeGameState(accountInfo.data);

      console.log(gameState);

      // Determinar el ganador y el estado del juego
      const winnerPublicKey = new PublicKey(gameState.winner);

      console.log("winnerpublickey");
      console.log(winnerPublicKey);


      const winner =
        winnerPublicKey.equals(PublicKey.default) ? 'No winner' : winnerPublicKey.toBase58();

      return {
        gameActive: gameState.game_active,
        winner,
      };
      // return null;
    } catch (error) {
      console.error('Error settling game:', error.logs || error.message);
      throw new Error(`Failed to settle game: ${error.message}`);
    }
  }

}
function deserializeGameState(buffer: Buffer): GameState {
  return borsh.deserialize(GameStateSchema, GameState, buffer);
}
class GameState {
  player1: Uint8Array;
  player2: Uint8Array;
  player1_choice: boolean;
  player2_choice: boolean;
  entry_price: bigint;
  last_price: bigint;
  game_active: boolean;
  winner: Uint8Array;

  constructor(fields: { player1: Uint8Array, player2: Uint8Array, player1_choice: boolean, player2_choice: boolean, entry_price: bigint, last_price: bigint, game_active: boolean, winner: Uint8Array } | undefined = undefined) {
    if (fields) {
      this.player1 = fields.player1;
      this.player2 = fields.player2;
      this.player1_choice = fields.player1_choice,
        this.player2_choice = fields.player2_choice,
        this.entry_price = fields.entry_price;
      this.last_price = fields.last_price;
      this.game_active = fields.game_active;
      this.winner = fields.winner;
    }
  }
}
const GameStateSchema = new Map([
  [GameState, { kind: 'struct', fields: [['player1', [32]], ['player2', [32]], ['player1_choice', 'u8'], ['player2_choice', 'u8'], ['entry_price', 'u64'], ['last_price', 'u64'], ['game_active', 'u8'], ['winner', [32]]] }]
]);