/*
 * Encapsulates all of the CLI functionality. The api argument simply
 * provides environment-specific functionality.
 */
/*global CSSLint*/
function cli(api){

    var globalOptions = {
        "help"        : { "format" : "",                       "description" : "Displays this information."},
        "format"      : { "format" : "<format>",               "description" : "Indicate which format to use for output."},
        "list-rules"  : { "format" : "",                       "description" : "Outputs all of the rules available."},
        "quiet"       : { "format" : "",                       "description" : "Only output when errors are present."},
        "errors"      : { "format" : "<rule[,rule]+>",         "description" : "Indicate which rules to include as errors."},
        "warnings"    : { "format" : "<rule[,rule]+>",         "description" : "Indicate which rules to include as warnings."},
        "ignore"      : { "format" : "<rule[,rule]+>",         "description" : "Indicate which rules to ignore completely."},
        "exclude-list": { "format" : "<file|dir[,file|dir]+>", "description" : "Indicate which files/directories to exclude from being linted."},
        "version"     : { "format" : "",                       "description" : "Outputs the current version number."}
    };

    //-------------------------------------------------------------------------
    // Helper functions
    //-------------------------------------------------------------------------

    /**
     * Returns an array of messages for a particular type.
     * @param messages {Array} Array of CSS Lint messages.
     * @param type {String} The type of message to filter on.
     * @return {Array} An array of matching messages.
     */
    function pluckByType(messages, type){
        return messages.filter(function(message) {
            return message.type === type;
        });
    }

    /**
     * Returns a ruleset object based on the CLI options.
     * @param options {Object} The CLI options.
     * @return {Object} A ruleset object.
     */
    function gatherRules(options, ruleset){
        var warnings = options.rules || options.warnings,
            errors = options.errors;

        if (warnings){
            ruleset = ruleset || {};
            warnings.split(",").forEach(function(value){
                ruleset[value] = 1;
            });
        }

        if (errors){
            ruleset = ruleset || {};
            errors.split(",").forEach(function(value){
                ruleset[value] = 2;
            });
        }

        return ruleset;
    }

    /**
     * Filters out rules using the ignore command line option.
     * @param options {Object} the CLI options
     * @return {Object} A ruleset object.
     */
    function filterRules(options) {
        var ignore = options.ignore,
            ruleset = null;

        if (ignore) {
            ruleset = CSSLint.getRuleset();
            ignore.split(",").forEach(function(value){
                ruleset[value] = 0;
            });
        }

        return ruleset;
    }


    /**
     * Filters out files using the exclude-list command line option.
     * @param files   {Array}  the list of files to check for exclusions
     * @param options {Object} the CLI options
     * @return {Array} A list of files
     */
    function filterFiles(files, options) {
        var excludeList = options["exclude-list"],
            excludeFiles = [],
            filesToLint = files.map(api.getFullPath),
            fullPath;


        if (excludeList) {
            // Build up the exclude list, expanding any directory exclusions that were passed in
            excludeList.split(",").forEach(function(value){
                if (api.isDirectory(value)) {
                    excludeFiles = excludeFiles.concat(api.getFiles(value));
                } else {
                    excludeFiles.push(value);
                }
            });

            // Remove the excluded files from the list of files to lint
            excludeFiles.forEach(function(value){
                fullPath = api.getFullPath(value);
                if (filesToLint.indexOf(fullPath) > -1) {
                    filesToLint.splice(filesToLint.indexOf(fullPath),1);
                }
            });
        }

        return filesToLint;
    }

    /**
     * Outputs all available rules to the CLI.
     * @return {void}
     */
    function printRules(){
        api.print("");
        var rules = CSSLint.getRules();
        rules.forEach(function(rule){
            api.print(rule.id + "\n  " + rule.desc + "\n");
        });
    }

    /**
     * Given a file name and options, run verification and print formatted output.
     * @param {String} relativeFilePath absolute file location
     * @param {Object} options for processing
     * @return {Number} exit code
     */
    function processFile(relativeFilePath, options) {
        var input = api.readFile(relativeFilePath),
            ruleset = filterRules(options),
            result = CSSLint.verify(input, gatherRules(options, ruleset)),
            formatter = CSSLint.getFormatter(options.format || "text"),
            messages = result.messages || [],
            output,
            exitCode = 0;

        if (!input) {
            if (formatter.readError) {
                api.print(formatter.readError(relativeFilePath, "Could not read file data. Is the file empty?"));
            } else {
                api.print("csslint: Could not read file data in " + relativeFilePath + ". Is the file empty?");
            }
            exitCode = 1;
        } else {
            //var relativeFilePath = getRelativePath(api.getWorkingDirectory(), fullFilePath);
            options.fullPath = api.getFullPath(relativeFilePath);
            output = formatter.formatResults(result, relativeFilePath, options);
            if (output){
                api.print(output);
            }

            if (messages.length > 0 && pluckByType(messages, "error").length > 0) {
                exitCode = 1;
            }
        }

        return exitCode;
    }


    /**
     * Outputs the help screen to the CLI.
     * @return {void}
     */
    function outputHelp(){
        var lenToPad = 40,
            toPrint = '',
            formatString = '';

        api.print([
            "\nUsage: csslint-rhino.js [options]* [file|dir]*",
            " ",
            "Global Options"
        ].join("\n"));

        for (var optionName in globalOptions) {
            if (globalOptions.hasOwnProperty(optionName)) {
                // Print the option name and the format if present
                toPrint += "  --" + optionName;
                if (globalOptions[optionName].format !== "") {
                    formatString = '=' + globalOptions[optionName].format;
                    toPrint += formatString;
                } else {
                    formatString = '';
                }

                // Pad out with the appropriate number of spaces
                toPrint += new Array(lenToPad - (optionName.length + formatString.length)).join(' ');

                // Print the description
                toPrint += globalOptions[optionName].description + "\n";
            }
        }
        api.print(toPrint);
    }

    /**
     * Given an Array of filenames, print wrapping output and process them.
     * @param files {Array} filenames list
     * @param options {Object} options object
     * @return {Number} exit code
     */
    function processFiles(fileArray, options){
        var exitCode = 0,
            formatId = options.format || "text",
            formatter,
            files = filterFiles(fileArray,options),
            output;

        if (!files.length) {
            api.print("csslint: No files specified.");
            exitCode = 1;
        } else {
            if (!CSSLint.hasFormat(formatId)){
                api.print("csslint: Unknown format '" + formatId + "'. Cannot proceed.");
                exitCode = 1;
            } else {
                formatter = CSSLint.getFormatter(formatId);

                output = formatter.startFormat();
                if (output){
                    api.print(output);
                }


                files.forEach(function(file){
                    if (exitCode === 0) {
                        exitCode = processFile(file,options);
                    } else {
                        processFile(file,options);
                    }
                });

                output = formatter.endFormat();
                if (output){
                    api.print(output);
                }
            }
        }
        return exitCode;
    }


    function processArguments(args, options) {
        var arg = args.shift(),
            argName,
            parts,
            files = [];

        while(arg){
            if (arg.indexOf("--") === 0){
                argName = arg.substring(2);

                if (argName.indexOf("=") > -1){
                    parts = argName.split("=");
                    options[parts[0]] = parts[1];
                } else {
                    options[argName] = true;
                }

            } else {

                //see if it's a directory or a file
                if (api.isDirectory(arg)){
                    files = files.concat(api.getFiles(arg));
                } else {
                    files.push(arg);
                }
            }
            arg = args.shift();
        }

        options.files = files;
        return options;
    }

    function validateOptions(options) {
        for (var option_key in options) {
            if (!globalOptions.hasOwnProperty(option_key) && option_key !== 'files') {
                api.print(option_key + ' is not a valid option. Exiting...');
                outputHelp();
                api.quit(0);
            }
        }
    }

    function readConfigFile(options) {
        var data = api.readFile(api.getFullPath(".csslintrc"));
        if (data) {
            options = processArguments(data.split(/[\s\n\r]+/m), options);
        }

        return options;
    }



    //-----------------------------------------------------------------------------
    // Process command line
    //-----------------------------------------------------------------------------

    var args     = api.args,
        argCount = args.length,
        options  = {};

    // first look for config file .csslintrc
    options = readConfigFile(options);

    // Command line arguments override config file
    options = processArguments(args, options);

    if (options.help || argCount === 0){
        outputHelp();
        api.quit(0);
    }

    // Validate options
    validateOptions(options);

    if (options.version){
        api.print("v" + CSSLint.version);
        api.quit(0);
    }

    if (options["list-rules"]){
        printRules();
        api.quit(0);
    }

    api.quit(processFiles(options.files,options));
}
