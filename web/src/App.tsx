import React from "react";
import Navigation from "./components/Navigation";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import Home from "./pages/Home";
import Video from "./pages/Video";

class App extends React.Component {
  render() {
    return (
      <Router>
        <Navigation />
        <Switch>
          <Route exact path="/">
            <Home />
          </Route>
          <Route path="/watch/:id" component={Video} />
        </Switch>
      </Router>
    );
  }
}

export default App;
