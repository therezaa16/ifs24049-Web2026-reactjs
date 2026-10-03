import { describe, it, expect, vi, beforeEach } from "vitest";
import lostFoundApi from "./lostFoundApi";
import apiHelper from "../../../helpers/apiHelper";

function mockResponse(body) {
  return vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
    json: async () => body,
  });
}

describe("lostFoundApi", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("postLostFound", () => {
    it("should create a report and return data", async () => {
      const spy = mockResponse({
        status: "success",
        data: { lost_found_id: 10 },
      });

      const res = await lostFoundApi.postLostFound("Title", "Desc", "lost");
      expect(res).toEqual({ lost_found_id: 10 });
      const [url, options] = spy.mock.calls[0];
      expect(url).toContain("/lost-founds/");
      expect(options.method).toBe("POST");
      expect(JSON.parse(options.body)).toEqual({
        title: "Title",
        description: "Desc",
        status: "lost",
      });
    });

    it("should throw API message when creation fails", async () => {
      mockResponse({ status: "fail", message: "Data tidak valid" });
      await expect(lostFoundApi.postLostFound("", "", "")).rejects.toThrow(
        "Data tidak valid"
      );
    });

    it("should use fallback message when API message is missing", async () => {
      mockResponse({ status: "fail" });
      await expect(lostFoundApi.postLostFound("", "", "")).rejects.toThrow(
        "Gagal menambahkan laporan"
      );
    });
  });

  describe("postLostFoundCover", () => {
    it("should upload cover using FormData", async () => {
      const spy = mockResponse({
        status: "success",
        message: "Berhasil mengubah cover",
      });
      const file = new File(["x"], "cover.png", { type: "image/png" });

      const res = await lostFoundApi.postLostFoundCover(5, file);
      expect(res).toBe("Berhasil mengubah cover");
      const [url, options] = spy.mock.calls[0];
      expect(url).toContain("/lost-founds/5/cover");
      expect(options.body).toBeInstanceOf(FormData);
      expect(options.body.get("cover").name).toBe("cover.png");
    });

    it("should fall back to default file name", async () => {
      const spy = mockResponse({ status: "success", message: "ok" });
      const blob = new Blob(["x"], { type: "image/png" });
      Object.defineProperty(blob, "name", { value: "" });

      await lostFoundApi.postLostFoundCover(5, blob);
      expect(spy.mock.calls[0][1].body.get("cover").name).toBe("cover.jpg");
    });

    it("should throw error when upload fails", async () => {
      mockResponse({ status: "fail", message: "File terlalu besar" });
      const file = new File(["x"], "cover.png", { type: "image/png" });
      await expect(lostFoundApi.postLostFoundCover(5, file)).rejects.toThrow(
        "File terlalu besar"
      );
    });

    it("should use fallback message when upload fails without message", async () => {
      mockResponse({ status: "fail" });
      const file = new File(["x"], "cover.png", { type: "image/png" });
      await expect(lostFoundApi.postLostFoundCover(5, file)).rejects.toThrow(
        "Gagal mengubah cover"
      );
    });
  });

  describe("putLostFound", () => {
    it("should update a report with is_completed as number", async () => {
      const spy = mockResponse({ status: "success", message: "Berhasil" });

      const res = await lostFoundApi.putLostFound(3, "T", "D", "found", true);
      expect(res).toBe("Berhasil");
      const [url, options] = spy.mock.calls[0];
      expect(url).toContain("/lost-founds/3");
      expect(options.method).toBe("PUT");
      expect(JSON.parse(options.body)).toEqual({
        title: "T",
        description: "D",
        status: "found",
        is_completed: 1,
      });
    });

    it("should send is_completed 0 when false", async () => {
      const spy = mockResponse({ status: "success", message: "Berhasil" });
      await lostFoundApi.putLostFound(3, "T", "D", "lost", false);
      expect(JSON.parse(spy.mock.calls[0][1].body).is_completed).toBe(0);
    });

    it("should throw API message when update fails", async () => {
      mockResponse({ status: "fail", message: "Tidak ditemukan" });
      await expect(
        lostFoundApi.putLostFound(3, "T", "D", "lost", false)
      ).rejects.toThrow("Tidak ditemukan");
    });

    it("should use fallback message when update fails", async () => {
      mockResponse({ status: "fail" });
      await expect(
        lostFoundApi.putLostFound(3, "T", "D", "lost", false)
      ).rejects.toThrow("Gagal mengubah laporan");
    });
  });

  describe("getLostFounds", () => {
    it("should fetch without query when no filters", async () => {
      const spy = mockResponse({
        status: "success",
        data: { lost_founds: [{ id: 1 }] },
      });

      const res = await lostFoundApi.getLostFounds();
      expect(res).toEqual([{ id: 1 }]);
      expect(spy.mock.calls[0][0]).toMatch(/\/lost-founds\/$/);
    });

    it("should build query from filters and skip empty values", async () => {
      const spy = mockResponse({
        status: "success",
        data: { lost_founds: [] },
      });

      await lostFoundApi.getLostFounds({
        status: "lost",
        is_completed: 0,
        is_me: 1,
        empty: "",
        nothing: null,
        missing: undefined,
      });
      expect(spy.mock.calls[0][0]).toMatch(
        /\/lost-founds\/\?status=lost&is_completed=0&is_me=1$/
      );
    });

    it("should return empty array when data is missing", async () => {
      mockResponse({ status: "success" });
      expect(await lostFoundApi.getLostFounds()).toEqual([]);
    });

    it("should throw API message on failure", async () => {
      mockResponse({ status: "fail", message: "Gagal total" });
      await expect(lostFoundApi.getLostFounds()).rejects.toThrow("Gagal total");
    });

    it("should use fallback message on failure", async () => {
      mockResponse({ status: "fail" });
      await expect(lostFoundApi.getLostFounds()).rejects.toThrow(
        "Gagal mengambil data laporan"
      );
    });
  });

  describe("getLostFoundById", () => {
    it("should return lost_found detail", async () => {
      const spy = mockResponse({
        status: "success",
        data: { lost_found: { id: 7 } },
      });
      expect(await lostFoundApi.getLostFoundById(7)).toEqual({ id: 7 });
      expect(spy.mock.calls[0][0]).toContain("/lost-founds/7");
    });

    it("should throw API message on failure", async () => {
      mockResponse({ status: "fail", message: "Tidak ada" });
      await expect(lostFoundApi.getLostFoundById(7)).rejects.toThrow("Tidak ada");
    });

    it("should use fallback message on failure", async () => {
      mockResponse({ status: "fail" });
      await expect(lostFoundApi.getLostFoundById(7)).rejects.toThrow(
        "Gagal mengambil detail laporan"
      );
    });
  });

  describe("deleteLostFound", () => {
    it("should delete and return message", async () => {
      const spy = mockResponse({ status: "success", message: "Dihapus" });
      expect(await lostFoundApi.deleteLostFound(2)).toBe("Dihapus");
      expect(spy.mock.calls[0][1].method).toBe("DELETE");
    });

    it("should throw API message on failure", async () => {
      mockResponse({ status: "fail", message: "Ditolak" });
      await expect(lostFoundApi.deleteLostFound(2)).rejects.toThrow("Ditolak");
    });

    it("should use fallback message on failure", async () => {
      mockResponse({ status: "fail" });
      await expect(lostFoundApi.deleteLostFound(2)).rejects.toThrow(
        "Gagal menghapus laporan"
      );
    });
  });

  describe("getLostFoundStats", () => {
    it("should fetch daily stats by default", async () => {
      const spy = mockResponse({
        status: "success",
        data: { stats_losts: { "01-10-2024": 1 } },
      });
      expect(await lostFoundApi.getLostFoundStats()).toEqual({
        stats_losts: { "01-10-2024": 1 },
      });
      expect(spy.mock.calls[0][0]).toMatch(/\/lost-founds\/stats\/daily$/);
    });

    it("should fetch monthly stats with params", async () => {
      const spy = mockResponse({ status: "success", data: { a: 1 } });
      await lostFoundApi.getLostFoundStats("monthly", { total_data: 6 });
      expect(spy.mock.calls[0][0]).toMatch(
        /\/lost-founds\/stats\/monthly\?total_data=6$/
      );
    });

    it("should return empty object when data is missing", async () => {
      mockResponse({ status: "success" });
      expect(await lostFoundApi.getLostFoundStats()).toEqual({});
    });

    it("should throw API message on failure", async () => {
      mockResponse({ status: "fail", message: "Statistik gagal" });
      await expect(lostFoundApi.getLostFoundStats()).rejects.toThrow(
        "Statistik gagal"
      );
    });

    it("should use fallback message on failure", async () => {
      mockResponse({ status: "fail" });
      await expect(lostFoundApi.getLostFoundStats()).rejects.toThrow(
        "Gagal mengambil statistik"
      );
    });
  });
});
