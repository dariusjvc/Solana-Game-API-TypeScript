# Solana Game Service API

## Description
This project is a backend service built with NestJS to manage Solana blockchain-based games. It allows creating, joining, and settling games by interacting with Solana-deployed programs.

---

## Prerequisites

### Dependencies
1. **Node.js**: Version 16 or higher
2. **npm**: Installed with Node.js
3. **Solana CLI**: [Install here](https://docs.solana.com/cli/install-solana-cli-tools)
4. **PostgreSQL**: For the database
5. **Docker**: For the database and API

### Key Configuration
You need to provide JSON files for the keys of player 1 and player 2:
- `payer.json`: Private key for player 1
- `player2.json`: Private key for player 2

---

## Initial Setup

1. **Clone the repository**:

   ```bash
   git clone ...
   cd ...
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Set up environment variables**:

   Create a `.env` file in the root directory and add the following:

   ```env
   SOLANA_RPC=https://api.mainnet-beta.solana.com
   PATH_TO_YOUR_SOLANA_PAYER_JSON=./path/to/payer.json
   PATH_TO_YOUR_SOLANA_PLAYER2_JSON=./path/to/player2.json
   SCROW_TOKEN_ACCOUNT=<ESCROW_ACCOUNT_PUBLIC_KEY>
   PAYER_TOKEN_ACCOUNT=<PLAYER1_TOKEN_ACCOUNT_PUBLIC_KEY>
   PLAYER2_TOKEN_ACCOUNT=<PLAYER2_TOKEN_ACCOUNT_PUBLIC_KEY>
   PROGRAM_SC=<PROGRAM_PUBLIC_KEY>
   TOKEN_PROGRAM_ID=TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA
   USDC_PRICE_ACCOUNT=<USDC_ORACLE_PUBLIC_KEY>
   DATABASE_URL=postgresql://user:password@localhost:5432/database_name
   ```

4. **Set up the database**:

   Run migrations to initialize the tables:

   ```bash
   npm run migration:run
   ```

---

## Usage

### Start the project

1. **Start Postgres DB**:

  ```bash
  docker-compose up 
  ```

2. **In development mode**:

   ```bash
   npm run dev
   ```

### Main Endpoints

1. **Test if the service is running**:
   - **Method**: `GET`
   - **Route**: `/game/test`

2. **Create a new game**:
   - **Method**: `POST`
   - **Route**: `/game/create`

3. **Join a game**:
   - **Method**: `POST`
   - **Route**: `/game/join`

4. **Settle a game**:
   - **Method**: `POST`
   - **Route**: `/game/settle`

For more details, check the Swagger documentation at:

```bash
http://localhost:3000/api-docs
```

---

## Project Structure

```plaintext
src/
├── config/              # Project configuration
├── entities/            # TypeORM entities
├── services/            # Core business services
├── controllers/         # HTTP controllers
├── migrations/          # Database migration files
└── app.module.ts        # Root application module
```

---

## Tests

Run tests to ensure functionality:

```bash
npm run test
```

---

## Contribution

1. Create a new branch for your feature:
   ```bash
   git checkout -b feature/new-feature
   ```
2. Make your changes and commit them:
   ```bash
   git commit -m "Description of changes"
   ```
3. Push your changes to the remote repository:
   ```bash
   git push origin feature/new-feature
   ```
4. Create a Pull Request for review.

---

## Additional Resources

- [Solana Official Documentation](https://docs.solana.com)
- [NestJS Documentation](https://docs.nestjs.com)
- [Borsh Serialization](https://borsh.io)

---
