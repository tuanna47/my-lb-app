import { IConfigFile } from '@microsoft/api-extractor';
/**
 * TypeScript definition for
 * {@link https://github.com/lerna/lerna/blob/master/core/package/index.js | Lerna Package}
 */
export interface LernaPackage {
    /**
     * Package name
     */
    name: string;
    /**
     * Location of the package
     */
    location: string;
    /**
     * Root directory of the monorepo
     */
    rootPath: string;
    /**
     * Location of `package.json`
     */
    manifestLocation: string;
    /**
     * Is it a private package?
     */
    private: boolean;
}
/**
 * Get un-scoped package name
 *
 * @example
 * - '@loopback/context' => 'context'
 * - 'express' => 'express'
 *
 * @param name - Name of the npm package
 */
export declare function getUnscopedPackageName(name: string): string;
/**
 * Get lerna packages and sorted them by location
 *
 * @param rootDir - Root directory to find lerna.json
 */
export declare function getPackages(rootDir?: string): Promise<LernaPackage[]>;
/**
 * Check if a package should be processed for tsdocs
 *
 * @param pkg - Lerna package
 */
export declare function shouldGenerateTsDocs(pkg: LernaPackage): boolean;
/**
 * Get an array of lerna-managed TypeScript packages to generate tsdocs
 *
 * @param rootDir - Root directory to find the monorepo
 */
export declare function getPackagesWithTsDocs(rootDir?: string): Promise<LernaPackage[]>;
/**
 * Default path for apidocs to be generated for loopback.io site
 */
export declare const DEFAULT_APIDOCS_GENERATION_PATH = "docs/site/apidocs";
/**
 * Options for api docs
 */
export interface ApiDocsOptions {
    /**
     * To have a dry-run without generating api reports/doc models
     */
    dryRun?: boolean;
    /**
     * If `true`, do not print messages to console
     */
    silent?: boolean;
    /**
     * Root directory for the lerna-managed monorepo, default to current dir
     */
    rootDir?: string;
    /**
     * Path to tsdocs reports/models
     */
    apiDocsExtractionPath?: string;
    /**
     * Path to target directory to generate apidocs
     */
    apiDocsGenerationPath?: string;
    /**
     * A flag to generate default package documentation
     */
    generateDefaultPackageDoc?: boolean;
    /**
     * Package metadata
     */
    lernaPackages?: Record<string, LernaPackage>;
}
/**
 * Options to run api-extractor against the lerna repo
 */
export interface ExtractorOptions extends ApiDocsOptions {
    /**
     * Configuration for api-extractor
     */
    config?: IConfigFile;
    /**
     * Custom TypeScript compiler dir
     */
    typescriptCompilerFolder?: string;
    /**
     * Path for tsconfig
     */
    tsconfigFilePath?: string;
    /**
     * mainEntryPointFilePath
     */
    mainEntryPointFilePath?: string;
    /**
     * A flag to control if `apiReport` should be enabled
     */
    apiReportEnabled?: boolean;
    /**
     * A flag to control if errors should be ignored
     */
    ignoreErrors?: boolean;
}
/**
 * Default path as the output directory for extracted api reports and models
 */
export declare const DEFAULT_APIDOCS_EXTRACTION_PATH = "docs/apidocs";
/**
 * Export the TypeScript path from `@loopback/build`
 */
export declare const typeScriptPath: any;
