import * as crypto from 'crypto'

// 计算 MD5
export const convertMd5 = (str: string) =>
    crypto.createHash('md5').update(str).digest('hex');
