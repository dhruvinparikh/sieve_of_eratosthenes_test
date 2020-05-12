/**
 * Tests for Overview using React Testing Library
 * with Jest adaptors.
 */
import * as React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { render } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import { FindMedian } from "../components/FindMedian";

describe("Testing QueryPageContainer", () => {
  // Demonstrates how to test static rendering
  test("Basic tests", async () => {
    const { /*container, getByText, getAllByText,*/ queryByText } = render(
      <Router>
        <FindMedian />
        );
      </Router>
    );
    expect(
      queryByText("Go back to", { exact: true, selector: "div" })
    ).toBeVisible();

    expect(
      queryByText("Overview", { exact: true, selector: "a" })
    ).toBeVisible();

    expect(queryByText("Limit to compute", { selector: "div" })).toBeVisible();

    expect(
      queryByText("Median(s)", { exact: true, selector: "div" })
    ).toBeVisible();
  });

  test("Button should be disbaled when input is empty", async () => {
    const { container } = render(
      <Router>
        <FindMedian />
      </Router>
    );
    const cssButton = "button";
    const element = container.querySelector(cssButton);
    expect(element?.disabled).toBe(true);
  });

  test("Button should be disabled when input is invalid", async () => {
    // test suite when input is invalid
  });

  test("Button should be enabled when input is valid", async () => {
    // test suite when input is valid
  });
});
