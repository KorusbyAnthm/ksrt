"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
const src_1 = __importDefault(require("../src"));
const fd = node_fs_1.default.readFileSync(node_path_1.default.join(__dirname, "./test.ksrtx"), { encoding: "utf-8" });
const data = src_1.default.parse(fd);
console.log(data.ksrtData);
const stringified = data.stringify();
console.log(stringified);
