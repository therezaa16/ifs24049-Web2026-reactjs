import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, fireEvent } from "@testing-library/react";
import AddModal from "./AddModal";
import { renderWithProviders } from "../../../test-utils";
import * as toolsHelper from "../../../helpers/toolsHelper";
import * as lostFoundAction from "../states/action";

const onSaved = vi.fn();

describe("AddModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should not render when show is false", () => {
    const { container } = renderWithProviders(<AddModal show={false} onClose={vi.fn()} onSaved={onSaved} />);
    expect(container.firstChild).toBeNull();
  });

  it("should show validation error if title is empty", () => {
    const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => {});

    renderWithProviders(<AddModal show={true} onClose={vi.fn()} onSaved={onSaved} />);

    const form = screen.getByTestId("add-lost-found-modal").querySelector("form");
    fireEvent.submit(form);

    expect(errorSpy).toHaveBeenCalledWith("Judul tidak boleh kosong");
  });

  it("should show validation error if description is empty", () => {
    const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => {});

    renderWithProviders(<AddModal show={true} onClose={vi.fn()} onSaved={onSaved} />);

    const titleInput = screen.getByTestId("add-lost-found-title-input");
    fireEvent.change(titleInput, { target: { value: "Judul Laporan" } });

    const form = screen.getByTestId("add-lost-found-modal").querySelector("form");
    fireEvent.submit(form);

    expect(errorSpy).toHaveBeenCalledWith("Deskripsi tidak boleh kosong");
  });

  it("should dispatch asyncSetIsLostFoundAdd and call onClose on successful add", () => {
    const asyncAddSpy = vi.spyOn(lostFoundAction, "asyncSetIsLostFoundAdd").mockReturnValue(() => {});
    const onClose = vi.fn();

    renderWithProviders(<AddModal show={true} onClose={onClose} onSaved={onSaved} />, {
      preloadedState: {
        isLostFoundAdd: false,
        isLostFoundAdded: false,
      },
    });

    const titleInput = screen.getByTestId("add-lost-found-title-input");
    const descInput = screen.getByTestId("add-lost-found-description-input");

    fireEvent.change(titleInput, { target: { value: "Belajar Vitest" } });
    fireEvent.change(descInput, { target: { value: "Belajar sampai coverage 100%" } });

    const form = screen.getByTestId("add-lost-found-modal").querySelector("form");
    fireEvent.submit(form);

    expect(asyncAddSpy).toHaveBeenCalledWith("Belajar Vitest", "Belajar sampai coverage 100%", "lost");
    expect(screen.getByText("Menyimpan...")).toBeInTheDocument();

    // Simulate completion from store
    renderWithProviders(<AddModal show={true} onClose={onClose} onSaved={onSaved} />, {
      preloadedState: {
        isLostFoundAdd: true,
        isLostFoundAdded: true,
      },
    });

    expect(onSaved).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });

  it("should send the selected report type", () => {
    const asyncAddSpy = vi.spyOn(lostFoundAction, "asyncSetIsLostFoundAdd").mockReturnValue(() => {});
    renderWithProviders(<AddModal show={true} onClose={vi.fn()} onSaved={onSaved} />);

    fireEvent.change(screen.getByTestId("add-lost-found-title-input"), { target: { value: "Dompet" } });
    fireEvent.change(screen.getByTestId("add-lost-found-description-input"), { target: { value: "Ditemukan di kantin" } });
    fireEvent.change(screen.getByTestId("add-lost-found-status-select"), { target: { value: "found" } });
    fireEvent.submit(screen.getByTestId("add-lost-found-modal").querySelector("form"));

    expect(asyncAddSpy).toHaveBeenCalledWith("Dompet", "Ditemukan di kantin", "found");
  });

  it("should restore body scroll when hidden", () => {
    document.body.style.overflow = "scroll";
    const { rerender } = renderWithProviders(<AddModal show={true} onClose={vi.fn()} onSaved={onSaved} />);
    expect(document.body.style.overflow).toBe("hidden");
    rerender(<AddModal show={false} onClose={vi.fn()} onSaved={onSaved} />);
    expect(document.body.style.overflow).toBe("scroll");
    document.body.style.overflow = "";
  });

  it("should handle isLostFoundAdd true when isLostFoundAdded is false", () => {
    renderWithProviders(<AddModal show={true} onClose={vi.fn()} onSaved={onSaved} />, {
      preloadedState: {
        isLostFoundAdd: true,
        isLostFoundAdded: false,
      },
    });

    expect(screen.getByTestId("add-lost-found-modal")).toBeInTheDocument();
  });

  it("should close modal when close or cancel button clicked", () => {
    const onClose = vi.fn();
    renderWithProviders(<AddModal show={true} onClose={onClose} onSaved={onSaved} />);

    const closeBtn = screen.getByTestId("close-add-modal-btn");
    fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalledTimes(1);

    const cancelBtn = screen.getByTestId("cancel-add-modal-btn");
    fireEvent.click(cancelBtn);
    expect(onClose).toHaveBeenCalledTimes(2);
  });
});
