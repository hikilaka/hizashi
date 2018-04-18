import { EventEmitter } from 'events'
import irc from 'irc-framework'

function handleClientRegistered(client) {
    client.emit('registered');

    let channels = client.config.channels;
    
    if (!Array.isArray(channels)) {
        channels = Array(channels);
    }

    channels.map(channel => {
        const pieces = channel.split(':');

        return {
            name: pieces.shift(),
            key: pieces.join()
        };
    }).forEach(channel => client.bot.join(channel.name, channel.key));
}

function hookIrcEvents(client) {
    // events that irc-framework can emit
    const events = [
        'reconnecting', 'close', 'userlist', 'wholist',
        'banlist', 'topic', 'join', 'part', 'kick', 'quit',
        'invite', 'message', 'nick', 'action', 'error'
    ];

    // this reads ambiguously... however, this emits an 'irc-event'
    // that irc-framework will emit, with that event's type.
    events.forEach(event => client.bot.on(event, (args = {}) => {
        client.emit('irc-event', Object.assign({ type: event }, args));
    }));
}

const defaultConfigOptions = {
    nick: "hizashi",
    username: "hizashi",
    gecos: "hizashi"
};

export default class Client extends EventEmitter {
    constructor(config = {}) {
        super();
        this.config = Object.assign(defaultConfigOptions, config);
        this.bot = new irc.Client();

        // the `registered` event needs to be handled here
        // in order to automatically join configured channels
        // and verify with nickserv
        // TODO: add nickserv verification & middleware
        this.bot.on('registered', () => handleClientRegistered(this));

        // hooks certain events that irc-framework will emit,
        // that way we can be sure that listeners of this client
        // will be notified with a uniform event object
        hookIrcEvents(this);
    }

    connect(handler = () => {}) {
        this.once('registered', handler);
        this.bot.connect(this.config);
    }

    disconnect(message = 'suicide') {
        this.bot.quit(message);
    }
}
