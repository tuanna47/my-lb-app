"use strict";
// Copyright IBM Corp. 2019,2020. All Rights Reserved.
// Node module: @loopback/tsdocs
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const testlab_1 = require("@loopback/testlab");
const events_1 = require("events");
const fs_extra_1 = (0, tslib_1.__importDefault)(require("fs-extra"));
const path_1 = (0, tslib_1.__importDefault)(require("path"));
const __1 = require("../..");
const monorepo_api_extractor_1 = require("../../monorepo-api-extractor");
const runCLI = require('@loopback/build').runCLI;
const MONOREPO_ROOT = path_1.default.dirname(require.resolve('@loopback/tsdocs-monorepo/package.json'));
const APIDOCS_ROOT = path_1.default.join(MONOREPO_ROOT, 'docs/apidocs');
const SITE_APIDOCS_ROOT = path_1.default.join(MONOREPO_ROOT, 'docs/site/apidocs');
describe('tsdocs', function () {
    this.timeout(10000);
    const API_MD_FILES = [
        'index.md',
        'pkg1.md',
        // It was `'pkg1.pet._constructor_.md'` before
        // https://github.com/microsoft/web-build-tools/pull/1410
        'pkg1.pet._constructor_.md',
        'pkg1.pet.greet.md',
        'pkg1.pet.kind.md',
        'pkg1.pet.md',
        'pkg1.pet.name.md',
        'pkg2.dog.kind.md',
        'pkg2.dog.md',
        'pkg2.md',
    ];
    before('remove apidocs', () => {
        fs_extra_1.default.emptyDirSync(APIDOCS_ROOT);
        fs_extra_1.default.emptyDirSync(SITE_APIDOCS_ROOT);
        fs_extra_1.default.emptyDirSync(path_1.default.join(MONOREPO_ROOT, 'packages/pkg1/docs'));
    });
    let originalConsoleLog;
    before(function setupConsoleLogInterceptor() {
        originalConsoleLog = console.log;
        console.log = function (...args) {
            const msg = typeof args[0] === 'string' ? args[0] : '';
            const ignore = msg &&
                (/Analysis will use the bundled TypeScript version/.test(msg) ||
                    /The target project appears to use TypeScript/.test(msg));
            if (ignore)
                return;
            process.stdout.write('XX: ' + require('util').inspect(args));
            originalConsoleLog(...args);
        };
    });
    after(function uninstallConsoleLogInterceptor() {
        console.log = originalConsoleLog;
    });
    it('runs api-extractor', async () => {
        await (0, __1.runExtractorForMonorepo)({
            rootDir: MONOREPO_ROOT,
            silent: true,
            apiDocsGenerationPath: 'docs/apidocs',
            apiReportEnabled: true,
        });
        const dirs = await fs_extra_1.default.readdir(APIDOCS_ROOT);
        (0, testlab_1.expect)(dirs.sort()).eql(['models', 'reports', 'reports-temp']);
        const models = await fs_extra_1.default.readdir(path_1.default.join(APIDOCS_ROOT, 'models'));
        (0, testlab_1.expect)(models.sort()).to.eql(['pkg1.api.json', 'pkg2.api.json']);
        const reports = await fs_extra_1.default.readdir(path_1.default.join(APIDOCS_ROOT, 'reports'));
        (0, testlab_1.expect)(reports.sort()).to.eql(['pkg1.api.md', 'pkg2.api.md']);
    });
    it('runs api-extractor on package only', async () => {
        const pkgDir = path_1.default.join(MONOREPO_ROOT, 'packages/pkg1');
        const apidocsRootDir = path_1.default.join(pkgDir, 'docs/apidocs');
        (0, monorepo_api_extractor_1.runExtractorForPackage)(pkgDir, {
            silent: true,
            apiDocsGenerationPath: 'docs/apidocs',
            apiReportEnabled: true,
        });
        const dirs = await fs_extra_1.default.readdir(apidocsRootDir);
        (0, testlab_1.expect)(dirs.sort()).eql(['models', 'reports', 'reports-temp']);
        const models = await fs_extra_1.default.readdir(path_1.default.join(apidocsRootDir, 'models'));
        (0, testlab_1.expect)(models.sort()).to.eql(['pkg1.api.json']);
        const reports = await fs_extra_1.default.readdir(path_1.default.join(apidocsRootDir, 'reports'));
        (0, testlab_1.expect)(reports.sort()).to.eql(['pkg1.api.md']);
    });
    it('runs api-documenter', async () => {
        const args = [
            'markdown',
            '-i',
            path_1.default.join(APIDOCS_ROOT, 'models'),
            '-o',
            SITE_APIDOCS_ROOT,
        ];
        process.chdir(path_1.default.join(__dirname, '../../..'));
        const child = runCLI('@microsoft/api-documenter/lib/start', args, {
            stdio: 'ignore',
        });
        await (0, events_1.once)(child, 'close');
        const files = await fs_extra_1.default.readdir(SITE_APIDOCS_ROOT);
        (0, testlab_1.expect)(files.sort()).eql(API_MD_FILES);
    });
    it('updates apidocs for site', async () => {
        await (0, __1.updateApiDocs)({
            rootDir: MONOREPO_ROOT,
            silent: true,
            apiDocsGenerationPath: 'docs/site/apidocs',
        });
        const files = await fs_extra_1.default.readdir(SITE_APIDOCS_ROOT);
        (0, testlab_1.expect)(files.sort()).to.eql(API_MD_FILES);
        for (const f of files) {
            const md = await fs_extra_1.default.readFile(path_1.default.join(SITE_APIDOCS_ROOT, f), 'utf-8');
            (0, testlab_1.expect)(md).to.match(/lang\: en/);
            (0, testlab_1.expect)(md).to.match(/sidebar\: lb4_sidebar/);
        }
        let index = await fs_extra_1.default.readFile(path_1.default.join(SITE_APIDOCS_ROOT, 'index.md'), 'utf-8');
        // Remove \r
        index = index.replace(/\r/gm, '');
        (0, testlab_1.expect)(index).to.containEql(`---
lang: en
title: 'API docs: index'
keywords: LoopBack 4.0, LoopBack 4, Node.js, TypeScript, OpenAPI
sidebar: lb4_sidebar
editurl: https://github.com/loopbackio/loopback-next
permalink: /doc/en/lb4/apidocs.index.html
---`);
        (0, testlab_1.expect)(index).to.containEql('[Home](./index.md)');
        (0, testlab_1.expect)(index).to.containEql('## Packages');
        (0, testlab_1.expect)(index).to.containEql(`
|  Package | Description |
|  --- | --- |
|  [pkg1](./pkg1.md) |  |
|  [pkg2](./pkg2.md) |  |
`);
        const constructorDoc = await fs_extra_1.default.readFile(path_1.default.join(SITE_APIDOCS_ROOT, 'pkg1.pet._constructor_.md'), 'utf-8');
        (0, testlab_1.expect)(constructorDoc).to.not.match(/\.\(constructor\)\.md/);
        (0, testlab_1.expect)(constructorDoc).to.match(/editurl\: https\:\/\/github\.com\/loopbackio\/loopback\-next\/tree\/master\/packages\/pkg1/);
        const pkgDoc = await fs_extra_1.default.readFile(path_1.default.join(SITE_APIDOCS_ROOT, 'pkg1.md'), 'utf-8');
        (0, testlab_1.expect)(pkgDoc).to.match(/\[pkg1\]\(https\:\/\/github\.com\/loopbackio\/loopback\-next\/tree\/master\/packages\/pkg1\)/);
        (0, testlab_1.expect)(pkgDoc).to.match(/editurl\: https\:\/\/github\.com\/loopbackio\/loopback\-next\/tree\/master\/packages\/pkg1/);
    });
});
//# sourceMappingURL=tsdocs.acceptance.js.map