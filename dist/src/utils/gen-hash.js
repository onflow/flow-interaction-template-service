"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.genHash = genHash;
const sha3_1 = require("sha3");
async function genHash(utf8String) {
    const sha = new sha3_1.SHA3(256);
    sha.update(Buffer.from(utf8String, "utf8"));
    return sha.digest("hex");
}
