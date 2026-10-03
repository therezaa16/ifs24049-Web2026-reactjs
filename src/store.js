import { configureStore } from "@reduxjs/toolkit";
import {
  isAuthLoginReducer,
  isAuthRegisterReducer,
  isAuthLogoutReducer,
} from "./features/auth/states/reducer";
import {
  usersReducer,
  userReducer,
  profileReducer,
  isProfileReducer,
  isChangeProfileReducer,
  isChangeProfilePhotoReducer,
  isChangeProfilePasswordReducer,
} from "./features/users/states/reducer";
import {
  lostFoundsReducer,
  lostFoundStatsReducer,
  lostFoundReducer,
  isLostFoundReducer,
  isLostFoundAddReducer,
  isLostFoundAddedReducer,
  isLostFoundChangeReducer,
  isLostFoundChangedReducer,
  isLostFoundChangeCoverReducer,
  isLostFoundChangedCoverReducer,
  isLostFoundDeleteReducer,
  isLostFoundDeletedReducer,
} from "./features/lost-founds/states/reducer";

const store = configureStore({
  reducer: {
    // Auth reducers
    isAuthLogin: isAuthLoginReducer,
    isAuthRegister: isAuthRegisterReducer,
    isAuthLogout: isAuthLogoutReducer,

    // Users reducers
    users: usersReducer,
    user: userReducer,
    profile: profileReducer,
    isProfile: isProfileReducer,
    isChangeProfile: isChangeProfileReducer,
    isChangeProfilePhoto: isChangeProfilePhotoReducer,
    isChangeProfilePassword: isChangeProfilePasswordReducer,

    // LostFounds reducers
    lostFounds: lostFoundsReducer,
    lostFoundStats: lostFoundStatsReducer,
    lostFound: lostFoundReducer,
    isLostFound: isLostFoundReducer,
    isLostFoundAdd: isLostFoundAddReducer,
    isLostFoundAdded: isLostFoundAddedReducer,
    isLostFoundChange: isLostFoundChangeReducer,
    isLostFoundChanged: isLostFoundChangedReducer,
    isLostFoundChangeCover: isLostFoundChangeCoverReducer,
    isLostFoundChangedCover: isLostFoundChangedCoverReducer,
    isLostFoundDelete: isLostFoundDeleteReducer,
    isLostFoundDeleted: isLostFoundDeletedReducer,
  },
});

export default store;
