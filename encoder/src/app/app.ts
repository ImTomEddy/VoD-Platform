import axios from "axios";
import path from "path";
import fs from "fs";

import { Storage } from "@google-cloud/storage";

import MDashH264 from './encoders/mdash-h264';
import Thumbnail from "./encoders/thumbnail";
import HLSH264 from "./encoders/hls-h264";

export default class App {
  heightBitrateMap = [
    [1440, 5000],
    [1080, 4000],
    [720, 3000],
    [720, 1000],
  ];
  storage = new Storage();

  successfulEncodes: string[] = [];

  setup = () => {
    if (!process.env.API_URL) {
      console.log("No API URL Set!");
      return;
    }

    console.log("Starting Encoder Service...");

    this.getVideo();
  };

  getVideo = async () => {
    try {
      let request = await axios.get(`${process.env.API_URL}/queue/next`, {
        data: {
          api_secret: process.env.API_SECRET,
        },
      });

      if (request.data && request.data.message && request.data.message.video) {
        let video = request.data.message.video;
        this.downloadVideo(video);
      } else {
        setTimeout(this.getVideo, 5000);
      }
    } catch (err) {
      console.log(err.message);
      setTimeout(this.getVideo, 30000);
    }
  };

  downloadVideo = async (video: any) => {
    console.log(`Downloading video '${video.title}'`);

    let tempPath = path.resolve("./temp", `${video._id}.mp4`);
    if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
    let writer = fs.createWriteStream(tempPath);

    let contentStream = await axios({
      url: video.files.original,
      method: "GET",
      responseType: "stream",
    });

    contentStream.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on("finish", () => {
        this.processVideo(video);
        if (resolve) resolve();
      });
      writer.on("error", () => {
        console.log("Error writing to file...");
        this.downloadVideo(video);
        if (reject) reject();
      });
    });
  };

  processVideo = async (video: any) => {
    let videoPath = path.resolve("./temp", `${video._id}.mp4`);
    let response: any = undefined;

    response = await MDashH264.encode(video, videoPath, this.heightBitrateMap);
    if(!response) this.successfulEncodes.push('mdash_h264');

    response = await Thumbnail.encode(video, videoPath, this.heightBitrateMap);
    if(!response) this.successfulEncodes.push('thumbnail');

    response = await HLSH264.encode(video, videoPath, this.heightBitrateMap);
    if(!response) this.successfulEncodes.push('hls_h264');
    
    this.uploadFiles(video);
  };

  uploadFiles = (video: any) => {
    console.log(`Uploading files for video '${video.title}'`);
    let files = fs.readdirSync('./temp/out');

    files.forEach(async (path, index) => {
      await this.storage
        .bucket(process.env.GOOGLE_APPLICATION_BUCKET_NAME || "bucket")
        .upload(`./temp/out/${path}`, {
          gzip: true,
        });
      
        fs.unlinkSync(`./temp/out/${path}`);
    });

    console.log(`Uploaded files for video '${video.title}'`);

    setTimeout(() => { this.updateQueue(video) }, 1000);
  }

  updateQueue = async (video: any) => {
    console.log(`Updating video '${video.title}'`);
    let files = video.files;

    this.successfulEncodes.forEach((val) => {
      switch(val){
        case 'mdash_h264':
          files.mdash_h264 = `https://storage.googleapis.com/it3d-vod/mdash_h264-${video._id}.mpd`;
        case 'hls_h264':
          files.hls_h264 = `https://storage.googleapis.com/it3d-vod/hls_h264-${video._id}.m3u8`;
        case 'thumbnail':
          files.thumbnail = `https://storage.googleapis.com/it3d-vod/thumbnail-${video._id}.jpg`;
        }
    });

    let request = await axios.get(`${process.env.API_URL}/queue/finish/${video._id}`, {
      data: {
        api_secret: process.env.API_SECRET,
        files: files
      },
    });

    if(request.data && request.data.message && request.data.message.done) {
      console.log(`Successfully updated video '${video.title}'`);
      this.successfulEncodes = [];
      setTimeout(this.getVideo, 1000);
    } else {
      console.log(`Error updating video '${video.title}'`);
      setTimeout(() => { this.updateQueue(video) }, 5000);
    }
  }
}
