import * as dotenv from 'dotenv';
import * as path from 'path';

// Cargar variables de entorno desde el archivo .env
dotenv.config({ path: path.resolve(__dirname, '../.env') });

export const CONFIG = {
  PATH_TO_YOUR_SOLANA_PAYER_JSON: path.resolve(process.cwd(), process.env.PATH_TO_YOUR_SOLANA_PAYER_JSON!),
  PATH_TO_YOUR_SOLANA_PLAYER2_JSON: path.resolve(process.cwd(), process.env.PATH_TO_YOUR_SOLANA_PLAYER2_JSON!),
  PATH_TO_YOUR_SOLANA_GAME_JSON: path.resolve(process.cwd(), process.env.PATH_TO_YOUR_SOLANA_GAME_JSON!),
  PAYER_TOKEN_ACCOUNT: process.env.PAYER_TOKEN_ACCOUNT!,
  PLAYER2_TOKEN_ACCOUNT: process.env.PLAYER2_TOKEN_ACCOUNT!,
  SCROW_TOKEN_ACCOUNT: process.env.SCROW_TOKEN_ACCOUNT!,
  TOKEN_PROGRAM_ID: process.env.TOKEN_PROGRAM_ID!,
  DEPLOYED_PROGRAM_ADDRESS: process.env.DEPLOYED_PROGRAM_ADDRESS!,
  PROGRAM_SC: process.env.PROGRAM_SC!,
  SOLANA_RPC: process.env.SOLANA_RPC!,
  USDC_PRICE_ACCOUNT:process.env.USDC_PRICE_ACCOUNT!,


  DATABASE: {
    HOST: process.env.DATABASE_HOST!,
    PORT: parseInt(process.env.DATABASE_PORT!, 10),
    USERNAME: process.env.DATABASE_USERNAME!,
    PASSWORD: process.env.DATABASE_PASSWORD!,
    NAME: process.env.DATABASE_NAME!,
  },

};
