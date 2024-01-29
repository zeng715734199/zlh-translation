import * as crypto from "crypto";
import * as p from "path";
import * as fs from "fs";
import * as inquirer from "inquirer";

// 计算 MD5
export const convertMd5 = (str: string) => crypto.createHash("md5").update(str).digest("hex");

//密钥id文件路径
export const filePath = p.join(__dirname, "private.js");

//输出错误函数
export const errorCb = (msg: Error | string) => {
  console.error(msg);
  process.exit(2);
};

//输出成功函数
export const successCb = (msg = "") => {
  console.log(msg || "✨ Success!");
  process.exit(0);
};

//写入private.ts文件（只读且不提交）
type SECRETINFO = { APP_ID: string; APP_SECRET: string };
export const writePrivateInfo = (filePath: string, { APP_ID, APP_SECRET }: SECRETINFO) => {
  //先删除再写入，防止重复写入
  fs.unlink(filePath, (err) => {
    const data = `exports.APP_ID = "${APP_ID}"` + "\n" + `exports.APP_SECRET = "${APP_SECRET}"`;
    fs.writeFile(filePath, data, { flag: "a+" }, (err) => {
      if (err) errorCb(err);
      //写入结束后再把它设置为只读
      fs.chmod(filePath, 0o400, (err) => (err ? errorCb(err) : successCb()));
    });
  });
};

//输入框
export const inputCommanderTemp = async ({
  name,
  message,
}: {
  name: string;
  message: string;
}): Promise<Record<string, string>> => {
  return inquirer.prompt({
    type: "input",
    name,
    message,
  });
};
