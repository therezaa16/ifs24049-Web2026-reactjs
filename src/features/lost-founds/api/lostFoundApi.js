import apiHelper from "../../../helpers/apiHelper";

const lostFoundApi = (() => {
  const BASE_URL = `${DELCOM_BASEURL}/lost-founds`;

  function _url(path) {
    return BASE_URL + path;
  }

  function _query(params = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== "" && value !== null && value !== undefined) {
        query.append(key, value);
      }
    });
    const queryString = query.toString();
    return queryString ? `?${queryString}` : "";
  }

  async function _parse(response, fallbackMessage) {
    const result = await response.json();
    if (result.status !== "success") {
      throw new Error(result.message || fallbackMessage);
    }
    return result;
  }

  async function postLostFound(title, description, status) {
    const response = await apiHelper.fetchData(_url("/"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title, description, status }),
    });

    const result = await _parse(response, "Gagal menambahkan laporan");
    return result.data;
  }

  async function postLostFoundCover(lostFoundId, cover) {
    const formData = new FormData();
    formData.append("cover", cover, cover.name || "cover.jpg");
    const response = await apiHelper.fetchData(_url(`/${lostFoundId}/cover`), {
      method: "POST",
      body: formData,
    });

    const result = await _parse(response, "Gagal mengubah cover");
    return result.message;
  }

  async function putLostFound(
    lostFoundId,
    title,
    description,
    status,
    is_completed
  ) {
    const response = await apiHelper.fetchData(_url(`/${lostFoundId}`), {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title,
        description,
        status,
        is_completed: is_completed ? 1 : 0,
      }),
    });

    const result = await _parse(response, "Gagal mengubah laporan");
    return result.message;
  }

  // filters: { status: "lost" | "found", is_completed: 0 | 1, is_me: 1 }
  async function getLostFounds(filters = {}) {
    const response = await apiHelper.fetchData(_url(`/${_query(filters)}`), {
      method: "GET",
    });

    const result = await _parse(response, "Gagal mengambil data laporan");
    return result.data?.lost_founds || [];
  }

  async function getLostFoundById(lostFoundId) {
    const response = await apiHelper.fetchData(_url(`/${lostFoundId}`), {
      method: "GET",
    });

    const result = await _parse(response, "Gagal mengambil detail laporan");
    return result.data?.lost_found;
  }

  async function deleteLostFound(lostFoundId) {
    const response = await apiHelper.fetchData(_url(`/${lostFoundId}`), {
      method: "DELETE",
    });

    const result = await _parse(response, "Gagal menghapus laporan");
    return result.message;
  }

  // period: "daily" | "monthly"; params: { end_date, total_data }
  async function getLostFoundStats(period = "daily", params = {}) {
    const response = await apiHelper.fetchData(
      _url(`/stats/${period}${_query(params)}`),
      { method: "GET" }
    );

    const result = await _parse(response, "Gagal mengambil statistik");
    return result.data || {};
  }

  return {
    postLostFound,
    postLostFoundCover,
    putLostFound,
    getLostFounds,
    getLostFoundById,
    deleteLostFound,
    getLostFoundStats,
  };
})();

export default lostFoundApi;
