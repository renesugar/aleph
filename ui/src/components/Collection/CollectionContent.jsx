import React, { Component } from 'react';

import { DualPane } from 'src/components/common';
import EntitySearch from 'src/components/EntitySearch/EntitySearch';

class CollectionContent extends Component {
  render() {
    const { collection } = this.props;
    const context = {
      'filter:collection_id': collection.id
    };
    return (
      <DualPane.ContentPane>
        <EntitySearch showLinksInPreview={true} context={context} hideCollection={true} />
      </DualPane.ContentPane>
    );
  }
}

export default CollectionContent;
