/*
 * Wire
 * Copyright (C) 2017 Wire Swiss GmbH
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

import * as http from 'http';
const https = require('follow-redirects').https;

type ClientRequestModified = http.ClientRequest & {errorCnt: number};

type Data = {[key: string]: string} | Buffer | null;

class HttpsClient {
  private token: string;

  constructor(token: string) {
    this.token = token;
  }

  static onError(req: ClientRequestModified, e: Error | null, cb: (data: Data, status: number) => any) {
    if (req.errorCnt > 1) {
      return;
    }
    if (e) {
      console.log(`Request error: ${JSON.stringify(e)}`);
    } else {
      console.log('Request timeout.');
      req.abort();
    }
    cb(null, 0);
  }

  sendRequest(method: string, path: string, data: any, additionalHeaders: {[key: string]: string} | null, cb: (data: Data, statusCode: number) => any) {
    const options:
    http.RequestOptions = {
      hostname: 'prod-nginz-https.wire.com',
      port: 443,
      path,
      method,
      headers: {
        Authorization: `Bearer ${this.token}`,
        'Content-Type': 'application/json',
      },
    };
    if (additionalHeaders != null) {
      Object.keys(additionalHeaders).forEach((hKey) => {
        options.headers![hKey] = additionalHeaders[hKey];
      });
    }
    console.log(options.headers);
    const req = https.request(options, (res: http.ServerResponse) => {
      let responseData: Buffer[] = [];
      res.on('data', (chunk: Buffer) => {
        console.log('got data from https');
        responseData.push(chunk);
      });
      res.on('end', () => {
        console.log(`req end from https ${res.statusCode}`);
        const result = Buffer.concat(responseData);
        cb(result, res.statusCode);
      });
    });

    req.errorCnt = 0;
    req.on('error', (e: Error) => {
      req.errorCnt += 1;
      HttpsClient.onError(req, e, cb);
    });
    req.setTimeout(15000, () => {
      req.errorCnt += 1;
      HttpsClient.onError(req, null, cb);
    });

    if (data !== null) {
      if (Buffer.isBuffer(data)) {
        req.write(data);
      } else {
        req.write(JSON.stringify(data));
      }
    }
    req.end();
  }

  sendMessage(postData: string, ignoreMissing: boolean, cb: (data: Data, status: number) => any) {
    const path = `/bot/messages?ignore_missing=${ignoreMissing}`;
    this.sendRequest('POST', path, postData, null, (retData, status) => {
      if (retData) {
        const json = JSON.parse(retData.toString()); // fixme: try/catch
        cb(json, status);
      }
    });
  }

  getClients(postData: string, cb: (data: Data, status: number) => any) {
    this.sendRequest('GET', '/bot/client', postData, null, cb);
  }

  getPrekeys(forUsersAndDevices: {[key: string]: string}, cb: (data: {[key: string]: string}, status: number) => any) {
    console.log(`getprekeys ${JSON.stringify(forUsersAndDevices)}`);
    this.sendRequest('POST', '/bot/users/prekeys', forUsersAndDevices, null, (retData, status) => {
      if (retData) {
        const json = JSON.parse(retData.toString()); // fixme: try/catch
        cb(json, status);
      }
    });
  }

  getAsset(assetID: string, assetToken: string, cb: (data: Data, status: number) => any) {
    console.log(`assetID ${assetID} token ${assetToken}`);
    this.sendRequest('GET', `/bot/assets/${assetID}`, null,
    { 'Asset-Token': assetToken }, cb);
  }

  uploadAsset(assetData: any, cb: (data: Data, status: number) => any) {
    this.sendRequest('POST', '/bot/assets', assetData, {
      'Content-Type': 'multipart/mixed; boundary=frontier',
      'Content-Length': assetData.length }, cb);
  }
};

export {HttpsClient};
