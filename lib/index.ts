import EchoEmitter from './emitter/Emitter';
const emitter = new EchoEmitter();

emitter.on('a', (version) => console.log(`Your Version: ${version}`));
emitter.once('b', (version) => console.log(`Your Version: ${version}`));
emitter.once('b', (version) => console.log(`Your Version: ${version}`));
emitter.on('a', (version) => console.log(`Your Version: ${version}`));
emitter.on('a', (version) => console.log(`Your Version: ${version}`));
emitter.on('a', (version) => console.log(`Your Version: ${version}`));

emitter.emit('a', '1.0.0');
emitter.emit('b', '1.0.2');