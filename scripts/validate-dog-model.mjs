import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const relPath = "public/assets/models/dog/jackrussell-doggerz.glb";
const absPath = path.resolve(root, relPath);

console.log("Doggerz model validator");
console.log("-----------------------");
console.log("Working directory:", root);
console.log("Expected model path:", absPath);
console.log("");

if (!fs.existsSync(absPath)) {
  console.error("FAIL: Dog model file is missing.");
  console.error(`Expected at: ${relPath}`);
  process.exit(1);
}

const stat = fs.statSync(absPath);

if (!stat.isFile()) {
  console.error("FAIL: Path exists, but it is not a file.");
  process.exit(1);
}

if (stat.size <= 0) {
  console.error("FAIL: File exists, but it is empty.");
  process.exit(1);
}

const fd = fs.openSync(absPath, "r");
const header = Buffer.alloc(4);
fs.readSync(fd, header, 0, 4, 0);
fs.closeSync(fd);

const headerText = header.toString("utf8");

console.log("PASS: Dog model file exists.");
console.log("File size:", stat.size, "bytes");
console.log("Header:", JSON.stringify(headerText));

if (headerText !== "glTF") {
  console.warn("");
  console.warn('WARNING: File exists, but header is not "glTF".');
  console.warn("It may still be the wrong file or a bad export.");
  process.exit(2);
}

console.log("");
console.log("PASS: GLB header looks valid.");
process.exit(0);
