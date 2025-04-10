import fs from "fs";
import path from "path";

import { GitClient } from "./git/client.js";

// Commands
import {
  CatFileCommand,
  HashObjectCommand,
  LSTreeCommand,
  WriteTreeCommand,
} from "./git/commands/index.js";

const gitclient = new GitClient();

const command = process.argv[2];

switch (command) {
  case "init":
    createGitDirectory();
    break;
  case "cat-file":
    handleCatFileCommand();
    break;
  case "hash-object":
    handleHashObjectCommand();
    break;
  case "ls-tree":
    handleLSTreeCommand();
    break;
  case "write-tree":
    handleWriteTreeCommand();
    break;
  default:
    throw new Error(`Unknown command ${command}`);
}

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

function handleCatFileCommand() {
  const flag = process.argv[3];
  const commitSHA = process.argv[4];

  const command = new CatFileCommand(flag, commitSHA);
  gitclient.run(command);
}

function handleHashObjectCommand() {
  let flag = process.argv[3];
  let filePath = process.argv[4];

  if (!filePath) {
    filePath = flag;
    flag = null;
  }

  const command = new HashObjectCommand(flag, filePath);
  gitclient.run(command);
}

function handleLSTreeCommand() {
  let flag = process.argv[3];
  let sha = process.argv[4];

  if (!sha && flag == "--name-only") {
    return;
  }

  if (!sha) {
    sha = flag;
    flag = null;
  }

  const command = new LSTreeCommand(flag, sha);
  gitclient.run(command);
}

function handleWriteTreeCommand() {
  const command = new WriteTreeCommand();
  gitclient.run(command);
}
