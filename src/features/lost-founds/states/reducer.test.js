import { describe, it, expect } from "vitest";
import {
  lostFoundsReducer,
  lostFoundReducer,
  isLostFoundReducer,
  lostFoundStatsReducer,
  isLostFoundAddReducer,
  isLostFoundAddedReducer,
  isLostFoundChangeReducer,
  isLostFoundChangedReducer,
  isLostFoundChangeCoverReducer,
  isLostFoundChangedCoverReducer,
  isLostFoundDeleteReducer,
  isLostFoundDeletedReducer,
} from "./reducer";
import { ActionType } from "./action";

describe("lostFound reducers", () => {
  it("should return default state for unknown or missing actions", () => {
    expect(lostFoundsReducer(undefined, {})).toEqual([]);
    expect(lostFoundsReducer(undefined)).toEqual([]);
    expect(lostFoundReducer(undefined, {})).toBeNull();
    expect(lostFoundStatsReducer(undefined, {})).toBeNull();
    [
      isLostFoundReducer,
      isLostFoundAddReducer,
      isLostFoundAddedReducer,
      isLostFoundChangeReducer,
      isLostFoundChangedReducer,
      isLostFoundChangeCoverReducer,
      isLostFoundChangedCoverReducer,
      isLostFoundDeleteReducer,
      isLostFoundDeletedReducer,
    ].forEach((reducer) => {
      expect(reducer(undefined, {})).toBe(false);
    });
  });

  it("should keep current state for unrelated action", () => {
    expect(lostFoundsReducer([{ id: 1 }], { type: "OTHER" })).toEqual([
      { id: 1 },
    ]);
  });

  it("should handle collection and detail actions", () => {
    expect(
      lostFoundsReducer([], {
        type: ActionType.SET_LOST_FOUNDS,
        payload: [{ id: 1 }],
      })
    ).toEqual([{ id: 1 }]);
    expect(
      lostFoundReducer(null, {
        type: ActionType.SET_LOST_FOUND,
        payload: { id: 2 },
      })
    ).toEqual({ id: 2 });
    expect(
      lostFoundStatsReducer(null, {
        type: ActionType.SET_LOST_FOUND_STATS,
        payload: { stats_losts: {} },
      })
    ).toEqual({ stats_losts: {} });
  });

  it("should handle status flag actions", () => {
    const pairs = [
      [isLostFoundReducer, ActionType.SET_IS_LOST_FOUND],
      [isLostFoundAddReducer, ActionType.SET_IS_LOST_FOUND_ADD],
      [isLostFoundAddedReducer, ActionType.SET_IS_LOST_FOUND_ADDED],
      [isLostFoundChangeReducer, ActionType.SET_IS_LOST_FOUND_CHANGE],
      [isLostFoundChangedReducer, ActionType.SET_IS_LOST_FOUND_CHANGED],
      [isLostFoundChangeCoverReducer, ActionType.SET_IS_LOST_FOUND_CHANGE_COVER],
      [
        isLostFoundChangedCoverReducer,
        ActionType.SET_IS_LOST_FOUND_CHANGED_COVER,
      ],
      [isLostFoundDeleteReducer, ActionType.SET_IS_LOST_FOUND_DELETE],
      [isLostFoundDeletedReducer, ActionType.SET_IS_LOST_FOUND_DELETED],
    ];
    pairs.forEach(([reducer, type]) => {
      expect(reducer(false, { type, payload: true })).toBe(true);
    });
  });
});
