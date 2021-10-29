"use strict";
// Copyright IBM Corp. 2019,2020. All Rights Reserved.
// Node module: @loopback/testlab
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
Object.defineProperty(exports, "__esModule", { value: true });
const fs_extra_1 = require("fs-extra");
const path_1 = require("path");
const __1 = require("../..");
const FIXTURES = (0, path_1.resolve)(__dirname, '../../../fixtures');
describe('TestSandbox integration tests', () => {
    let sandbox;
    let path;
    const COPY_FILE = 'copy-me.txt';
    const COPY_FILE_PATH = (0, path_1.resolve)(FIXTURES, COPY_FILE);
    beforeEach(createSandbox);
    beforeEach(givenPath);
    afterEach(deleteSandbox);
    it('returns path of sandbox and it exists', async () => {
        (0, __1.expect)(path).to.be.a.String();
        (0, __1.expect)(await (0, fs_extra_1.pathExists)(path)).to.be.True();
    });
    it('creates a directory in the sandbox', async () => {
        const dir = 'controllers';
        await sandbox.mkdir(dir);
        (0, __1.expect)(await (0, fs_extra_1.pathExists)((0, path_1.resolve)(path, dir))).to.be.True();
    });
    it('copies a file to the sandbox', async () => {
        await sandbox.copyFile(COPY_FILE_PATH);
        (0, __1.expect)(await (0, fs_extra_1.pathExists)((0, path_1.resolve)(path, COPY_FILE))).to.be.True();
        await expectFilesToBeIdentical(COPY_FILE_PATH, (0, path_1.resolve)(path, COPY_FILE));
    });
    it('copies a file to the sandbox with transform', async () => {
        await sandbox.copyFile(COPY_FILE_PATH, undefined, content => content.toUpperCase());
        const dest = (0, path_1.resolve)(path, COPY_FILE);
        (0, __1.expect)(await (0, fs_extra_1.pathExists)(dest)).to.be.True();
        const content = await (0, fs_extra_1.readFile)(dest, 'utf-8');
        (0, __1.expect)(content).to.equal('HELLO WORLD!');
    });
    it('copies a file to the sandbox with dest and transform', async () => {
        const rename = 'copy.me.js';
        await sandbox.copyFile(COPY_FILE_PATH, rename, content => content.toUpperCase());
        const dest = (0, path_1.resolve)(path, rename);
        (0, __1.expect)(await (0, fs_extra_1.pathExists)(dest)).to.be.True();
        const content = await (0, fs_extra_1.readFile)(dest, 'utf-8');
        (0, __1.expect)(content).to.equal('HELLO WORLD!');
    });
    it('copies and renames the file to the sandbox', async () => {
        const rename = 'copy.me.js';
        await sandbox.copyFile(COPY_FILE_PATH, rename);
        (0, __1.expect)(await (0, fs_extra_1.pathExists)((0, path_1.resolve)(path, COPY_FILE))).to.be.False();
        (0, __1.expect)(await (0, fs_extra_1.pathExists)((0, path_1.resolve)(path, rename))).to.be.True();
        await expectFilesToBeIdentical(COPY_FILE_PATH, (0, path_1.resolve)(path, rename));
    });
    it('copies file to a directory', async () => {
        const dir = 'test';
        const rename = `${dir}/${COPY_FILE}`;
        await sandbox.copyFile(COPY_FILE_PATH, rename);
        (0, __1.expect)(await (0, fs_extra_1.pathExists)((0, path_1.resolve)(path, rename))).to.be.True();
        await expectFilesToBeIdentical(COPY_FILE_PATH, (0, path_1.resolve)(path, rename));
    });
    it('updates source map path for a copied file', async () => {
        const file = 'test.js';
        const resolvedFile = (0, path_1.resolve)(__dirname, '../fixtures/test.js');
        const sourceMapString = `//# sourceMappingURL=${resolvedFile}.map`;
        await sandbox.copyFile(resolvedFile);
        const fileContents = (await (0, fs_extra_1.readFile)((0, path_1.resolve)(path, file), 'utf8')).split('\n');
        (0, __1.expect)(fileContents.pop()).to.equal(sourceMapString);
    });
    it('creates a JSON file in the sandbox', async () => {
        await sandbox.writeJsonFile('data.json', { key: 'value' });
        const fullPath = (0, path_1.resolve)(path, 'data.json');
        (0, __1.expect)(await (0, fs_extra_1.pathExists)(fullPath)).to.be.True();
        const content = await (0, fs_extra_1.readFile)(fullPath, 'utf-8');
        (0, __1.expect)(content).to.equal('{\n  "key": "value"\n}\n');
    });
    it('creates a text file in the sandbox', async () => {
        await sandbox.writeTextFile('data.txt', 'Hello');
        const fullPath = (0, path_1.resolve)(path, 'data.txt');
        (0, __1.expect)(await (0, fs_extra_1.pathExists)(fullPath)).to.be.True();
        const content = await (0, fs_extra_1.readFile)(fullPath, 'utf-8');
        (0, __1.expect)(content).to.equal('Hello');
    });
    it('resets the sandbox', async () => {
        const file = 'test.js';
        const resolvedFile = (0, path_1.resolve)(__dirname, '../fixtures/test.js');
        await sandbox.copyFile(resolvedFile);
        await sandbox.reset();
        (0, __1.expect)(await (0, fs_extra_1.pathExists)((0, path_1.resolve)(path, file))).to.be.False();
    });
    it('decaches files from npm require when sandbox is reset', async () => {
        const file = 'test.json';
        await (0, fs_extra_1.writeJSON)((0, path_1.resolve)(path, file), { x: 1 });
        const data = require((0, path_1.resolve)(path, file));
        (0, __1.expect)(data).to.be.eql({ x: 1 });
        await sandbox.reset();
        await (0, fs_extra_1.writeJSON)((0, path_1.resolve)(path, file), { x: 2 });
        const data2 = require((0, path_1.resolve)(path, file));
        (0, __1.expect)(data2).to.be.eql({ x: 2 });
    });
    it('deletes the test sandbox', async () => {
        await sandbox.delete();
        (0, __1.expect)(await (0, fs_extra_1.pathExists)(path)).to.be.False();
    });
    describe('after deleting sandbox', () => {
        const ERR = 'TestSandbox instance was deleted. Create a new instance.';
        beforeEach(callSandboxDelete);
        it('throws an error when trying to call getPath()', () => {
            (0, __1.expect)(() => sandbox.path).to.throw(ERR);
        });
        it('throws an error when trying to call mkdir()', async () => {
            await (0, __1.expect)(sandbox.mkdir('test')).to.be.rejectedWith(ERR);
        });
        it('throws an error when trying to call copy()', async () => {
            await (0, __1.expect)(sandbox.copyFile(COPY_FILE_PATH)).to.be.rejectedWith(ERR);
        });
        it('throws an error when trying to call reset()', async () => {
            await (0, __1.expect)(sandbox.reset()).to.be.rejectedWith(ERR);
        });
        it('throws an error when trying to call delete() again', async () => {
            await (0, __1.expect)(sandbox.delete()).to.be.rejectedWith(ERR);
        });
    });
    async function callSandboxDelete() {
        await sandbox.delete();
    }
    async function expectFilesToBeIdentical(original, copied) {
        const originalContent = await (0, fs_extra_1.readFile)(original, 'utf8');
        const copiedContent = await (0, fs_extra_1.readFile)(copied, 'utf8');
        (0, __1.expect)(copiedContent).to.equal(originalContent);
    }
    function createSandbox() {
        sandbox = new __1.TestSandbox((0, path_1.resolve)(__dirname, '../../.sandbox'));
    }
    function givenPath() {
        path = sandbox.path;
    }
    async function deleteSandbox() {
        if (!(await (0, fs_extra_1.pathExists)(path)))
            return;
        await (0, fs_extra_1.remove)(sandbox.path);
    }
});
//# sourceMappingURL=test-sandbox.integration.js.map