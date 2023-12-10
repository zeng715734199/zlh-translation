import * as crypto from 'crypto'
import * as https from "https";
import * as querystring from "querystring";
import {appId, appSecret} from "./private";

//声明响应类型
type BaiduResponse = {
    error_code?: string;
    error_msg?: string;
    from: string;
    to: string;
    trans_result: {
        src: string;
        dst: string;
    }[]
}


// 计算 MD5
const convertMd5 = (str: string) =>
    crypto.createHash('md5').update(str).digest('hex');

export const translate = (word: string) => {
    const salt = Math.random() //随机数
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
            const string = Buffer.concat(chunks).toString()
            const response: BaiduResponse = JSON.parse(string)
            //错误处理，有错误码就打出错误信息，没有就打出结果
            if (response.error_code) {
                console.error(response.error_msg)
                process.exit(2)  //报错的话，退出进程，这个code只要不是0即可
            } else {
                console.log(response.trans_result['0'].dst)
                process.exit(0)  //0表示没有错误，即成功
            }
        })
    }).on('error', (e) => {
        console.error(e);
    });
    request.end()
}
