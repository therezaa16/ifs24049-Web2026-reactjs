import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, fireEvent, waitFor, act } from "@testing-library/react";
import DetailPage from "./DetailPage";
import { renderWithProviders } from "../../../test-utils";
import * as toolsHelper from "../../../helpers/toolsHelper";
import * as lostFoundAction from "../states/action";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ lostFoundId: "1" }),
  };
});

describe("DetailPage", () => {
  const mockProfile = { id: 1, name: "Eliza", email: "eliza@del.org" };
  const lostItem = {
    id: 1,
    user_id: 1,
    title: "Dompet Hitam",
    description: "Hilang di kantin lantai 2",
    status: "lost",
    is_completed: 0,
    cover: "https://example.com/cover.jpg",
    created_at: "2026-10-01T02:34:26.000000Z",
    updated_at: "2026-10-02T02:44:47.000000Z",
    author: { name: "Eliza", photo: null },
  };
  const foundItem = {
    ...lostItem,
    status: "found",
    is_completed: 1,
    cover: null,
  };

  let fetchSpy;

  beforeEach(() => {
    vi.clearAllMocks();
    fetchSpy = vi
      .spyOn(lostFoundAction, "asyncSetLostFound")
      .mockReturnValue(() => {});
  });

  function renderPage(preloadedState) {
    return renderWithProviders(<DetailPage />, {
      preloadedState: { profile: mockProfile, lostFound: lostItem, ...preloadedState },
    });
  }

  it("should fetch detail by route param on mount", () => {
    renderPage();
    expect(fetchSpy).toHaveBeenCalledWith("1");
  });

  it("should render loading status when profile or report is missing", () => {
    renderPage({ profile: null });
    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.queryByText("Dompet Hitam")).not.toBeInTheDocument();
  });

  it("should render lost and unfinished report with cover", () => {
    renderPage();

    expect(screen.getByRole("heading", { name: "Dompet Hitam" })).toBeInTheDocument();
    expect(screen.getByText("Hilang di kantin lantai 2")).toBeInTheDocument();
    expect(screen.getByTestId("detail-type-badge")).toHaveTextContent("Barang Hilang");
    expect(screen.getByText("Masih Diproses")).toBeInTheDocument();
    expect(screen.getByAltText("Dompet Hitam")).toHaveAttribute(
      "src",
      "https://example.com/cover.jpg"
    );
    expect(screen.getByText("Pelapor:")).toBeInTheDocument();
  });

  it("should render found and completed report without cover", () => {
    renderPage({ lostFound: foundItem });

    expect(screen.getByTestId("detail-type-badge")).toHaveTextContent("Barang Ditemukan");
    expect(screen.getByText("Selesai")).toBeInTheDocument();
    expect(screen.queryByAltText("Dompet Hitam")).not.toBeInTheDocument();
  });

  it("should redirect home when report could not be loaded", () => {
    const { store } = renderPage({ lostFound: null, isLostFound: true });
    expect(mockNavigate).toHaveBeenCalledWith("/");
    expect(store.getState().isLostFound).toBe(false);
  });

  it("should stay on page when report loaded successfully", () => {
    renderPage({ isLostFound: true });
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("should open and close cover and edit modals", () => {
    renderPage();

    fireEvent.click(screen.getByTestId("edit-cover-btn"));
    expect(screen.getByTestId("change-cover-modal")).toBeInTheDocument();
    fireEvent.click(screen.getByTestId("close-cover-modal-btn"));
    expect(screen.queryByTestId("change-cover-modal")).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId("edit-detail-lost-found-btn"));
    expect(screen.getByTestId("edit-lost-found-modal")).toBeInTheDocument();
    fireEvent.click(screen.getByTestId("close-edit-modal-btn"));
    expect(screen.queryByTestId("edit-lost-found-modal")).not.toBeInTheDocument();
  });

  it("should reload detail after cover or data was saved", () => {
    renderPage({ isLostFoundChangedCover: true, isLostFoundChangeCover: true });
    expect(fetchSpy).toHaveBeenCalledWith(1);
  });

  it("should dispatch delete when confirmed", async () => {
    const deleteSpy = vi
      .spyOn(lostFoundAction, "asyncSetIsLostFoundDelete")
      .mockReturnValue(() => {});
    vi.spyOn(toolsHelper, "showConfirmDialog").mockResolvedValue({ isConfirmed: true });
    renderPage();

    fireEvent.click(screen.getByTestId("delete-detail-lost-found-btn"));
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

    fireEvent.click(screen.getByTestId("delete-detail-lost-found-btn"));
    await waitFor(() => expect(confirmSpy).toHaveBeenCalled());
    await act(async () => {});
    expect(deleteSpy).not.toHaveBeenCalled();
  });

  it("should navigate home and reset flags after deletion", () => {
    const { store } = renderPage({ isLostFoundDeleted: true, isLostFoundDelete: true });
    expect(mockNavigate).toHaveBeenCalledWith("/");
    expect(store.getState().isLostFoundDeleted).toBe(false);
    expect(store.getState().isLostFoundDelete).toBe(false);
  });
});
