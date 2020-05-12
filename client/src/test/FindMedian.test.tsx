/**
 * Tests for Overview using React Testing Library
 * with Jest adaptors.
 */
import * as React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { render, fireEvent } from "@testing-library/react";
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

  test("Input value should be same as filled", async () => {
    const { container } = render(
      <Router>
        <FindMedian />
      </Router>
    );
    const cssInput = "input";
    const element = container.querySelector(cssInput);
    fireEvent.change(element!, { target: { value: "23" } });
    expect(element?.value).toBe("23");
  });

  test("Button should be disabled when input is invalid", async () => {
    const { container } = render(
      <Router>
        <FindMedian />
      </Router>
    );
    const cssInput = "input";
    const elementInput = container.querySelector(cssInput);
    fireEvent.change(elementInput!, { target: { value: "kk" } });
    const cssButton = "button";
    const element = container.querySelector(cssButton);
    expect(element?.disabled).toBe(true);
  });

  test("Button should be enabled when input is valid", async () => {
    const { container } = render(
      <Router>
        <FindMedian />
      </Router>
    );
    const cssInput = "input";
    const elementInput = container.querySelector(cssInput);
    fireEvent.change(elementInput!, { target: { value: "200" } });
    const cssButton = "button";
    const element = container.querySelector(cssButton);
    expect(element?.disabled).toBe(false);
  });
});
