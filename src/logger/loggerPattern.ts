export interface PatternReplaceLog {
  isPattern: (key: string) => boolean;
  mapPattern: (value: string) => string;
}

class startPasswordPattern implements PatternReplaceLog {
  isPattern(key: string) {
    const isDatePattern = /^password\w*/i;
    return isDatePattern.test(key);
  }

  mapPattern(value: any) {
    return '****';
  }
}

class endPasswordPattern implements PatternReplaceLog {
  isPattern(key: string) {
    const isDatePattern = /\w+Password$/i;
    return isDatePattern.test(key);
  }

  mapPattern(value: any) {
    return '****';
  }
}

class cidPattern implements PatternReplaceLog {
  isPattern(key: string) {
    const isCID = /^cid$/i;
    return isCID.test(key);
  }

  mapPattern(value: any) {
    const cid = value as string;
    return cid.substr(0, 7) + 'XXXXX' + cid.substr(12);
  }
}

class defaultPattern implements PatternReplaceLog {
  isPattern(key: string) {
    return true;
  }

  mapPattern(value: any) {
    return value;
  }
}

const patterns: PatternReplaceLog[] = [
  new startPasswordPattern(),
  new endPasswordPattern(),
  new cidPattern(),
  new defaultPattern(),
];

export const addPattern = (pattern: PatternReplaceLog) => {
  patterns.splice(0, 0, pattern);
};

export const replace = (key: string, value: any) => {
  return patterns.filter((p) => p.isPattern(key)).map((p) => p.mapPattern(value))[0];
};
