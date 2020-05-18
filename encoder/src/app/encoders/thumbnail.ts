import ffmpeg from "fluent-ffmpeg";
import fs from 'fs';
import path from 'path';

export default class Thumbnail {
  static encode = (video: any, videoPath: string, heightBitrateMap: number[][], onEnd?: Function): Promise<any> => {
    console.log(`Generating FFmpeg command for thumbnal of video '${video.title}'`);

    return new Promise((resolve, reject) => {
      let targetPath = path.resolve(
        "./temp",
        "out",
        `thumbnail-${video._id}.jpg`
      );

      let encoder = ffmpeg({
        source: videoPath
      })
        .output(targetPath)
        .frames(1)
        .setStartTime('01:00')
        .outputOptions([
          "-q:v 2",
        ]);
  
      encoder.on('start', (cli) => {
        console.log(`Processing thumbnal of video '${video.title}'`);
      });
  
      encoder.on('end', () => {
        console.log(`Finished processing thumbnal of video '${video.title}'`);
        resolve();
      });
  
      encoder.on('error', (err) => {
        console.log(`Error processing thumbnal of video '${video.title}'`);
        reject(err);
      });
  
      encoder.run();
    });
  }
}