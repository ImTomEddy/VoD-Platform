import express from "express";

import Video from "../models/video";

import Response from "../util/response";

function getNext(req: any, res: any, next: any) {
  if(!req.body.api_secret || req.body.api_secret !== (process.env.API_SECRET || 'vodplatform-secret')) {
    next({ message: "Unauthorized", status: 403 });
  } else {
    Video.findOneAndUpdate(
      { "processing.started": null },
      { $set: { "processing.started": new Date() } }
    ).exec((err, video) => {
      if (err) return next(err);
      res.json(Response.getMessage({ video: video }));
    });
  }
}

function updateFinished(req: any, res: any, next: any) {
  if(!req.body.api_secret || req.body.api_secret !== (process.env.API_SECRET || 'vodplatform-secret')) {
    next({ message: "Unauthorized", status: 403 });
  } else if(!req.body.files) {
    next({message: "No files provided"});
  } else {
    let raw = req.body.files;
    let files: any = {}

    if(typeof raw !== 'object') raw = JSON.parse(raw);

    if(raw.original) files.original = raw.original;
    if(raw.mdash_av1) files.mdash_av1 = raw.mdash_av1;
    if(raw.mdash_vp9) files.mdash_vp9 = raw.mdash_vp9;
    if(raw.mdash_h264) files.mdash_h264 = raw.mdash_h264;
    if(raw.hls_h264) files.hls_h264 = raw.hls_h264;
    if(raw.thumbnail) files.thumbnail = raw.thumbnail;

    Video.findOneAndUpdate(
      { _id: req.params.id },
      { $set: { files: files, "processing.finished": new Date() } }
    ).exec((err, video) => {
      if (err) return next(err);
      res.json(Response.getMessage({ done: true }));
    });
  }
}

export default class QueueRoute {
  static init = () => {
    const router = express.Router();

    router.get("/queue/next", getNext);
    router.get("/queue/finish/:id", updateFinished);

    return router;
  };
}
