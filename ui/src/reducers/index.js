import { combineReducers } from 'redux'

import collections from './collections'
import metadata from './metadata'
import session from './session'
import entities from './entities';
import tabularResults from './tabularResults';

const rootReducer = combineReducers({
  collections,
  metadata,
  session,
  entities,
  tabularResults
});

export default rootReducer;
