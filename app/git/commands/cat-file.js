class CatFileCommand {
  constructor(flag, commitSHA) {
    this.flag = flag;
    this.commitSHA = commitSHA;
  }

  execute() {
    console.log({ flag: this.flag, commitSHA: this.commitSHA });
  }
}

export { CatFileCommand };
