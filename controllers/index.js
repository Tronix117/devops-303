const
  dns = require('dns'),
  os = require('os'),
  Redis = require('ioredis');

const redis = new Redis({
  host: process.env.REDIS_HOST || '127.0.0.1',
  db: process.env.REDIS_DB || 1,
  port: process.env.REDIS_PORT || 6379,
  username: process.env.REDIS_USERNAME,
  password: process.env.REDIS_PASSWORD,
});

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

  const [totalSeen, ownSeenCount] = await Promise.all([
    redis.incr('totalSeenCount'),
    redis.hincrby('perContainerSeenCount', hostname, 1)
  ]);

  const perContainerSeenCount = await redis.hgetall('perContainerSeenCount');

  return `<html><pre>
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