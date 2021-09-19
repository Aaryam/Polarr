var peer = new Peer(getID(10));

/* ELEMENTS */

const msgInput = document.getElementById('msgInput');
const msgBtn = document.getElementById('msgBtn');
const contentBox = document.getElementById('contentBox');

const startpage = document.getElementById('startpage');
const mainEl = document.getElementById('main');
const copyBtn = document.getElementById('copyBtn');

let recievers = [];

var isHost = !(window.location.search.substring(1) != null && window.location.search.substring(1) != "");
var hostPeer = window.location.search.substring(1);

function sendMsg(msg, reason, otherPeer) {
    if (otherPeer == null) {
        for (let i = 0; i < recievers.length; i++) {
            let conn = peer.connect(recievers[i]);

            conn.on('open', function () {
                conn.send({ msg: msg, reason: reason });
            });
        }
    }
    else {
        let conn = peer.connect(otherPeer);

        conn.on('open', function () {
            conn.send({ msg: msg, reason: reason });
        });
    }
}

function getID(length) {
    let alphabetArr = [
        "A", "B", "C", "D", "E", "F", "G", "H", "I", "J",
        "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X",
        "Y", "Z", "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m",
        "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"
    ];

    let id = "";

    for (let i = 0; i < length; i++) {
        id += alphabetArr[Math.round(Math.random() * alphabetArr.length)];
    }

    return id;
}

function copyToClp(txt){
    var m = document;
    txt = m.createTextNode(txt);
    var w = window;
    var b = m.body;
    b.appendChild(txt);
    if (b.createTextRange) {
        var d = b.createTextRange();
        d.moveToElementText(txt);
        d.select();
        m.execCommand('copy');
    } 
    else {
        var d = m.createRange();
        var g = w.getSelection;
        d.selectNodeContents(txt);
        g().removeAllRanges();
        g().addRange(d);
        m.execCommand('copy');
        g().removeAllRanges();
    }
    txt.remove();
}

peer.on('open', function () {

    console.log(peer.id);

    if (isHost) {
        hostPeer = peer.id;

        peer.on('connection', function (conn) {
            if (!recievers.includes(conn.peer)) {
                recievers.push(conn.peer);
                sendMsg(conn.peer, 'new-peer');

                if (recievers.length > 0) {
                    startpage.remove();
                    mainEl.classList.remove('hide');
                }
            }

            conn.on('data', function (data) {
                if (data.reason == 'msg') {
                    addMsg(data.msg, false);
                }
            });
        });
    }
    else {
        peer.connect(hostPeer);

        if (!recievers.includes(hostPeer)) {
            recievers.push(hostPeer);
            if (recievers.length > 0) {
                startpage.remove();
                mainEl.classList.remove('hide');
            }
        }

        peer.on('connection', function (conn) {
            if (!recievers.includes(conn.peer)) {
                recievers.push(conn.peer);
            }

            conn.on('data', function (data) {
                if (data.reason == 'new-peer') {
                    if (!recievers.includes(data.msg)) {
                        recievers.push(data.msg);
                    }
                }
                else if (data.reason == 'msg') {
                    addMsg(data.msg, false);
                }
            });
        });
    }
});

copyBtn.addEventListener('click', function () {
    let windowLoc = window.location.toString();
    let link = windowLoc.substring(windowLoc.lastIndexOf('/'), 0) + "?" + peer.id;
    copyToClp(link);
});

function addMsg(content, isMine) {
    let msg = document.createElement('p');
    let clear = document.createElement('div');

    msg.classList.add('msg');

    if (isMine) {
        msg.classList.add('mine');
    }

    msg.innerText = content;

    clear.classList.add('clear');

    contentBox.appendChild(msg);
    contentBox.appendChild(clear);
}

msgBtn.addEventListener('click', function () {
    addMsg(msgInput.value, true);
    sendMsg(msgInput.value, 'msg');
});