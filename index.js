/* Magic Import
 *
 * Automagically import files with simpler syntax, ignoring subdirectories in
 * nodejs.
 *
 * There are two caveats:
 *
 * 1. All filenames must be unique
 * 2. require("magic-import") must be called in the root directory before
 *    anywhere else
 *
 * Type:
 *
 *    const { FileName, FileNameSubDir } = require("magic-import");
 *
 * instead of:
 *
 *   const FileName = require("./Filename"),
 *   const FileNameSubDir = require("./path/to/file/FileNameSubDir");
 */

/* Imports
 */
const fs = require("fs");
const path = require("path");

/* Setup/Config
 */
const filesByKey = {};
const dir = __dirname;
const extensions = [".js", ".json"];

/* Read all the .js/.json files in this directory and below it
 */
const files = (function* walker(dir) {
   const files = fs.readdirSync(dir);

   for (const file of files) {
      const pathToFile = path.join(dir, file);
      const isDirectory = fs.statSync(pathToFile).isDirectory();
      if (isDirectory) {
         yield* walker(pathToFile);
         continue;
      }

      yield pathToFile;
   }
})(dir);

/* Add all paths to object in form key => pathToFile
 * eg. Filename => FileName.js
 */
for (let pathToFile of files) {
   const filename = path.basename(pathToFile);
   const extension = path.extname(pathToFile);
   const key = filename.replace(extension, "");

   filesByKey[key] = pathToFile;
}

/* Use a proxy to require the filepath and return the module
 * when a property is requested on filesByKey object
 */
const proxy = new Proxy(filesByKey, {
   get: (filesByKey, key) => {
      const path = filesByKey[key];
      return path ? require(path) : undefined;
   }
});

/* Exports
 */
module.exports = proxy;
