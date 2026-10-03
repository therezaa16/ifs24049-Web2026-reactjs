import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, fireEvent } from "@testing-library/react";
import ChangeCoverModal from "./ChangeCoverModal";
import { renderWithProviders } from "../../../test-utils";
import * as toolsHelper from "../../../helpers/toolsHelper";
import * as lostFoundAction from "../states/action";

const onSaved = vi.fn();

describe("ChangeCoverModal", () => {
  const mockLostFound = { id: 1, title: "LostFound Test" };

  beforeEach(() => {
    vi.clearAllMocks();
    global.URL.createObjectURL = vi.fn().mockReturnValue("blob:mock-url");
  });

  it("should not render when show is false", () => {
    const { container } = renderWithProviders(
      <ChangeCoverModal show={false} onClose={vi.fn()} onSaved={onSaved} lostFound={mockLostFound} />
    );
    expect(container.firstChild).toBeNull();
  });

  it("should validate file presence, file type, and file size", () => {
    const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => {});

    renderWithProviders(<ChangeCoverModal show={true} onClose={vi.fn()} onSaved={onSaved} lostFound={mockLostFound} />);

    const fileInput = screen.getByTestId("cover-file-input");
    const form = fileInput.closest("form");

    fireEvent.submit(form);
    expect(errorSpy).toHaveBeenCalledWith("Pilih file cover terlebih dahulu!");

    // Empty files test
    fireEvent.change(fileInput, { target: { files: [] } });

    // Non-image file test
    const badFile = new File(["dummy"], "doc.pdf", { type: "application/pdf" });
    fireEvent.change(fileInput, { target: { files: [badFile] } });
    expect(errorSpy).toHaveBeenCalledWith("Hanya file JPEG, JPG, atau PNG yang diperbolehkan!");

    // Large file test (>1MB)
    const largeFile = new File([new Uint8Array(2 * 1024 * 1024)], "large.png", {
      type: "image/png",
    });
    fireEvent.change(fileInput, { target: { files: [largeFile] } });
    expect(errorSpy).toHaveBeenCalledWith("Ukuran file terlalu besar. Maksimal 1MB!");
  });

  it("should preview selected image and dispatch cover upload on valid file", () => {
    const changeCoverSpy = vi
      .spyOn(lostFoundAction, "asyncSetIsLostFoundChangeCover")
      .mockReturnValue(() => {});
    const onClose = vi.fn();

    renderWithProviders(
      <ChangeCoverModal show={true} onClose={onClose} onSaved={onSaved} lostFound={mockLostFound} />,
      {
        preloadedState: {
          isLostFoundChangeCover: false,
          isLostFoundChangedCover: false,
        },
      }
    );

    const fileInput = screen.getByTestId("cover-file-input");
    const validFile = new File(["dummy"], "photo.jpg", { type: "image/jpeg" });
    fireEvent.change(fileInput, { target: { files: [validFile] } });

    expect(screen.getByAltText("Preview")).toBeInTheDocument();

    const form = fileInput.closest("form");
    fireEvent.submit(form);

    expect(changeCoverSpy).toHaveBeenCalledWith(1, validFile);

    // Simulate completion
    renderWithProviders(
      <ChangeCoverModal show={true} onClose={onClose} onSaved={onSaved} lostFound={mockLostFound} />,
      {
        preloadedState: {
          isLostFoundChangeCover: true,
          isLostFoundChangedCover: true,
        },
      }
    );

    expect(onSaved).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });

  it("should handle isLostFoundChangeCover true when isLostFoundChangedCover is false", () => {
    renderWithProviders(
      <ChangeCoverModal show={true} onClose={vi.fn()} onSaved={onSaved} lostFound={mockLostFound} />,
      {
        preloadedState: {
          isLostFoundChangeCover: true,
          isLostFoundChangedCover: false,
        },
      }
    );

    expect(screen.getByTestId("change-cover-modal")).toBeInTheDocument();
    expect(onSaved).not.toHaveBeenCalled();
  });

  it("should not render when lostFound is missing", () => {
    const { container } = renderWithProviders(
      <ChangeCoverModal show={true} onClose={vi.fn()} onSaved={onSaved} lostFound={null} />
    );
    expect(container.firstChild).toBeNull();
  });

  it("should show loading state after submitting a valid file", () => {
    vi.spyOn(lostFoundAction, "asyncSetIsLostFoundChangeCover").mockReturnValue(() => {});
    renderWithProviders(
      <ChangeCoverModal show={true} onClose={vi.fn()} onSaved={onSaved} lostFound={mockLostFound} />
    );
    const fileInput = screen.getByTestId("cover-file-input");
    fireEvent.change(fileInput, {
      target: { files: [new File(["d"], "a.png", { type: "image/png" })] },
    });
    fireEvent.submit(fileInput.closest("form"));
    expect(screen.getByText("Mengunggah...")).toBeInTheDocument();
  });

  it("should trigger onClose when close or cancel button clicked", () => {
    const onClose = vi.fn();
    renderWithProviders(
      <ChangeCoverModal show={true} onClose={onClose} onSaved={onSaved} lostFound={mockLostFound} />
    );

    fireEvent.click(screen.getByTestId("close-cover-modal-btn"));
    expect(onClose).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByTestId("cancel-cover-modal-btn"));
    expect(onClose).toHaveBeenCalledTimes(2);
  });
});
