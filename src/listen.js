// Express 5 forwards listen errors to its callback. Resolve only after a successful bind.
export function listen(app, port, host) {
  return new Promise((resolve, reject) => {
    const server = app.listen(port, host, error => {
      if (error) reject(error);
      else resolve(server);
    });
  });
}
