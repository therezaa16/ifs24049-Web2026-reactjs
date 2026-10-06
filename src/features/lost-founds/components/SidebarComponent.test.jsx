import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, fireEvent } from "@testing-library/react";
import SidebarComponent from "./SidebarComponent";
import { renderWithProviders } from "../../../test-utils";

describe("SidebarComponent", () => {
  beforeEach(() => {
    window.history.pushState({}, "", "/");
  });

  it("should render navigation links properly", () => {
    renderWithProviders(
      <SidebarComponent isSidebarOpen={false} onCloseMobile={vi.fn()} />
    );

    expect(screen.getByText("Dashboard Laporan")).toBeInTheDocument();
    expect(screen.getByText("Statistik")).toBeInTheDocument();
    expect(screen.getByText("Semua Pengguna")).toBeInTheDocument();
    expect(screen.getByText("Profil Saya")).toBeInTheDocument();
    expect(screen.queryByTestId("sidebar-backdrop")).not.toBeInTheDocument();
  });

  it("should mark the dashboard link as active on the root path", () => {
    renderWithProviders(
      <SidebarComponent isSidebarOpen={false} onCloseMobile={vi.fn()} />
    );

    expect(screen.getByText("Dashboard Laporan").closest("a")).toHaveAttribute(
      "aria-current",
      "page"
    );
    expect(screen.getByText("Statistik").closest("a")).not.toHaveAttribute(
      "aria-current"
    );
  });

  it("should render backdrop and close when backdrop clicked", () => {
    const onCloseMobile = vi.fn();
    renderWithProviders(
      <SidebarComponent isSidebarOpen={true} onCloseMobile={onCloseMobile} />
    );

    const backdrop = screen.getByTestId("sidebar-backdrop");
    fireEvent.click(backdrop);
    expect(onCloseMobile).toHaveBeenCalled();
  });

  it("should close the open mobile menu when Escape is pressed", () => {
    const onCloseMobile = vi.fn();
    renderWithProviders(
      <SidebarComponent isSidebarOpen={true} onCloseMobile={onCloseMobile} />
    );

    fireEvent.keyDown(document, { key: "Enter" });
    expect(onCloseMobile).not.toHaveBeenCalled();

    fireEvent.keyDown(document, { key: "Escape" });
    expect(onCloseMobile).toHaveBeenCalledTimes(1);
  });

  it("should call onCloseMobile and activate statistik link when clicked", () => {
    const onCloseMobile = vi.fn();
    renderWithProviders(
      <SidebarComponent isSidebarOpen={true} onCloseMobile={onCloseMobile} />
    );

    fireEvent.click(screen.getByText("Statistik"));
    expect(onCloseMobile).toHaveBeenCalled();
    expect(screen.getByText("Statistik").closest("a")).toHaveAttribute(
      "aria-current",
      "page"
    );
  });

  it("should navigate to other pages when links are clicked", () => {
    renderWithProviders(
      <SidebarComponent isSidebarOpen={true} onCloseMobile={vi.fn()} />
    );

    fireEvent.click(screen.getByText("Semua Pengguna"));
    expect(window.location.pathname).toBe("/users");
  });
});
