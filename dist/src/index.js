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
exports.stringify = exports.parse = exports.KSRT = void 0;
// SRT Parser
const srtParser = __importStar(require("srtparsejs"));
// Korus
const regex_1 = __importDefault(require("@korusbyanthm/regex"));
const removeComments = (src) => src.replace(/((?<!\\)#.{0,})\n/gi, "");
const defaultKSRTOptions = {
    // skipValidation: false,
    removeComments: true
};
/**
 * KSRT Class
 *
 * Handles parsing, stringifying and playing
 */
class KSRT {
    constructor(src, options) {
        this.ksrtData = [];
        this.options = defaultKSRTOptions;
        // Set the options and src string
        this.options = Object.assign(Object.assign({}, this.options), options);
        this.src = src;
        // Filter the data and normalize it
        let filteredData = src;
        filteredData = this.options.removeComments ? removeComments(filteredData) : filteredData;
        filteredData = filteredData.normalize("NFC");
        // Parse the filtered data
        this.srtArray = srtParser.parse(filteredData);
        // Parse the KSRT data
        for (let srt of this.srtArray) {
            // Create datas and annotations objects
            const datas = {};
            const annotations = {};
            // Create base text where text from the lyrics can be added
            let text = "";
            // Create base note 
            let note = "";
            // Split the text into lines (containing KSRT data and annotations)
            for (let textLine of srt.text.split("\n")) {
                // Split into argument and value (won't be used when treated as just text)
                const [_arg, val] = textLine.split(/\s/, 2);
                const arg = _arg.replace(/^(:|!)/, "");
                console.log(textLine, arg, val);
                if (textLine.match(/(?<!\\):/gim)) {
                    // Handle data
                    datas[arg] =
                        // Check if there is a value
                        (val === null || val === void 0 ? void 0 : val.length) >= 1 ?
                            // Split with ', '
                            val.split(/,\s/)
                                // Cast to a number if it's not an ID
                                .map(val => { var _a; return !regex_1.default.id(val) ? (_a = Number(val)) !== null && _a !== void 0 ? _a : val : val; }) :
                            // Use a true boolean if no value is provided
                            true;
                }
                else if (textLine.match(/(?<!\\)!/gim)) {
                    // Handle annotations
                    annotations[arg] =
                        // Check if there is a valud
                        (val === null || val === void 0 ? void 0 : val.length) >= 1 ?
                            // Split with ', '
                            val.split(/,\s/)
                                // Cast to a number if it's not an ID
                                .map(val => { var _a; return !regex_1.default.id(val) ? (_a = Number(val)) !== null && _a !== void 0 ? _a : val : val; }) :
                            // Use a true boolean if no value is provided
                            true;
                }
                else if (textLine.match(/(?<!\\)&/gim)) {
                    // Handle note
                    note += `${textLine.replace(/^&/, "")}\n`;
                }
                else {
                    // Handle just text
                    text += `${textLine}\n`;
                }
                ;
            }
            ;
            // Add the data to the array
            this.ksrtData.push(Object.assign(Object.assign({ endTime: srt.endTime, id: Number(srt.id), startTime: srt.startTime, text,
                note }, datas), annotations));
        }
        ;
    }
    ;
    /**
     * Stringify the data back into an SRT file
     */
    stringify() {
        return srtParser.toSrt(this.srtArray);
    }
    ;
}
exports.KSRT = KSRT;
;
/**
 * Alias for `new KSRT()`
 * @param src Text to parse
 * @returns {KSRT}
 */
const parse = (src) => new KSRT(src);
exports.parse = parse;
/**
 * Alias for `KSRT.stringify`
 * @param ksrt `KSRT` class object
 * @returns {string}
 */
const stringify = (ksrt) => ksrt.stringify();
exports.stringify = stringify;
exports.default = { KSRT, parse: exports.parse, stringify: exports.stringify };
