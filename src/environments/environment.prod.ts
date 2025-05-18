export const environment = {
  production: true,
  server: 'https://chat-api-292563502323.us-central1.run.app', // Hardcode or replace during build
  webSocket: 'wss://chat-api-292563502323.us-central1.run.app/socket'
  // server: process.env['BACKEND_URL'],
  // webSocket: `${process.env['BACKEND_URL']?.replace('http', 'ws')}/socket`
};
