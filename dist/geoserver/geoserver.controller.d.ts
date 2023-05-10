/// <reference types="multer" />
export declare class GeoserverController {
    uploadShapefile(file: Express.Multer.File): Promise<string>;
}
