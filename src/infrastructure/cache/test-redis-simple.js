import { createClient } from 'redis';

const client = createClient({
  url: 'redis://default:plrzkArfvFAC31tXnWOGiZtj9s5oHJD5@redis-17152.crce202.eu-west-3-1.ec2.redns.redis-cloud.com:17152',
});

client.on('error', (err) => console.log('Redis Client Error', err));

await client.connect();

const pong = await client.ping();
console.log('PING:', pong);
await client.disconnect();