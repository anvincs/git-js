import path from "path";
import fs from "fs";
import crypto from "crypto";
import zlib from "zlib";

class WriteTreeCommand {
  constructor() {}

  execute() {
    // 1. Recursively read the contents of the current directory and its subdirectories.
    // 2. If item is a directory, do it recursively.
    // 3. If item is a file, create a blob object, write the hash and file to .git/objects directory and write the entry to tree

    function recursiveCreateTree(basePath) {
      const dirContents = fs.readdirSync(basePath);

      const result = [];

      for (const dirContent of dirContents) {
        // Ignore .git directory
        if (dirContent.includes(".git")) {
          continue;
        }

        const currentPath = path.join(basePath, dirContent);
        const stats = fs.statSync(currentPath);

        if (stats.isDirectory()) {
          const sha = recursiveCreateTree(currentPath);
          result.push({
            mode: "40000",
            basename: path.basename(currentPath),
            sha,
          });
        } else if (stats.isFile()) {
          const sha = writeFileBlob(currentPath);
          result.push({
            mode: "100644",
            basename: path.basename(currentPath),
            sha,
          });
        }
      }

      if (dirContents.length === 0 || result.length === 0) {
        return null;
      }

      const treeData = result.reduce((acc, curr) => {
        const { mode, basename, sha } = curr;
        return Buffer.concat([
          acc,
          Buffer.from(`${mode} ${basename}\0`),
          Buffer.from(sha, "hex"),
        ]);
      }, Buffer.alloc(0));

      const tree = Buffer.concat([
        Buffer.from(`tree ${treeData.length}\0`),
        treeData,
      ]);

      const hash = crypto.createHash("sha1").update(tree).digest("hex");

      const folder = hash.slice(0, 2);
      const file = hash.slice(2);

      const treeFolderPath = path.join(
        process.cwd(),
        "test-.git-dir",
        "objects",
        folder
      );

      if (!fs.existsSync(treeFolderPath)) {
        fs.mkdirSync(treeFolderPath);
      }

      const compressedTree = zlib.deflateSync(tree);
      fs.writeFileSync(path.join(treeFolderPath, file), compressedTree);

      return hash;
    }

    const sha = recursiveCreateTree(process.cwd());

    console.log(sha);
  }
}

function writeFileBlob(currentPath) {
  const fileContents = fs.readFileSync(currentPath);
  const fileLength = fileContents.length;

  // 3. Create blob
  const blobHeader = `blob ${fileLength}\0`;
  const blob = Buffer.concat([Buffer.from(blobHeader), fileContents]);

  // 4. Calculate hash
  const hash = crypto.createHash("sha1").update(blob).digest("hex");

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

  return hash;
}

export { WriteTreeCommand };
