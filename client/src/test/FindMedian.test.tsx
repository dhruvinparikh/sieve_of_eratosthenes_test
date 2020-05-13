/**
 * Tests for Overview using React Testing Library
 * with Jest adaptors.
 */
import * as React from "react";
import * as ReactDOM from "react-dom";
import { BrowserRouter as Router } from "react-router-dom";
import { render, fireEvent, act } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import {
  FindMedian,
} from "../components/FindMedian";

const testValidLimit = "200";
const testInvalidLimit = "kk";

describe("Testing FindMedian Page", () => {
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
    fireEvent.change(element!, { target: { value: testValidLimit } });
    expect(element?.value).toBe(testValidLimit);
  });

  test("Button should be disabled when input is invalid", async () => {
    const { container } = render(
      <Router>
        <FindMedian />
      </Router>
    );
    const cssInput = "input";
    const elementInput = container.querySelector(cssInput);
    fireEvent.change(elementInput!, { target: { value: testInvalidLimit } });
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
    fireEvent.change(elementInput!, { target: { value: testValidLimit } });
    const cssButton = "button";
    const element = container.querySelector(cssButton);
    expect(element?.disabled).toBe(false);
  });

  test("The median should be visible when find median button is clicked", async () => {
    const { container /*, queryByText*/ } = render(
      <Router>
        <FindMedian />
      </Router>
    );
    act(() => {
      ReactDOM.render(
        <Router>
          <FindMedian />
        </Router>,
        container
      );
    });
    const cssInput = "input";
    const elementInput = container.querySelector(cssInput);
    fireEvent.change(elementInput!, { target: { value: testValidLimit } });
    expect(elementInput?.value).toBe(testValidLimit);
    const cssButton = "button";
    const elementButton = container.querySelector(cssButton);
    expect(elementButton?.disabled).toBe(false);
    // act(() => {
    //   fireEvent.click(elementButton!, { button: 0 });
    //   console.log(queryByText(/Result/i, { selector: "div" }));
    // });
    // expect(queryByText(/Result/i, { selector: "div" })).toBeVisible();
  });
});
