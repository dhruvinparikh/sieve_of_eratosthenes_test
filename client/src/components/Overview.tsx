/**
 * Overview is a sample component that provides
 * an overview of the First SPA it belongs to.
 * Uses BaseComponent for rendering.
 */
import * as React from "react";
import { Header, Container } from "semantic-ui-react";
import { Navigation } from "./Navigation";
import { BaseComponent } from "./BaseComponent";

const Description: React.FC = _props => {
  return (
    <>
      <Container text textAlign="justified">
        <Header as="h4">
          Overview of the application
        </Header>
         <p>Front end where user can input number, and receive the result of math function such as <b>find Median</b> with an appropriate error message</p>
      </Container>
    </>
  );
};

export const Overview: React.FC = _props => {
  return (
    <BaseComponent leftComponent={Navigation} rightComponent={Description} />
  );
};
