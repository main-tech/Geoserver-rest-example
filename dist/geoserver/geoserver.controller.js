"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeoserverController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const axios_1 = require("axios");
const AdmZip = require("adm-zip");
const multer_1 = require("multer");
const storage = (0, multer_1.diskStorage)({
    destination: './uploads',
    filename: (req, file, callback) => {
        const filename = `${file.originalname}`;
        callback(null, filename);
    },
});
let GeoserverController = class GeoserverController {
    async uploadShapefile(file) {
        if (!file) {
            throw new Error('No file uploaded.');
        }
        const { originalname, buffer } = file;
        const shapefileName = originalname.replace('.zip', '');
        try {
            const workspaceName = 'upload';
            const zip = new AdmZip(buffer);
            const zipEntries = zip.getEntries();
            const shapefileEntry = zipEntries.find((entry) => entry.entryName.endsWith('.shp'));
            if (!shapefileEntry) {
                throw new Error('No shapefile found in the uploaded zip.');
            }
            const shapefileBuffer = shapefileEntry.getData();
            const uploadUrl = `http://localhost:8080/rest/workspaces/${workspaceName}/datastores/${shapefileName}/file.shp`;
            await axios_1.default.put(uploadUrl, shapefileBuffer, {
                headers: {
                    'Content-Type': 'application/zip',
                },
                auth: {
                    username: 'admin',
                    password: 'geoserver',
                },
            });
            return 'Shapefile uploaded successfully!';
        }
        catch (error) {
            console.error('Error uploading shapefile to GeoServer:', error);
            throw new Error(`Failed to upload shapefile to GeoServer. ${error.message}`);
        }
    }
};
__decorate([
    (0, common_1.Post)('upload'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', { storage })),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], GeoserverController.prototype, "uploadShapefile", null);
GeoserverController = __decorate([
    (0, common_1.Controller)('geoserver')
], GeoserverController);
exports.GeoserverController = GeoserverController;
//# sourceMappingURL=geoserver.controller.js.map