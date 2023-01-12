import fs from "node:fs";
import path from "node:path"
import KSRT from "../src";
import * as srtParser from 'srtparsejs';

const fd = fs.readFileSync(path.join(__dirname, "./test.ksrtx"), {encoding: "utf-8"});

// const data = srtParser.parse(fd);
const data = KSRT.parse(fd);

console.log(data.ksrtData)

const stringified = data.stringify();

console.log(stringified);