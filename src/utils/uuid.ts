import Adler32 from 'adler32-js';
import crc32c from 'crc-32/crc32c';
import fnv1a from 'fnv1a';

const adlerHash = new Adler32();

export enum UUID_ALGO {
  'adler32' = 'adler32',
  'fnv1a' = 'fnv1a',
  'crc32c' = 'crc32c',
}

export const uuidFromString = (namespace: string, seed: string, algo = UUID_ALGO.fnv1a): string => {
  if (algo === UUID_ALGO.adler32) {
    adlerHash.reset();
    adlerHash.update(`${namespace}:${seed}`);
    return adlerHash.digest('hex');
  } else if (algo === UUID_ALGO.fnv1a) {
    return fnv1a(namespace).toString(16) + fnv1a(`${namespace}:${seed}`).toString(16);
  } else if (algo === UUID_ALGO.crc32c) {
    return (crc32c.str(`${namespace}:${seed}`) >>> 0).toString(16);
  }
};
