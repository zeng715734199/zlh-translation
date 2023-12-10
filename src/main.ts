import * as crypto from 'crypto'
import * as https from "https";
import * as querystring from "querystring";
import {appId, appSecret} from "./private";


// 计算 MD5
const convertMd5 = (str: string) =>
    crypto.createHash('md5').update(str).digest('hex');

export const translate = (word: string) => {
    const salt = 1435660288 //随机数
    const sign = convertMd5(`${appId + word + salt + appSecret}`)    //sign 是appid+q+salt+密钥的md5值，为了不暴露这里先用???
    const query = querystring.stringify({
        q: word,
        from: 'en',
        to: 'zh',
        appid: appId,
        salt,
        sign
    })

    const options = {
        hostname: 'fanyi-api.baidu.com',
        port: 443,
        path: '/api/trans/vip/translate?' + query,
        method: 'GET'
    };
    const request = https.request(options, (response) => {
        const chunks = [] as Buffer[]
        response.on('data', (chunk) => {
            chunks.push(chunk)
        });
        response.on('end', () => {
            const response = Buffer.concat(chunks).toString()
            console.log(response, 'response')
        })
    }).on('error', (e) => {
        console.error(e);
    });
    request.end()
}
