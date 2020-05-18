import React from "react";

import { Link } from "react-router-dom";
import VideoCard from "../components/VideoCard";

class Home extends React.Component<{}, { videos: any[]}> {

  constructor(props: Readonly<{}>) {
    super(props);

    this.state = {
      videos: []
    }
  }

  componentDidMount() {
    fetch('http://localhost:5050/video')
      .then(res => res.json())
      .then((data) => {
        this.setState({videos: data.message.videos});
      });
  }

  render() {
    return (
      <div>
        <div className="jumbotron jumbotron-fluid">
          <div className="container">
            <h1>VoD Platform</h1>
            <p className="lead">A Video on Demand platform.</p>
          </div>
        </div>
        <div className="container">
          <div className="row">
            {
              (this.state.videos).map((video, index) => {
                return <VideoCard video={video} key={index} />
              })
            }
          </div>
        </div>
      </div>
    );
  }
}

export default Home;
