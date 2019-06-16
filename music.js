const Discord = require('discord.js');
var os = require('os');
const bot = new Discord.Client();
const prefix = '?';
var loop;
bot.on('ready', () => {
	console.log('Ready!');
	bot.user.setGame(`อ่านไอ่สัส พิมพ์ "?"`);
});



bot.login('NTY4Mjg2OTQ3MDM4OTg2MjQw.XQS5Eg.h98CwE5LP_VFHWq6lIbnshsfd7w');
const YouTube = require('simple-youtube-api');
const ytdl = require('ytdl-core');
const youtube = new YouTube("AIzaSyAGenWhq0O_CZ2E_4uAj0WF7PUJvgaXH1o");
const queue = new Map();
var servers = {};


bot.on("message", async message => {
	if(message.author.bot) return;
    var args = message.content.split(" ");
  var searchString = args.slice(1).join(' ');
	var url = args[1] ? args[1].replace(/<(.+)>/g, '$1') : '';
	var serverQueue = queue.get(message.guild.id);
if (args[0] == `${prefix}เปิดเพลง`||args[0]==`${prefix}play`||args[0]==`${prefix}p`){
	
    var voiceChannel = message.member.voiceChannel;
		if (!voiceChannel) return message.channel.send('คุณไม่ได้อยู่ในห้องคุย');
		var permissions = voiceChannel.permissionsFor(message.client.user);
		if (!permissions.has('CONNECT')) {
			return message.channel.send('กูเข้าห้องไม่ได้ไอ้เหี้ย! ให้ความสามารถในการเข้าห้องกูด้วย');
		}
		if (!permissions.has('SPEAK')) {
			return message.channel.send('กูเข้าห้องไม่ได้ไอ้เหี้ย! ให้ความสามารถในการเข้าห้องกูด้วย');
		}
      if (url.match(/^https?:\/\/(www.youtube.com|youtube.com)\/playlist(.*)$/)) {
			var playlist = await youtube.getPlaylist(url);
			var videos = await playlist.getVideos();
			for (const video of Object.values(videos)) {
				var video2 = await youtube.getVideoByID(video.id); // eslint-disable-line no-await-in-loop
				await handleVideo(video2, message, voiceChannel, true); // eslint-disable-line no-await-in-loop
			}
			return message.channel.send(`✅ เพลงมั้งหมด: **${playlist.title}** แหกตาดูไอ่สัส!`);
		} else {
			try {
				var video = await youtube.getVideo(url);
			} catch (error) {
				try {
					var videos = await youtube.searchVideos(searchString, 10);
					var index = 0;
					var videoIndex = "1";
					var video = await youtube.getVideoByID(videos[videoIndex - 1].id);
					console.log(video);
				} catch (err) {
					console.error(err);
					return message.channel.send('หาเพลงไม่เจอไอ่สัส พิมพ์ใหม่อีสัส');
				}
			}
			return handleVideo(video, message, voiceChannel);
		}
}
if (args[0]==`${prefix}เปลี่ยนเพลง`||args[0]==`${prefix}skip`||args[0]==`${prefix}s`){
		if (!message.member.voiceChannel) return message.channel.send('คุณไม่ได้อยู่ในห้องคุย');
		if (!serverQueue) return message.channel.send('ไม่มีเพลงไอ่สัส เปิดเพลงด้วยกูอยากฟัง');
		serverQueue.connection.dispatcher.end('เปลี่ยนเพลงแล้ว');
		return undefined;
}
		if(args[0]==`${prefix}ปิดเพลง`||args[0]==`${prefix}stop`||args[0]==`${prefix}st`){
		if(!message.member.voiceChannel) return message.channel.send('คุณไม่ได้อยู่ในห้องคุย!');
		if(!serverQueue) return message.channel.send('ไม่มีเพลงที่เล่นอยู่');
		serverQueue.songs = [];
		serverQueue.connection.dispatcher.end('ปิดเพลงแล้ว');
		return undefined;
	  }		
	  if(args[0]==`${prefix}วน`||args[0]==`${prefix}loop`){
		  if(!loop){
	message.channel.send(':repeat_one: **Enabled!**');
		  loop = true;
		  }else{ 
		  message.channel.send(':repeat_one: **Disabled!**');
		  loop = false;
		  }
		return undefined;
	  }
		if(args[0]==`${prefix}เสียง`||args[0]==`${prefix}volume`||args[0]==`${prefix}v`){
		if (!message.member.voiceChannel) return message.channel.send('คุณไม่ได้อยู่ในห้องคุย!');
		if (!serverQueue) return message.channel.send('ไม่มีเพลงที่เล่นอยู่');
		if (!args[1]) return message.channel.send(`ระดับความเจ็บคอคือ **${serverQueue.volume}**`);
		serverQueue.volume = args[1];
		serverQueue.connection.dispatcher.setVolumeLogarithmic(args[1] / 5);
		return message.channel.send(`อย่าเร่งเสียงกูมากกูเจ็บคอ กูปรับเสียงเป็น **${args[1]}** แล้ว`);
		}
      if(args[0]==`${prefix}คิว`||args[0]==`${prefix}queue`||args[0]==`${prefix}q`){
		if (!serverQueue) return message.channel.send('ไม่มีเพลงที่เล่นอยู่');
		return message.channel.send(`
__**Song queue:**__
${serverQueue.songs.map(song => `**-** ${song.title}`).join('\n')}
**Now playing:** ${serverQueue.songs[0].title}
		`);
	  }
if(args[0]==`${prefix}หยุด`||args[0]==`${prefix}pause`||args[0]==`${prefix}pa`){
		if (serverQueue && serverQueue.playing) {
			serverQueue.playing = false;
			serverQueue.connection.dispatcher.pause();
			return message.channel.send('⏸ หยุดเพลงแล้ว');
			bot.user.setGame(`หยุดเพลง : ${song.title} แล้ว`);
		}
		return message.channel.send('ไม่มีเพลงที่เล่นอยู่');
}
if(args[0]==`${prefix}ต่อ`||args[0]==`${prefix}resume`||args[0]==`${prefix}re`){
		if (serverQueue && !serverQueue.playing) {
			serverQueue.playing = true;
			serverQueue.connection.dispatcher.resume();
			return message.channel.send('▶ Resumed the music for you!');
		}
		return message.channel.send('เปิดเพลงไม่ได้ไอ่เหี้ย');
	

	return undefined;
}
async function handleVideo(video, message, voiceChannel, playlist = false) {
	var serverQueue = queue.get(message.guild.id);
	console.log(video);
	var song = {
		id: video.id,
		title: video.title,
		url: `https://www.youtube.com/watch?v=${video.id}`
	};
	if (!serverQueue) {
		var queueConstruct = {
			textChannel: message.channel,
			voiceChannel: voiceChannel,
			connection: null,
			songs: [],
			volume: 5,
			playing: true
		};
		queue.set(message.guild.id, queueConstruct);

		queueConstruct.songs.push(song);

		try {
			var connection = await voiceChannel.join();
			queueConstruct.connection = connection;
			play(message.guild, queueConstruct.songs[0]);
		} catch (error) {
			console.error(`กูเข้าห้องไม่ได้ไอ้เหี้ย: ${error}`);
			queue.delete(message.guild.id);
			return message.channel.send(`กูเข้าห้องไม่ได้ไอ้เหี้ย: ${error}`);
		}
	} else {
		serverQueue.songs.push(song);
		console.log(serverQueue.songs);
		if (playlist) return undefined;
		else return message.channel.send(`✅ __**${song.title}**__ เพิ่มลงใน list เพลงแล้วไอ่สัส!`);
	}
	return undefined;
}
  function play(guild, song) {
	var serverQueue = queue.get(guild.id);

	if (!song) {
		serverQueue.voiceChannel.leave();
		queue.delete(guild.id);
		return;
	}
	console.log(serverQueue.songs);

	const dispatcher = serverQueue.connection.playStream(ytdl(song.url), {quality: 'highestaudio'})
		.on('end', reason => {
      message.channel.send('✅ เพลงจบละไอ่สัส');
			if (reason === 'Stream is not generating quickly enough.') console.log('Song ended.');
			else console.log(reason);
			if(!loop){
			serverQueue.songs.shift();
			}
			play(guild, serverQueue.songs[0]);
		})
		.on('error', error => console.error(error));
	dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);

  serverQueue.textChannel.send(wrap(`🎶 กูกำลังเปิด : __**${song.title}**__`));
}
});
function mysqllog(text, color) {
	console.log("mysql>".blue,text);
	return
}
function wrap(text) {
	return '\n' + text.replace(/`/g, '`' + String.fromCharCode(8203)) + '\n';
}
const numberWithCommas = (x) => {
  var parts = x.toString().split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return parts.join(".");
}