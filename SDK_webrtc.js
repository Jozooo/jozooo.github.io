/**
 * Created by Jozo on 16/9/23.
 */

//document.write("<script src='https://rawgit.com/onsip/SIP.js/0.7.5/dist/sip-0.7.5.js'></script>");
document.write("<script src='sip-0.7.5.js'></script>");
var USIP = {
    session: null,
    userAgent: null,
    options: null
};

var UDomain = {
    domain: null,
    wsServer: null,
    wssServer: null
};

// ULoginState:  0: 已登录; 1: 未登录
// UCallState:  1: 拨号中; 2: 已接听; 3: 已拒接; 4: 已挂断; 5:已取消;  6: 收到来电;
var ULoginState = 9;
var UCallState = 5;

var UCSConnect = {

    // 初始化
    init: function (domain, wsServer, wssServer)
    {
        console.log("----------------\n\n初始化中\n\n----------------");

        //UDomain.domain = domain;
        //UDomain.wsServer = wsServer;
        //UDomain.wssServer = wssServer;

        navigator.getUserMedia = navigator.getUserMedia ||
            navigator.webkitGetUserMedia ||
            navigator.mediaDevices.getUserMedia;

        if (navigator.getUserMedia) {
            navigator.getUserMedia({ audio: true, video: false },
                function(stream) {

                },
                function(err) {
                    console.log("The following error occurred: " + err.name);
                }
            );
        } else {
            console.log("getUserMedia not supported");
        }
    },

    // 登陆
    login: function(userName, password, displayName) {

        console.log("----------------\n\n登陆中\n\n----------------");
        USIP.userAgent = new SIP.UA({
            uri: userName + '@' + UDomain.domain,
            wsServers: [UDomain.wsServer, UDomain.wssServer],
            authorizationUser: userName,
            password: password,
            displayName: displayName,
            traceSip: true,
        });

        // 跳转来电回调
        USIP.userAgent.on('invite', UCSCall.onIncomingCall);

        //// 跳转登录成功回调
        //USIP.userAgent.on('registered', UCSConnect.onLoginRet);
        //// 跳转登录失败回调
        //USIP.userAgent.on('registrationFailed', UCSConnect.onLoginRet);

        // 跳转登录成功回调
        USIP.userAgent.on('registered', function (response, cause) {
            UCSConnect.onLoginRet(response, cause, 0);
        });

        // 跳转登录失败回调
        USIP.userAgent.on('registrationFailed',  function (response, cause) {
            UCSConnect.onLoginRet(response, cause, 99);
        });

    },


    //login1: function(username, password, displayName) {
    //
    //    console.log("----------------\n\n登陆中\n\n----------------");
    //    USIP.userAgent = new SIP.UA({
    //        traceSip: true,
    //        uri: username + '@sipjs.onsip.com',
    //        displayName: displayName
    //    });
    //
    //    // 跳转来电回调
    //    USIP.userAgent.on('invite', UCSCall.onIncomingCall);
    //
    //
    //    // 跳转登录成功回调
    //    USIP.userAgent.on('registered', function (response, cause) {
    //        UCSConnect.onLoginRet(response, cause, 0);
    //    });
    //
    //    // 跳转登录失败回调
    //    USIP.userAgent.on('registrationFailed',  function (response, cause) {
    //        UCSConnect.onLoginRet(response, cause, 99);
    //    });
    //},

    // 登录结果回调
    onLoginRet: function(response, cause, ret){
        console.log("----------------\n\n登录结果:" + response + "\ncause:" + cause + "\n\n----------------");

        // 外部登陆回调
        //0: 成功; 1: 登录超时; 2：密码错误; 99：其他  待定
        if (cause === SIP.C.causes.REJECTED) {
            ret = 2;
        } else if (cause === SIP.C.causes.REQUEST_TIMEOUT) {
            ret = 1;
        }

        if (ret === 0) {
            ULoginState = 0;
        }
        onLoginRet(response, ret);
    },


    // 登出
    logout: function() {

        if (ULoginState === 9) {
            console.log("----------------\n\n未登录,无法登出\n\n----------------");
            return;
        }

        console.log("----------------\n\n登出中\n\n----------------");
        var logout_options = {
            'all': true,
            'extraHeaders': [ 'X-Foo: foo', 'X-Bar: bar']
        };

        USIP.userAgent.stop();
        USIP.userAgent.unregister(logout_options);

        //if (UCallState === 6) {   // 收到来电时退出
        //    UCSCall.reject();
        //} else if (UCallState === 2) {    // 接听电话时退出
        //    UCSCall.callGiveUp();
        //}

        //// 跳转登出成功回调
        //USIP.userAgent.on('unregistered', UCSConnect.onLogoutRet);
        //// 跳转登出失败回调
        //USIP.userAgent.on('unregisteredFailed', UCSConnect.onLogoutRet);

        // 跳转登出成功回调
        USIP.userAgent.on('unregistered', function (response, cause) {
            UCSConnect.onLogoutRet(response, cause, 0);
            ULoginState = 9;
        });

        // 跳转登出失败回调
        USIP.userAgent.on('unregisteredFailed', function (response, cause) {
            UCSConnect.onLogoutRet(response, cause, 1);
        });

    },

    // 登出结果回调
    onLogoutRet: function(response, cause, ret){
        console.log("----------------\n\n登出结果:" + response + "\ncause:" + cause + "\n\n----------------");

        // 外部登出回调
        onLogoutRet(response, ret);
    }

    // 异常事件
};


