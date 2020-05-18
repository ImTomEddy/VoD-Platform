import React from "react";

import { Link } from "react-router-dom";

class Navigation extends React.Component {
  render() {
    return (
      <header>
        <div className="navbar navbar-black bg-dark shadow-sm">
          <div className="container">
            <Link to="/" style={{ color: "#ffffff" }} className="navbar-brand">
              VoD Platform
            </Link>
            <ul className="navbar-nav">
              <li className="nav-item">
                <Link to="/" style={{ color: "#ffffff" }} className="nav-link">
                  Home
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </header>
    );
  }
}

export default Navigation;
