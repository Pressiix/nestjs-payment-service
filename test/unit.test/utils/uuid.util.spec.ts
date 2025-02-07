import uuid from '../../../src/utils/uuid.util';

describe('UuidUtil', () => {
  it('should return uuid', () => {
    let generatedUUID = uuid();
    expect(generatedUUID.length).toStrictEqual(45);
    generatedUUID = uuid('');
    expect(generatedUUID.length).toStrictEqual(45);
    generatedUUID = uuid('a');
    expect(generatedUUID.length).toStrictEqual(45);
    generatedUUID = uuid('A');
    expect(generatedUUID.length).toStrictEqual(45);
    generatedUUID = uuid('#');
    expect(generatedUUID.length).toStrictEqual(45);
  });
});
