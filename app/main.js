import fs from "fs";
import path from "path";

import { GitClient } from "./git/client.js";

// Commands

import { CatFileCommand } from "./git/commands/index.js";

console.error("Logs from your program will appear here!");

const gitclient = new GitClient();

function createGitDirectory() {
  fs.mkdirSync(path.join(process.cwd(), ".git"), { recursive: true });
  fs.mkdirSync(path.join(process.cwd(), ".git", "objects"), {
    recursive: true,
  });
  fs.mkdirSync(path.join(process.cwd(), ".git", "refs"), { recursive: true });

  fs.writeFileSync(
    path.join(process.cwd(), ".git", "HEAD"),
    "ref: refs/heads/main\n"
  );
  console.log("Initialized git directory");
}

const handleCatFileCommand = () => {
  const flag = process.argv[3];
  const commitSHA = process.argv[4];

  const command = new CatFileCommand(flag, commitSHA);
  gitclient.run(command);
};

const command = process.argv[2];

switch (command) {
  case "init":
    createGitDirectory();
    break;
  case "cat-file":
    handleCatFileCommand();
    break;
  default:
    throw new Error(`Unknown command ${command}`);
}