var UCSCall = {

    // 发起通话
    sendOutCall: function (called) {

        console.log("----------------\n\n发起外呼\n\n----------------");

        //var uri = new SIP.URI('WSS', called, 'ipcc.ucpaas.com');

        USIP.session = USIP.userAgent.invite('sip:' + called + '@' + UDomain.domain, USIP.options);

        UCSCall.onOutCallStatus('OUT', USIP.session);

        // USIP.session.request 请求参数
    },


    //sendOutCall1: function (called) {
    //
    //    console.log("----------------\n\n发起外呼\n\n----------------");
    //
    //    //var uri = new SIP.URI('WSS', called, 'ipcc.ucpaas.com');
    //
    //    USIP.session = USIP.userAgent.invite('sip:' + called + '@sipjs.onsip.com', USIP.options);
    //
    //    UCSCall.onOutCallStatus('OUT', USIP.session);
    //
    //    // USIP.session.request 请求参数
    //},

    // 通话状态回调
    onOutCallStatus: function (callType, currentSession) {

        var ret = 99;
        var callID = currentSession.request.call_id;
        var peerNumber;
        if (callType === 'OUT') {
            peerNumber = currentSession.request.to;
        } else if (callType === 'IN') {
            peerNumber = currentSession.request.from;
        }
        // 拨号中
        currentSession.on('progress', function (response) {
            console.log("----------------\n\n拨号中\n\n----------------");
            ret = 1;
            UCallState = 1;
            onCallStationChange(response, callID, ret, callType, peerNumber);
        });
        // 跳转到已接听 data.code  data.response
        currentSession.on('accepted', function (data) {
            console.log("----------------\n\n通话被接听\n\n----------------");
            ret = 2;
            UCallState = 2;
            onCallStationChange(data, callID, ret, callType, peerNumber);
            //alert("accepted" + '\n' +  data);
        });
        // 已拒接
        currentSession.on('rejected', function (response, cause) {
            console.log("----------------\n\n通话被拒接\n\n----------------");
            ret = 3;
            UCallState = 3;
            onCallStationChange(response, callID, ret, callType, peerNumber);
            //alert("rejected" + '\n' +  response + '\n' + cause);
        });
        // 已挂断
        currentSession.on('bye', function (request) {
            console.log("----------------\n\n通话被挂断\n\n----------------");
            ret = 4;
            UCallState = 4;
            USIP.session = null;
            onCallStationChange(request, callID, ret, callType, peerNumber);
            //alert('failed' + request.reason_phrase);
        });
        // 已取消
        currentSession.on('cancel', function () {
            console.log("----------------\n\n通话已取消\n\n----------------");
            ret = 5;
            UCallState = 5;
            onCallStationChange(null, callID, ret, callType, peerNumber);
        });

        // 异常事件
        currentSession.on('failed', function (request) {

            // End Cause
            //var ret = 99;
            //if (request.reason_phrase === SIP.C.causes.REJECTED) {
            //    ret = 2;
            //} else if (request.reason_phrase === SIP.C.causes.CANCELED) {
            //    ret = 1;
            //}

            //console.log("----------------\n\nfailed" + '\n' + ret + '\n' + request.reason_phrase + '\n\n----------------');

            onExcepting(request, request.reasonPhrase);
        });

        // 已结束
        currentSession.on('terminated', function (message, cause) {

            console.log("----------------\n\n通话结束\n\n----------------");
            console.log("----------------\n\nterminated" + '\n' + '\n' + cause + '\n\n----------------');
            //ret = cause;
            //// 结束原因,异常?
            //if (cause === 'Canceled') {
            //    //ret = 6;
            //} else if (cause === '') {
            //
            //}
            UCallState = 0;
            onCallStationChange(message, callID, ret, callType, peerNumber);
            onCallGiveup(message, cause);
        });
    } ,



    // 来电回调
    onIncomingCall: function (incomingSession) {

        console.log("----------------\n\n收到来电\n\n----------------");
        USIP.session = incomingSession;
        UCallState = 6;
        UCSCall.onOutCallStatus('IN', USIP.session);

        //alert(incomingSession.request.body);
        // 外部来电回调
        //alert(incomingSession.request.call_id + '\n' + incomingSession.request.from + '\n');
        onIncomingCall(incomingSession.request.call_id, incomingSession.request.from, incomingSession.request.data);
    },

    // 接听来电
    answerCall: function () {

        if (UCallState !== 6) {
            console.log("----------------\n\n未收到来电,无法接听\n\n----------------");
            return;
        }
        //alert('video:' + USIP.options.media.constraints.video + '\naudio:' + USIP.options.media.constraints.audio + '\nremote:' + USIP.options.media.render.remote.className + '\nlocal:' + USIP.options.media.render.local.className);
        console.log("----------------\n\n接听来电\n\n----------------");
        USIP.session.accept(USIP.options);
    },

    // 拒绝来电
    reject: function () {

        if (UCallState !== 6) {
            console.log("----------------\n\n未收到来电,无法拒接\n\n----------------");
            return;
        }

        console.log("----------------\n\n拒绝来电\n\n----------------");
        USIP.session.reject(USIP.options);
    },


    // 取消通话 要进入progress状态后才能调用(即主叫方的挂断)
    cancel: function () {

        if (UCallState !== 1) {
            console.log("----------------\n\n无法取消通话\n\n----------------");
            return;
        }

        console.log("----------------\n\n取消通话\n\n----------------");
        USIP.session.cancel(USIP.options);
    },

    // 释放呼叫
    callGiveUp: function () {

        if (UCallState !== 2) {
            console.log("----------------\n\n无法挂断通话\n\n----------------");
            return;
        }

        console.log("----------------\n\n释放呼叫\n\n----------------");
        USIP.session.bye();
    },

    //释放呼叫结果
    onCallGiveup: function(request) {
        //console.log("----------------\n\n释放通话结果:" + request + "\n\n----------------");
    },


};


// 通话状态回调
function onCallStationChange(message, callID, ret, callType, peerNumber) {
    // 外部通话回调(未解析)
    onOutCallStatusMSG(message, ret);

    // 外部通话回调(解析)
    onOutCallStatus(callID, ret, callType, peerNumber);
}

// 功能函数
function mediaOptions(audio, video, remoteRender, localRender) {
    return {
        media: {
            constraints: {
                audio: audio,
                video: video
            },
            render: {
                remote: remoteRender,
                local: localRender
            }
        }
    };
};


