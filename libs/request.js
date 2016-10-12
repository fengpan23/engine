"use strict";
const _ = require('underscore');
const Event = require('events');

class Request extends Event{
    constructor(client, content, timeout) {
        super();
        this.content = content;     //client send data object json

        this._client = client;
        this._timeout = timeout;

        this._buffer = {response: {}, broadcast: {}};
    }

    /**
     * get attribute
     * @param name  eg： 'content.action'
     * @returns {*}
     */
    getAttribute(name){
        let names = [], value = this.content;
        if(name)
            names = name.split('.');

        for(let n of names){
            if(typeof value === 'object' && value[n]) {
                value = value[n];
                continue;
            }
            return value;
        }
        return value;
    }

    /**
     * 将响应数据缓存
     * @param name
     * @param data
     * @param immediately      消息是否立即发送
     * @returns {*}
     */
    response(name, data, immediately){
        if (!_.isEmpty(data))
            this._buffer.response[name] = this._buffer.response.hasOwnProperty(name) ? _.extend(this._buffer.response[name], data) : data;

        if(immediately)
            this._send('response');
    }

    /**
     * 广播数据缓存
     * @param name
     * @param data
     * @param immediately   立即发送
     * @returns {*}
     */
    broadcast(name, data, immediately){
        if (!_.isEmpty(data))
            this._buffer.broadcast[name] = this._buffer.broadcast.hasOwnProperty(name) ? _.extend(this._buffer.broadcast[name], data) : data;

        if(immediately)
            this._send('broadcast');
    }

    /**
     * close request
     * @param exit  if this param is true, server close this client socket
     */
    close(exit) {
        this.emit('beforeClose');
        this._send();
        this.emit('afterClose');

        if (!!exit)
            this._client.close();
    }

    /**
     * 发送数据
     * @param type  broadcast ，response or null
     * @private
     */
    _send(type) {
        switch (type){
            case 'broadcast':
                this.emit('broadcast', this._client.id,  this._buffer.broadcast);
                this._buffer.broadcast = {};
                break;
            case 'response':
                this._client.send({action: this.getAttribute('action'), data: this._buffer.response});
                this._buffer.response = {};
                break;
            default:
                this.emit('broadcast', this._client.id,  this._buffer.broadcast);
                this._client.send({action: this.getAttribute('action'), data: this._buffer.response});
                this._buffer = {response: {}, broadcast: {}};
        }
    }
}
module.exports = Request;
