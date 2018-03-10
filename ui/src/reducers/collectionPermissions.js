import { createReducer } from 'redux-act';
import { set } from 'lodash/fp';

import { fetchCollectionPermissions, updateCollectionPermissions } from 'actions';

const initialState = {};

export default createReducer({
  [fetchCollectionPermissions.COMPLETE]: (state, { id, data }) =>
    set(id, data.results)(state),

  [updateCollectionPermissions.COMPLETE]: (state, { id, data }) =>
    set(id, data.results)(state),

}, initialState);
