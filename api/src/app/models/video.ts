import mongoose from 'mongoose';

const VideoSchema = new mongoose.Schema({
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: false,
        default: null,
    },
    tags: {
        type: [String],
        default: [],
    },
    files: {
        original: {
          type: String,
          default: null
        },
        mdash_av1: {
          type: String,
          default: null
        },
        mdash_vp9: {
          type: String,
          default: null
        },
        mdash_h264: {
          type: String,
          default: null
        },
        hls_h264: {
          type: String,
          default: null
        },
        thumbnail: {
          type: String,
          default: null
        },
    },
    processing: {
        started: {
          type: Date,
          default: null
        },
        finished: {
          type: Date,
          default: null
        },
    },
    __v: {
        type: Number,
        select: false,
    },
}, { timestamps: { createdAt: 'uploaded_at', updatedAt: 'updated_at' } });

interface Video extends mongoose.Document {
  owner: mongoose.Schema.Types.ObjectId,
  title: String,
  description: String,
  tags: String[],
  files: {
    original: String,
    mdash_av1: String,
    mdash_vp9: String,
    mdash_h264: String,
    hls_h264: String,
    thumbnail: String
  }
}

export default mongoose.model<Video>('Video', VideoSchema);
