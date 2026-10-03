import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  asyncSetLostFound,
  asyncSetIsLostFoundDelete,
  setIsLostFoundActionCreator,
  setIsLostFoundDeleteActionCreator,
  setIsLostFoundDeletedActionCreator,
} from "../states/action";
import { formatDate, showConfirmDialog } from "../../../helpers/toolsHelper";
import ChangeCoverModal from "../modals/ChangeCoverModal";
import ChangeModal from "../modals/ChangeModal";
import {
  IconArrowLeft,
  IconPhotoUp,
  IconEdit,
  IconTrash,
  IconCalendar,
  IconCircleCheck,
  IconClock,
  IconUser,
} from "@tabler/icons-react";

function DetailPage() {
  const { lostFoundId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const profile = useSelector((state) => state.profile);
  const lostFound = useSelector((state) => state.lostFound);
  const isLostFound = useSelector((state) => state.isLostFound);
  const isLostFoundDeleted = useSelector((state) => state.isLostFoundDeleted);

  const [showCoverModal, setShowCoverModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    dispatch(asyncSetLostFound(lostFoundId));
  }, [lostFoundId, dispatch]);

  useEffect(() => {
    if (isLostFound) {
      dispatch(setIsLostFoundActionCreator(false));
      if (!lostFound) {
        navigate("/");
      }
    }
  }, [isLostFound, lostFound, navigate, dispatch]);

  useEffect(() => {
    if (isLostFoundDeleted) {
      dispatch(setIsLostFoundDeleteActionCreator(false));
      dispatch(setIsLostFoundDeletedActionCreator(false));
      navigate("/");
    }
  }, [isLostFoundDeleted, navigate, dispatch]);

  if (!profile || !lostFound) {
    return (
      <div
        role="status"
        aria-label="Memuat detail laporan"
        className="flex flex-col items-center justify-center py-20"
      >
        <div className="w-8 h-8 border-4 border-indigo-700 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  async function handleDelete() {
    const result = await showConfirmDialog(
      "Apakah Anda yakin ingin menghapus laporan ini?"
    );
    if (result.isConfirmed) {
      dispatch(asyncSetIsLostFoundDelete(lostFound.id));
    }
  }

  function handleSaved() {
    dispatch(asyncSetLostFound(lostFound.id));
  }

  const isLost = lostFound.status === "lost";

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Back button & Action buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          to="/"
          data-testid="back-to-lost-founds-link"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-indigo-700 transition-colors"
        >
          <IconArrowLeft size={18} />
          Kembali ke Daftar Laporan
        </Link>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            data-testid="edit-cover-btn"
            onClick={() => setShowCoverModal(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl text-sky-800 bg-sky-50 hover:bg-sky-100 border border-sky-200 transition-colors"
          >
            <IconPhotoUp size={16} />
            Ubah Foto
          </button>
          <button
            type="button"
            data-testid="edit-detail-lost-found-btn"
            onClick={() => setShowEditModal(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition-colors"
          >
            <IconEdit size={16} />
            Ubah Data
          </button>
          <button
            type="button"
            data-testid="delete-detail-lost-found-btn"
            onClick={handleDelete}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl text-red-800 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors"
          >
            <IconTrash size={16} />
            Hapus
          </button>
        </div>
      </div>

      {/* Main Detail Card */}
      <article className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {lostFound.cover && (
          <div className="w-full bg-slate-100 flex justify-center">
            <img
              src={lostFound.cover}
              alt={lostFound.title}
              className="w-full max-h-[28rem] object-contain"
            />
          </div>
        )}

        <div className="p-6 sm:p-8 space-y-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-mono text-xs font-bold text-slate-600">
                #{lostFound.id}
              </span>
              <span
                data-testid="detail-type-badge"
                className={`inline-flex px-3 py-1 rounded-full text-xs font-bold border ${
                  isLost
                    ? "bg-rose-50 text-rose-800 border-rose-200"
                    : "bg-sky-50 text-sky-800 border-sky-200"
                }`}
              >
                {isLost ? "Barang Hilang" : "Barang Ditemukan"}
              </span>
              {lostFound.is_completed ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  <IconCircleCheck size={14} />
                  Selesai
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                  <IconClock size={14} />
                  Masih Diproses
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {lostFound.title}
            </h1>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
              <div className="flex items-center gap-1.5">
                <IconUser size={14} className="shrink-0" />
                <span>
                  Pelapor:{" "}
                  <strong className="text-slate-800">{lostFound.author.name}</strong>
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <IconCalendar size={14} className="shrink-0" />
                <span>
                  Dilaporkan:{" "}
                  <strong className="text-slate-800">
                    {formatDate(lostFound.created_at)}
                  </strong>
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <IconCalendar size={14} className="shrink-0" />
                <span>
                  Diperbarui:{" "}
                  <strong className="text-slate-800">
                    {formatDate(lostFound.updated_at)}
                  </strong>
                </span>
              </div>
            </div>
          </div>

          <div className="text-slate-700 bg-slate-50/60 p-6 rounded-2xl border border-slate-100 whitespace-pre-wrap leading-relaxed">
            {lostFound.description}
          </div>
        </div>
      </article>

      <ChangeCoverModal
        show={showCoverModal}
        onClose={() => setShowCoverModal(false)}
        onSaved={handleSaved}
        lostFound={lostFound}
      />

      <ChangeModal
        show={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSaved={handleSaved}
        lostFoundId={lostFound.id}
      />
    </div>
  );
}

export default DetailPage;
