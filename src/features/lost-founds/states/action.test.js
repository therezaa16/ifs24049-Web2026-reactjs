import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  ActionType,
  setLostFoundsActionCreator,
  asyncSetLostFounds,
  setLostFoundActionCreator,
  setIsLostFoundActionCreator,
  asyncSetLostFound,
  setLostFoundStatsActionCreator,
  asyncSetLostFoundStats,
  setIsLostFoundAddActionCreator,
  setIsLostFoundAddedActionCreator,
  asyncSetIsLostFoundAdd,
  setIsLostFoundChangeActionCreator,
  setIsLostFoundChangedActionCreator,
  asyncSetIsLostFoundChange,
  setIsLostFoundChangeCoverActionCreator,
  setIsLostFoundChangedCoverActionCreator,
  asyncSetIsLostFoundChangeCover,
  setIsLostFoundDeleteActionCreator,
  setIsLostFoundDeletedActionCreator,
  asyncSetIsLostFoundDelete,
} from "./action";
import lostFoundApi from "../api/lostFoundApi";
import * as toolsHelper from "../../../helpers/toolsHelper";

describe("lostFound actions", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(toolsHelper, "showSuccessDialog").mockImplementation(() => {});
    vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => {});
  });

  it("should create plain action objects", () => {
    const cases = [
      [setLostFoundsActionCreator, ActionType.SET_LOST_FOUNDS],
      [setLostFoundActionCreator, ActionType.SET_LOST_FOUND],
      [setIsLostFoundActionCreator, ActionType.SET_IS_LOST_FOUND],
      [setLostFoundStatsActionCreator, ActionType.SET_LOST_FOUND_STATS],
      [setIsLostFoundAddActionCreator, ActionType.SET_IS_LOST_FOUND_ADD],
      [setIsLostFoundAddedActionCreator, ActionType.SET_IS_LOST_FOUND_ADDED],
      [setIsLostFoundChangeActionCreator, ActionType.SET_IS_LOST_FOUND_CHANGE],
      [
        setIsLostFoundChangedActionCreator,
        ActionType.SET_IS_LOST_FOUND_CHANGED,
      ],
      [
        setIsLostFoundChangeCoverActionCreator,
        ActionType.SET_IS_LOST_FOUND_CHANGE_COVER,
      ],
      [
        setIsLostFoundChangedCoverActionCreator,
        ActionType.SET_IS_LOST_FOUND_CHANGED_COVER,
      ],
      [setIsLostFoundDeleteActionCreator, ActionType.SET_IS_LOST_FOUND_DELETE],
      [
        setIsLostFoundDeletedActionCreator,
        ActionType.SET_IS_LOST_FOUND_DELETED,
      ],
    ];
    cases.forEach(([creator, type]) => {
      expect(creator("x")).toEqual({ type, payload: "x" });
    });
  });

  describe("asyncSetLostFounds", () => {
    it("should dispatch fetched list using filters", async () => {
      const spy = vi
        .spyOn(lostFoundApi, "getLostFounds")
        .mockResolvedValue([{ id: 1 }]);
      const dispatch = vi.fn();

      await asyncSetLostFounds({ status: "lost" })(dispatch);
      expect(spy).toHaveBeenCalledWith({ status: "lost" });
      expect(dispatch).toHaveBeenCalledWith(
        setLostFoundsActionCreator([{ id: 1 }])
      );
    });

    it("should use empty filters by default", async () => {
      const spy = vi.spyOn(lostFoundApi, "getLostFounds").mockResolvedValue([]);
      await asyncSetLostFounds()(vi.fn());
      expect(spy).toHaveBeenCalledWith({});
    });

    it("should dispatch empty list on error", async () => {
      vi.spyOn(lostFoundApi, "getLostFounds").mockRejectedValue(new Error("x"));
      const dispatch = vi.fn();
      await asyncSetLostFounds()(dispatch);
      expect(dispatch).toHaveBeenCalledWith(setLostFoundsActionCreator([]));
    });
  });

  describe("asyncSetLostFound", () => {
    it("should dispatch detail and mark loaded", async () => {
      vi.spyOn(lostFoundApi, "getLostFoundById").mockResolvedValue({ id: 1 });
      const dispatch = vi.fn();
      await asyncSetLostFound(1)(dispatch);
      expect(dispatch).toHaveBeenNthCalledWith(
        1,
        setLostFoundActionCreator({ id: 1 })
      );
      expect(dispatch).toHaveBeenNthCalledWith(
        2,
        setIsLostFoundActionCreator(true)
      );
    });

    it("should dispatch null detail on error", async () => {
      vi.spyOn(lostFoundApi, "getLostFoundById").mockRejectedValue(
        new Error("x")
      );
      const dispatch = vi.fn();
      await asyncSetLostFound(1)(dispatch);
      expect(dispatch).toHaveBeenNthCalledWith(
        1,
        setLostFoundActionCreator(null)
      );
      expect(dispatch).toHaveBeenNthCalledWith(
        2,
        setIsLostFoundActionCreator(true)
      );
    });
  });

  describe("asyncSetLostFoundStats", () => {
    it("should dispatch stats", async () => {
      const spy = vi
        .spyOn(lostFoundApi, "getLostFoundStats")
        .mockResolvedValue({ stats_losts: {} });
      const dispatch = vi.fn();
      await asyncSetLostFoundStats("monthly", { total_data: 3 })(dispatch);
      expect(spy).toHaveBeenCalledWith("monthly", { total_data: 3 });
      expect(dispatch).toHaveBeenCalledWith(
        setLostFoundStatsActionCreator({ stats_losts: {} })
      );
    });

    it("should use daily and empty params by default", async () => {
      const spy = vi
        .spyOn(lostFoundApi, "getLostFoundStats")
        .mockResolvedValue({});
      await asyncSetLostFoundStats()(vi.fn());
      expect(spy).toHaveBeenCalledWith("daily", {});
    });

    it("should dispatch null on error", async () => {
      vi.spyOn(lostFoundApi, "getLostFoundStats").mockRejectedValue(
        new Error("x")
      );
      const dispatch = vi.fn();
      await asyncSetLostFoundStats()(dispatch);
      expect(dispatch).toHaveBeenCalledWith(setLostFoundStatsActionCreator(null));
    });
  });

  describe("asyncSetIsLostFoundAdd", () => {
    it("should add and dispatch success flags", async () => {
      const spy = vi
        .spyOn(lostFoundApi, "postLostFound")
        .mockResolvedValue({ lost_found_id: 1 });
      const dispatch = vi.fn();
      await asyncSetIsLostFoundAdd("T", "D", "lost")(dispatch);
      expect(spy).toHaveBeenCalledWith("T", "D", "lost");
      expect(toolsHelper.showSuccessDialog).toHaveBeenCalled();
      expect(dispatch).toHaveBeenNthCalledWith(
        1,
        setIsLostFoundAddedActionCreator(true)
      );
      expect(dispatch).toHaveBeenNthCalledWith(
        2,
        setIsLostFoundAddActionCreator(true)
      );
    });

    it("should show error and dispatch failure flags", async () => {
      vi.spyOn(lostFoundApi, "postLostFound").mockRejectedValue(
        new Error("Gagal")
      );
      const dispatch = vi.fn();
      await asyncSetIsLostFoundAdd("T", "D", "lost")(dispatch);
      expect(toolsHelper.showErrorDialog).toHaveBeenCalledWith("Gagal");
      expect(dispatch).toHaveBeenNthCalledWith(
        1,
        setIsLostFoundAddedActionCreator(false)
      );
      expect(dispatch).toHaveBeenNthCalledWith(
        2,
        setIsLostFoundAddActionCreator(true)
      );
    });
  });

  describe("asyncSetIsLostFoundChange", () => {
    it("should update and dispatch success flags", async () => {
      const spy = vi
        .spyOn(lostFoundApi, "putLostFound")
        .mockResolvedValue("Berhasil mengubah data");
      const dispatch = vi.fn();
      await asyncSetIsLostFoundChange(1, "T", "D", "found", 1)(dispatch);
      expect(spy).toHaveBeenCalledWith(1, "T", "D", "found", 1);
      expect(toolsHelper.showSuccessDialog).toHaveBeenCalledWith(
        "Berhasil mengubah data"
      );
      expect(dispatch).toHaveBeenNthCalledWith(
        1,
        setIsLostFoundChangedActionCreator(true)
      );
      expect(dispatch).toHaveBeenNthCalledWith(
        2,
        setIsLostFoundChangeActionCreator(true)
      );
    });

    it("should show error and dispatch failure flags", async () => {
      vi.spyOn(lostFoundApi, "putLostFound").mockRejectedValue(new Error("Gagal"));
      const dispatch = vi.fn();
      await asyncSetIsLostFoundChange(1, "T", "D", "found", 0)(dispatch);
      expect(toolsHelper.showErrorDialog).toHaveBeenCalledWith("Gagal");
      expect(dispatch).toHaveBeenNthCalledWith(
        1,
        setIsLostFoundChangedActionCreator(false)
      );
    });
  });

  describe("asyncSetIsLostFoundChangeCover", () => {
    it("should upload cover and dispatch success flags", async () => {
      const file = new File(["x"], "c.png");
      const spy = vi
        .spyOn(lostFoundApi, "postLostFoundCover")
        .mockResolvedValue("Berhasil mengubah cover");
      const dispatch = vi.fn();
      await asyncSetIsLostFoundChangeCover(1, file)(dispatch);
      expect(spy).toHaveBeenCalledWith(1, file);
      expect(toolsHelper.showSuccessDialog).toHaveBeenCalledWith(
        "Berhasil mengubah cover"
      );
      expect(dispatch).toHaveBeenNthCalledWith(
        1,
        setIsLostFoundChangedCoverActionCreator(true)
      );
      expect(dispatch).toHaveBeenNthCalledWith(
        2,
        setIsLostFoundChangeCoverActionCreator(true)
      );
    });

    it("should show error and dispatch failure flags", async () => {
      vi.spyOn(lostFoundApi, "postLostFoundCover").mockRejectedValue(
        new Error("Gagal")
      );
      const dispatch = vi.fn();
      await asyncSetIsLostFoundChangeCover(1, {})(dispatch);
      expect(toolsHelper.showErrorDialog).toHaveBeenCalledWith("Gagal");
      expect(dispatch).toHaveBeenNthCalledWith(
        1,
        setIsLostFoundChangedCoverActionCreator(false)
      );
    });
  });

  describe("asyncSetIsLostFoundDelete", () => {
    it("should delete and dispatch success flags", async () => {
      const spy = vi
        .spyOn(lostFoundApi, "deleteLostFound")
        .mockResolvedValue("Berhasil menghapus data");
      const dispatch = vi.fn();
      await asyncSetIsLostFoundDelete(1)(dispatch);
      expect(spy).toHaveBeenCalledWith(1);
      expect(toolsHelper.showSuccessDialog).toHaveBeenCalledWith(
        "Berhasil menghapus data"
      );
      expect(dispatch).toHaveBeenNthCalledWith(
        1,
        setIsLostFoundDeletedActionCreator(true)
      );
      expect(dispatch).toHaveBeenNthCalledWith(
        2,
        setIsLostFoundDeleteActionCreator(true)
      );
    });

    it("should show error and dispatch failure flags", async () => {
      vi.spyOn(lostFoundApi, "deleteLostFound").mockRejectedValue(
        new Error("Gagal")
      );
      const dispatch = vi.fn();
      await asyncSetIsLostFoundDelete(1)(dispatch);
      expect(toolsHelper.showErrorDialog).toHaveBeenCalledWith("Gagal");
      expect(dispatch).toHaveBeenNthCalledWith(
        1,
        setIsLostFoundDeletedActionCreator(false)
      );
    });
  });
});
