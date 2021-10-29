"use strict";
// Copyright IBM Corp. 2019,2020. All Rights Reserved.
// Node module: @loopback/tsdocs
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
Object.defineProperty(exports, "__esModule", { value: true });
exports.runExtractorForPackage = exports.runExtractorForMonorepo = void 0;
const tslib_1 = require("tslib");
const api_extractor_1 = require("@microsoft/api-extractor");
const debug_1 = (0, tslib_1.__importDefault)(require("debug"));
const fs_extra_1 = (0, tslib_1.__importDefault)(require("fs-extra"));
const path_1 = (0, tslib_1.__importDefault)(require("path"));
const helper_1 = require("./helper");
const debug = (0, debug_1.default)('loopback:tsdocs');
/**
 * Run api-extractor for a lerna-managed monrepo
 *
 * @remarks
 * The function performs the following steps:
 * 1. Discover packages with tsdocs from the monorepo
 * 2. Iterate through each package to run `api-extractor`
 *
 * @param options - Options for running api-extractor
 */
async function runExtractorForMonorepo(options = {}) {
    var _a;
    debug('Extractor options:', options);
    options = Object.assign({
        rootDir: process.cwd(),
        apiDocsExtractionPath: helper_1.DEFAULT_APIDOCS_EXTRACTION_PATH,
        typescriptCompilerFolder: helper_1.typeScriptPath,
        tsconfigFilePath: 'tsconfig.json',
        mainEntryPointFilePath: 'dist/index.d.ts',
    }, options);
    const packages = await (0, helper_1.getPackagesWithTsDocs)(options.rootDir);
    /* istanbul ignore if  */
    if (!packages.length)
        return;
    const lernaRootDir = packages[0].rootPath;
    /* istanbul ignore if  */
    if (!options.silent) {
        console.log('Running api-extractor for lerna repo: %s', lernaRootDir);
    }
    setupApiDocsDirs(lernaRootDir, options);
    const errors = {};
    for (const pkg of packages) {
        /* istanbul ignore if  */
        const err = invokeExtractorForPackage(pkg, options);
        if (err != null) {
            if (options.ignoreErrors) {
                errors[pkg.name] = err;
            }
            else {
                throw err;
            }
        }
    }
    if (Object.keys(errors).length === 0)
        return;
    console.error('****************************************' +
        '****************************************');
    for (const p in errors) {
        const err = errors[p];
        console.error('%s: %s', p, (_a = err === null || err === void 0 ? void 0 : err.message) !== null && _a !== void 0 ? _a : err);
    }
    console.error('****************************************' +
        '****************************************');
}
exports.runExtractorForMonorepo = runExtractorForMonorepo;
function runExtractorForPackage(pkgDir = process.cwd(), options = {}) {
    options = Object.assign({
        rootDir: pkgDir,
        apiDocsExtractionPath: helper_1.DEFAULT_APIDOCS_EXTRACTION_PATH,
        typescriptCompilerFolder: helper_1.typeScriptPath,
        tsconfigFilePath: 'tsconfig.json',
        mainEntryPointFilePath: 'dist/index.d.ts',
    }, options);
    const pkgJson = require(path_1.default.join(pkgDir, 'package.json'));
    setupApiDocsDirs(pkgDir, options);
    const pkg = {
        private: pkgJson.private,
        name: pkgJson.name,
        location: pkgDir,
        manifestLocation: path_1.default.join(pkgDir, 'package.json'),
        rootPath: pkgDir,
    };
    const err = invokeExtractorForPackage(pkg, options);
    if (err == null)
        return;
    if (!options.ignoreErrors) {
        throw err;
    }
    console.error(err);
}
exports.runExtractorForPackage = runExtractorForPackage;
/**
 * Run `api-extractor` on a given package
 * @param pkg - Package descriptor
 * @param options - Options for api extraction
 */
