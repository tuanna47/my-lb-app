"use strict";
// Copyright IBM Corp. 2019,2020. All Rights Reserved.
// Node module: @loopback/tsdocs
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
Object.defineProperty(exports, "__esModule", { value: true });
exports.typeScriptPath = exports.DEFAULT_APIDOCS_EXTRACTION_PATH = exports.DEFAULT_APIDOCS_GENERATION_PATH = exports.getPackagesWithTsDocs = exports.shouldGenerateTsDocs = exports.getPackages = exports.getUnscopedPackageName = void 0;
const tslib_1 = require("tslib");
const fs_extra_1 = (0, tslib_1.__importDefault)(require("fs-extra"));
const path_1 = (0, tslib_1.__importDefault)(require("path"));
const { getPackages: getLernaPackages } = require('@lerna/project');
/**
 * Get un-scoped package name
 *
 * @example
 * - '@loopback/context' => 'context'
 * - 'express' => 'express'
 *
 * @param name - Name of the npm package
 */
function getUnscopedPackageName(name) {
    if (name.startsWith('@')) {
        return name.split('/')[1];
    }
    return name;
}
exports.getUnscopedPackageName = getUnscopedPackageName;
/**
 * Get lerna packages and sorted them by location
 *
 * @param rootDir - Root directory to find lerna.json
 */
async function getPackages(rootDir = process.cwd()) {
    const packages = await getLernaPackages(rootDir);
    packages.sort((p1, p2) => p1.location.localeCompare(p2.location));
    return packages;
}
exports.getPackages = getPackages;
/**
 * Check if a package should be processed for tsdocs
 *
 * @param pkg - Lerna package
 */
function shouldGenerateTsDocs(pkg) {
    // We generate tsdocs for `@loopback/tsdocs` even it's private at this moment
    if (pkg.name === '@loopback/tsdocs')
        return true;
    if (pkg.private && pkg.name !== '@loopback/tsdocs')
        return false;
    /* istanbul ignore if  */
    if (pkg.name.startsWith('@loopback/example-'))
        return false;
    if (!fs_extra_1.default.existsSync(path_1.default.join(pkg.location, 'tsconfig.build.json')) &&
        !fs_extra_1.default.existsSync(path_1.default.join(pkg.location, 'tsconfig.json'))) {
        return false;
    }
    /* istanbul ignore if  */
    if (!fs_extra_1.default.existsSync(path_1.default.join(pkg.location, 'dist/index.d.ts')))
        return false;
    return true;
}
exports.shouldGenerateTsDocs = shouldGenerateTsDocs;
/**
 * Get an array of lerna-managed TypeScript packages to generate tsdocs
 *
 * @param rootDir - Root directory to find the monorepo
 */
async function getPackagesWithTsDocs(rootDir = process.cwd()) {
    const packages = await getPackages(rootDir);
    return packages.filter(shouldGenerateTsDocs);
}
exports.getPackagesWithTsDocs = getPackagesWithTsDocs;
/**
 * Default path for apidocs to be generated for loopback.io site
 */
exports.DEFAULT_APIDOCS_GENERATION_PATH = 'docs/site/apidocs';
/**
 * Default path as the output directory for extracted api reports and models
 */
exports.DEFAULT_APIDOCS_EXTRACTION_PATH = 'docs/apidocs';
/**
 * Export the TypeScript path from `@loopback/build`
 */
exports.typeScriptPath = require('@loopback/build').typeScriptPath;
//# sourceMappingURL=helper.js.map