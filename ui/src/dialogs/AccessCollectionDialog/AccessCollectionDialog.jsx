import React, {Component} from 'react';
import { Button, Checkbox, Dialog } from '@blueprintjs/core';
import { defineMessages, FormattedMessage, injectIntl } from 'react-intl';
import { connect } from 'react-redux';

import { updateCollectionPermissions, fetchCollectionPermissions } from 'src/actions';
import { Role } from 'src/components/common';
import { showSuccessToast } from "src/app/toast";

import './AccessCollectionDialog.css';

const messages = defineMessages({
  title: {
    id: 'collection.edit.title',
    defaultMessage: 'Manage collection permissions',
  },
  save_success: {
    id: 'collection.edit.save_success',
    defaultMessage: 'Your changes are saved.',
  },
});

class PermissionRow extends Component {
  render() {
    const { permission, onToggle } = this.props;
    return (<tr>
      <td>
        {permission.role.name}
      </td>
      <td className='other-rows'>
        <Checkbox checked={permission.read}
                  onClick={() => onToggle(permission, 'read')} />
      </td>
      <td className='other-rows'>
        <Checkbox checked={permission.write}
                  onClick={() => onToggle(permission, 'write')} />
      </td>
    </tr>);
  }
}


class AccessCollectionDialog extends Component {
  constructor(props) {
    super(props);
    this.state = {
      permissions: []
    };

    this.onAddRole = this.onAddRole.bind(this);
    this.onToggle = this.onToggle.bind(this);
    this.onSave = this.onSave.bind(this);
  }

  componentDidMount() {
    this.fetchPermissions();
  }

  componentWillReceiveProps(nextProps) {
    const { collection } = this.props;
    if (!collection || (nextProps.collection && nextProps.collection.id !== collection.id)) {
      this.fetchPermissions();
    }
  }

  fetchPermissions() {
    const { collection } = this.props;
    if (collection && collection.writeable) {
      this.props.fetchCollectionPermissions(collection.id);
    }
  }

  filterPermissions(type) {
    const { permissions } = this.props;
    return permissions.filter((perm) =>
      perm.role.type === type
    );
  }

  onAddRole(role) {
    const { permissions } = this.state;
    permissions.push({role: role, read: true, write: false});
    this.setState({permissions: permissions});
  }

  onToggle(permission, flag) {
    const permissions = this.props.permissions.map((perm) => {
      if (perm.role.id === permission.role.id) {
        perm[flag] = !perm[flag];
      }
      return perm;
    });
    this.setState({permissions: permissions});
  }

  async onSave() {
    const { intl, collection, updateCollectionPermissions } = this.props;
    const { permissions } = this.state;

    await updateCollectionPermissions(collection.id, permissions);
    this.props.toggleDialog();
    showSuccessToast(intl.formatMessage(messages.save_success));
  }

  render() {
    const {collection, intl} = this.props;
    const {permissions} = this.state;
    const exclude = permissions.map((perm) => perm.role.id);

    if (!collection || !collection.writeable) {
      return null;
    }

    return (
      <Dialog icon="key" className="AlertsDialog"
              isOpen={this.props.isOpen}
              onClose={this.props.toggleDialog}
              title={intl.formatMessage(messages.title)}>
        <div className="pt-dialog-body">
          <div className="CollectionPermissions">
            <table className="settings-table">
              <thead>
              <tr key={0}>
                <th/>
                <th>
                  <FormattedMessage id="collection.edit.permissionstable.view"
                                    defaultMessage="View"/>
                </th>
                <th>
                  <FormattedMessage id="collection.edit.permissionstable.edit"
                                    defaultMessage="Edit"/>
                </th>
              </tr>
              </thead>
              <tbody>
              {this.filterPermissions('system').map((permission) =>
                <PermissionRow key={permission.role.id}
                               permission={permission}
                               onToggle={this.onToggle} />
              )}
              <tr key={'groups'}>
                <td className='header-topic' colSpan="3">
                  <FormattedMessage id="collection.edit.groups"
                                    defaultMessage="Groups"/>
                </td>
              </tr>
              {this.filterPermissions('group').map((permission) =>
                <PermissionRow key={permission.role.id}
                               permission={permission}
                               onToggle={this.onToggle} />
              )}
              <tr key={'users'}>
                <td className='header-topic' colSpan="3">
                  <FormattedMessage id="collection.edit.users"
                                    defaultMessage="Users"/>
                </td>
              </tr>
              {this.filterPermissions('user').map((permission) =>
                <PermissionRow key={permission.role.id}
                               permission={permission}
                               onToggle={this.onToggle} />
              )}
              <tr key="add">
                <td colSpan="3">
                  <Role.Select onSelect={this.onAddRole}
                               exclude={exclude} />
                </td>
              </tr>
              </tbody>
            </table>
            <div className="save">
              <Button className="pt-intent-primary pt-large" onClick={this.onSave}>
                <FormattedMessage id="collection.info.permissions.update"
                                  defaultMessage="Save"/>
              </Button>
            </div>
          </div>
        </div>
      </Dialog>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  const collectionId = ownProps.collection.id;
  return {
    permissions: state.collectionPermissions[collectionId] || []
  };
};

AccessCollectionDialog = injectIntl(AccessCollectionDialog);
export default connect(mapStateToProps, {updateCollectionPermissions, fetchCollectionPermissions})(AccessCollectionDialog);
