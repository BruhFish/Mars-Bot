const Commando = require("discord.js-commando");
const mysqlProvider = require("commando-provider-mysql");
const mysql = require("mysql2/promise");
const axios = require("axios");
const schedule = require("node-schedule");
const moment = require("moment");
const chalk = require("chalk");
const fs = require("fs");
const path = require("path");
const config = require("./config.json");
const load = require("./load");
const dpod = require("./dpod");

const client = new Commando.CommandoClient({
  commandPrefix: config.prefix,
  owner: config.user_id.owner,
  invite: config.invite,
  unknownCommandResponse: false,
});
client.config = config;
db_connect = false;
login = false;
res = {};
client.registry
  .registerDefaultTypes()
  .registerGroups([
    ["missions", "I have info on all of there missions"],
    ["api calls", "I also have access to images for these"],
    ["utilities", "Other useful commands"],
  ])
  .registerDefaultGroups()
  .registerDefaultCommands({ unknownCommand: false })
  .registerCommandsIn(path.join(__dirname, "commands"));

mysql
  .createConnection({
    host: config.mysql.host,
    user: config.mysql.user,
    password: config.mysql.pwd,
    database: config.mysql.db,
  })
  .then((db) => {
    client.setProvider(new mysqlProvider(db));
    console.log(chalk.green(`Database Connected Successfully`));
  });

fs.readdir("./events/", (err, files) => {
  if (err) return console.error(err);
  files.forEach((file) => {
    if (!file.endsWith(".js")) return;
    let properties = require(`./events/${file}`);
    let functionName = file.split(".")[0];
    client.functions = {};
    client.functions[functionName] = properties;
  });
});

client.once("ready", () => {
  client.user.setActivity(`${config.prefix}Help for help.`, {
    type: "WATCHING",
  });
  login = true;
  axios
    .get(`https://api.nasa.gov/planetary/apod?api_key=${config.api_key}`)
    .then((res) => {
      console.log(chalk.green(`NASA API Connected Successfully`));
    })
    .catch(function (error) {
      console.log(chalk.yellow(error));
    });

  if (client.config.dpod == true) {
    dpod.execute();
  }
  if (db_connect !== true) db_connect = false;
  if (login !== true) login = false;
  let info = {
    tag: client.user.tag,
    id: client.user.id,
    server: client.guilds.cache.size,
  };
  load.execute(info, res);
});
client.on("error", console.error);
client.login(config.token);
