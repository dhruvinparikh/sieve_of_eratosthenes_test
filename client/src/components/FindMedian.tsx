/**
 * The APIClient component renders the data received from
 * backend via API call.
 */
import * as React from "react";
import { style } from "typestyle";
import {
  Button,
  Card,
  Container,
  Icon,
  Input,
  InputOnChangeData,
  Message,
  Segment,
  Menu
} from "semantic-ui-react";
import { BaseComponent } from "./BaseComponent";
import {
  MathMedianRetrieval,
  MathMedianResult,
  MathBackendManager,
} from "../api/BackendManager";
import { IBackendMedianRequestData } from "../api/BackendRequest";
import { CustomError } from "../utils/error";
import { isError, isCustomError } from "../utils/typeguards";

//#region CSS

const cssFlexContainer = style({
  display: "flex",
  flexDirection: "row",
  flexWrap: "wrap",
});

const cssFlexItem = style({
  flex: "1 0 auto",
  marginTop: "1rem !important",
});

const cssInputHeader = style({
  display: "block",
  fontSize: "1.3em",
  fontWeight: "bold",
  marginBottom: "0.8em",
  marginTop: "0.4em",
});

const cssInputFootnote = style({
  marginTop: "1em",
  overflow: "hidden",
  width: "27ch",
});

const cssButton = style({
  marginBottom: "0.9em !important",
  marginTop: "1.5em !important",
});

//#endregion

const FindMedianContent: React.FC = (_props) => {
  // API call is in progress
  const [inFlight, setInFlight] = React.useState<boolean>(false);

  // Name entered by user
  const [limit, setLimit] = React.useState<string | undefined>(undefined);

  const onLimitChange = (
    _evt: React.ChangeEvent<HTMLInputElement>,
    data: InputOnChangeData
  ) => {
    setLimit(data.value);
  };

  function isLimitValid(limitToCheck: string | undefined): boolean {
    return !!limitToCheck ? ((limitToCheck as unknown) as number) > 1 : false;
  }

  // API call outcome
  const [outcome, setOutcome] = React.useState<MathMedianRetrieval | undefined>(
    undefined
  );
  function isOutcomeFailure(): boolean {
    return isError(outcome) || isCustomError(outcome);
  }

  // HTML <input> used to enter a name
  const inputRef = React.useRef<Input>(null);
  React.useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // AbortController
  const [controller, setController] = React.useState<
    AbortController | undefined
  >(undefined);
  const abortFetch = () => {
    !!controller && controller.abort();
  };

  // Button click handler
  const onQuery = async () => {
    const apiTimeout = 5000;
    const reqData: IBackendMedianRequestData = { limit: limit! };

    abortFetch();
    const abortController = new AbortController();
    setController(abortController);

    const backendMgr = new MathBackendManager(abortController.signal);
    setInFlight(true);
    const ret: boolean = await Promise.race([
      backendMgr.fetch(reqData),
      new Promise<boolean>((resolve) => setTimeout(resolve, apiTimeout, false)),
    ]);
    setInFlight(false);

    const data = ret
      ? backendMgr.MedianData
      : (abortFetch(),
        new CustomError(
          "Could not get data from the backend, it didn't respond in a timely fashion." +
            " If the problem persists please contact Support.",
          "Timeout fetching data"
        ));

    // setOutcome({ response: { medians: [5, 7] } });
    setOutcome(data);
    setController(undefined);
  };

  // Helper function
  function getMedian(): string {
    return !outcome || isOutcomeFailure()
      ? "unknown"
      : String((outcome as MathMedianResult).response.medians);
  }

  //#region Render

  return (
    <section>
      <Container text textAlign="justified">
        <div className={cssFlexContainer}>
          <Segment compact basic className={cssFlexItem}>
            <div className={cssInputHeader}>Limit to compute</div>
            <Input
              type="text"
              maxLength="32"
              style={{ width: "27ch" }}
              error={!isLimitValid(limit)}
              onChange={onLimitChange}
              ref={inputRef}
            />
            <div className={cssInputFootnote}>
              Type a number e.g. &nbsp; <code>200</code>.<br />
              Then click on the button to find median(s).
            </div>
          </Segment>

          <Segment basic className={cssFlexItem}>
            <Card>
              <Card.Content>
                <Card.Header>Median(s)</Card.Header>
                <Card.Meta>{`Result: ${getMedian()}`}</Card.Meta>
                <div style={{ textAlign: "center" }}>
                  <Button
                    className={cssButton}
                    size="tiny"
                    color="blue"
                    disabled={!isLimitValid(limit) || inFlight}
                    onClick={onQuery}
                    loading={inFlight}
                  >
                    <Icon name="search" />
                    Find median(s)
                  </Button>
                </div>
              </Card.Content>
            </Card>
          </Segment>
        </div>
        <p />
        <Message
          hidden={!outcome || !isOutcomeFailure()}
          error={true}
          content={isOutcomeFailure() ? (outcome as Error).message : undefined}
          header="Error"
        />
      </Container>
    </section>
  );

  //#endregion
};

const Navigation: React.FC = _props => {
  return (
    <nav>
      <Menu vertical compact borderless>
        <Menu.Item>
          <Menu.Header>Go back to</Menu.Header>
          <Menu.Menu>
            <Menu.Item href="/">Overview</Menu.Item>
          </Menu.Menu>
        </Menu.Item>
      </Menu>
    </nav>
  );
};

export const FindMedian: React.FC = (_props) => {
  return (
    <BaseComponent
      leftComponent={Navigation}
      rightComponent={FindMedianContent}
    />
  );
};
