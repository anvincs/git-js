import path from "path";
import fs from "fs";
import crypto from "crypto";
import zlib from "zlib";

class CommitTreeCommand {
  constructor(treeSHA, commitSHA, commitMessage) {
    this.treeSHA = treeSHA;
    this.commitSHA = commitSHA;
    this.commitMessage = commitMessage;
  }

  execute() {
    const commitContentBuffer = Buffer.concat([
      Buffer.from(`tree ${this.treeSHA}\n`),
      Buffer.from(`parent ${this.commitSHA}\n`),
      Buffer.from(`author: author_name author@email.com ${Date.now()} +0000\n`),
      Buffer.from(
        `committer: committer_name committer@email.com ${Date.now()} +0000\n\n`
      ),
      Buffer.from(`${this.commitMessage}\n`),
    ]);

    const header = Buffer.from(`commit ${commitContentBuffer.length}\n`);
    const commit = Buffer.concat([header, commitContentBuffer]);

    const hash = crypto.createHash("sha1").update(commit).digest("hex");

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

    console.log(hash);
  }
}

export { CommitTreeCommand };
