import path from "path";
import fs from "fs";
import zlib from "zlib";

class LSTreeCommand {
  constructor(flag, sha) {
    this.flag = flag;
    this.sha = sha;
  }

  execute() {
    const folder = this.sha.slice(0, 2);
    const file = this.sha.slice(2);

    const folderPath = path.join(process.cwd(), ".git", "objects", folder);

    const filePath = path.join(folderPath, file);

    if (!fs.existsSync(folderPath) || !fs.existsSync(filePath)) {
      throw new Error(`Not a valid object name ${this.sha}`);
    }

    const fileContents = fs.readFileSync(filePath);

    const outputBuffer = zlib.inflateSync(fileContents);
    const output = outputBuffer.toString().split("\0");

    const treeContent = output.slice(1).filter((e) => e.includes(" "));
    const names = treeContent.map((e) => e.split(" ")[1]);

    const mode = treeContent.map((e) => e.split(" ")[0]);
    // needs to be fixed

    names.forEach((name) => console.log(name));
  }
}

export { LSTreeCommand };
