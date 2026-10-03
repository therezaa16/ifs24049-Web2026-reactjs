import { useState, useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import AddModal from "../modals/AddModal";
import ChangeModal from "../modals/ChangeModal";
import {
  asyncSetIsLostFoundDelete,
  asyncSetLostFounds,
  asyncSetLostFoundStats,
  setIsLostFoundDeleteActionCreator,
  setIsLostFoundDeletedActionCreator,
} from "../states/action";
import { formatDate, showConfirmDialog } from "../../../helpers/toolsHelper";
import {
  IconPlus,
  IconListDetails,
  IconSearch,
  IconPackage,
  IconPackageOff,
  IconCircleCheck,
  IconEye,
  IconPencil,
  IconTrash,
  IconFilter,
  IconLoader2,
  IconChartBar,
} from "@tabler/icons-react";

const STATUS_LABEL = { lost: "Hilang", found: "Ditemukan" };

function sumValues(record) {
  return Object.values(record || {}).reduce((total, value) => total + value, 0);
}

function StatsPanel({ stats, period, onChangePeriod }) {
  const labels = Object.keys(stats?.stats_losts || {});
  const maxValue = Math.max(
    1,
    ...labels.map((label) =>
      Math.max(stats.stats_losts[label], stats.stats_founds[label])
    )
  );

  return (
    <section
      id="statistik"
      aria-labelledby="statistik-heading"
      className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-6 space-y-5"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
            <IconChartBar size={20} />
          </div>
          <h2
            id="statistik-heading"
            className="text-lg font-bold text-slate-900"
          >
            Statistik Laporan
          </h2>
        </div>
        <div className="inline-flex rounded-xl bg-slate-100 p-1 text-xs font-semibold text-slate-700">
          <button
            type="button"
            data-testid="stats-daily-btn"
            aria-pressed={period === "daily"}
            onClick={() => onChangePeriod("daily")}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              period === "daily" ? "bg-white text-slate-900 shadow-xs" : ""
            }`}
          >
            Harian
          </button>
          <button
            type="button"
            data-testid="stats-monthly-btn"
            aria-pressed={period === "monthly"}
            onClick={() => onChangePeriod("monthly")}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              period === "monthly" ? "bg-white text-slate-900 shadow-xs" : ""
            }`}
          >
            Bulanan
          </button>
        </div>
      </div>

      {stats ? (
        <>
          <div
            data-testid="stats-summary"
            className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center"
          >
            <div className="rounded-xl bg-rose-50 p-3">
              <p className="text-xs font-semibold text-rose-800">Hilang</p>
              <p className="text-xl font-extrabold text-rose-800">
                {sumValues(stats.stats_losts)}
              </p>
            </div>
            <div className="rounded-xl bg-sky-50 p-3">
              <p className="text-xs font-semibold text-sky-800">Ditemukan</p>
              <p className="text-xl font-extrabold text-sky-800">
                {sumValues(stats.stats_founds)}
              </p>
            </div>
            <div className="rounded-xl bg-amber-50 p-3">
              <p className="text-xs font-semibold text-amber-800">Proses</p>
              <p className="text-xl font-extrabold text-amber-800">
                {sumValues(stats.stats_losts_process) +
                  sumValues(stats.stats_founds_process)}
              </p>
            </div>
            <div className="rounded-xl bg-emerald-50 p-3">
              <p className="text-xs font-semibold text-emerald-800">Selesai</p>
              <p className="text-xl font-extrabold text-emerald-800">
                {sumValues(stats.stats_losts_completed) +
                  sumValues(stats.stats_founds_completed)}
              </p>
            </div>
          </div>

          <ul className="space-y-2" data-testid="stats-list">
            {labels.map((label) => (
              <li
                key={label}
                className="grid grid-cols-[5.5rem_1fr] items-center gap-3 text-xs text-slate-700"
              >
                <span className="font-semibold">{label}</span>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-2 rounded-full bg-rose-500"
                      style={{
                        width: `${(stats.stats_losts[label] / maxValue) * 100}%`,
                      }}
                    />
                    <span>{stats.stats_losts[label]} hilang</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className="h-2 rounded-full bg-sky-500"
                      style={{
                        width: `${(stats.stats_founds[label] / maxValue) * 100}%`,
                      }}
                    />
                    <span>{stats.stats_founds[label]} ditemukan</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p
          data-testid="stats-empty"
          className="text-sm text-slate-600 text-center py-4"
        >
          Statistik belum tersedia.
        </p>
      )}
    </section>
  );
}

function HomePage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const profile = useSelector((state) => state.profile);
  const lostFounds = useSelector((state) => state.lostFounds);
  const lostFoundStats = useSelector((state) => state.lostFoundStats);
  const isLostFoundDeleted = useSelector((state) => state.isLostFoundDeleted);

  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const [completedFilter, setCompletedFilter] = useState("");
  const [onlyMine, setOnlyMine] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [period, setPeriod] = useState("daily");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showChangeModal, setShowChangeModal] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const loadLostFounds = useCallback(() => {
    setLoading(true);
    return Promise.resolve(
      dispatch(
        asyncSetLostFounds({
          status: statusFilter,
          is_completed: completedFilter,
          is_me: onlyMine ? 1 : "",
        })
      )
    ).finally(() => setLoading(false));
  }, [dispatch, statusFilter, completedFilter, onlyMine]);

  useEffect(() => {
    loadLostFounds();
  }, [loadLostFounds]);

  useEffect(() => {
    dispatch(asyncSetLostFoundStats(period));
  }, [period, dispatch]);

  useEffect(() => {
    if (isLostFoundDeleted) {
      dispatch(setIsLostFoundDeleteActionCreator(false));
      dispatch(setIsLostFoundDeletedActionCreator(false));
      loadLostFounds();
      dispatch(asyncSetLostFoundStats(period));
    }
  }, [isLostFoundDeleted, loadLostFounds, period, dispatch]);

  if (!profile) return null;

  async function handleDelete(lostFoundId) {
    const result = await showConfirmDialog(
      "Apakah Anda yakin ingin menghapus laporan ini?"
    );
    if (result.isConfirmed) {
      dispatch(asyncSetIsLostFoundDelete(lostFoundId));
    }
  }

  function handleSaved() {
    loadLostFounds();
    dispatch(asyncSetLostFoundStats(period));
  }

  const keyword = searchQuery.trim().toLowerCase();
  const filteredItems = lostFounds.filter(
    (item) =>
      item.title.toLowerCase().includes(keyword) ||
      item.description.toLowerCase().includes(keyword)
  );

  const totalCount = lostFounds.length;
  const lostCount = lostFounds.filter((item) => item.status === "lost").length;
  const foundCount = lostFounds.filter((item) => item.status === "found").length;
  const completedCount = lostFounds.filter((item) => item.is_completed).length;

  const statCards = [
    {
      label: "Total Laporan",
      value: totalCount,
      icon: IconListDetails,
      color: "text-indigo-800",
      bg: "bg-indigo-50",
    },
    {
      label: "Barang Hilang",
      value: lostCount,
      icon: IconPackageOff,
      color: "text-rose-800",
      bg: "bg-rose-50",
    },
    {
      label: "Barang Ditemukan",
      value: foundCount,
      icon: IconPackage,
      color: "text-sky-800",
      bg: "bg-sky-50",
    },
    {
      label: "Selesai",
      value: completedCount,
      icon: IconCircleCheck,
      color: "text-emerald-800",
      bg: "bg-emerald-50",
    },
  ];

  const statusButtons = [
    { value: "", label: "Semua", testId: "filter-all-btn" },
    { value: "lost", label: "Hilang", testId: "filter-lost-btn" },
    { value: "found", label: "Ditemukan", testId: "filter-found-btn" },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Lost &amp; Founds
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Laporkan dan pantau barang hilang maupun barang temuan di sekitar
            Anda.
          </p>
        </div>
        <button
          type="button"
          data-testid="add-lost-found-btn"
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm text-white bg-indigo-700 hover:bg-indigo-800 active:bg-indigo-900 shadow-md shadow-indigo-600/25 transition-all self-start sm:self-auto"
        >
          <IconPlus size={18} stroke={2.5} />
          <span>Tambah Laporan</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              data-testid={`stat-card-${card.label}`}
              className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between"
            >
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                  {card.label}
                </p>
                <p className={`text-3xl font-black mt-1 ${card.color}`}>
                  {card.value}
                </p>
              </div>
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center ${card.bg} ${card.color}`}
              >
                <Icon size={26} stroke={2} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Table & Controls Section */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col gap-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <IconSearch
                size={18}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600"
              />
              <input
                type="text"
                data-testid="search-lost-found-input"
                aria-label="Cari laporan"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari judul atau deskripsi laporan..."
                className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-300 bg-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-700 transition-all"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs font-semibold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
                <IconFilter size={16} /> Filter:
              </span>
              <div className="inline-flex rounded-xl bg-slate-100 p-1 text-xs font-semibold text-slate-700">
                {statusButtons.map((btn) => (
                  <button
                    key={btn.testId}
                    type="button"
                    data-testid={btn.testId}
                    aria-pressed={statusFilter === btn.value}
                    onClick={() => setStatusFilter(btn.value)}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      statusFilter === btn.value
                        ? "bg-white text-slate-900 shadow-xs"
                        : "hover:text-slate-900"
                    }`}
                  >
                    {btn.label}
                  </button>
                ))}
              </div>

              <select
                data-testid="filter-completed-select"
                aria-label="Filter status penyelesaian"
                value={completedFilter}
                onChange={(e) => setCompletedFilter(e.target.value)}
                className="px-3 py-2 text-xs font-semibold rounded-xl border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              >
                <option value="">Semua penyelesaian</option>
                <option value="0">Masih diproses</option>
                <option value="1">Sudah selesai</option>
              </select>

              <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700">
                <input
                  type="checkbox"
                  data-testid="filter-mine-checkbox"
                  checked={onlyMine}
                  onChange={(e) => setOnlyMine(e.target.checked)}
                  className="rounded border-slate-400"
                />
                Laporan saya
              </label>
            </div>
          </div>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <caption className="sr-only">Daftar laporan barang hilang dan ditemukan</caption>
            <thead className="bg-slate-50/80 text-xs uppercase tracking-wider font-semibold text-slate-700 border-b border-slate-100">
              <tr>
                <th scope="col" className="px-5 py-3.5 text-center w-16">ID</th>
                <th scope="col" className="px-5 py-3.5">Laporan</th>
                <th scope="col" className="px-5 py-3.5">Jenis</th>
                <th scope="col" className="px-5 py-3.5 hidden md:table-cell">Pelapor</th>
                <th scope="col" className="px-5 py-3.5 hidden lg:table-cell">Dibuat</th>
                <th scope="col" className="px-5 py-3.5">Status</th>
                <th scope="col" className="px-5 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-600">
                    <IconLoader2 size={36} className="mx-auto text-indigo-700 animate-spin mb-2" />
                    <p className="font-medium">Memuat daftar laporan...</p>
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-600">
                    <IconListDetails size={40} className="mx-auto text-slate-600 mb-2" />
                    <p className="font-medium">Belum ada laporan yang cocok.</p>
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr
                    key={`lost-found-${item.id}`}
                    data-testid={`lost-found-row-${item.id}`}
                    className="hover:bg-slate-50/70 transition-colors"
                  >
                    <td className="px-5 py-4 text-center font-mono text-xs font-bold text-slate-600">
                      #{item.id}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {item.cover && (
                          <img
                            src={item.cover}
                            alt={item.title}
                            className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0"
                          />
                        )}
                        <div>
                          <p className="font-semibold text-slate-900 leading-snug">
                            {item.title}
                          </p>
                          <p className="text-xs text-slate-600 line-clamp-1 mt-0.5">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold border ${
                          item.status === "lost"
                            ? "bg-rose-50 text-rose-800 border-rose-200"
                            : "bg-sky-50 text-sky-800 border-sky-200"
                        }`}
                      >
                        {STATUS_LABEL[item.status]}
                      </span>
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell text-xs text-slate-700">
                      {item.author.name}
                    </td>
                    <td className="px-5 py-4 hidden lg:table-cell text-xs text-slate-700">
                      {formatDate(item.created_at)}
                    </td>
                    <td className="px-5 py-4">
                      {item.is_completed ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                          Selesai
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                          Proses
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          data-testid={`view-lost-found-${item.id}`}
                          onClick={() => navigate(`/lost-founds/${item.id}`)}
                          className="p-1.5 text-slate-700 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Lihat Detail"
                          aria-label={`Lihat detail ${item.title}`}
                        >
                          <IconEye size={18} />
                        </button>
                        <button
                          type="button"
                          data-testid={`edit-lost-found-${item.id}`}
                          onClick={() => {
                            setSelectedId(item.id);
                            setShowChangeModal(true);
                          }}
                          className="p-1.5 text-slate-700 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors"
                          title="Ubah Laporan"
                          aria-label={`Ubah ${item.title}`}
                        >
                          <IconPencil size={18} />
                        </button>
                        <button
                          type="button"
                          data-testid={`delete-lost-found-${item.id}`}
                          onClick={() => handleDelete(item.id)}
                          className="p-1.5 text-slate-700 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                          title="Hapus Laporan"
                          aria-label={`Hapus ${item.title}`}
                        >
                          <IconTrash size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <StatsPanel
        stats={lostFoundStats}
        period={period}
        onChangePeriod={setPeriod}
      />

      {/* Modals */}
      <AddModal
        show={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSaved={handleSaved}
      />
      <ChangeModal
        show={showChangeModal}
        onClose={() => setShowChangeModal(false)}
        onSaved={handleSaved}
        lostFoundId={selectedId}
      />
    </div>
  );
}

export default HomePage;
