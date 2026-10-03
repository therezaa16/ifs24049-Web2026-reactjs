import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import App from "./App";
import { renderWithProviders } from "./test-utils";

describe("App Component", () => {
  it("should render application without crashing", () => {
    const { container } = renderWithProviders(<App />);
    expect(container).toBeDefined();
  });

  it("should render 404 NotFoundPage for invalid route", () => {
    window.history.pushState({}, "Not Found", "/random-invalid-route");
    renderWithProviders(<App />);
    expect(screen.getByText("404")).toBeInTheDocument();
    expect(screen.getByText("Halaman Tidak Ditemukan")).toBeInTheDocument();
  });
});

