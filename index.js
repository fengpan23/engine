/**
 * Created by fengpan23@qq.com on 2016/8/4.
 */
"use strict";
const _ = require('underscore');
const Event = require('events');
const Connect = require('multi-connect');

const Log = require('log')({develop: true});    //create global log
const Translate = require('./libs/translate');
const Request = require('./libs/request');

class Index extends Event{
    constructor() {
        super();
        this._clients = new Map();
    }

    _createRequest(client, content){
        if(content.event){
            let request = new Request(client, content);
            request.on('broadcast', this.broadcast.bind(this));
            return request;
        }
        throw new Error('event can not empty');
    }

    start(options) {
        let server = Connect.createServer(options);
        server.on('connected', client => {
            client.on('data', content => {
                this.emit('request', this._createRequest(client, content));
            }).on('reconnect', () => {
                //TODO: need replace socket ???
                let content = {event: 'reconnect'};
                this.emit('request', this._createRequest(client, content));
            });
            this._clients.set(client.id, client);
        }).on('disconnect', id => {
            this._clients.delete(id);
            this.emit('disconnect', id);
        }).on('error', (e, hook) => {
            Log.error('hook: ' + hook, e);
        });
    }

    /**
     * broadcast data
     * @param content
     * @param [omit]  {array} omit client ids (除去这些client id)
     * @param [limit] {array} limit client ids  (只发送这些client)
     * @param event
     */
    broadcast(event, content, omit, limit){
        let data = Translate.packBroadcast(content, event);
        if(_.isArray(limit)){
            for(let id in limit)
                this._clients.has(id) && this._clients.get(id).send(data);
        }else{
            let o = new Set(omit);
            for(let [id, client] of this._clients){
                if(!o.has(id)){
                    client.send(data);
                }
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
        if(_.isArray(ids)){
            for(let id in ids){
                this._clients.has(id) && clients.push(this._clients.get(id));
            }
            return clients;
        }else if(this._clients.has(ids)){
            return this._clients.get(ids);
        }
        return [...this._clients.values()];
    }

    createRequest(id, content){
        if(this._clients.has(id))
            return this._createRequest(this._clients.get(id), content);
    }

    close(){

    }

    exit(){

    }
}
module.exports = Index;