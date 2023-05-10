import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import axios from 'axios';
//import AdmZip from 'adm-zip';
import * as AdmZip from 'adm-zip';

import multer from 'multer';
import { diskStorage } from 'multer';
import { MulterModule } from '@nestjs/platform-express';

const storage = diskStorage({
  destination: './uploads',
  filename: (req, file, callback) => {
    const filename = `${file.originalname}`;
    callback(null, filename);
  },
});



@Controller('geoserver')
export class GeoserverController{
  @Post('upload')
  @UseInterceptors(FileInterceptor('file', { storage }))
  async uploadShapefile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new Error('No file uploaded.');
    }
    const { originalname, buffer } = file;

    // Extract the name of the shapefile (without the .zip extension)
    const shapefileName = originalname.replace('.zip', '');

    // Upload the shapefile to GeoServer using the REST API
    try {
      // Step 1: Create the workspace (if necessary)
      const workspaceName = 'upload';
      // await axios.post(`http://localhost:8080/rest/workspaces`, {
      //   workspace: { name: workspaceName },
      // });

      // Step 2: Extract the shapefile from the zip
      const zip = new AdmZip(buffer);
      const zipEntries = zip.getEntries();

      const shapefileEntry = zipEntries.find((entry: { entryName: string; }) => entry.entryName.endsWith('.shp'));
      if (!shapefileEntry) {
        throw new Error('No shapefile found in the uploaded zip.');
      }

      const shapefileBuffer = shapefileEntry.getData();

      // Step 3: Upload the shapefile
      const uploadUrl = `http://localhost:8080/rest/workspaces/${workspaceName}/datastores/${shapefileName}/file.shp`;
      await axios.put(uploadUrl, shapefileBuffer, {
        headers: {
          'Content-Type': 'application/zip',
        },
        auth: {
          username: 'admin',
          password: 'geoserver',
        },      });

      return 'Shapefile uploaded successfully!';
    } catch (error) {
      console.error('Error uploading shapefile to GeoServer:', error);
      throw new Error(`Failed to upload shapefile to GeoServer. ${error.message}`);
    }
  }
}
