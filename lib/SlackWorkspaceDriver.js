'use strict';

const { OAuth2Driver } = require('homey-oauth2app');

module.exports = class SlackWorkspaceDriver extends OAuth2Driver {

  async onOAuth2Init() {
    this.homey.flow.getDeviceTriggerCard('slash_command')
      .registerRunListener(async (args, state) => {
        return args.command === state.command;
      });

    this.homey.flow.getActionCard('send_message')
      .registerRunListener(async ({
        device,
        message,
        recipient,
      }) => {
        return device.sendMessage({
          message,
          to: recipient.id,
        });
      })
      .getArgument('recipient')
      .registerAutocompleteListener(async (query, { device }) => {
        return device.getRecipientsAutocomplete({ query });
      });

    this.homey.flow.getActionCard('send_message_with_image')
      .registerRunListener(async ({
        device,
        message,
        recipient,
        droptoken,
      }) => {
        return device.sendMessageWithImage({
          message,
          to: recipient.id,
          image: droptoken,
        });
      })
      .getArgument('recipient')
      .registerAutocompleteListener(async (query, { device }) => {
        return device.getRecipientsAutocomplete({ query });
      });
  }

  async onPairListDevices({ oAuth2Client }) {
    const { team } = oAuth2Client.getToken();
    return [{
      name: team.name,
      data: {
        id: team.id,
      },
    }];
  }

};
