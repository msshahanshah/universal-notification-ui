import { render, screen } from "@testing-library/react";

import Login from "./login";

test("renders username, password and submit button", () => {
  render(<Login />);
  expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /submit/i })).toBeInTheDocument();
});

test("submit button disabled initially", () => {
  render(<Login />);
  expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  const submitButton = screen.getByRole("button", { name: /submit/i });
  expect(submitButton).toBeDisabled();
});
