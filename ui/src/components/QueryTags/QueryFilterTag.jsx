import React, { PureComponent } from 'react';
import { FormattedMessage } from 'react-intl';
import { Tag as TagWidget } from '@blueprintjs/core';

import { Schema, Tag, Country, Language, Category, Collection, Entity } from 'src/components/common';

import './QueryFilterTag.css';


class QueryFilterTag extends PureComponent {
  constructor(props) {
    super(props);
    this.onRemove = this.onRemove.bind(this);
  }

  onRemove() {
    const { filter, value, remove } = this.props;
    remove(filter, value);
  }
  
  label(filter, value) {
    switch (filter) {
      case 'schema':
        return (
          <Schema.Label schema={value} icon={true} plural={true} />
        );
      case 'countries':
        return (
          <Country.Name code={value} />
        );
      case 'languages':
        return (
          <Language.Name code={value} />
        );
      case 'category':
        return (
          <Category category={value} />
        );
      case 'collection_id':
        return (
          <Collection.Load id={value} renderWhenLoading={'…'}>{collection => (
            <React.Fragment>
              {collection && <Collection.Label collection={collection} />}
              {collection && collection.error &&  <FormattedMessage id="query.not_accessible" defaultMessage="Not accessible!"/>}
            </React.Fragment>
          )}</Collection.Load>
        );
      case 'ancestors':
      case 'parent.id':
        return (
          <React.Fragment>
            <FormattedMessage id="search.filterTag.ancestors" defaultMessage="in:" />
            <Entity.Load id={value} renderWhenLoading={'…'}>{entity => (
              <Entity.Label entity={entity} icon />
            )}</Entity.Load>
          </React.Fragment>
        );
      case 'exclude':
        return (
          <React.Fragment>
            <FormattedMessage id="search.filterTag.exclude" defaultMessage="not:" />
            <Entity.Load id={value} renderWhenLoading={'…'}>{entity => (
              <Entity.Label entity={entity} icon />
            )}</Entity.Load>
          </React.Fragment>
        );
      case 'entities':
        return (
          <React.Fragment>
            <Entity.Load id={value} renderWhenLoading={'…'}>{entity => (
              <Entity.Label entity={entity} icon />
            )}</Entity.Load>
          </React.Fragment>
        );
      case 'names':
      case 'identifiers':
      case 'emails':
      case 'phones':
      case 'addresses':
        return (
          <React.Fragment>
            <Tag.Icon field={filter} /> {value}
          </React.Fragment>
        );
      default:
        return (
          <React.Fragment>{value}</React.Fragment>
        );
    }
  }

  render() {
    const { filter, value } = this.props;
    return (
        <TagWidget
          className="pt-large pt-intent-primary QueryFilterTag"
          onRemove={this.onRemove}>
          {this.label(filter, value)}
        </TagWidget>
    );
  }
}

export default QueryFilterTag;
