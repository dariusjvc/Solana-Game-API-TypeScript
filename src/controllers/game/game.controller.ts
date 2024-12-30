import { Controller, Get, Post, Query, BadRequestException, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiBody } from '@nestjs/swagger'
import { from } from 'rxjs';

import { GameService } from '../../services/game/game.service';

@ApiTags('game')
@Controller('game')
export class GameController {

  constructor(private readonly gameService: GameService) { }

  // test
  //  @Get()
  //  @ApiOperation({ summary: 'Health'})
  //  getGame(){
  //     return this.gameService.getGameTest();
  //  }

  @Post()
  @ApiOperation({ summary: "Create a new game" })
  createGame() {
    return this.gameService.createGame();
  }

  // Join game endpoint
  @Post('join')
  @ApiOperation({ summary: 'Join an existing game as Player 2' })
  @ApiBody({
    description: 'Payload for joining a game',
    schema: {
      type: 'object',
      properties: {
        gameId: { type: 'string', description: 'ID of the game to join' },
        lastPrice: { type: 'number', description: 'Last price for the game' },
      },
      required: ['gameId', 'lastPrice'],
    },
  })
  async joinGame(
    @Body('gameId') gameId: string,
    @Body('lastPrice') lastPrice: number,
  ) {
    if (!gameId || typeof lastPrice !== 'number') {
      throw new BadRequestException('gameId and lastPrice are required and must be valid');
    }

    return this.gameService.joinGame(gameId, lastPrice);
  }



  //Settle Game
  @Post('settle')
  @ApiOperation({ summary: 'Settle and finalize the game' })
  @ApiBody({
    description: 'Payload for joining a game',
    schema: {
      type: 'object',
      properties: {
        gameId: { type: 'string', description: 'ID of the game to join' },
        lastPrice: { type: 'number', description: 'Last price for the game' },
      },
      required: ['gameId', 'lastPrice'],
    },
  })
  async settleGame(
    @Body('gameId') gameId: string,
    @Body('lastPrice') lastPrice: number,
  ) {
    if (!gameId || typeof lastPrice !== 'number') {
      throw new BadRequestException('gameId and lastPrice are required and must be valid');
    }

    return this.gameService.settleGame(gameId, lastPrice);
  }
  //TODO
  //Close the game verifying who is the winner controller

}
