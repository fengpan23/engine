"use strict";
const _ = require('underscore');
const Event = require('events');

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
    getClientId(){
        return this._client.id;
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
     * send error message
     * @param code
     * @param mess
     */
    error(code, mess){
        this._sendResponseData();
        this._sendBroadcastData();
        this._buffer.response.status = 'error';
        this._buffer.response.error = mess;
        this._buffer.response.code = code;
        this._sendResponseData();
    }

    /**
     * close request
     * @param error  if had this param, send this error and close this client socket
     */
    close(error) {
        this.emit('beforeClose', error);
        this._sendResponseData();
        this._sendBroadcastData();
        this.emit('afterClose', error);

        if (!!error)
            this._client.close(error);
        this.removeAllListeners();
    }

    _sendBroadcastData(){
        if(!_.isEmpty(this._buffer.broadcast)){
            this.emit('broadcast', this._packData('broadcast'), [this._client.id]);
            this._buffer.broadcast = {};
        }
    }

    _sendResponseData(){
        if(!_.isEmpty(this._buffer.response)) {
            this._client.send(this._packData('response'));
            this._buffer.response = {};
        }
    }

    _packData(type){
        let data = {content: _.extend({status: 'ok', error: null}, this._buffer[type])};
        switch (type){
            case 'broadcast':
                data.event = type + '_' + this.getParams('event');
                break;
            case 'response':
                data.event = this.getParams('event');
                break;
        }
        return data;
    }
}
module.exports = Request;
