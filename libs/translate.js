/**
 * Created by fp on 2016/11/9.
 */

class Translate{
    static packBroadcast(content, action){
        return {event: action, content: Object.assign({status: 'ok', error: null, debug: [], action: 'broadcast_' + action}, content)};
    }

    static packResponse(content, action){
        return {event: action, content: Object.assign({status: 'ok', error: null, action: action}, content)};
    }
}

module.exports = Translate;