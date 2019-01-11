import Bluebird from 'bluebird';
import { wait } from 'promise-streams';
import { Stream } from 'stream';

function streamToPromise(stream: Stream): Bluebird<any> {
  return Bluebird.resolve(
    wait(stream)
  );
}

export {
  Bluebird,
  streamToPromise
}
