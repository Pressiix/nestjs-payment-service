export const testCasesFor = (classMethod: string): string => `Test cases for ${classMethod}`;
export const shouldReturnSuccessFor = (classMethod: string): string =>
  `Should return a success result for ${classMethod}`;
export const shouldThrowExceptionCodeFrom = (classMethod: string, errorCode: number): string =>
  `Should throw an exception code ${errorCode} from ${classMethod}`;
export const shouldThrowExceptionFrom = (classMethod: string): string =>
  `Should thrown an exception from ${classMethod}`;