function invokeExtractorForPackage(pkg, options) {
    if (!options.silent) {
        console.log('> %s', pkg.name);
    }
    debug('Package: %s (%s)', pkg.name, pkg.location);
    process.chdir(pkg.location);
    const extractorConfig = buildExtractorConfig(pkg, options);
    debug('Resolved extractor config:', extractorConfig);
    try {
        invokeExtractor(extractorConfig, options);
    }
    catch (err) {
        debug('Error in extracting API docs for %s', pkg.name, err);
        return err;
    }
}
/**
 * Set up dirs for apidocs
 *
 * @param lernaRootDir - Root dir of the monorepo
 * @param options - Extractor options
 */
function setupApiDocsDirs(lernaRootDir, options) {
    /* istanbul ignore if  */
    if (options.dryRun)
        return;
    const apiDocsExtractionPath = options.apiDocsExtractionPath;
    fs_extra_1.default.emptyDirSync(path_1.default.join(lernaRootDir, `${apiDocsExtractionPath}/models`));
    if (!options.apiReportEnabled)
        return;
    fs_extra_1.default.ensureDirSync(path_1.default.join(lernaRootDir, `${apiDocsExtractionPath}/reports`));
    fs_extra_1.default.emptyDirSync(path_1.default.join(lernaRootDir, `${apiDocsExtractionPath}/reports-temp`));
}
/**
 * Build extractor configuration object for the given package
 *
 * @param pkg - Lerna managed package
 * @param options - Extractor options
 */
function createRawExtractorConfig(pkg, options) {
    const entryPoint = path_1.default.join(pkg.location, options.mainEntryPointFilePath);
    const apiDocsExtractionPath = options.apiDocsExtractionPath;
    let configObj = {
        projectFolder: pkg.location,
        mainEntryPointFilePath: entryPoint,
        apiReport: {
            enabled: !!options.apiReportEnabled,
            reportFolder: path_1.default.join(pkg.rootPath, `${apiDocsExtractionPath}/reports`),
            reportTempFolder: path_1.default.join(pkg.rootPath, `${apiDocsExtractionPath}/reports-temp`),
            reportFileName: '<unscopedPackageName>.api.md',
        },
        docModel: {
            enabled: true,
            apiJsonFilePath: path_1.default.join(pkg.rootPath, `${apiDocsExtractionPath}/models/<unscopedPackageName>.api.json`),
        },
        messages: {
            extractorMessageReporting: {
                ["ae-missing-release-tag" /* MissingReleaseTag */]: {
                    logLevel: "none" /* None */,
                    addToApiReportFile: false,
                },
            },
        },
        compiler: {
            tsconfigFilePath: options.tsconfigFilePath,
        },
    };
    /* istanbul ignore if  */
    if (options.config) {
        configObj = Object.assign(configObj, options.config);
    }
    debug('Extractor config options:', configObj);
    return configObj;
}
/**
 * Create and prepare the extractor config for invocation
 *
 * @param pkg - Lerna package
 * @param options - Extractor options
 */
function buildExtractorConfig(pkg, options) {
    const configObj = createRawExtractorConfig(pkg, options);
    const extractorConfig = api_extractor_1.ExtractorConfig.prepare({
        configObject: configObj,
        configObjectFullPath: '',
        packageJsonFullPath: pkg.manifestLocation,
    });
    return extractorConfig;
}
/**
 * Invoke the extractor
 *
 * @param extractorConfig - Resolved config
 * @param options - Extractor options
 */
function invokeExtractor(extractorConfig, options) {
    const compilerState = api_extractor_1.CompilerState.create(extractorConfig, {
    // typescriptCompilerFolder: options.typescriptCompilerFolder,
    });
    /* istanbul ignore if  */
    if (options.dryRun)
        return;
    const extractorResult = api_extractor_1.Extractor.invoke(extractorConfig, {
        typescriptCompilerFolder: options.typescriptCompilerFolder,
        localBuild: true,
        showVerboseMessages: !options.silent,
        messageCallback: (message) => {
            if (message.messageId === "console-api-report-created" /* ApiReportCreated */) {
                // This script deletes the outputs for a clean build,
                // so don't issue a warning if the file gets created
                message.logLevel = "none" /* None */;
            }
        },
        compilerState,
    });
    debug(extractorResult);
}
//# sourceMappingURL=monorepo-api-extractor.js.map