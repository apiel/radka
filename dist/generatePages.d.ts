import { Page, GetPropsList } from './lib';
export declare function generatePages(): Promise<void>;
export declare function generatePage({ page, file }: PagePath, pagePaths: PagePaths): Promise<void>;
export declare function generateDynamicPage(page: Page, pagePaths: PagePaths, htmlPath: string, getPropsList: GetPropsList): Promise<void>;
interface PagePath {
    file: string;
    page: Page;
}
declare type PagePaths = {
    [pathId: string]: PagePath;
};
export declare function collectPagePaths(): Promise<PagePaths>;
export {};
