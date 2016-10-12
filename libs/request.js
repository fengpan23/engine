"use strict";
const Event = require('events');

class Request extends Event{
    constructor(client, action, params, timeout) {
        super();

        this._action = action;
        this._client = client;
        this._params = params;
        this._timeout = timeout;

        this._initBuffer();
    }

    _initBuffer(){
        this._buffer = {};
        this._buffer.response = {action: this._action, status: 'ok', error: null, data: []};
        this._buffer.broadcast = {action: 'broadcast_' + this._action, status: 'ok', error: null, data: [] };
    }

    attribute(name){
        let names, value = this;
        if(name)names = name.split('.');

        for(let n in names){
            if(typeof value === 'Object' && value[n]){
                value = value[n];
            }else{
                return value;
            }
        }
    }

    /**
     * 请求响应缓存设置
     * @param name
     * @param data
     * @param immediately
     * @returns {*}
     */
    response(name, data, immediately) {
        if (data) {
            if (this._buffer.respone.data.hasOwnProperty(name))
                return this._buffer.respone.data[name];
            else
                return undefined;
        } else
            this._buffer.respone.data[name] = this._buffer.respone.data.hasOwnProperty(name) ? common.mergeobj_recursive(this._buffer.respone.data[name], data) : data;

        if(immediately){

        }
    }

    /**
     * 请求广播缓存设置
     * @param name
     * @param data
     * @param immediately   立即发送
     * @returns {*}
     */
    broadcast(name, data, immediately) {
        if (this.closed === true)
            return false;

        if (data) {
            if (this._buffer.broadcast.data.hasOwnProperty(name))
                this._buffer.broadcast.data[name] = data;
            else
                return undefined;
        } else{
            this._buffer.broadcast.data[name] = data;
        }
        if(immediately){
            this.emit('broadcast', this._client.id)
        }
    }

    /**
     * 发送数据
     * */
    _send() {
        if (this.buffer.respone.status !== 'ok' || !common.empty(this.buffer.respone.data)) {
            let data = this.buffer.respone.data;
            this.buffer.respone.debug = this.debugs;
            delete this.buffer.respone.data;
            this.buffer.respone = common.mergeobj(this.buffer.respone, data);

            this._client.send({id: this.id, action: this.buffer.respone.action, data: this.buffer.respone});
        }

        if (this.buffer.broadcast.status !== 'ok' || !common.empty(this.buffer.broadcast.data)) {
            let data = this.buffer.broadcast.data;
            this.buffer.broadcast.debug = this.debugs;
            delete this.buffer.broadcast.data;
            this.buffer.broadcast = common.mergeobj(this.buffer.broadcast, data);

            this.broadcast(this.buffer.broadcast.action, this.buffer.broadcast, true);
        }

        this._initBuffer();
    }

    /**
     * 在线状态标记
     * @param flag
     * @returns {*}
     */
    verify(flag) {
        if (flag){
            this._client.socket.verify = flag;
            switch (flag) {
                case 0:
                    this.client.socket.verify_timeout(1, config.get("general") ? config.get("general").verifytimeout[1] : config.commonconf().settimeout.verify[1]);
                    break;

                case 1:
                    this.client.socket.verify_timeout(2, config.get("general") ? config.get("general").verifytimeout[2] : config.commonconf().settimeout.verify[2]);
                    break;
            }
        }
        return this.client.socket.verify;
    }

    close() {
        this.emit('beforeClose');

        this._send();
        //释放资料库连接
        if (me.dbc !== null && me.dbc.release) {
            me.dbc.release();
            me.dbc = null;
        }
        if (me.timeout !== null)
            clearTimeout(me.timeout);

        me.closed = true;

        me.emit('afterclose', error);

        me.client.actionqueue_sub(me.action);

        //若结束，呼叫退出
        if (me.action === 'userquit' || me.action === 'disconnect') {
            me.client.destroy();
        } else if (!!exit) {
            me.client.close(me.buffer.respone.error);
            me.client.nextreq();
        } else {
            me.client.nextreq();
        }

        if (!!error)
            _close(error, exit);
        else
            me.client.commit(me.dbc).then(function () {
                _close(false, exit);
            }).catch(function (err) {
                me.error('error', 'unexpected_error', `unable to commit with error ${common.tostring(err)} on request.close`, true, exit);
            });
    }

    destroy(err) {
        this.emit('beforeclose', err);
        if (this.closed === true)
            return false;
        if (this.timeout !== null)
            clearTimeout(this.timeout);
        this.closed = true;
        this.emit('afterclose', err);
    }
}


module.exports = Request;
