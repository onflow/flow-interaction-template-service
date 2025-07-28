"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.writeFile = writeFile;
const fs_1 = __importDefault(require("fs"));
async function writeFile(path, content) {
    return new Promise((res, rej) => {
        fs_1.default.writeFile(path, content, {
            encoding: "utf8",
            flag: "w",
            mode: 0o666,
        }, (err) => {
            if (err)
                rej(err);
            else {
                res();
            }
        });
    });
}
