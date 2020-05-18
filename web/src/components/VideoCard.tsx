import React from "react";

import { Link } from "react-router-dom";

class VideoCard extends React.Component<{video: any}, {}> {

  constructor(props: Readonly<{video: any}>) {
    super(props);
  }

  render() {
    let video = this.props.video;
    return (
      <div className="col-md-4 col-sm-6 col-12">
        <Link to={`/watch/${video._id}`}>
          <div className="card">
            <img src={video.files.thumbnail} alt={`Thumbnail for video titled '${video.title}'`} className="card-img-top"/>
            <div className="card-body">
              <h2 className="card-title h5">{video.title}</h2>
              <p className="card-text" style={{color: '#212529'}}>Uploaded {video.uploaded_at}</p>
            </div>
          </div>
        </Link>
      </div>
    );
  }
}

export default VideoCard;
