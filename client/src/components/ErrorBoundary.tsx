/*
  React error boundary. Catches and displays unexpected exceptions
  using a popup. This component process
  unexpected and hopefully rare exceptions.
*/
import * as React from "react";
import * as ReactDOM from "react-dom";
import { style } from "typestyle";
import { isCustomError } from "../utils/typeguards";
import logger from "../utils/logger";
import { isServer } from "../utils/ssr/misc";

type ErrorBoundaryState = {
  hasError: boolean
  errDescription?: string
};

export class ErrorBoundary extends React.PureComponent<{}, ErrorBoundaryState> {
  public readonly state: ErrorBoundaryState = { hasError: false };

  public static getDerivedStateFromError(err: Error): ErrorBoundaryState {
    const ret: ErrorBoundaryState = {
      errDescription: ErrorBoundary.extractErrorInfo(err),
      hasError: true,
    };
    return ret;
  }

  public componentDidCatch(_err: Error, errInfo: React.ErrorInfo) {
    if (errInfo.componentStack) {
      const errMsg = this.state.errDescription + "\n" + errInfo.componentStack;
      logger.error(errMsg);
      this.setState(prevState =>
        ({ ...prevState, errDescription: errMsg })
      );
    }
  }

  public readonly onClick = (_evt: React.MouseEvent<HTMLButtonElement>) => {
    this.setState(prevState => {
      return prevState.hasError ? { ...prevState, hasError: false } : prevState;
    });
  }

  public render() {
    if (this.state.hasError) {
      return isServer() ?
        // Using console at build time is acceptable.
        // tslint:disable-next-line:no-console
        (console.error(this.state.errDescription!), <>{`SSR Error: ${this.state.errDescription!}`}</>) :
        (
          <PortalCreator
            onClose={this.onClick}
            errorHeader="Error"
            errorText={this.state.errDescription!}
          />
        );
    } else {
      return this.props.children;
    }
  }

  private static extractErrorInfo = (err: Error): string => {
    let errStr = "Something went wrong. If the issue persists please contact Support.\n\n";
    errStr += err.message;
    if (isCustomError(err)) {
      errStr += `\n${err.detailMessage ?? "<no further details>"}`;
    }

    return errStr;
  }
}

interface IPortalCreatorProps {
  errorText: string;
  errorHeader: string;
  onClose: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

class PortalCreator extends React.Component<IPortalCreatorProps, {}> {
  public componentDidMount() {
    document.body.appendChild(this.m_overlayContainer);
  }

  public componentWillUnmount() {
    document.body.removeChild(this.m_overlayContainer);
  }

  public render() {
    return ReactDOM.createPortal(
      <section className={PortalCreator.s_cssOverlay}>
        <h3>{this.props.errorHeader}</h3>
        <div className="textWrapper">{this.props.errorText}</div>
        <div className="buttonWrapper">
          <button onClick={this.props.onClose}>Close</button>
        </div>
      </section>,
      this.m_overlayContainer
    );
  }

  private readonly m_overlayContainer: HTMLDivElement = document.createElement("div");
  public static readonly s_cssOverlay: string = style({
    $debugName: "overlayErrorBox",
    $nest: {
      "& button": {
        padding: "0.3em 0.8em 0.3em 0.8em"
      },
      "& div.buttonWrapper": {
        margin: "1em",
        textAlign: "center"

      },
      "& div.textWrapper": {
        whiteSpace: "pre-wrap"
      },
      "& h3": {
        textAlign: "center",
      }
    },
    backgroundColor: "linen",
    border: "thick solid darkred",
    left: "50%",
    maxWidth: "80%",
    outline: "9999px solid rgba(0,0,0,0.5)",
    padding: "0.5em 1em 0.1em 1em",
    position: "fixed",
    top: "50%",
    transform: "translate(-50%, -50%)",
    width: "500px",
    zIndex: 10
  });
}
