import ffmpeg from "fluent-ffmpeg";
import fs from 'fs';
import path from 'path';

export default class MDashH264 {
  static encode = (video: any, videoPath: string, heightBitrateMap: number[][], onEnd?: Function): Promise<any> => {
    console.log(`Generating FFmpeg command for video video '${video.title}' using MPEG-Dash and H.264`);

    return new Promise((resolve, reject) => {
      let targetPath = path.resolve(
        "./temp",
        "out",
        `mdash_h264-${video._id}.mpd`
      );

      let encoder = ffmpeg({
        source: videoPath
      })
        .output(targetPath)
        .format("dash")
        .videoCodec("libx264")
        .audioCodec("aac")
        .audioChannels(2)
        .audioFrequency(48000)
        .outputOptions([
          "-preset veryfast",
          "-keyint_min 60",
          "-g 60",
          "-sc_threshold 0",
          "-profile:v main",
          "-use_template 1",
          "-use_timeline 1",
          "-b_strategy 0",
          "-bf 1",
          "-map 0:a",
          "-b:a 96k",
          `-init_seg_name enc-init-mdash-h264-${video._id}-stream$RepresentationID$.$ext$`,
          `-media_seg_name enc-chunk-mdash-h264-${video._id}-stream$RepresentationID$-$Number%05d$.$ext$`,
          '-seg_duration 8',
          '-method GET',
        ]);
  
      heightBitrateMap.forEach((values, index) => {
        encoder.outputOptions([
          `-filter_complex [0]format=pix_fmts=yuv420p[temp${index}];[temp${index}]scale=-2:${values[0]}[A${index}]`,
          `-map [A${index}]:v`,
          `-b:v:${index} ${values[1]}k`,
        ]);
      });
  
      encoder.on('start', () => {
        console.log(`Processing video '${video.title}' using MPEG-Dash and H.264`);
      });
  
      encoder.on('end', () => {
        console.log(`Finished processing video '${video.title}' using MPEG-Dash and H.264`);
        MDashH264.moveFiles(video);
        resolve();
      });
  
      encoder.on('error', (err) => {
        console.log(`Error processing video '${video.title}' using MPEG-Dash and H.264`);
        reject(err);
      });
  
      encoder.run();
    });
  }

  private static moveFiles = async (video: any) => {
    console.log(`Moving files for video '${video.title}'`);
    let files = fs.readdirSync('./');
    files.forEach((path) => {
      if(path.endsWith('.m4s')) {
        fs.renameSync(path, './temp/out/' + path);
      }
    });
  }
}