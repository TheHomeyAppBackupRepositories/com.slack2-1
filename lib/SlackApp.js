'use strict';

const Homey = require('homey');
const { OAuth2App } = require('homey-oauth2app');
const SlackOAuth2Client = require('./SlackOAuth2Client');

module.exports = class SlackOAuth2App extends OAuth2App {

  static OAUTH2_CLIENT = SlackOAuth2Client;
  static OAUTH2_DEBUG = true;
  static OAUTH2_MULTI_SESSION = true;

  async onOAuth2Init() {
    this.webhookKeys = [];
  }

  async registerWebhook({ teamId }) {
    if (this.webhookKeys.includes(teamId)) return;
    this.webhookKeys.push(teamId);

    if (this.webhook) {
      await this.webhook.unregister();
    }

    this.webhook = await this.homey.cloud.createWebhook(
      Homey.env.WEBHOOK_ID,
      Homey.env.WEBHOOK_SECRET,
      {
        $keys: this.webhookKeys,
      },
    );
    this.webhook.on('message', ({ body }) => {
      this.emit(`webhook:${body.team_id}`, body);
    });
  }

};
