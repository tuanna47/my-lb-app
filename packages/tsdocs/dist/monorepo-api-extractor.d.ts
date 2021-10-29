import { ExtractorOptions } from './helper';
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
export declare function runExtractorForMonorepo(options?: ExtractorOptions): Promise<void>;
export declare function runExtractorForPackage(pkgDir?: string, options?: ExtractorOptions): void;
