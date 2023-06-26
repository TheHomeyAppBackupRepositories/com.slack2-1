'use strict';

const { OAuth2Device } = require('homey-oauth2app');
const SlackUtil = require('./SlackUtil');

module.exports = class SlackWorkspaceDevice extends OAuth2Device {

  async onOAuth2Init() {
    const { id: teamId } = this.getData();
    this.homey.app.registerWebhook({ teamId });
    this.homey.app.on(`webhook:${teamId}`, body => {
      this.onWebhook(body).catch(this.error);
    });
  }

  async onDeleted() {
    const { id: teamId } = this.getData();
    this.homey.app.removeListener(`webhook:${teamId}`);
  }

  async sendMessage({ to, message }) {
    await this.oAuth2Client.postMessage({
      text: message,
      channel: to,
    });
  }

  async sendMessageWithImage({ to, message, image }) {
    await this.oAuth2Client.postMessageWithFile({
      text: message,
      channel: to,
      stream: await image.getStream(),
    });
  }

  async getRecipientsAutocomplete({ query = '' }) {
    const [users, channels] = await Promise.all([
      this.oAuth2Client.getUsersCached(),
      this.oAuth2Client.getChannelsCached(),
    ]);

    return [
      ...users
        .filter(user => {
          if (user.name === 'slackbot') return false;
          if (user.deleted) return false;
          if (user.is_bot) return false;
          if (user.is_app_user) return false;
          return true;
        })
        .map(user => ({
          id: user.id,
          name: user.profile
            ? user.profile.real_name
            : `@${user.name}`,
          image: user.profile
            ? user.profile.image_512
            : null,
        })),

      ...channels
        .filter(channel => {
          if (channel.is_channel !== true) return false;
          if (channel.is_member !== true) return false;
          if (channel.is_archived) return false;
          if (channel.is_group) return false;
          if (channel.is_im) return false;
          return true;
        })
        .map(channel => ({
          id: channel.id,
          name: `#${channel.name}`,
        })),
    ].filter(item => item.name.toLowerCase().includes(query.toLowerCase()));
  }

  async onWebhook({ command, text }) {
    this.log(`Webhook: ${command} ${text}`);

    if (command === '/flow') {
      const [command, tag = ''] = SlackUtil.split(text, ' ', 1);
      await this.homey.flow
        .getDeviceTriggerCard('slash_command')
        .trigger(this, {
          tag,
        }, {
          command,
        });
    }
  }

};
