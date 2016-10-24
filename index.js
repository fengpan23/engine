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

            client.on('data', content => {
                let request = new Request(client, content);
                request.on('broadcast', this.broadcast.bind(this));

                this.emit('request', request);
            });

            this._clients.set(client.id, client);
        }).on('error', e => {
            Log.error('engine server error', e);
        });
    }

    /**
     * broadcast data
     * @param data
     * @param omit  {array} omit client ids
     */
    broadcast(data, omit){
        console.log('engine broadcast', data, omit);
        let o = new Set(omit);
        for(let key of this._clients){
            if(!o.has(key)){
                this._clients[key].send(data);
            }
        }
    }

    /**
     * get clients
     * @param ids
     * @returns {*}
     */
    getClients(ids){
        let clients = [];
        if(ids){
            for(let id in ids){
                this._clients.has(id) && clients.push(this._clients.get(id));
            }
        }
        return clients.length > 0 ? clients : [...this._clients.values()];
    }

    close(){

    }

    exit(){

    }
}
module.exports = Index;