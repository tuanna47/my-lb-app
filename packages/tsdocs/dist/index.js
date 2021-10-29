"use strict";
// Copyright IBM Corp. 2018,2020. All Rights Reserved.
// Node module: @loopback/tsdocs
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
/**
 * The `@loopback/tsdocs` package is an internal module to generate
 * {@link https://github.com/Microsoft/tsdoc | tsdoc} based API docs
 * for `@loopback/*` packages within
 * {@link https://github.com/loopbackio/loopback-next | loopback-next} monorepo
 * managed by {@link https://github.com/lerna/lerna | Lerna}.
 *
 * @remarks
 * It's built on top of {@link https://api-extractor.com | Microsoft API Extractor}:
 *
 * - {@link https://github.com/Microsoft/web-build-tools/tree/master/apps/api-extractor | api-extractor}
 * - {@link https://github.com/Microsoft/web-build-tools/tree/master/apps/api-documenter | api-documenter}
 *
 * @packageDocumentation
 */
(0, tslib_1.__exportStar)(require("./helper"), exports);
(0, tslib_1.__exportStar)(require("./monorepo-api-extractor"), exports);
(0, tslib_1.__exportStar)(require("./update-api-md-docs"), exports);
//# sourceMappingURL=index.js.map