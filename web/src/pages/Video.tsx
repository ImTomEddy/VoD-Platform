import React from "react";

import ReactPlayer from 'react-player';

class Video extends React.Component<any, {video: any}> {

  constructor(props: Readonly<any>) {
    super(props);

    this.state = {
      video: undefined
    }
  }

  componentDidMount() {
    if(!this.props || !this.props.match || 
      !this.props.match.params || !this.props.match.params.id) return;
    
    let id = this.props.match.params.id;

    fetch('http://localhost:5050/video/' + id)
      .then(res => res.json())
      .then((data) => {
        this.setState({video: data.message.video});
      });
  }

  render() {
    if (!this.state.video) return null;

    return (
      <div>
        <div className="jumbotron jumbotron-fluid">
          <div className="container">
            <h1>{this.state.video.title}</h1>
            <p className="lead">Uploaded by: {this.state.video.owner.display_name}</p>
          </div>
        </div>
        <div className="container">
          <div className="row">
            <div className="col-12">
              <ReactPlayer url={[this.state.video.files.mdash_h264, this.state.video.files.hls_h264, this.state.video.files.original]} controls={true} 
                width='100%' height='auto' forceDash={true} forceHLS={true} />
            </div>
          </div>
          <div className="row mb-4">
            <div className="col-12">
              <h2 className="h3">Description</h2>
              <p>{this.state.video.description}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Video;
