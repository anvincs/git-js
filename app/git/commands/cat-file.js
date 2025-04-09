import path from "path";
import fs from "fs";
import zlib from "zlib";

class CatFileCommand {
  constructor(flag, commitSHA) {
    this.flag = flag;
    this.commitSHA = commitSHA;
  }

  execute() {
    // Navigate to .git/objects/commitSHA[0..2]
    // Read the file .git/objects/commitSHA[0..2]/commitSHA[2..]
    // Decompress the file

    switch (this.flag) {
      case "-p":
        {
          const folder = this.commitSHA.slice(0, 2);
          const file = this.commitSHA.slice(2);

          const completePath = path.join(
            process.cwd(),
            "test-.git-dir",
            "objects",
            folder,
            file
          );

          if (!fs.existsSync(completePath)) {
            throw new Error(`Not a valid object name ${completePath}`);
          }

          const fileContents = fs.readFileSync(completePath);

          const outputBuffer = zlib.inflateSync(fileContents);
          const output = outputBuffer.toString();

          console.log(output);
        }
        break;
      default:
        throw new Error(`Unknown flag ${this.flag}`);
    }
  }
}

export { CatFileCommand };
