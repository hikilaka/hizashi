import config from './config'
import Client from './hizashi/irc/client'

const clients = Array.from(config.ircServers)
    .map(serverConfig => new Client(serverConfig));

process.on('SIGINT', () => {
    console.log('received SIGINT -- requesting clients to disconnect');
    clients.forEach(client => client.disconnect());
});

clients.forEach(client => {
    client.on('irc-event', event => {
        if (event.type === 'message' && event.nick === 'andrew') {
            console.log(`got msg event: ${event}`);
        }
    });

    client.connect(() => {
        console.log('client connected to server');
    });
})
