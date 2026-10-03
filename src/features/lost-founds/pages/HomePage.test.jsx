import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, fireEvent, waitFor, act } from "@testing-library/react";
import HomePage from "./HomePage";
import { renderWithProviders } from "../../../test-utils";
import * as toolsHelper from "../../../helpers/toolsHelper";
import * as lostFoundAction from "../states/action";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const profile = { id: 1, name: "Tester", email: "t@delcom.org" };

const items = [
  {
    id: 1,
    user_id: 1,
    title: "Dompet Hitam",
    description: "Hilang di kantin",
    status: "lost",
    is_completed: 0,
    cover: "https://img.test/dompet.png",
    created_at: "2026-10-01T10:00:00.000000Z",
    updated_at: "2026-10-01T10:00:00.000000Z",
    author: { name: "Eliza", photo: null },
  },
  {
    id: 2,
    user_id: 2,
    title: "Kunci Motor",
    description: "Ditemukan di parkiran",
    status: "found",
    is_completed: 1,
    cover: null,
    created_at: "2026-10-02T10:00:00.000000Z",
    updated_at: "2026-10-02T10:00:00.000000Z",
    author: { name: "Budi", photo: null },
  },
];

const fullStats = {
  stats_losts: { "01-10-2026": 2, "02-10-2026": 0 },
  stats_losts_completed: { "01-10-2026": 1, "02-10-2026": 0 },
  stats_losts_process: { "01-10-2026": 1, "02-10-2026": 0 },
  stats_founds: { "01-10-2026": 1, "02-10-2026": 3 },
  stats_founds_completed: { "01-10-2026": 0, "02-10-2026": 2 },
  stats_founds_process: { "01-10-2026": 1, "02-10-2026": 1 },
};

