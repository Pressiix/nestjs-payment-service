const configs: Record<string, string> = {
  ['CURRENCY']: 'THB',
};

export const setCustomConfig = (key: string, value?: string) => {
  configs[key] = value;
};

export const MockConfigService = {
  get: jest.fn().mockImplementation((key: string) => configs[key] ?? null),
};
