const { Command } = require('discord.js-commando')
const axios = require('axios')

const config = require('$root/config.json')

module.exports = class Curiosity extends Command {
  constructor(client) {
    super(client, {
      name: 'curiosity',
      group: 'rovers',
      memberName: 'curiosity',
      description:
        'Get info about curiosity and look up the images it has taken',
      examples: [
        `${config.prefix}curiosity`,
        `${config.prefix}curiosity <'info' | 'image'> <sol> <result number>`,
      ],
      clientPermissions: ['EMBED_LINKS'],
      throttling: config.command_throttling.api,
      args: [
        {
          key: 'type',
          prompt: 'Please choose if you are looking for an image or info',
          type: 'string',
          oneOf: ['info', `image`],
          default: 'info',
        },
        {
          key: 'sol',
          prompt: 'Please choose a sol to look for',
          type: 'integer',
          default: '',
        },
        {
          key: 'result_number',
          prompt: 'Please choose a result number to look for',
          type: 'integer',
          default: '',
        },
      ],
    })
  }

  run(message, { type, sol, result_number }) {
    if (type === 'image') {
      if (!sol)
        return message.reply(
          'Please choose a sol to look for\n`=curiosity image <sol> <result number>`',
        )
      if (!result_number)
        return message.reply(
          'Please choose a result number to look for\n`=curiosity image <sol> <result number>`',
        )

      axios
        .get(
          `https://api.nasa.gov/mars-photos/api/v1/rovers/curiosity/photos?sol=${sol}&api_key=${config.api_key}`,
        )
        .then((res) => {
          if (!res.data.photos[result_number - 1]) {
            return message.reply('No results found')
          }
          let img = res.data.photos[result_number - 1].img_src
          let data = res.data.photos[result_number - 1]
          let cam = res.data.photos[result_number - 1].camera
          let rover = res.data.photos[result_number - 1].rover

          message.channel.send({
            embed: {
              title: 'Photo from ' + rover.name + "'s from " + cam.full_name,
              url: img,
              description: `**Rover Name:** ${rover.name}\n**Mission Status:** ${rover.status}\n**Sol:** ${data.sol}\n**Date:** ${data.earth_date}\n**Camera Name:** ${cam.full_name} (${cam.name})\n**Photo ID:** ${data.id}`,
              color: this.client.config.embed_color,
              timestamp: new Date(),
              image: {
                url: img,
              },
              footer: {
                text: 'Photo Credit: NASA/JPL-Caltech',
                icon_url: '',
              },
            },
          })
        })
        .catch(function (error) {
          console.log(error.stack)
          message.reply(
            `An API error has occurred: ${error}\nFor help solving this problem please join are support server: ${config.invite}`,
          )
        })
      return
    }
    message.embed({
      title: 'Mars Science Laboratory Curiosity',
      url:
        'https://mars.nasa.gov/mars-exploration/missions/mars-science-laboratory',
      description:
        '**API data available for this mission** Do `=curiosity image <sol> <result number>`\nLaunched on November 26, 2011\nLaunched from Cape Canaveral Air Force Station, Florida\nLanded on August 6, 2012\nLanded at Gale Crater, Mars\nMission Ongoing\nMore Info at:\nhttps://mars.nasa.gov/mars-exploration/missions/mars-science-laboratory/',
      color: this.client.config.embed_color,
      timestamp: new Date(),
      image: {
        url:
          'https://mars.nasa.gov/system/resources/detail_files/3504_msl20110519_PIA14156-full2.jpg',
      },
      footer: {
        text: 'Credit: NASA/JPL-Caltech',
        icon_url: '',
      },
    })
  }
}
