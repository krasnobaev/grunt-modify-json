/*
 * grunt-modify-json
 * https://github.com/aarongloege/grunt-modify-json
 *
 * Copyright (c) 2014 Aaron Gloege
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

    // Please see the Grunt documentation for more information regarding task
    // creation: http://gruntjs.com/creating-tasks

    grunt.registerMultiTask('modify_json', 'Add or update properties of a JSON file', function() {
        // Merge task-specific and/or target-specific options with these defaults.
        var options = this.options({
            fields: {},
            add: false,
            indent: 4
        });

        // Iterate over all specified file groups.
        this.files.forEach(function(f) {
            f.src
                .filter(function(filepath) {
                    // Warn on and remove invalid source files (if nonull was set).
                    if (!grunt.file.exists(filepath)) {
                        grunt.log.warn('Source file "' + filepath + '" not found.');
                        return false;
                    } else {
                        return true;
                    }
                })
                .map(function(filepath) {
                    return {
                        json: grunt.file.readJSON(filepath),
                        path: filepath
                    };
                })
                .map(function(file) {
                    Object.keys(options.fields).forEach(function(key) {
                        var value = options.fields[key];
                        if (options.add === true || file.json.hasOwnProperty(key)) {

                            /** @todo implement deep merge */
                            if (typeof file.json[key] === "object") { // attempt to merge objects
                                for (var attrname in value) {
                                    if (typeof file.json[key][attrname] === "object") {
                                        for (var attrname2 in value[attrname]) {
                                            file.json[key][attrname][attrname2] = value[attrname][attrname2];
                                        }
                                    } else {
                                        file.json[key][attrname] = value[attrname];
                                    }
                                }
                            } else { // overwrite file with new object
                                file.json[key] = value;
                            }
                        }
                    });

                    return file;
                })
                .map(function(file) {
                    grunt.file.write(file.path, JSON.stringify(file.json, null, options.indent));
                    grunt.log.success('File ' + file.path + ' updated.');
                });
        });
    });

};
