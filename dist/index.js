"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fromGenius = exports.stringify = exports.parse = exports.KSRT = void 0;
const srtParser = __importStar(require("srtparsejs"));
const regex_1 = __importDefault(require("@korusbyanthm/regex"));
const removeComments = (src) => src.replace(/((?<!\\)#.{0,})\n/gi, "");
const defaultKSRTOptions = {
    removeComments: true
};
class KSRT {
    constructor(src, options) {
        this.srtArray = [];
        this.ksrtData = [];
        this.options = defaultKSRTOptions;
        this.options = Object.assign(Object.assign({}, this.options), options);
        this.src = src;
        src && this.parse();
    }
    ;
    add(...ksrt) {
        for (let [index, srt] of ksrt.entries())
            srt.id = this.ksrtData.length + index;
        this.ksrtData.push(...ksrt);
        return this.ksrtData;
    }
    ;
    parse(src) {
        var _a;
        let filteredData = src !== null && src !== void 0 ? src : this.src;
        filteredData = this.options.removeComments ? removeComments(filteredData) : filteredData;
        filteredData = filteredData.normalize("NFC");
        this.srtArray = srtParser.parse(filteredData);
        for (let srt of this.srtArray) {
            const data = {};
            const annotations = {};
            let text = "";
            let note = "";
            for (let textLine of srt.text.split("\n")) {
                const dataTarget = textLine.match(/^(?<!\\):/gim) ? data :
                    textLine.match(/^(?<!\\)!/gim) ? annotations :
                        null;
                if (dataTarget) {
                    const line = `${textLine.replace(/^(?<!\\):|!/, "")}`;
                    const [arg, ...vals] = line.split(" ");
                    const realVals = vals.map(val => val.replace(/,$/gim, "")).map(val => !regex_1.default.id(val) ? isNaN(Number(val)) ? val : Number(val) : val);
                    dataTarget[arg] = realVals.length > 1 ? realVals : (_a = realVals[0]) !== null && _a !== void 0 ? _a : true;
                }
                else if (textLine.match(/(?<!\\)&/gim)) {
                    note += `${textLine.replace(/^&\s/, "")}\n`;
                }
                else {
                    text += `${textLine}\n`;
                }
                ;
            }
            ;
            this.ksrtData.push({
                endTime: srt.endTime,
                id: Number(srt.id),
                startTime: srt.startTime,
                text: text.replace(/\n$/im, ""),
                note,
                data,
                annotations,
            });
        }
        ;
    }
    ;
    stringify() {
        let res = "";
        for (let ksrt of this.ksrtData) {
            res += `${ksrt.id.toString()}\n`;
            res += `${ksrt.startTime} --> ${ksrt.endTime}\n`;
            let text = "";
            text += ksrt.text ? `${ksrt.text}\n` : "";
            text += ksrt.note ? `& ${ksrt.note}\n` : "";
            for (let [arg, val] of Object.entries(ksrt.data)) {
                text += `:${arg} ${Array.isArray(val) ? val.join(", ") : val === true ? "" : val}\n`;
            }
            ;
            for (let [arg, val] of Object.entries(ksrt.annotations)) {
                text += `!${arg} ${Array.isArray(val) ? val.join(", ") : val === true ? "" : val}\n`;
            }
            ;
            text += "\n";
            res += text;
        }
        ;
        return res;
    }
    ;
}
exports.KSRT = KSRT;
;
const parse = (src) => new KSRT(src);
exports.parse = parse;
const stringify = (ksrt) => ksrt.stringify();
exports.stringify = stringify;
const fromGenius = (geniusLyrics) => {
    const res = new KSRT();
    const lyricLines = geniusLyrics.split(/\n/gim);
    const singers = [];
    for (let [index, lyricLine] of lyricLines.entries()) {
        if (lyricLine.startsWith("[") ||
            !lyricLine.match(/./gim))
            continue;
        res.add({
            id: index,
            text: lyricLine,
            startTime: "00:00:00,00",
            endTime: "00:00:00,00",
            data: {},
            annotations: Object.assign({}, (function () {
                if (typeof lyricLines[index - 1] === "string" &&
                    lyricLines[index - 1].startsWith("[")) {
                    const [part, singer] = lyricLines[index - 1].replace(/^\[|\]$/gi, "").split(": ", 2);
                    !singers.includes(singer) ? singers.push(singer) : void 0;
                    return {
                        annotations: {
                            part: part.toLowerCase(),
                            singer: [
                                singers.indexOf(singer),
                            ]
                        }
                    };
                }
                return {};
            }()))
        });
    }
    ;
    return res;
};
exports.fromGenius = fromGenius;
const ksrt = {
    KSRT,
    parse: exports.parse,
    stringify: exports.stringify,
    fromGenius: exports.fromGenius
};
exports.default = ksrt;
