import * as https from "https";
import * as querystring from "querystring";
import {appId, appSecret} from "./private";
import {convertMd5} from "./utils";

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

//表驱动编程，errorMap就是一个表
const errorMap = {
    52000: '成功',
    52001: '请求超时',
    52002: '系统错误',
    52003: '用户未授权',
    54000: '必填参数为空',
    54001: '签名错误',
    54003: '访问频率受限',
    52004: '账户余额不足',
    52005: '长query请求频繁',
    58000: '客户端IP非法',
    58001: '译文语言方向不支持',
    58002: '当前服务器已关闭',
    90107: '认证未通过或者未生效',
    unknown: '服务器繁忙'
}

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
            if (response.error_code) {
                //errorMap里有，就输出错误码对应的中文提示
                console.error(errorMap[response.error_code] || response.error_msg)
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
