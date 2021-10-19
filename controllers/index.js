const
  dns = require('dns'),
  os = require('os'),
  Redis = require('ioredis');

let redis = null;

try {
  const redisConfig = {
    host: process.env.REDIS_HOST || '127.0.0.1',
    db: process.env.REDIS_DB || 1,
    port: process.env.REDIS_PORT || 6380,
    username: process.env.REDIS_USERNAME,
    password: process.env.REDIS_PASSWORD,
  }
  console.log(`je me connecte sur ${redisConfig.host}:${redisConfig.port}`);
  redis = new Redis(redisConfig);

  redis.on("error", (error) => {
    if (error.code === 'ECONNREFUSED') {
      console.error(
        '\x1b[5m\x1b[37m\x1b[41m%s\x1b[0m',
        "⚠ Impossible de se connecter à redis, avez-vous lancé une instance de redis ?",
      );
      redis.quit();
      redis = null;
      return;
    }
    console.log(error);
  });
} catch (err) {
  console.log('Redis is disable');
  console.log(err.message);
}

let
  ipAdress = null,
  hostname = os.hostname(),
  seen = 0;

dns.lookup(hostname, function(err, ip) {
  ipAdress = ip;
})

module.exports = async function(request, reply){
  try {
    reply(await indexHandler(request)).type('text/html');
  } catch (err) {
    console.log(err);
    reply(`<html><pre>${err.stack}`).type('text/html');
  }
}

async function indexHandler(request) {
  seen++;

  const [totalSeen, ownSeenCount] = redis ? await Promise.all([
    redis.incr('totalSeenCount'),
    redis.hincrby('perContainerSeenCount', hostname, 1),
  ]): [0,0];

  const perContainerSeenCount = redis ? (await redis.hgetall('perContainerSeenCount')) : 0;

  return `<html><pre>
    Hello everybody !!
    ---
    Hostname: ${hostname}
    Server IP: ${ipAdress}
    ---
    Count in this container launch: ${seen} times
    Count for this container: ${ownSeenCount} times
    Count for all container: ${totalSeen} times
    ---
    Container name\t | Visit count${
      Object.entries(perContainerSeenCount).map(([name, count]) => 
        `\n\t${name}\t | ${count}`
      ).join('')
    }
  `
}