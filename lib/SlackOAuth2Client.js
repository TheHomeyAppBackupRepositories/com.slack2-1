'use strict';

const { OAuth2Client } = require('homey-oauth2app');
const FormData = require('form-data');
const SlackOAuth2Token = require('./SlackOAuth2Token');

module.exports = class SlackOAuth2Client extends OAuth2Client {

  static API_URL = 'https://slack.com/api';
  static TOKEN = SlackOAuth2Token;
  static TOKEN_URL = 'https://slack.com/api/oauth.v2.access';
  static AUTHORIZATION_URL = 'https://slack.com/oauth/v2/authorize';
  static SCOPES = [
    'chat:write',
    'files:write',
    'channels:read',
    'users:read',
    'groups:read',
  ];

  onHandleAuthorizationURLScopes({ scopes }) {
    return scopes.join(',');
  }

  async getChannels() {
    return this.get({
      path: '/conversations.list',
      query: {
        exclude_archived: true,
        types: 'public_channel,private_channel',
      },
    }).then(result => result.channels);
  }

  async getChannelsCached() {
    if (!this._channelsCache) {
      this._channelsCache = await this.getChannels();
      setTimeout(() => {
        this._channelsCache = null;
      }, 10000);
    }

    return this._channelsCache;
  }

  async getUsers() {
    return this.get({
      path: '/users.list',
    }).then(result => result.members);
  }

  async getUsersCached() {
    if (!this._usersCache) {
      this._usersCache = await this.getUsers();
      setTimeout(() => {
        this._usersCache = null;
      }, 10000);
    }

    return this._usersCache;
  }

  async postMessage({ text, channel }) {
    return this.post({
      path: '/chat.postMessage',
      json: {
        text,
        channel,
      },
    }).then(result => {
      if (!result.ok && result.error) {
        throw new Error(result.error);
      }

      return result;
    });
  }

  async postMessageWithFile({ text, channel, stream }) {
    const form = new FormData();
    form.append('file', stream, {
      contentType: 'image/jpeg',
      filename: 'image.jpg',
    });
    form.append('channels', channel);
    form.append('initial_comment', text);

    return this.post({
      path: '/files.upload',
      body: form,
      headers: form.getHeaders(),
    }).then(result => {
      if (!result.ok && result.error) {
        throw new Error(result.error);
      }

      return result;
    });
  }

};
