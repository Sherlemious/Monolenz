import net from 'net';

const findOpenPort = (startPort: number, endPort: number): Promise<number> => {
  return new Promise((resolve, reject) => {
    let port = startPort;

    const checkNextPort = () => {
      if (port > endPort) {
        return reject(new Error(`No open port found between ${startPort} and ${endPort}`));
      }

      const server = net.createServer();

      server.once('error', (err: any) => {
        if (err.code === 'EADDRINUSE') {
          port++;
          checkNextPort();
        } else {
          reject(err);
        }
      });

      server.listen(port, () => {
        server.once('close', () => {
          resolve(port);
        });
        server.close();
      });
    };

    checkNextPort();
  });
};

export default findOpenPort;
