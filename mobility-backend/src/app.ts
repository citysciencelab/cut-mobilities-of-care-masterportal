import server from './server';

const port = parseInt(process.env.API_PORT || '8080');

const starter = new server()
  .start(port)
  .then((port) => console.log(`Running on port ${port}`))
  .catch((error) => {
    console.log(error);
  });

export default starter;
