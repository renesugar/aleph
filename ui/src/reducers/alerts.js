import { createReducer } from 'redux-act';

import { fetchAlerts } from 'actions';

const initialState = {};

export default createReducer({
  [fetchAlerts.COMPLETE]: (state, { alerts }) => ({
    ...alerts
  }),
}, initialState);
