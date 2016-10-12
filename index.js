/**
 * Created by fengpan23@qq.com on 2016/8/4.
 */
"use strict";
const Event = require('events');
const Connect = require('connect');

const Request = require('./libs/request');

class Index extends Event{
    constructor(opt) {
        super();
        this._clients = new Map();
    }

    start() {
        let server = Connect.createServer();
        server.on('connect', client => {
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

    login(){

    }

    seat(request){

    }

    move(){

    }

    open(){

    }

    getPlayers(){
        
    }

    out(){

    }

    close(){

    }

    exit(){

    }

    buy(){

    }

    bet(){

    }

    win(){

    }
}
module.exports = Index;