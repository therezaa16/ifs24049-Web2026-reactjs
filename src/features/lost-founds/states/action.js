import {
  showErrorDialog,
  showSuccessDialog,
} from "../../../helpers/toolsHelper";
import lostFoundApi from "../api/lostFoundApi";

export const ActionType = {
  SET_LOST_FOUNDS: "SET_LOST_FOUNDS",
  SET_LOST_FOUND: "SET_LOST_FOUND",
  SET_IS_LOST_FOUND: "SET_IS_LOST_FOUND",
  SET_LOST_FOUND_STATS: "SET_LOST_FOUND_STATS",
  SET_IS_LOST_FOUND_ADD: "SET_IS_LOST_FOUND_ADD",
  SET_IS_LOST_FOUND_ADDED: "SET_IS_LOST_FOUND_ADDED",
  SET_IS_LOST_FOUND_CHANGE: "SET_IS_LOST_FOUND_CHANGE",
  SET_IS_LOST_FOUND_CHANGED: "SET_IS_LOST_FOUND_CHANGED",
  SET_IS_LOST_FOUND_CHANGE_COVER: "SET_IS_LOST_FOUND_CHANGE_COVER",
  SET_IS_LOST_FOUND_CHANGED_COVER: "SET_IS_LOST_FOUND_CHANGED_COVER",
  SET_IS_LOST_FOUND_DELETE: "SET_IS_LOST_FOUND_DELETE",
  SET_IS_LOST_FOUND_DELETED: "SET_IS_LOST_FOUND_DELETED",
};

export function setLostFoundsActionCreator(lostFounds) {
  return {
    type: ActionType.SET_LOST_FOUNDS,
    payload: lostFounds,
  };
}

export function asyncSetLostFounds(filters = {}) {
  return async (dispatch) => {
    try {
      const lostFounds = await lostFoundApi.getLostFounds(filters);
      dispatch(setLostFoundsActionCreator(lostFounds));
    } catch {
      dispatch(setLostFoundsActionCreator([]));
    }
  };
}

export function setLostFoundActionCreator(lostFound) {
  return {
    type: ActionType.SET_LOST_FOUND,
    payload: lostFound,
  };
}

export function setIsLostFoundActionCreator(status) {
  return {
    type: ActionType.SET_IS_LOST_FOUND,
    payload: status,
  };
}

export function asyncSetLostFound(lostFoundId) {
  return async (dispatch) => {
    try {
      const lostFound = await lostFoundApi.getLostFoundById(lostFoundId);
      dispatch(setLostFoundActionCreator(lostFound));
    } catch {
      dispatch(setLostFoundActionCreator(null));
    } finally {
      dispatch(setIsLostFoundActionCreator(true));
    }
  };
}

export function setLostFoundStatsActionCreator(stats) {
  return {
    type: ActionType.SET_LOST_FOUND_STATS,
    payload: stats,
  };
}

export function asyncSetLostFoundStats(period = "daily", params = {}) {
  return async (dispatch) => {
    try {
      const stats = await lostFoundApi.getLostFoundStats(period, params);
      dispatch(setLostFoundStatsActionCreator(stats));
    } catch {
      dispatch(setLostFoundStatsActionCreator(null));
    }
  };
}

export function setIsLostFoundAddActionCreator(isLostFoundAdd) {
  return {
    type: ActionType.SET_IS_LOST_FOUND_ADD,
    payload: isLostFoundAdd,
  };
}

export function setIsLostFoundAddedActionCreator(isLostFoundAdded) {
  return {
    type: ActionType.SET_IS_LOST_FOUND_ADDED,
    payload: isLostFoundAdded,
  };
}

export function asyncSetIsLostFoundAdd(title, description, status) {
  return async (dispatch) => {
    try {
      await lostFoundApi.postLostFound(title, description, status);
      showSuccessDialog("Laporan berhasil ditambahkan!");
      dispatch(setIsLostFoundAddedActionCreator(true));
    } catch (error) {
      showErrorDialog(error.message);
      dispatch(setIsLostFoundAddedActionCreator(false));
    } finally {
      dispatch(setIsLostFoundAddActionCreator(true));
    }
  };
}

export function setIsLostFoundChangeActionCreator(isLostFoundChange) {
  return {
    type: ActionType.SET_IS_LOST_FOUND_CHANGE,
    payload: isLostFoundChange,
  };
}

export function setIsLostFoundChangedActionCreator(isLostFoundChanged) {
  return {
    type: ActionType.SET_IS_LOST_FOUND_CHANGED,
    payload: isLostFoundChanged,
  };
}

export function asyncSetIsLostFoundChange(
  lostFoundId,
  title,
  description,
  status,
  is_completed
) {
  return async (dispatch) => {
    try {
      const message = await lostFoundApi.putLostFound(
        lostFoundId,
        title,
        description,
        status,
        is_completed
      );
      showSuccessDialog(message);
      dispatch(setIsLostFoundChangedActionCreator(true));
    } catch (error) {
      showErrorDialog(error.message);
      dispatch(setIsLostFoundChangedActionCreator(false));
    } finally {
      dispatch(setIsLostFoundChangeActionCreator(true));
    }
  };
}

export function setIsLostFoundChangeCoverActionCreator(isLostFoundChangeCover) {
  return {
    type: ActionType.SET_IS_LOST_FOUND_CHANGE_COVER,
    payload: isLostFoundChangeCover,
  };
}

export function setIsLostFoundChangedCoverActionCreator(status) {
  return {
    type: ActionType.SET_IS_LOST_FOUND_CHANGED_COVER,
    payload: status,
  };
}

export function asyncSetIsLostFoundChangeCover(lostFoundId, cover) {
  return async (dispatch) => {
    try {
      const message = await lostFoundApi.postLostFoundCover(lostFoundId, cover);
      showSuccessDialog(message);
      dispatch(setIsLostFoundChangedCoverActionCreator(true));
    } catch (error) {
      showErrorDialog(error.message);
      dispatch(setIsLostFoundChangedCoverActionCreator(false));
    } finally {
      dispatch(setIsLostFoundChangeCoverActionCreator(true));
    }
  };
}

export function setIsLostFoundDeleteActionCreator(isLostFoundDelete) {
  return {
    type: ActionType.SET_IS_LOST_FOUND_DELETE,
    payload: isLostFoundDelete,
  };
}

export function setIsLostFoundDeletedActionCreator(isLostFoundDeleted) {
  return {
    type: ActionType.SET_IS_LOST_FOUND_DELETED,
    payload: isLostFoundDeleted,
  };
}

export function asyncSetIsLostFoundDelete(lostFoundId) {
  return async (dispatch) => {
    try {
      const message = await lostFoundApi.deleteLostFound(lostFoundId);
      showSuccessDialog(message);
      dispatch(setIsLostFoundDeletedActionCreator(true));
    } catch (error) {
      showErrorDialog(error.message);
      dispatch(setIsLostFoundDeletedActionCreator(false));
    } finally {
      dispatch(setIsLostFoundDeleteActionCreator(true));
    }
  };
}
