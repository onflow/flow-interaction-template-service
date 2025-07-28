"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mixpanelTrack = mixpanelTrack;
const mixpanel_1 = __importDefault(require("mixpanel"));
let memoMixpanel;
function mixpanelTrack(...args) {
    if (process.env.MIXPANEL_TOKEN) {
        if (!memoMixpanel) {
            memoMixpanel = mixpanel_1.default.init(process.env.MIXPANEL_TOKEN);
        }
        memoMixpanel.track(...args);
    }
}
