/**
 * Created by fengpan23@qq.com on 2016/8/4.
 */
"use strict";
const Event = require('events');
const Connect = require('connect');

const Log = require('log');
const Request = require('./libs/request');

class Index extends Event{
    constructor() {
        super();

        new Log({develop: true});       //create global log
        this._clients = new Map();
    }

    start(opt) {
        let server = Connect.createServer(opt);
        server.on('connected', client => {
            this._clients.set(client.id, client);
        }).on('request', (client, content) => {
            let request = new Request(client, content);
            request.on('broadcast', this.broadcast.bind(this));

            this.emit('request', request);
        });
    }

    /**
     * broadcast data
     * @param data
     * @param omit  {array} omit client id
     */
    broadcast(data, omit){
        for(let client of this._clients){
            client.send();
        }
    }

    getClients(){
        return [...this._clients.values()];
    }

    close(){

    }

    exit(){

    }
}
module.exports = Index;