import path from "path";
import fs from "fs";
import crypto from "crypto";
import zlib from "zlib";

class HashObjectCommand {
  constructor(flag, filePath) {
    this.flag = flag;
    this.filePath = filePath;
  }

  execute() {
    // 1. Make sure the file exists

    const completePath = path.resolve(this.filePath);

    if (!fs.existsSync(completePath)) {
      throw new Error(
        `Could not open ${completePath} for reading: No such file or directory`
      );
    }

    // 2. Read the file
    const fileContents = fs.readFileSync(completePath);
    const fileLength = fileContents.length;

    // 3. Create blob
    const blobHeader = `blob ${fileLength}\0`;
    const blob = Buffer.concat([Buffer.from(blobHeader), fileContents]);

    // 4. Calculate hash
    const hash = crypto.createHash("sha1").update(blob).digest("hex");

    // 5. If the flag is -w, write the file
    if (this.flag && this.flag === "-w") {
      const folder = hash.slice(0, 2);
      const file = hash.slice(2);

      const completeFolderPath = path.join(
        process.cwd(),
        "test-.git-dir",
        "objects",
        folder
      );

      if (!fs.existsSync(completeFolderPath)) {
        fs.mkdirSync(completeFolderPath, { recursive: true });
      }

      const compressedBlob = zlib.deflateSync(blob);

      fs.writeFileSync(path.join(completeFolderPath, file), compressedBlob);
    }

    console.log(hash);
  }
}

export { HashObjectCommand };
