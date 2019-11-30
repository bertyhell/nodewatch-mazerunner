"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const tempDir = path_1.default.join(__dirname, 'temp');
const filesNames = fs_extra_1.default.readdirSync(tempDir);
const fileContents = {};
filesNames.forEach((fileName) => {
    if (/.*\.js$/g.test(fileName)) {
        let fileContent = fs_extra_1.default.readFileSync(path_1.default.join(tempDir, fileName)).toString();
        fileContent = fileContent.replace(/^export /gm, '');
        fileContents[fileName.replace(/\.js$/, '')] = fileContent;
    }
});
let bangleJsContent = fileContents.bangle;
while (bangleJsContent.includes('import ')) {
    bangleJsContent = bangleJsContent.replace(/import [a-zA-Z0-9\-{}\s,]+ from '([^']+)';/g, (match, importFrom, offset, text) => {
        const importFile = importFrom.split('/').pop() || '';
        if (!importFile || !fileContents[importFile]) {
            console.error(`Failed to build file. Cannot find file to replace import statement: "${match}"`);
            return '';
        }
        else {
            return fileContents[importFile];
        }
    });
}
bangleJsContent = bangleJsContent.replace(/^\/\/.*?$/gm, '');
const outputPath = path_1.default.join(__dirname, 'dist/bangle.js');
fs_extra_1.default.ensureFileSync(outputPath);
fs_extra_1.default.writeFileSync(outputPath, bangleJsContent);
console.log('Wrote file: ' + path_1.default.join(__dirname, 'dist/bangle.js'));
//# sourceMappingURL=build-bangle.js.map