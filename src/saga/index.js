import { takeLatest, put, spawn, debounce, retry } from 'redux-saga/effects';
import {
  searchSkillsRequest,
  searchSkillsSuccess,
  searchSkillsFailure,
} from '../actions/actionCreators';
import {LIST_SERVICES_REQUEST, ITEM_SERVICE_REQUEST, CHANGE_SEARCH_FIELD, SEARCH_SKILLS_SUCCESS, SEARCH_SKILLS_REQUEST} from '../actions/actionTypes';
import searchSkills from '..api/searchSkills';

function filterChangeSearchAction() {
  return type === CHANGE_SEARCH_FIELD && payload.search.trim() !== '';
}

// worker
function* handleChangeSearchSaga(action) {
  yield put(searchSkillsRequest(action.payload.search));
}

// worker
function* handleSearchSkillsSaga(action) {
  try {
    const retryCount = 3;
    const retryDelay = 1 * 1000;
    const data = yield retry(
      retryCount,
      retryDelay,
      searchSkills,
      action.payload.search
    )
    yield put(searchSkillsSuccess(data));
  } catch (e) {
    yield put(searchSkillsFailure(e.massage));
  }
}
  
// watcher
function* watchChangeSearchSaga() {
  yield debounce(100, filterChangeSearchAction, handleChangeSearchSaga);
}

// watcher
function* watchChangeSkillsSaga() {
  yield takeLatest(SEARCH_SKILLS_REQUEST, handleSearchSkillsSaga);
}

export default function* saga() {
  yield spawn(watchChangeSearchSaga);
  yield spawn(watchChangeSkillsSaga);
}
