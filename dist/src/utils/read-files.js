"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.readFiles = readFiles;
const glob_1 = require("glob");
const fs_1 = __importDefault(require("fs"));
function readFiles(pattern) {
    return new Promise((res, rej) => {
        try {
            (0, glob_1.glob)(pattern, {}).then((paths) => {
                const fileReadPromises = paths.map((path) => new Promise((fsRes, fsRej) => {
                    try {
                        fs_1.default.readFile(path, "utf8", function (err, data) {
                            if (err) {
                                fsRej(err);
                                return;
                            }
                            const file = {
                                path,
                                content: data,
                            };
                            fsRes(file);
                        });
                    }
                    catch (e) {
                        fsRej(e);
                    }
                }));
                return Promise.all(fileReadPromises).then((files) => res(files));
            }).catch(rej);
        }
        catch (e) {
            rej(e);
        }
    });
}
