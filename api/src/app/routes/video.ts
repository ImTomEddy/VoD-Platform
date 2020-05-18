import express from "express";

import TokenUtil from "../util/token";

import Video from "../models/video";

import { Storage } from "@google-cloud/storage";

import fs from "fs";
import Response from "../util/response";

async function uploadVideo(req: any, res: any, next: any) {
  if (!req.user) {
    next({ message: "Unauthorized", status: 403 });
    if(req.files && req.files.video) 
      fs.unlink('./temp/' + req.files.video.tempFilePath, () => {});
  } else if (!req.body.title) {
    next({ message: "Please provide a video title", status: 400 });
  } else if (!req.files || !req.files.video) {
    next({ message: "Please provide a video", status: 400 });
  } else if (req.files.video.mimetype !== "video/mp4") {
    next({ message: "Uploaded video must be an mp4", status: 400 });
    fs.unlink('./temp/' + req.files.video.tempFilePath, () => {});
  } else {
    const video = new Video({
      owner: req.user._id,
      title: req.body.title,
      description: req.body.description,
      tags: req.body.tags.split("|"),
      files: {},
      processing: {},
    });

    await req.files.video.mv(`./temp/${video._id}.mp4`, async (err: any) => {
      if (err) return next(err);

      const storage = new Storage();
      let upload = await storage
        .bucket(process.env.GOOGLE_APPLICATION_BUCKET_NAME || "bucket")
        .upload(`./temp/${video._id}.mp4`, {
          gzip: true,
        });

      fs.unlink(`./temp/${video._id}.mp4`, () => {});

      video.files.original = `https://storage.googleapis.com/it3d-vod/${video._id}.mp4`;

      await video.save();

      res.json(
        Response.getMessage({
          video: video,
        })
      );
    });
  }
}

function getVideos(req: any, res: any, next: any) {
  let page = 0;

  if (req.query.page && !isNaN(req.query.page)) {
    page = parseInt(req.query.page);
    if (page < 0) page = 0;
  }

  let limit = 10;

  Video.find({'processing.finished': {$exists: true, $ne: null }})
    .limit(limit)
    .sort({ uploaded_at: -1 })
    .skip(page * limit)
    .select("id owner title files.thumbnail uploaded_at")
    .exec((err, videos) => {
      if (err) return next(err);
      res.json(Response.getMessage({videos: videos}));
    });
}

function getVideo(req: any, res: any, next: any) {
  if(!req.params.id) {
    next({message: 'No video ID specified'});
  } else {
    Video.findOne({_id: req.params.id}).populate('owner').exec((err, video) => {
      if(err) return next(err);
      res.json(Response.getMessage({video: video}));
    })
  }
}

export default class VideoRoute {
  static init = () => {
    const router = express.Router();

    router.post("/video/upload", TokenUtil.getPassportAuth, uploadVideo);
    router.get("/video", getVideos);
    router.get("/video/:id", getVideo);

    return router;
  };
}
