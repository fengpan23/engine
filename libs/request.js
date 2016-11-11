"use strict";
const _ = require('underscore');
const Event = require('events');
const Translate = require('./translate');

class Request extends Event{
    constructor(client, params, timeout) {
        super();
        this.params = params;     //client send data object json

        this._client = client;
        this._timeout = timeout;

        this._buffer = {response: {}, broadcast: {}};
    }

    /**
     * get client id
     * @return {Number}
     */
    get clientId(){
        return this._client && this._client.id;
    }

    /**
     * get params    (获取传人参数)
     * @param name  eg： 'content.action'
     * @returns {*}
     */
    getParams(name){
        let names = [], value = this.params;
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
            this._sendResponseData();
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
            this._sendBroadcastData();
    }

    /**
     * send error message     need emit close event ???
     * @param code
     * @param mess
     */
    error(code, mess){
        this._sendResponseData();
        this._sendBroadcastData();
        this._buffer.response = {status: 'error', error: mess, code: code};
        this._sendResponseData();
        this.removeAllListeners();
    }

    /**
     * close request
     * @param error  if had this param, send this error and close this client socket
     */
    close(error) {
        this.emit('beforeClose', error);
        this._sendResponseData();
        this._sendBroadcastData();

        if (!!error)
            this._client.close(error);
        this.emit('afterClose', error);
        this.removeAllListeners();
    }

    _sendBroadcastData(){
        if(!_.isEmpty(this._buffer.broadcast)){
            this.emit('broadcast', Object.assign({event: this.getParams('event')}, this._buffer.broadcast), [this._client.id]);
            this._buffer.broadcast = {};
        }
    }

    _sendResponseData(){
        if(!_.isEmpty(this._buffer.response)) {
            this._client.send(Translate.packResponse(this._buffer.response, this.getParams('event')));
            this._buffer.response = {};
        }
    }
}
module.exports = Request;
