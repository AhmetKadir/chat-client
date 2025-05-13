export const environment = {
  production: true,
  server: 'https://34.105.61.164:8080', // Hardcode or replace during build
  webSocket: 'ws://34.105.61.164:8080/socket'
  // server: process.env['BACKEND_URL'],
  // webSocket: `${process.env['BACKEND_URL']?.replace('http', 'ws')}/socket`
};
