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
        var _a;
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
            const data = {};
            const annotations = {};
            // Create base text where text from the lyrics can be added
            let text = "";
            // Create base note 
            let note = "";
            // Split the text into lines (containing KSRT data and annotations)
            for (let textLine of srt.text.split("\n")) {
                const dataTarget = 
                // If the line starts with a colon (:) and is not preceeded by a \, it's data
                textLine.match(/^(?<!\\):/gim) ? data :
                    // If the line starts with an exclamation mark (!) and is not proceeded by a \, it's an annotation
                    textLine.match(/^(?<!\\)!/gim) ? annotations :
                        null;
                if (dataTarget) {
                    // Replace the start prefix of the line (arg)
                    const line = `${textLine.replace(/^(?<!\\):|!/, "")}`;
                    const [arg, ...vals] = line.split(" ");
                    const realVals = vals.map(val => val.replace(/,$/gim, "")).map(val => !regex_1.default.id(val) ? isNaN(Number(val)) ? val : Number(val) : val);
                    dataTarget[arg] = realVals.length > 1 ? realVals : (_a = realVals[0]) !== null && _a !== void 0 ? _a : true;
                }
                else if (textLine.match(/(?<!\\)&/gim)) {
                    // Handle note
                    note += `${textLine.replace(/^&\s/, "")}\n`;
                }
                else {
                    // Handle just text
                    text += `${textLine}\n`;
                }
                ;
            }
            ;
            // Add the data to the array
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
    /**
     * Stringify the data back into an SRT string
     */
    stringify() {
        // Create result string
        let res = "";
        // Stringify each KSRT script
        for (let ksrt of this.ksrtData) {
            // Add the stringified id
            res += `${ksrt.id.toString()}\n`;
            // Add the start and end times
            res += `${ksrt.startTime} --> ${ksrt.endTime}\n`;
            // Create text string where text, datas, notes and annotations will be added
            let text = "";
            // Add the text if any
            text += ksrt.text ? `${ksrt.text}\n` : "";
            // Add the note to the text
            text += ksrt.note ? `& ${ksrt.note}\n` : "";
            // Encode data into a string and add it to the text
            for (let [arg, val] of Object.entries(ksrt.data)) {
                text += `:${arg} ${Array.isArray(val) ? val.join(", ") : val === true ? "" : val}\n`;
            }
            ;
            // Encode annotations into a string and add it to the text
            for (let [arg, val] of Object.entries(ksrt.annotations)) {
                text += `!${arg} ${Array.isArray(val) ? val.join(", ") : val === true ? "" : val}\n`;
            }
            ;
            // Add a final new line to the text to separate from other scripts
            text += "\n";
            // Add the text to the result
            res += text;
        }
        ;
        return res;
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
