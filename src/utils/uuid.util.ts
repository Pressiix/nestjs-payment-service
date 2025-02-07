import { v4 as uuidv4 } from 'uuid';

export default (char?: string) => {
  const randomCharGroup = char ? char : 'aA#';
  return (uuidv4() + '-' + randomString(8, randomCharGroup)).substring(0, 45);
};

function randomString(length: number, chars: string) {
  let mask = '';
  if (chars.indexOf('a') > -1) mask += 'abcdefghijklmnopqrstuvwxyz';
  if (chars.indexOf('A') > -1) mask += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  if (chars.indexOf('#') > -1) mask += '0123456789';
  let result = '';
  for (let i = length; i > 0; --i) {
    result += mask[Math.round(Math.random() * (mask.length - 1))];
  }
  return result;
}
