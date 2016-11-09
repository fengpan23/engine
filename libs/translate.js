/**
 * Created by fp on 2016/11/9.
 */

class Translate{
    static packBroadcast(content, event){
        return Object.assign({status: 'ok', error: null, event: 'broadcast_' + event}, content);
    }

    static packResponse(content, event){
        return Object.assign({status: 'ok', error: null, event: event}, content);
    }
}

module.exports = Translate;