import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, fireEvent } from "@testing-library/react";
import ChangeModal from "./ChangeModal";
import { renderWithProviders } from "../../../test-utils";
import * as toolsHelper from "../../../helpers/toolsHelper";
import * as lostFoundAction from "../states/action";

const onSaved = vi.fn();

describe("ChangeModal", () => {
  const mockLostFound = {
    id: 1,
    title: "Initial Title",
    description: "Initial Desc",
    status: "lost",
    is_completed: 0,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(lostFoundAction, "asyncSetLostFound").mockReturnValue(() => {});
  });

  function renderModal(props = {}, preloadedState = { lostFound: mockLostFound }) {
    return renderWithProviders(
      <ChangeModal
        show={true}
        onClose={vi.fn()}
        onSaved={onSaved}
        lostFoundId={1}
        {...props}
      />,
      { preloadedState }
    );
  }

  it("should not render when show is false", () => {
    document.body.style.overflow = "scroll";
    const { container } = renderModal({ show: false });
    expect(container.firstChild).toBeNull();
    expect(document.body.style.overflow).toBe("scroll");
    expect(lostFoundAction.asyncSetLostFound).not.toHaveBeenCalled();
    document.body.style.overflow = "";
  });

  it("should fetch detail and populate inputs when shown", () => {
    renderModal();

    expect(lostFoundAction.asyncSetLostFound).toHaveBeenCalledWith(1);
    expect(document.body.style.overflow).toBe("hidden");
    expect(screen.getByTestId("edit-lost-found-title-input").value).toBe("Initial Title");
    expect(screen.getByTestId("edit-lost-found-description-input").value).toBe("Initial Desc");
    expect(screen.getByTestId("edit-lost-found-type-select").value).toBe("lost");
    expect(screen.getByTestId("edit-lost-found-status-select").value).toBe("0");
  });

  it("should restore body scroll when the modal is unmounted", () => {
    document.body.style.overflow = "scroll";
    const { unmount } = renderModal();
    expect(document.body.style.overflow).toBe("hidden");
    unmount();
    expect(document.body.style.overflow).toBe("scroll");
    document.body.style.overflow = "";
  });

  it("should reflect found and completed report data", () => {
    renderModal({}, { lostFound: { ...mockLostFound, status: "found", is_completed: 1 } });

    expect(screen.getByTestId("edit-lost-found-type-select").value).toBe("found");
    expect(screen.getByTestId("edit-lost-found-status-select").value).toBe("1");
  });

  it("should not populate or fetch when the stored report belongs to another id", () => {
    renderModal({}, { lostFound: { ...mockLostFound, id: 99 } });
    expect(screen.getByTestId("edit-lost-found-title-input").value).toBe("");
    expect(screen.getByTestId("submit-edit-modal-btn")).toBeDisabled();
  });

  it("should prevent submitting until the selected report has loaded", () => {
    const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => {});
    const changeSpy = vi.spyOn(lostFoundAction, "asyncSetIsLostFoundChange");
    renderModal({}, { lostFound: { ...mockLostFound, id: 99 } });

    fireEvent.submit(screen.getByTestId("edit-lost-found-title-input").closest("form"));

    expect(errorSpy).toHaveBeenCalledWith("Data laporan belum berhasil dimuat.");
    expect(changeSpy).not.toHaveBeenCalled();
  });

  it("should not fetch when lostFoundId is missing", () => {
    renderModal({ lostFoundId: null }, { lostFound: null });
    expect(lostFoundAction.asyncSetLostFound).not.toHaveBeenCalled();
  });

  it("should validate empty title and empty description", () => {
    const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => {});
    renderModal();

    const titleInput = screen.getByTestId("edit-lost-found-title-input");
    const form = titleInput.closest("form");

    fireEvent.change(titleInput, { target: { value: "   " } });
    fireEvent.submit(form);
    expect(errorSpy).toHaveBeenCalledWith("Judul tidak boleh kosong");

    fireEvent.change(titleInput, { target: { value: "Valid Title" } });
    fireEvent.change(screen.getByTestId("edit-lost-found-description-input"), {
      target: { value: "   " },
    });
    fireEvent.submit(form);
    expect(errorSpy).toHaveBeenCalledWith("Deskripsi tidak boleh kosong");
  });

  it("should dispatch change with current values and show loading", () => {
    const changeSpy = vi
      .spyOn(lostFoundAction, "asyncSetIsLostFoundChange")
      .mockReturnValue(() => {});
    renderModal();

    fireEvent.submit(screen.getByTestId("edit-lost-found-title-input").closest("form"));

    expect(changeSpy).toHaveBeenCalledWith(1, "Initial Title", "Initial Desc", "lost", 0);
    expect(screen.getByText("Menyimpan...")).toBeInTheDocument();
  });

  it("should dispatch change with edited type and completion", () => {
    const changeSpy = vi
      .spyOn(lostFoundAction, "asyncSetIsLostFoundChange")
      .mockReturnValue(() => {});
    renderModal();

    fireEvent.change(screen.getByTestId("edit-lost-found-type-select"), {
      target: { value: "found" },
    });
    fireEvent.change(screen.getByTestId("edit-lost-found-status-select"), {
      target: { value: "1" },
    });
    fireEvent.change(screen.getByTestId("edit-lost-found-title-input"), {
      target: { value: "  Baru  " },
    });
    fireEvent.submit(screen.getByTestId("edit-lost-found-title-input").closest("form"));

    expect(changeSpy).toHaveBeenCalledWith(1, "Baru", "Initial Desc", "found", 1);
  });

  it("should call onSaved and onClose when change succeeded", () => {
    const onClose = vi.fn();
    renderModal(
      { onClose },
      { lostFound: mockLostFound, isLostFoundChange: true, isLostFoundChanged: true }
    );

    expect(onSaved).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });

  it("should stay open when change failed", () => {
    const onClose = vi.fn();
    renderModal(
      { onClose },
      { lostFound: mockLostFound, isLostFoundChange: true, isLostFoundChanged: false }
    );

    expect(screen.getByTestId("edit-lost-found-title-input")).toBeInTheDocument();
    expect(onSaved).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });

  it("should trigger onClose on cancel or close button click", () => {
    const onClose = vi.fn();
    renderModal({ onClose });

    fireEvent.click(screen.getByTestId("close-edit-modal-btn"));
    expect(onClose).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByTestId("cancel-edit-modal-btn"));
    expect(onClose).toHaveBeenCalledTimes(2);
  });
});
