import { Ok, Error } from "./gleam.mjs"
import { StreamString, StreamBuffer, UpStringEvent, DownStringEvent, UpBufferEvent, DownBufferEvent } from "./njs/stream.mjs"

function event(e) {
    if (e instanceof UpStringEvent) {
        return 'upload';
    }
    else if (e instanceof DownStringEvent) {
        return 'download';
    }
    else if (e instanceof UpBufferEvent) {
        return 'upstream';
    }
    return 'downstream';
}

export function allow(s) {
    s.allow();
}

export function decline(s) {
    s.decline();
}

export function deny(s) {
    s.deny();
}

export function done(s) {
    s.done();
}

export function done_code(s, c) {
    s.done(c);
}

export function error(s, m) {
    s.error(m);
}

export function warn(s, m) {
    s.warn(m);
}

export function log(s, m) {
    s.log(m);
}

export function off(s, en) {
    s.off(event(en));
}

export function on(s, en) {
    return new Promise(resolve => {
        var e = event(en)
        s.on(e, function(data, option) {
            resolve(e == 'upload' || e == 'download' ?
                new StreamString(data, option.last) :
                new StreamBuffer(data, option.last))
        });
    })
}

export function on_callback(s, en, cb) {
    var e = event(en)
    s.on(e, function(data, option) {
        if (e == 'upload' || e == 'download') {
            cb(new StreamString(data, option.last))
        } else {
            cb(new StreamBuffer(data, option.last))
        }
    })
}

export function remote_address(s) {
    return s.remoteAddress;
}

export function send(s, d, o) {
    s.send(d, o);
}

export function send_downstream(s, d, o) {
    s.sendDownstream(d, o);
}

export function send_upstream(s, d, o) {
    s.sendUpstream(d, o);
}

export function status(s) {
    return s.status;
}

export function set_return_value(s, rv) {
    return new Promise(resolve => {
        rv.then((v) => resolve(s.setReturnValue(v)))
    })
}

export function variables(s) {
    return s.variables;
}

export function raw_variables(s) {
    return s.rawVariables;
}
