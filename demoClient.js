$(function() {
	var appId = $("#appId").val();
	var opt = {
		debugLevel: "infor", //fatal,error,warn,infor
		//来电回调接口
		OnIncomingCall: function(callid, caller, len, data) {
			Demo.updateCallId(callid);//显示callid
			
			Demo.disableBtn();
			Demo.incomingArea.show();
			Demo.incomingNoText.text(caller);
			Demo.startRingTone(); //启动铃声
			Demo.setTipMsg("您有来电信息");
			Demo.isIncoming = true;
			Demo.enableBtn(["refuseBtn", "answerCallBtn"]);
			if (Demo.callType !== Demo.CALL_TYPES.CALL_OUT) {
				Demo.callType = Demo.CALL_TYPES.INCOMING; //标识是来电
			}
		},
		// 被叫接听电话回调
		OnCallAnswer: function() {
			Demo.setTipMsg("正在通话中");
			Demo.stopRingTone(); //关闭铃声
			Demo.stopRingbackTone();
			Demo.enableBtn(["disableAudioBtn"]);
		},
		//呼叫被释放回调接口
		OnCallGiveup: function(status) {
			if (status === 0) {
				Demo.setTipMsg("主叫挂断电话");
			} else if (status === 1) {
				Demo.setTipMsg("被叫挂断电话");
			} else if (status === 2) {
				Demo.setTipMsg("主叫因欠费而终止电话");
			} else if (status === 10) {
				Demo.setTipMsg("因系统异常而挂断电话");
			} else if (status === 99) {
				Demo.setTipMsg("因其他原因而终止通话");
			}

			Demo.stopRingTone(); //关闭铃声
			Demo.stopRingbackTone();
			Demo.hideCommingStatus();
			Demo.enableBtn(["logoutBtn"]);
			Demo.enableBtn(["sendAudioCallBtn"]);
		},
		//退出结果回调 0成功 1 失败
		OnLogoutRet: function(code) {
			if (code == Demo.LOGOUT_STATUS.SUCCESS) {
				Demo.setTipMsg("请先登录");
			} else if (code == Demo.LOGOUT_STATUS.FAILED) {
				Demo.setTipMsg("退出失败");
			}
			Demo.disableBtn();
			Demo.enableBtn(["loginBtn", "subscribeBtn"]);
			Demo.incomingArea.hide();
			Demo.stopRingTone(); //关闭铃声
			Demo.stopRingbackTone();
		},
		// 登陆成功回调函数 响应码   描述 0: 成功（SUCCESS）	1: 超时（TIMEOUT）2：用户名非法（INVALID_USERNAME） 3：密码非法（INVALID_PASSWORD）99：其他（OTHER）
		OnLoginRet: function(responseCode) {
			if (responseCode === Demo.LOGIN_STATUS.SUCCESS) {
				Demo.disableBtn();
				Demo.enableBtn(["logoutBtn", "sendAudioCallBtn", "sendVideoCallBtn"]);
				Demo.setTipMsg("登录成功");
				Demo.enableBtn(["logoutBtn"]);
				return;
			} else if (responseCode === Demo.LOGIN_STATUS.TIMEOUT) {
				Demo.setTipMsg("登录超时");
			} else if (responseCode === Demo.LOGIN_STATUS.INVALID_USERNAME) {
				Demo.setTipMsg("用户名错误");
			} else if (responseCode === Demo.LOGIN_STATUS.INVALID_PASSWORD) {
				Demo.setTipMsg("密码错误");
			} else if (responseCode === Demo.LOGIN_STATUS.INVALID_APPID) {
				Demo.setTipMsg("请填写有效的APPId");
			}
			Demo.disableBtn();
			Demo.enableBtn(["loginBtn", "subscribeBtn"]);
		},
		OnCallRing: function() {
			Demo.setTipMsg("被叫正在振铃");
		},
		//外呼状态通知回调
		OnOutCallStatus: function(callId, ret, callType, peerNumber) {
			Demo.updateCallId(callId);//callId
			if (ret === Demo.CALL_OUT_STATUS.TIMEOUT) {
				Demo.setTipMsg("呼叫失败:超时");
				Demo.hideCommingStatus();
				if(Demo.isSubsribe){//如果是订阅，直接返回
					return ;
				}
				Demo.disableBtn();
				Demo.enableBtn(["sendAudioCallBtn", "logoutBtn"]);
				Demo.stopRingTone(); //关闭铃声
			} else if (ret === Demo.CALL_OUT_STATUS.CALLER_REFUSE) {
				Demo.setTipMsg("呼叫失败:坐席拒绝");
				if(Demo.isSubsribe){//如果是订阅，直接返回
					return ;
				}
				Demo.hideCommingStatus();
				Demo.disableBtn();
				Demo.enableBtn(["sendAudioCallBtn", "logoutBtn"]);
				Demo.stopRingTone(); //关闭铃声
			} else if (ret === Demo.CALL_OUT_STATUS.CALLER_NO_ANSWER) {
				Demo.setTipMsg("呼叫失败:坐席无应答");
				if(Demo.isSubsribe){//如果是订阅，直接返回
					return ;
				}
				Demo.hideCommingStatus();
				Demo.disableBtn();
				Demo.enableBtn(["sendAudioCallBtn", "logoutBtn"]);
				Demo.stopRingTone(); //关闭铃声
			} else if (ret === Demo.CALL_OUT_STATUS.CALLER_INEXISTENCE) {
				Demo.setTipMsg("呼叫失败:坐席不存在");
				if(Demo.isSubsribe){//如果是订阅，直接返回
					return ;
				}
				Demo.hideCommingStatus();
				Demo.disableBtn();
				Demo.enableBtn(["sendAudioCallBtn", "logoutBtn"]);
				Demo.stopRingTone(); //关闭铃声
			} else if (ret === Demo.CALL_OUT_STATUS.CALLER_CALL_FAILED) {
				Demo.setTipMsg("坐席呼叫失败");
				if(Demo.isSubsribe){//如果是订阅，直接返回
					return ;
				}
				Demo.hideCommingStatus();
				Demo.disableBtn();
				Demo.enableBtn(["sendAudioCallBtn", "logoutBtn"]);
				Demo.stopRingTone(); //关闭铃声
			} else if (ret === Demo.CALL_OUT_STATUS.CALLER_RINGING) {
				Demo.setTipMsg("坐席正在振铃");
			} else if (ret === Demo.CALL_OUT_STATUS.CALLER_ANSWER) {
				Demo.setTipMsg("坐席已接听，正在呼叫对方");
				Demo.stopRingTone(); //关闭铃声
			} else if (ret === Demo.CALL_OUT_STATUS.CALLED_NO_ANSWER) {
				Demo.setTipMsg("被叫无应答");
				Demo.hideCommingStatus();
			} else if (ret === Demo.CALL_OUT_STATUS.CALLED_INEXISTENCE) {
				Demo.setTipMsg("被叫不存在");
				if(Demo.isSubsribe){//如果是订阅，直接返回
					return ;
				}
				Demo.hideCommingStatus();
				Demo.disableBtn();
				Demo.enableBtn(["sendAudioCallBtn", "logoutBtn"]);
			} else if (ret === Demo.CALL_OUT_STATUS.CALLED_CALL_FAILED) {
				Demo.setTipMsg("被叫呼叫失败");
				if(Demo.isSubsribe){//如果是订阅，直接返回
					return ;
				}
				Demo.hideCommingStatus();
				Demo.disableBtn();
				Demo.enableBtn(["sendAudioCallBtn", "logoutBtn"]);
			} else if (ret === Demo.CALL_OUT_STATUS.CALLED_RINGING) {
				Demo.setTipMsg("被叫正在振铃");
			} else if (ret === Demo.CALL_OUT_STATUS.CALLED_ANSWER) {
				Demo.setTipMsg("被叫已接听");
			} else if (ret === Demo.CALL_OUT_STATUS.CALLED_REFUSE) {
				Demo.setTipMsg("被叫拒接接听");
				Demo.hideCommingStatus();
			} else if (ret === Demo.CALL_OUT_STATUS.CALLER_HANG_UP) {
				Demo.setTipMsg("坐席挂机");
				if(Demo.isSubsribe){//如果是订阅，直接返回
					return ;
				}
				Demo.hideCommingStatus();
				Demo.disableBtn();
				Demo.enableBtn(["sendAudioCallBtn", "logoutBtn"]);
			} else if (ret === Demo.CALL_OUT_STATUS.CALLED_HANG_UP) {
				Demo.setTipMsg("被叫挂机");
				if(Demo.isSubsribe){//如果是订阅，直接返回
					return ;
				}
				Demo.hideCommingStatus();
				Demo.disableBtn();
				Demo.enableBtn(["sendAudioCallBtn", "logoutBtn"]);
			} else if (ret === Demo.CALL_OUT_STATUS.M_PERMISSION_REQUESTED) {
				Demo.setTipMsg("请求获取您的音频");
				if(Demo.isSubsribe){//如果是订阅，直接返回
					return ;
				}
				Demo.showReqMediaMask();
			} else if (ret === Demo.CALL_OUT_STATUS.M_PERMISSION_REQUESTED) {
				Demo.setTipMsg("获取音频失败");
				if(Demo.isSubsribe){//如果是订阅，直接返回
					return ;
				}
				Demo.hideReqMediaMask();
				Demo.disableBtn();
				Demo.enableBtn(["sendAudioCallBtn", "logoutBtn"]);
			} else if (ret === Demo.CALL_OUT_STATUS.M_PERMISSION_OK) {
				Demo.hideReqMediaMask();
				if (Demo.callStatus == "answer" || Demo.callStatus === "refuse") {

				} else {
					if (Demo.callType === Demo.CALL_TYPES.INCOMING) {
						Demo.setTipMsg("您有来电，正在振铃...");
					} else if (Demo.callType === Demo.CALL_TYPES.CALL_OUT) {
						Demo.setTipMsg("正在呼叫...");
					}
				}
			}else if (ret === Demo.CALL_OUT_STATUS.SERVICE_CALLING) {//坐席来电
				return;
				Demo.setTipMsg("来电方向：坐席");
				if(Demo.isSubsribe){//如果是订阅，直接返回
					return ;
				}
				Demo.hideCommingStatus();
				Demo.disableBtn();
				Demo.enableBtn(["sendAudioCallBtn", "logoutBtn"]);
			}else if (ret === Demo.CALL_OUT_STATUS.CUSTOMER_CALLING) {//客户来电
				Demo.setTipMsg("来电方向：客户");
				if(Demo.isSubsribe){//如果是订阅，直接返回
					return ;
				}
				Demo.hideCommingStatus();
				Demo.disableBtn();
				Demo.enableBtn(["sendAudioCallBtn", "logoutBtn"]);
			}else if (ret === Demo.CALL_OUT_STATUS.UN_KNOWN) {
				Demo.setTipMsg("由于未知异常，呼叫失败");
				if(Demo.isSubsribe){//如果是订阅，直接返回
					return ;
				}
				Demo.hideCommingStatus();
				Demo.disableBtn();
				Demo.enableBtn(["sendAudioCallBtn", "logoutBtn"]);
			}
			Demo.stopRingbackTone();
		},
		OnSubscribeRet: function(code){
			Demo.disableBtn();
			if(code === 0){//订阅成功
				Demo.setTipMsg("订阅成功");
				Demo.enableBtn("unSubscribeBtn");
			}else if(code === 1){//订阅失败
				Demo.setTipMsg("订阅失败");
				Demo.enableBtn(["loginBtn", "subscribeBtn"]);
				Demo.isSubsribe = false;//标识为非订阅
			}else if(code === 2){//取消订阅成功
				Demo.setTipMsg("已成功取消订阅");
				Demo.enableBtn(["loginBtn", "subscribeBtn"]);
				Demo.isSubsribe = false;//标识为非订阅
			}else if(code === 3){//取消订阅失败
				Demo.setTipMsg("取消订阅失败");
				Demo.enableBtn(["loginBtn", "subscribeBtn"]);
				Demo.isSubsribe = false;//标识为非订阅
			}
		},
		OnExcepting: function(code) {
			if (code === 0) { //异地登录
				
			} else if (code === 1) { //网络断开
				Demo.setTipMsg("与服务器断开连接");
				Demo.disableBtn();
				Demo.enableBtn("loginBtn");
				Demo.incomingArea.hide();

				setTimeout(function() {
					Demo.setTipMsg("请先登录");
					Demo.disableBtn();
					Demo.enableBtn(["loginBtn", "subscribeBtn"]);
					Demo.incomingArea.hide();
					Demo.stopRingTone(); //关闭铃声
					Demo.stopRingbackTone();
				}, 5 * 1000);
			}
		}
	};
	var loading = $(".loading");
	var ret = UCSConnect.init(
		appId,
		opt,
		function() {
			loading.hide();
			Demo.loadDemoTemplate();
			Demo.init();
		}
	);
	if (ret === false) {
		alert("初始化UCSConnect失败，请查看输出日志");
	};

});