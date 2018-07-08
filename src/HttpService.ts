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

import {BotOptions} from './BotOptions';
import * as https from 'https';
import * as fs from 'fs';
const logdown = require('logdown');

class HttpService {
  private readonly cert: string;
  private readonly logger = logdown('@wireapp/bot-sdk-node', {
    logger: console,
    markdown: false,
  });
  private readonly key: string;
  private server: https.Server | undefined;

  constructor(private readonly options: BotOptions) {
    this.cert = fs.readFileSync(this.options.cert, 'utf8');
    this.key = fs.readFileSync(this.options.key, 'utf8');
  }

  start() {
    const data: Array<Buffer> = [];
    this.server = https.createServer({
      cert: this.cert,
      key: this.key,
    }, (req, res) => {
      req
      .on('data', chunk => data.push(chunk as Buffer))
      .on('end', () => {
        const result = Buffer.concat(data).toString();
        console.log(`got: ${data}`);
        let j;
        try {
          j = JSON.parse(result);
        } catch (e) {
          console.log(`Unexpected error: ${e}`);
          return;
        }
        console.log(`got ${j}`);
        j = JSON.stringify(j);
        console.log(`as json: ${j}`);
      });
    }).listen(this.options.port);
  }

  stop() {
    if (this.server) {
      this.server.close();
      this.logger.info('Server closed.');
      this.server = undefined;
    } else {
      throw new Error('Server is not running.');
    }
  }
}

export {HttpService}
