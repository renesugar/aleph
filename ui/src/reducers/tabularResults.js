import { createReducer } from 'redux-act';

import { fetchTabularResults } from 'src/actions';

const initialState = {
    isLoaded: false,
};

export default createReducer({
    [fetchTabularResults.START]: state => ({ isLoaded: false }),

    [fetchTabularResults.COMPLETE]: (state, { cells }) => ({
        ...cells,
        isLoaded: true
    }),
}, initialState);