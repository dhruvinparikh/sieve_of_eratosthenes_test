/**
 * The 'entry point' (in webpack terminology)
 * of the application(Overview).
 */
import * as React from "react";
import * as ReactDOM from "react-dom";
import { Helmet } from "react-helmet";
import { Router, Route, Switch } from "react-router-dom";
import { Overview } from "../components/Overview";
import { FindMedian } from "../components/FindMedian";
import { ErrorBoundary } from "../components/ErrorBoundary";
import * as SPAs from "../../config/spa.config";
import { isServer, getHistory } from "../utils/ssr/misc";

const First: React.FC = (_props) => {
  return (
    <>
      <Router history={getHistory()}>
        <ErrorBoundary>
          <Helmet title={SPAs.appTitle} />
          <div
            style={{
              textAlign: "center",
              marginTop: "2rem",
              marginBottom: "3rem",
            }}
          >
            <h2>{SPAs.appTitle}</h2>
          </div>
          <Switch>
            <Route exact path="/" component={Overview} />
            <Route path="/findMedian" component={FindMedian} />
            <Route component={Overview} />
          </Switch>
        </ErrorBoundary>
      </Router>
    </>
  );
};

if (!isServer()) {
  ReactDOM.render(
    <First />,
    document.getElementById("react-root")
  );
}
