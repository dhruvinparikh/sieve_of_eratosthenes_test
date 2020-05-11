/**
 * Tests for Overview using React Testing Library
 * with Jest adaptors.
 */
import * as React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { render } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import { Overview } from "../components/Overview";

describe("Testing Overview", () => {
  test("Basic tests", async () => {
    const { container, getByText, getAllByText } = render(
      <Router>
        {/* <Overview> uses <Link> that requires <Router> to be present */}
        <Overview />
        );
      </Router>
    );

    getByText((content) => content.startsWith("Overview of the application"));
    expect(
      getAllByText("find Median", { exact: true, selector: "b" })[0]
    ).toBeVisible();

    // Testing find median to show how to find a DOM element. In this case it's the menu header.
    // Selector to find Semantic UI menu header
    const cssSelector =
      "nav " +
      "div.ui.borderless.compact.vertical.menu " +
      "div.item div.header";

    // find our menu header
    const element = container.querySelector(cssSelector);
    // and test its content
    expect(element).toHaveTextContent("Math Operations");
  });
});
