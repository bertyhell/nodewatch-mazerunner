import fs from 'fs';
import path from 'path';

const tempDir = path.join(__dirname, 'temp');
const filesNames: string[] = fs.readdirSync(tempDir);
const fileContents: { [filename: string]: string } = {};
filesNames.forEach((fileName: string) => {
	if (/.*\.js$/g.test(fileName)) {
		let fileContent = fs.readFileSync(path.join(tempDir, fileName)).toString();
		fileContent = fileContent.replace(/^export /gm, '');
		fileContents[fileName.replace(/\.js$/, '')] = fileContent;
	}
});

let bangleJsContent: string = fileContents.bangle;
while(bangleJsContent.includes('import ')) {
	bangleJsContent = bangleJsContent.replace(/import [a-zA-Z0-9\-{}\s,]+ from '([^']+)';/g, (match: string, importFrom: string, offset: number, text: string) => {
		const importFile = importFrom.split('/').pop() || '';
		if (!importFile || !fileContents[importFile]) {
			console.error(`Failed to build file. Cannot find file to replace import statement: "${match}"`);
			return '';
		} else {
			return fileContents[importFile];
		}
	});
}

// Remove comments
bangleJsContent = bangleJsContent.replace(/^\/\/.*?$/gm, '');

const outputPath = path.join(__dirname, 'dist/bangle.js');
fs.writeFileSync(outputPath, bangleJsContent);
console.log('Wrote file: ' + path.join(__dirname, 'dist/bangle.js'));



