import { Page } from './lib';
export declare function generatePages(): Promise<void>;
export declare function generatePage({ page, file }: PagePath, pagePaths: PagePaths): Promise<void>;
interface PagePath {
    file: string;
    page: Page;
}
declare type PagePaths = {
    [pathId: string]: PagePath;
};
export declare function collectPagePaths(): Promise<PagePaths>;
export {};
