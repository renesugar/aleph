import React, { Component } from 'react';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';

import Category from 'components/common/Category';
import Language from 'components/common/Language';
import Country from 'components/common/Country';
import Role from 'components/common/Role';
import Date from 'components/common/Date';


class CollectionInfo extends Component {
  render() {
    const { collection } = this.props;
    
    // If collection data it hasn't loaded yet don't attempt to draw anything
    if (!collection)
      return null

    return (
      <React.Fragment>
        <h1 style={{margin: 0, border: 0}}>
          {collection.label || null}
        </h1>
        <p>{collection.summary}</p>
        <ul className='info-sheet'>
          <li>
            <span className="key">
              <FormattedMessage id="collection.category" defaultMessage="Category"/>
            </span>
            <span className="value">
              <Category collection={collection} />
            </span>
          </li>
          { collection.creator && (
            <li>
              <span className="key">
                <FormattedMessage id="collection.creator" defaultMessage="Manager"/>
              </span>
              <span className="value">
                <Role.Label role={collection.creator} />
              </span>
            </li>
          )}
          { collection.languages && !!collection.languages.length && (
            <li>
              <span className="key">
                <FormattedMessage id="collection.languages" defaultMessage="Language"/>
              </span>
              <span className="value">
                <Language.List codes={collection.languages} />
              </span>
            </li>
          )}
          { collection.countries && !!collection.countries.length && (
            <li>
              <span className="key">
                <FormattedMessage id="collection.countries" defaultMessage="Country"/>
              </span>
              <span className="value">
                <Country.List codes={collection.countries} truncate={10} />
              </span>
            </li>
          )}
          <li>
            <span className="key">
              <FormattedMessage id="collection.updated_at" defaultMessage="Last updated"/>
            </span>
            <span className="value">
              <Date value={collection.updated_at} />
            </span>
          </li>
        </ul>
      </React.Fragment>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  return {};
}

export default connect(mapStateToProps)(CollectionInfo);
