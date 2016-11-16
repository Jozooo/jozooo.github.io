$(function() {
	var appId = $("#appId").val();
	var opt = {
		debugLevel: "infor", //fatal,error,warn,infor
		//来电回调接口
		OnIncomingCall: function(callid, caller, message) {
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

		//呼叫被释放回调接口
		OnCallGiveUp: function(message, cause) {

			Demo.stopRingTone(); //关闭铃声
			Demo.stopRingbackTone();
			Demo.hideCommingStatus();
			Demo.enableBtn(["logoutBtn"]);
			Demo.enableBtn(["sendAudioCallBtn"]);
		},
		//退出结果回调 0成功 1 失败
		OnLogoutRet: function(message, ret) {
			if (ret == Demo.LOGOUT_STATUS.SUCCESS) {
				Demo.setTipMsg("请先登录");
			} else if (ret == Demo.LOGOUT_STATUS.FAILED) {
				Demo.setTipMsg("退出失败");
			}
			Demo.disableBtn();
			Demo.enableBtn(["loginBtn", "subscribeBtn"]);
			Demo.incomingArea.hide();
			Demo.stopRingTone(); //关闭铃声
			Demo.stopRingbackTone();
		},
		// 登陆成功回调函数 响应码   描述 0: 成功（SUCCESS）	1: 超时（TIMEOUT）2：用户名非法（INVALID_USERNAME） 3：密码非法（INVALID_PASSWORD）99：其他（OTHER）
		OnLoginRet: function(message, ret) {
			if (ret === Demo.LOGIN_STATUS.SUCCESS) {
				Demo.disableBtn();
				Demo.enableBtn(["logoutBtn", "sendAudioCallBtn", "sendVideoCallBtn"]);
				Demo.setTipMsg("登录成功");
				Demo.enableBtn(["logoutBtn"]);
				return;
			} else if (ret === Demo.LOGIN_STATUS.TIMEOUT) {
				Demo.setTipMsg("登录超时");
			} else if (ret === Demo.LOGIN_STATUS.PASSWORD_INVALID) {
				Demo.setTipMsg("密码错误");
			} else if (ret === Demo.LOGIN_STATUS.USER_NULL) {
				Demo.setTipMsg("账号或密码为空");
			}
			Demo.disableBtn();
			Demo.enableBtn(["loginBtn", "subscribeBtn"]);
		},
		//外呼状态通知回调
		OnOutCallStatus: function(message, ret) {

			if (ret === CallStatus.RINGING) {
				Demo.setTipMsg("被叫正在振铃");
			} else if (ret === CallStatus.ANSWER_CALL) {
				Demo.setTipMsg("被叫已接听");
				Demo.stopRingTone(); //关闭铃声
				Demo.stopRingbackTone();
				Demo.enableBtn(["disableAudioBtn"]);
			} else if (ret === CallStatus.REJECT_CALL) {
				Demo.setTipMsg("被叫拒接接听");
				Demo.hideCommingStatus();
			} else if (ret === CallStatus.HANG_UP_CALL) {
				Demo.setTipMsg("被叫挂机");
				if(Demo.isSubsribe){//如果是订阅，直接返回
					return ;
				}
				Demo.hideCommingStatus();
				Demo.disableBtn();
				Demo.enableBtn(["sendAudioCallBtn", "logoutBtn"]);
			} else if (ret === CallStatus.CANCEL_CALL) {

			} else if (ret === CallStatus.ONINCOMING_CALL) {
				Demo.setTipMsg("您有来电，正在振铃...");
			} else if (ret === CallStatus.UNUSUAL_OPERATE) {
				Demo.setTipMsg("异常操作");
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
		opt
	);

	loading.hide();
	Demo.loadDemoTemplate();
	Demo.init();

	if (ret === false) {
		alert("初始化UCSConnect失败，请查看输出日志");
	};

});