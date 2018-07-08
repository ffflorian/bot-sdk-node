/*
 * Wire
 * Copyright (C) 2018 Wire Swiss GmbH
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see http://www.gnu.org/licenses/.
 *
 */

import * as EventEmitter from 'events';
//import {Account} from '@wireapp/core';
import {HttpService} from './HttpService';
import {BotOptions} from './BotOptions';
// const {Config} = require('@wireapp/api-client/dist/commonjs/Config');
// const logdown = require('logdown');

class WireBot extends EventEmitter {
  //private account: Account;
  private httpService: HttpService;

  constructor(private options: BotOptions) {
    super();
    this.httpService = new HttpService(options);
  }

  public async start() {
    console.log(this.options)
    this.httpService.start();
  }
}

export {WireBot};
