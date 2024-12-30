import { Controller, Get } from '@nestjs/common';
import {ApiTags, ApiOperation} from '@nestjs/swagger'
import { from } from 'rxjs';

@ApiTags('oracle')
@Controller('oracle')
export class OracleController {

// test
 @Get()
 @ApiOperation({ summary: 'test'})
 getOracle(){
    return{ messagge: 'oracle!'}
 }



}
