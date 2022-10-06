import { User, Room } from "../db";
import { App } from "../main";
import {
  Client,
  REST,
  Routes,
  GatewayIntentBits,
  Message,
  Interaction,
  CommandInteraction,
  Channel,
  EmbedBuilder,
} from "discord.js";
import { sendMessage } from "../routes/chat/chat";

const commands = [
  {
    name: "register",
    description: "Register an account",
    route: async (interaction: CommandInteraction) => {
      interaction.reply("test");
    },
  },
];

var rest: REST;
var client: Client;

export async function start(state:App,token: string, id: string) {
  rest = new REST({ version: "10" }).setToken(token);

  client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.MessageContent,
      GatewayIntentBits.GuildMessages,
    ],
  });
  registerCommands(token, id);

  client.on("messageCreate", async (message: Message) => {
    if (message.author.bot) return;
    if (message.channelId == lastmessage?.message.channelId) lastmessage = null;
    const room = await state.db.getOne<Room>("Rooms",{channel:message.channelId});
    const user= await state.db.getOne<User>("Users",{discordId:message.author.id});
    if (!room || !user) {
      return
    };
    sendMessage(state,user,room,message.content);
  });

  console.log("Bot Logged In");
  client.login(token);
}
//edit message if possible
var lastmessage: { sender: string; timestamp: Date; message: Message } | null;
export async function message(
  state: App,
  user: User,
  room: Room,
  content: string
) {
  if (!room.channel) return;
  const channel = client.channels.cache.get(room.channel);
  if (!channel || !channel.isTextBased()) return;

  let desc = 
        content
          .replace(/<br>/g, "\n")
          .replace(/&gt;/g, ">")
          .replace(/&lt;/, "<")
          .replace(/&amp;/, "&")

  const embed = new EmbedBuilder()
      .setColor(0x4c3e51)
      .setAuthor({
        name: user.username,
        iconURL: "https://coolelectronics.me/pfp/" + user.username + ".png",
      })

  if (
    lastmessage &&
    Math.floor(new Date().getTime() - lastmessage.timestamp.getTime()) /
      1000 /
      60 <
      5 &&
    lastmessage?.sender == user.uuid && lastmessage.message.channelId == channel.id
  ) {
    embed.setDescription(lastmessage.message.embeds[0].description + "\n" + desc);
    lastmessage = {
      sender: user.uuid,
      timestamp: new Date(),
      message: await lastmessage.message.edit({ embeds: [embed]})
    };
    await (await channel.send(content)).delete();
    // makes sure to send a notification
  } else {
    embed.setDescription(desc);

    lastmessage = {
      sender: user.uuid,
      timestamp: new Date(),
      message: await channel.send({ embeds: [embed] }),
    };
  }
}

async function registerCommands(token: string, id: string) {
  try {
    await rest.put(Routes.applicationCommands(id), {
      body: commands.map((c) => {
        const { route, ..._ } = c;
        return _;
      }),
    });
    client.on("interactionCreate", async (interaction) => {
      for (let command of commands) {
        if (!interaction.isChatInputCommand()) return;
        if (interaction.commandName != command.name) return;
        command.route(interaction);
      }
    });
  } catch (error) {
    console.error(error);
  }
}
