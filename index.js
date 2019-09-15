/* Magic Import
 *
 * Automagically import files with simpler syntax, ignoring subdirectories in
 * nodejs. ALL FILENAMES MUST BE UNIQUE!
 *
 * Use:
 *
 *    const { Module, ModuleSubDir } = require("magic-import");
 *
 * instead of:
 *
 *   const Module = require("./Module"),
 *   const ModuleSubDir = require("./path/to/file/ModuleSubDir");
 */

/* Imports
 */
const fs = require("fs");
const path = require("path");

/* Helpers
 */
// returns true if dir contains /node_modules/
const isNodeModules = dir => {
  return `${dir}/`.match(/[\/\\]node_modules[\/\\]/);
};
// returns absolute filepath from dir & file
const getFilepath = (dir, file) => {
  return path.join(dir, file);
};
// returns true if filepath references a directory
const isDirectory = filepath => {
  return fs.statSync(filepath).isDirectory();
};
// returns true if filepath references a javascript/json file
const isJavascriptFile = filepath => {
  return [".js", ".json"].includes(path.extname(filepath));
};
// returns the file key (the filename without an extension)
const getFileKey = filepath => {
  return path
    .basename(filepath)
    .replace(new RegExp(`${path.extname(filepath)}$`), "");
};

/* Initial Setup
 */
const filepathsByKey = {};
const dir = process.cwd();

/* Read all the javascript files in this directory and below it
 */
const filepaths = (function* walker(dir) {
  // ignore /node_modules/
  if (isNodeModules(dir)) return;

  // walk through directories recursively
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filepath = getFilepath(dir, file);

    if (isDirectory(filepath)) {
      yield* walker(filepath);
      continue;
    }

    if (isJavascriptFile(filepath)) {
      yield filepath;
      continue;
    }
  }
})(dir);

/* Add all paths to filepathsByKey
 * eg. filepathsByKey["Filename"] = "FileName.js";
 */
for (let filepath of filepaths) {
  const key = getFileKey(filepath);
  filepathsByKey[key] = filepath;
}

/* Use a proxy to require the filepath and return the module
 * when a property is requested on filepathsByKey object
 */
const proxy = new Proxy(filepathsByKey, {
  get(filepathsByKey, key) {
    const path = filepathsByKey[key];
    return path ? require(path) : undefined;
  }
});

/* Exports
 */
module.exports = proxy;
