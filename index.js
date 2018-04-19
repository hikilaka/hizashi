import config from './config'
import Client from './hizashi/irc/client'

const clients = Object.values(config.ircConnections)
    .map(serverConfig => new Client(serverConfig));

process.on('SIGINT', () => {
    console.log('received SIGINT -- requesting clients to disconnect');
    clients.forEach(client => client.disconnect());
});

clients.forEach(client => {
    client.on('error', error => console.error(`error: ${error}`));

    client.on('irc-event', event => {
        if (event.type === 'privmsg' && event.nick === 'andrew') {
            client.emit('say', event.target, event.message);
        }
    });

    client.connect(() => {
        console.log('client connected to server');
    });
});
