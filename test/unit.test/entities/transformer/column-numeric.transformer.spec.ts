import { ColumnNumericTransformer } from '../../../../src/entities/transformer/column-numeric.transformer';

describe('Test for ColumnNumericTransformer', () => {
  it('Test to method Should return numbers when input number', () => {
    const numbericTransform = new ColumnNumericTransformer();
    const expected = numbericTransform.to(6);
    expect(expected).not.toBeNull();
    expect(expected).toBe(6);
  });

  it('Test from method Should return numbers when input number', () => {
    const numbericTransform = new ColumnNumericTransformer();
    const expected = numbericTransform.from('6');
    expect(expected).not.toBeNull();
    expect(expected).toBe(6);
  });

  it('Test from method Should return null when input null', () => {
    const numbericTransform = new ColumnNumericTransformer();
    const expected = numbericTransform.from(null);
    expect(expected).toBeNull();
  });
});
