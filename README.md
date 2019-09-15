# magic-import
Importing files in node.js sucks, because you have to edit every single `require()` call whenever you restructure your subdirectories.

The following code is boring and lame:

    const importantModule = require("../importantModule");
    const moduleInDir = require("./path/to/dir/ModuleInDir");

What if you could do something exciting and cool like:

	const {
		importantModule, 
		moduleInDir
	} = require("magic-import");

Well, now you can!

# Installation
 `npm install magic-import`

# Notes
**NOTE:** Due to the fact subdirectories are ignored when specifying modules, every module in your project MUST be named differently.
