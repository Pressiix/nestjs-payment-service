import axios from 'axios';

export class MapperUtil {
  static mapperCatchResponse(errorType: string, error: Error, data?: any, url?: string) {
    if (axios.isAxiosError(error)) {
      throw new Error(JSON.stringify({ url, errorType, error: error.response.data, data, payload: error.config.data }));
    } else if (typeof error === 'object') {
      throw new Error(JSON.stringify({ url, errorType, error: error.message, data }));
    } else {
      throw new Error(JSON.stringify({ url, errorType, error: error, data }));
    }
  }
}
