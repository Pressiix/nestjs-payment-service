import { Inject, Injectable, Logger } from '@nestjs/common';
import * as AWS from 'aws-sdk';
import * as fs from 'fs';
import * as path from 'path';
import { ConfigServiceType } from '../services/config.service';
import {
  COMMON_CONFIG_BUCKET,
  LOOKUP_COMMON_FILE_NAME,
  LOOKUP_CONFIG_PATH,
  LOOKUP_FILE_NAME,
  LOOKUP_MS_FILE_NAME,
} from './constants.config';
import ErrnoException = NodeJS.ErrnoException;

// @Injectable()
export class BaselineConfig {
  private readonly logger = new Logger(BaselineConfig.name);
  private awsS3 = new AWS.S3();

  constructor(@Inject('CONFIG') private config: ConfigServiceType) {
    this.writeGenericResponseStatusFile()
      .then(() => this.logger.log(`Write data success.`))
      .catch((error) => {
        this.logger.error(`write generic response status fail.`);
        throw error;
      });
  }

  public async writeGenericResponseStatusFile(): Promise<void> {
    try {
      const commonBaselineStr = await this.readCommonFile();
      const localBaselineStr = await this.readLocalFile();
      const commonBaseline = JSON.parse(commonBaselineStr);
      const localBaseline = JSON.parse(localBaselineStr);
      const baseline = {
        en: { ...commonBaseline.en, ...localBaseline.en },
        th: { ...commonBaseline.th, ...localBaseline.th },
      };
      await this.writeToFile(JSON.stringify(baseline));
    } catch (error) {
      this.logger.error(`[write-generic-response-status]: fail ${error.message}`);
      throw error;
    }
  }

  private async readCommonFile(): Promise<any> {
    const bucket: string = this.config.get(COMMON_CONFIG_BUCKET, '');
    const filePath = `${this.config.get(LOOKUP_CONFIG_PATH, '')}/${this.config.get(LOOKUP_COMMON_FILE_NAME, '')}`;
    const data = await this.awsS3
      .getObject({
        Bucket: bucket,
        Key: filePath,
      })
      .promise();
    return data.Body.toString();
  }

  private async readLocalFile(): Promise<any> {
    const bucket: string = this.config.get(COMMON_CONFIG_BUCKET, '');
    const filePath = `${this.config.get(LOOKUP_CONFIG_PATH, '')}/${this.config.get(LOOKUP_MS_FILE_NAME, '')}`;
    const data = await this.awsS3
      .getObject({
        Bucket: bucket,
        Key: filePath,
      })
      .promise();
    return data.Body.toString();
  }

  private async writeToFile(text: string): Promise<void> {
    const genericFilePath = path.join(__dirname, `../utils/lookup/${LOOKUP_FILE_NAME}`);
    return new Promise<void>((resolve, reject) => {
      fs.writeFile(genericFilePath, text, (err: ErrnoException | null) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
}
