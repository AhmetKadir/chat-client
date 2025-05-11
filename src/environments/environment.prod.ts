export const environment = {
  production: true,
  server: process.env['BACKEND_URL'],
  webSocket: `${process.env['BACKEND_URL']?.replace('http', 'ws')}/socket`
};
