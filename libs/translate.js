/**
 * Created by fp on 2016/11/9.
 */

class Translate{
    static packBroadcast(content, event){
        let data = Object.assign({status: 'ok', error: null}, content);
        return {event: event || data.action, content: data};
    }

    static packResponse(content, event){
        return {event: event, content: Object.assign({status: 'ok', error: null}, content)};
    }
}

module.exports = Translate;