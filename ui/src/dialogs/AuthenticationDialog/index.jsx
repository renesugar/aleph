import React, {Component} from 'react';
import {defineMessages, FormattedMessage, injectIntl} from 'react-intl';
import {connect} from 'react-redux';
import {Callout, Intent, Dialog, MenuDivider, Button} from '@blueprintjs/core';

import {endpoint} from 'src/app/api';
import {xhrErrorToast} from 'src/components/auth/xhrToast';
import {PasswordAuthLogin} from 'src/components/auth/PasswordAuth';
import {PasswordAuthSignup} from 'src/components/auth/PasswordAuth';
import {loginWithPassword, loginWithToken} from "src/actions/sessionActions";

import './style.css';

const messages = defineMessages({
  registration_not_available_title: {
    id: 'signup.not_available_title',
    defaultMessage: 'Registration is disabled'
  },
  title: {
    id: 'signup.title',
    defaultMessage: 'Sign in',
  },
  registrationTitle: {
    id: 'signup.register',
    defaultMessage: 'Register',
  },
  registration_not_available_desc: {
    id: 'signup.not_available_desc',
    defaultMessage: 'Please contact the site admin to get an account'
  },
  not_available_title: {
    id: 'login.not_available_title',
    defaultMessage: 'Login is disabled',
  },
  not_available_desc: {
    id: 'login.not_available_desc',
    defaultMessage: 'There is no login provider configured for this app',
  }
});

class AuthenticationDialog extends Component {
  constructor() {
    super();

    this.state = {
      submitted: false,
      firstSection: '',
      secondSection: 'hide'
    };

    this.onLogin = this.onLogin.bind(this);
    this.onSignup = this.onSignup.bind(this);
    this.onRegisterClick = this.onRegisterClick.bind(this);
    this.onSignInClick = this.onSignInClick.bind(this);
    this.onOAuthLogin = this.onSignInClick.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    const {auth} = this.props.metadata;
    if (nextProps.isOpen && !auth.password_login_uri) {
      this.onOAuthLogin();
    }
  }

  onOAuthLogin() {
    const {auth} = this.props.metadata;
    if (!auth.oauth_uri) {
      const location = window.location;
      const targetUrl = `${location.protocol}//${location.host}/oauth`;
      const loginUrlQueryString = `?next=${encodeURIComponent(targetUrl)}`;
      window.location.replace(`/api/2/sessions/oauth${loginUrlQueryString}`);
    }
  }

  onSignup(data) {
    endpoint.post('/roles/code', data).then(() => {
      this.setState({submitted: true})
    }).catch(e => {
      console.log(e);
      xhrErrorToast(e.response, this.props.intl);
    });
  }

  onLogin(data) {
    this.props.loginWithPassword(data.email, data.password);
  }

  onRegisterClick() {
    this.setState({firstSection: 'hide', secondSection: ''})
  }

  onSignInClick() {
    this.setState({firstSection: '', secondSection: 'hide'})
  }

  render() {
    const {metadata, intl, auth} = this.props;
    const {submitted, firstSection, secondSection} = this.state;
    const passwordLogin = metadata.auth.password_login_uri;

    return (
      <Dialog icon="authentication" className="AuthenticationScreen"
              isOpen={this.props.isOpen}
              onClose={this.props.toggleDialog}
              title={firstSection === '' ? intl.formatMessage(messages.title) : intl.formatMessage(messages.registrationTitle)}>
        <div className="inner">
          <section className={firstSection}>
            {passwordLogin && <PasswordAuthLogin buttonClassName='signin-button' onSubmit={this.onLogin}/>}
            {passwordLogin && <div className='link-box'>
              <a key='oauth' onClick={this.onRegisterClick}>
                <FormattedMessage id="signup.register.question" defaultMessage="Don't have account? Register!"/>
              </a>
            </div>}
          </section>
          <section className={secondSection}>
            {submitted ?
              <Callout intent={Intent.SUCCESS} icon="tick">
                <h5><FormattedMessage id="signup.inbox.title" defaultMessage="Check your inbox"/></h5>
                <FormattedMessage id="signup.inbox.desc"
                                  defaultMessage="We've sent you an email, please follow the link to complete your registration"/>
              </Callout> :
              <span>
                <PasswordAuthSignup buttonClassName='signin-button' onSubmit={this.onSignup}/>
                <div className='link-box'>
                  <a key='oauth' onClick={this.onSignInClick}>
                    <FormattedMessage id="signup.login" defaultMessage="Already have account? Sign in!"/>
                  </a>
                </div>
              </span>}
          </section>
          <MenuDivider className='menu-divider'/>
          {auth.oauth_uri && (
            <Button icon="log-in" className="pt-large pt-fill" onClick={this.onOAuthLogin}>
              <FormattedMessage id="login.oauth" defaultMessage="Sign in via OAuth"/>
            </Button>
          )}
        </div>
      </Dialog>
    );
  }
}

const mapStateToProps = ({metadata}) => ({metadata});

AuthenticationDialog = connect(mapStateToProps, {loginWithToken, loginWithPassword})(injectIntl(AuthenticationDialog));
export default AuthenticationDialog;
