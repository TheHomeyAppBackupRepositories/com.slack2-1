/* eslint-disable camelcase */

'use strict';

const { OAuth2Token } = require('homey-oauth2app');

module.exports = class SlackOAuth2Token extends OAuth2Token {

  constructor({
    access_token,
    token_type,
    scope,
    team,
    bot_user_id,
  }) {
    super({
      access_token,
      token_type,
    });

    this.scope = scope;
    this.team = team;
    this.bot_user_id = bot_user_id;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      scope: this.scope,
      team: this.team,
      bot_user_id: this.bot_user_id,
    };
  }

};
