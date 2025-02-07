import { TIME_ZONE_OFFSET } from '../../configs/constants.config';
export class ColumnDatetimeTransformer {
  to(data: Date): Date {
    return data;
  }

  from(data: Date): Date {
    if (data == null) {
      return null;
    }
    data.setHours(data.getHours() + TIME_ZONE_OFFSET);
    return data;
  }
}