describe("HomePage", () => {
  let listSpy;
  let statsSpy;

  beforeEach(() => {
    vi.clearAllMocks();
    listSpy = vi
      .spyOn(lostFoundAction, "asyncSetLostFounds")
      .mockReturnValue(() => Promise.resolve());
    statsSpy = vi
      .spyOn(lostFoundAction, "asyncSetLostFoundStats")
      .mockReturnValue(() => Promise.resolve());
    vi.spyOn(lostFoundAction, "asyncSetLostFound").mockReturnValue(() => {});
  });

  function renderPage(preloadedState = {}) {
    return renderWithProviders(<HomePage />, {
      preloadedState: { profile, lostFounds: items, ...preloadedState },
    });
  }

  it("should render nothing when profile is missing", () => {
    const { container } = renderWithProviders(<HomePage />, {
      preloadedState: { profile: null },
    });
    expect(container.firstChild).toBeNull();
  });

  it("should load reports and daily stats on mount", () => {
    renderPage();
    expect(listSpy).toHaveBeenCalledWith({ status: "", is_completed: "", is_me: "" });
    expect(statsSpy).toHaveBeenCalledWith("daily");
  });

  it("should render stat cards and report rows", () => {
    renderPage();

    expect(screen.getByTestId("stat-card-Total Laporan")).toHaveTextContent("2");
    expect(screen.getByTestId("stat-card-Barang Hilang")).toHaveTextContent("1");
    expect(screen.getByTestId("stat-card-Barang Ditemukan")).toHaveTextContent("1");
    expect(screen.getByTestId("stat-card-Selesai")).toHaveTextContent("1");

    expect(screen.getByTestId("lost-found-row-1")).toHaveTextContent("Dompet Hitam");
    expect(screen.getByTestId("lost-found-row-1")).toHaveTextContent("Eliza");
    expect(screen.getByTestId("lost-found-row-1")).toHaveTextContent("Proses");
    expect(screen.getByAltText("Dompet Hitam")).toBeInTheDocument();
    expect(screen.getByTestId("lost-found-row-2")).toHaveTextContent("Ditemukan");
    expect(screen.getByTestId("lost-found-row-2")).toHaveTextContent("Selesai");
    expect(screen.queryByAltText("Kunci Motor")).not.toBeInTheDocument();
  });

  it("should show empty state when there are no reports", async () => {
    renderPage({ lostFounds: [] });
    await waitFor(() =>
      expect(screen.getByText("Belum ada laporan yang cocok.")).toBeInTheDocument()
    );
  });

  it("should show loading state while reports are being fetched", () => {
    listSpy.mockReturnValue(() => new Promise(() => {}));
    renderPage({ lostFounds: [] });
    expect(screen.getByText("Memuat daftar laporan...")).toBeInTheDocument();
  });

  it("should filter rows by search keyword", async () => {
    renderPage();
    await act(async () => {});
    const input = screen.getByTestId("search-lost-found-input");

    fireEvent.change(input, { target: { value: "kantin" } });
    expect(screen.getByTestId("lost-found-row-1")).toBeInTheDocument();
    expect(screen.queryByTestId("lost-found-row-2")).not.toBeInTheDocument();

    fireEvent.change(input, { target: { value: "KUNCI" } });
    expect(screen.queryByTestId("lost-found-row-1")).not.toBeInTheDocument();
    expect(screen.getByTestId("lost-found-row-2")).toBeInTheDocument();

    fireEvent.change(input, { target: { value: "tidak ada" } });
    expect(screen.getByText("Belum ada laporan yang cocok.")).toBeInTheDocument();
  });

  it("should reload reports when status filters change", () => {
    renderPage();

    fireEvent.click(screen.getByTestId("filter-lost-btn"));
    expect(listSpy).toHaveBeenLastCalledWith({ status: "lost", is_completed: "", is_me: "" });
    expect(screen.getByTestId("filter-lost-btn")).toHaveAttribute("aria-pressed", "true");

    fireEvent.click(screen.getByTestId("filter-found-btn"));
    expect(listSpy).toHaveBeenLastCalledWith({ status: "found", is_completed: "", is_me: "" });

    fireEvent.click(screen.getByTestId("filter-all-btn"));
    expect(listSpy).toHaveBeenLastCalledWith({ status: "", is_completed: "", is_me: "" });
  });

  it("should reload reports when completion and ownership filters change", () => {
    renderPage();

    fireEvent.change(screen.getByTestId("filter-completed-select"), {
      target: { value: "1" },
    });
    expect(listSpy).toHaveBeenLastCalledWith({ status: "", is_completed: "1", is_me: "" });

    fireEvent.click(screen.getByTestId("filter-mine-checkbox"));
    expect(listSpy).toHaveBeenLastCalledWith({ status: "", is_completed: "1", is_me: 1 });
  });

  it("should render statistics and switch period", () => {
    renderPage({ lostFoundStats: fullStats });

    expect(screen.getByTestId("stats-summary")).toHaveTextContent("Hilang2");
    expect(screen.getByTestId("stats-summary")).toHaveTextContent("Ditemukan4");
    expect(screen.getByTestId("stats-summary")).toHaveTextContent("Proses3");
    expect(screen.getByTestId("stats-summary")).toHaveTextContent("Selesai3");
    expect(screen.getByTestId("stats-list")).toHaveTextContent("01-10-2026");
    expect(screen.getByTestId("stats-daily-btn")).toHaveAttribute("aria-pressed", "true");

    fireEvent.click(screen.getByTestId("stats-monthly-btn"));
    expect(statsSpy).toHaveBeenLastCalledWith("monthly");
    expect(screen.getByTestId("stats-monthly-btn")).toHaveAttribute("aria-pressed", "true");

    fireEvent.click(screen.getByTestId("stats-daily-btn"));
    expect(statsSpy).toHaveBeenLastCalledWith("daily");
  });

  it("should tolerate partial statistics data", () => {
    renderPage({
      lostFoundStats: {
        stats_losts: { "06-2026": 1 },
        stats_founds: { "06-2026": 0 },
      },
    });
    expect(screen.getByTestId("stats-summary")).toHaveTextContent("Proses0");
  });

  it("should show empty statistics message when stats are unavailable", () => {
    renderPage({ lostFoundStats: null });
    expect(screen.getByTestId("stats-empty")).toBeInTheDocument();
  });

  it("should open and close AddModal", () => {
    renderPage();
    expect(screen.queryByTestId("add-lost-found-modal")).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId("add-lost-found-btn"));
    expect(screen.getByTestId("add-lost-found-modal")).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("close-add-modal-btn"));
    expect(screen.queryByTestId("add-lost-found-modal")).not.toBeInTheDocument();
  });

  it("should reload data after a report was saved", () => {
    renderPage({ isLostFoundAdd: true, isLostFoundAdded: true });
    expect(listSpy.mock.calls.length).toBeGreaterThanOrEqual(2);
    expect(statsSpy.mock.calls.length).toBeGreaterThanOrEqual(2);
  });

  it("should open and close ChangeModal for selected report", () => {
    renderPage({ lostFound: items[0] });

    fireEvent.click(screen.getByTestId("edit-lost-found-1"));
    expect(screen.getByTestId("edit-lost-found-modal")).toBeInTheDocument();
    expect(lostFoundAction.asyncSetLostFound).toHaveBeenCalledWith(1);

    fireEvent.click(screen.getByTestId("close-edit-modal-btn"));
    expect(screen.queryByTestId("edit-lost-found-modal")).not.toBeInTheDocument();
  });

  it("should navigate to detail page when view button clicked", () => {
    renderPage();
    fireEvent.click(screen.getByTestId("view-lost-found-2"));
    expect(mockNavigate).toHaveBeenCalledWith("/lost-founds/2");
  });

  it("should dispatch delete when confirmed", async () => {
    const deleteSpy = vi
      .spyOn(lostFoundAction, "asyncSetIsLostFoundDelete")
      .mockReturnValue(() => {});
    vi.spyOn(toolsHelper, "showConfirmDialog").mockResolvedValue({ isConfirmed: true });
    renderPage();

    fireEvent.click(screen.getByTestId("delete-lost-found-1"));
    await waitFor(() => expect(deleteSpy).toHaveBeenCalledWith(1));
  });

  it("should not delete when confirmation is cancelled", async () => {
    const deleteSpy = vi
      .spyOn(lostFoundAction, "asyncSetIsLostFoundDelete")
      .mockReturnValue(() => {});
    const confirmSpy = vi
      .spyOn(toolsHelper, "showConfirmDialog")
      .mockResolvedValue({ isConfirmed: false });
    renderPage();

    fireEvent.click(screen.getByTestId("delete-lost-found-1"));
    await waitFor(() => expect(confirmSpy).toHaveBeenCalled());
    await act(async () => {});
    expect(deleteSpy).not.toHaveBeenCalled();
  });

  it("should reload data and reset flag when a report has been deleted", async () => {
    const { store } = renderPage({ isLostFoundDeleted: true, isLostFoundDelete: true });

    await waitFor(() => expect(store.getState().isLostFoundDeleted).toBe(false));
    expect(store.getState().isLostFoundDelete).toBe(false);
    expect(listSpy.mock.calls.length).toBeGreaterThanOrEqual(2);
    expect(statsSpy.mock.calls.length).toBeGreaterThanOrEqual(2);
  });
});
