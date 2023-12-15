import * as https from "https";
import * as querystring from "querystring";
import { convertMd5, errorCb, filePath, successCb } from "./utils";
import * as fs from "fs";

//声明响应类型
type BaiduResponse = {
  error_code?: string;
  error_msg?: string;
  from: string;
  to: string;
  trans_result: {
    src: string;
    dst: string;
  }[];
};

//表驱动编程，errorMap就是一个表
const errorMap = {
  52000: "成功",
  52001: "请求超时",
  52002: "系统错误",
  52003: "用户未授权",
  54000: "必填参数为空",
  54001: "签名错误",
  54003: "访问频率受限",
  52004: "账户余额不足",
  52005: "长query请求频繁",
  58000: "客户端IP非法",
  58001: "译文语言方向不支持",
  58002: "当前服务器已关闭",
  90107: "认证未通过或者未生效",
};

export const translate = (word: string) => {
  let appId = "";
  let appSecret = "";
  if (fs.existsSync(filePath)) {
    const { APP_ID, APP_SECRET } = require(filePath);
    appId = APP_ID;
    appSecret = APP_SECRET;
  }

  const salt = Math.random(); //随机数
  const sign = convertMd5(`${appId + word + salt + appSecret}`); //sign 是appid+q+salt+密钥的md5值，为了不暴露这里先用???
  const reg = /^[A-Za-z]+$/;

  const query = querystring.stringify({
    q: word,
    from: reg.test(word) ? "en" : "zh",
    to: reg.test(word) ? "zh" : "en",
    appid: appId,
    salt,
    sign,
  });

  const options = {
    hostname: "fanyi-api.baidu.com",
    port: 443,
    path: "/api/trans/vip/translate?" + query,
    method: "GET",
  };

  const request = https
    .request(options, (response) => {
      const chunks = [] as Buffer[];
      response.on("data", (chunk) => {
        chunks.push(chunk);
      });
      response.on("end", () => {
        const string = Buffer.concat(chunks).toString();
        const response: BaiduResponse = JSON.parse(string);
        response.error_code
          ? errorCb(
              (errorMap as Record<string, string>)[response.error_code] ||
                (response.error_msg as string),
            )
          : successCb(`${response.trans_result["0"].src}: ${response.trans_result["0"].dst}`); //0表示没有错误，即成功
      });
    })
    .on("error", (e) => {
      console.error(e);
    });
  request.end();
};
