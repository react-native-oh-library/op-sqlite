/*
 * MIT License
 *
 * Copyright (C) 2024 Huawei Device Co., Ltd.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import { TurboModule } from '@rnoh/react-native-openharmony/ts';
import fs from '@ohos.file.fs';
import { BusinessError } from '@kit.BasicServicesKit';
import Logger from './Logger';

type OpSqlitePath = {
  IOS_DOCUMENT_PATH: string;
  IOS_LIBRARY_PATH: string;
  ANDROID_DATABASE_PATH: string;
  ANDROID_FILES_PATH: string;
  ANDROID_EXTERNAL_FILES_PATH: string;
  HARMONY_DATABASE_PATH: string;
  HARMONY_FILES_PATH: string;
}
const TAG: string = 'RNOpSqliteTurboModule';

export class RNOpSqliteTurboModule extends TurboModule {
  constructor(ctx) {
    super(ctx);
  }

  getConstants(): OpSqlitePath {
    if (!(this.ctx && this.ctx.uiAbilityContext)) {
      Logger.error(TAG, 'this api is not supported on this device');
      return null;
    }
    const filesPath: string = this.ctx.uiAbilityContext.filesDir;
    const dbPath: string = this.ctx.uiAbilityContext.databaseDir;
    return {
      IOS_DOCUMENT_PATH: '',
      IOS_LIBRARY_PATH: '',
      ANDROID_DATABASE_PATH: '',
      ANDROID_FILES_PATH: '',
      ANDROID_EXTERNAL_FILES_PATH: '',
      HARMONY_DATABASE_PATH: dbPath,
      HARMONY_FILES_PATH: filesPath
    };
  }

  install(): boolean {
    return true;
  }

  moveAssetsDatabase(args: {
    filename: string,
    path?: string,
    overwrite?: boolean,
  }): boolean {
    let filename: string = args.filename;
    let path: string = args?.path || 'custom';
    let overwrite: boolean = args?.overwrite || false;
    try {
      let databasesFolder: string = this.ctx.uiAbilityContext.databaseDir;
      let filePath: string = `${databasesFolder}/${filename}`;
      let destinationPath: string = `${path === 'custom' ? databasesFolder : path}/${filename}`;
      if (fs.accessSync(destinationPath, fs.AccessModeType.EXIST)) {
        if (overwrite) {
          fs.unlinkSync(destinationPath);
        } else {
          return true;
        }
      }
      fs.copyFileSync(filePath, destinationPath);
      return true
    } catch (e) {
      Logger.error(TAG, `call moveAssetsDatabase error:${(e as BusinessError).code}}`)
      return false
    }
  }
}