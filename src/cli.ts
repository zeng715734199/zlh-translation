#!/usr/bin/env node
import { Command } from "commander";
import { translate } from "./main";
import * as fs from "fs";
import * as inquirer from "inquirer";
import { chooseOriginPlatform, errorCb, filePath, writePrivateInfo, inputTemp } from "./utils";

const program = new Command();
program.option("-i, --init", "Initialize appid and app_secret");

program
  .version("0.0.1")
  .name("fy")
  .usage("<English>")
  .description("You must initialize the 'fy' command before using it.");

if (!process.argv[2]) process.exit(2);

if (["-i", "--init"].includes(process.argv[2])) {
  const choices = [{ name: "百度（目前只支持百度）", value: "baidu" }];
  chooseOriginPlatform(choices).then(({ key }) => {
    if (key === "baidu") {
      inputTemp({ name: "APP_ID", message: "请输入appid：" }).then(({ APP_ID }) => {
        if (!APP_ID) errorCb("APP_ID is necessary!");
        inputTemp({ name: "APP_SECRET", message: "请输入密钥：" }).then(({ APP_SECRET }) => {
          if (!APP_SECRET) errorCb("APP_SECRET is necessary!");
          //写入id、密钥
          writePrivateInfo(filePath, { APP_ID, APP_SECRET });
        });
      });
    }
  });
} else {
  //存在，进行翻译
  fs.existsSync(filePath)
    ? translate(process.argv[2])
    : errorCb("You must use -i or --init command to initialize before this!");
}

program.parse(process.argv);
