import { ColumnDatetimeTransformer } from '../../../../src/entities/transformer/column-datetime.transformer';
import { testCasesFor } from '../../../utils/string.template';

describe(testCasesFor('ColumnDatetimeTransformer'), () => {
  it('Test to method Should return date when input number', () => {
    const datetimeTransformer = new ColumnDatetimeTransformer();
    const expected = datetimeTransformer.to(new Date());
    expect(expected).not.toBeNull();
  });

  it('Test from method Should return date when input number', () => {
    const datetimeTransformer = new ColumnDatetimeTransformer();
    const expected = datetimeTransformer.from(new Date());
    expect(expected).not.toBeNull();
  });

  it('Test from method Should return null when input null', () => {
    const datetimeTransformer = new ColumnDatetimeTransformer();
    const expected = datetimeTransformer.from(null);
    expect(expected).toBeNull();
  });
});
