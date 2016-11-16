var　Demo = {
	LOGIN_STATUS:{
		SUCCESS:0,//成功
		TIMEOUT:1,//超时
		INVALID_USERNAME:2,//用户名错误
		INVALID_PASSWORD:3,//密码错误
		INVALID_APPID:5,
		OTHER:99//其他错误
	},
	LOGOUT_STATUS:{
		SUCCESS:0,//成功
		FAILED:1,//失败
	},
	CALL_OUT_STATUS:{
		TIMEOUT:0,//外呼超时
		CALLER_REFUSE:1,//坐席拒接
		CALLER_NO_ANSWER:2,//坐席无应答
		CALLER_INEXISTENCE:3,//坐席不存在
		CALLER_CALL_FAILED:4,//坐席呼叫失败
		CALLER_RINGING:5,//坐席振铃
		CALLER_ANSWER:6,//坐席接听
		CALLED_REFUSE:7,//被叫拒绝
		CALLED_NO_ANSWER:8,//被叫无应答
		CALLED_INEXISTENCE:9,//被叫不存在
		CALLED_CALL_FAILED:10,//呼叫被叫失败
		CALLED_RINGING:11,//被叫振铃
		CALLED_ANSWER:12,//被叫接听
		CALLER_HANG_UP:13,//坐席挂机
		CALLED_HANG_UP:14,//被叫挂机
		M_PERMISSION_REQUESTED:15,//申请获取音频
		M_PERMISSION_FAILED:16,//获取音频失败
		M_PERMISSION_OK:17,//获取音频成功
		SERVICE_CALLING: 18,//坐席来电
		CUSTOMER_CALLING: 19,//客户来电
		UN_KNOWN:99//未知
	},
	CALL_TYPES:{
		CALL_INCOMING:"incoming",
		CALL_OUT:"callOut"
	},
	SendCallTypes:{
		free:0,
		directly:1,
		intelligence:2
	},
	init:function(){
		this.loginBtn = $("#loginBtn");
		this.logoutBtn = $("#logoutBtn");
		this.subscribeBtn = $("#subscribeBtn");//订阅
		this.unSubscribeBtn = $("#unSubscribeBtn");//取消订阅
		this.sendAudioCallBtn = $("#sendAudioCallBtn");//发送语音电话
		this.sendVideoCallBtn = $("#sendVideoCallBtn");//发送视频电话
		this.giveUpBtn = $("#giveUpBtn")//挂断
		this.answerCallBtn = $("#answerCallBtn");//接听
		this.refuseBtn = $("#refuseBtn");
		this.incomingNoText = $("#incomingNo");//来电号码显示
		this.incomingArea = $("#incomingArea");
		this.userNameInput = $("#userName");
		this.showNameInput = $("#showName");
		this.passwordInput = $("#password");
		this.displayNumInput = $("#displayNum");
		this.callIdSpan = $("callIdSpan");
		this.appIdInput = $("#appId");
		this.tokenInput = $("#token");
		this.callTargetInput = $("#callTaret");
		this.checkInRet = $("#checkInRet");
		this.disableAudioBtn = $("#disableAudioBtn");
		this.showBannerArea = $("#showBanner");
		this.checkInBtn = $("#checkInBtn");
		
		this.isIncoming = false;//是否为来电
		this.callStatus = "none";
		this.checkInServer = this.checkInServer || "";
		this.showBanner = this.showBanner || "";
		
		this.isSubsribe = false;//标识是否为订阅
		
		this.getUserInforFromLocal();
		this.createAudios();
		this.initEvents();
		this.disableBtn();
		this.enableBtn(['loginBtn', 'subscribeBtn']);
		this.initPageEvents();
		
		this.showBannerArea.text(this.showBanner);
	},
	disableBtn:function(){
		this.loginBtn.attr("disabled","disabled");
		this.logoutBtn.attr("disabled","disabled");
		this.sendAudioCallBtn.attr("disabled","disabled");
		this.sendVideoCallBtn.attr("disabled","disabled");
		this.giveUpBtn.attr("disabled","disabled");
		this.refuseBtn.attr("disabled","disabled");
		this.answerCallBtn.attr("disabled","disabled");
		this.disableAudioBtn.attr("disabled","disabled");
		this.subscribeBtn.attr("disabled","disabled");
		this.unSubscribeBtn.attr("disabled","disabled");
	},
	enableBtn:function(btnNames){
		if(typeof(btnNames)==="string"){
			btnNames = [btnNames];
		}
		btnNames = btnNames || [];
		for(var i=0,j=btnNames.length;i<j;i++){
			var btnName = btnNames[i];
			if(btnName === "selectCallTypeBtn"){
				$(".js-selcect-text").removeClass("disabled");
				continue;
			}
			this[btnName].removeAttr("disabled");
		}
	},
	sendCall:function(type){
		var sendNo = this.callTargetInput.val();
		sendNo = $.trim(sendNo);
		var reg = /^\d{0,16}$/;
		if(!reg.test(sendNo)){
			alert("请填写不多于16的整数的被叫号码");
			return;
		}
		type = this.SendCallTypes[type];
		var ret = UCSConnect.MakeNewCall(type,sendNo);
		if(ret < 0){
			alert("呼叫失敗");
			return;
		}
		this.callType = this.CALL_TYPES.CALL_OUT;//呼出
		this.setTipMsg("正在呼叫...");
		this.disableBtn();
		this.enableBtn(["giveUpBtn","logoutBtn"]);
		this.callStatus = "send_out";
		this.setToLocal("sendNo",sendNo);
		this.setDisabledAudioBtnValue("静音");
	},
	initEvents:function(){
		var that = this;
		//登录
		this.loginBtn.bind("click",function(){
			var showName = that.showNameInput.val();
			var userName = "";
			var password = "";
			var appId = "";
			userName = that.userNameInput.val();
			password = that.passwordInput.val();
			appId = that.appIdInput.val();
			showName = $.trim(showName);
			userName = $.trim(userName);
			appId = $.trim(appId);
			if(appId.length === 0){
				alert("请填写aPPId");
				return ;
			}
			if(userName.length===0){
				alert("请填写用户名");
				return ;
			}
			if(password.length===0){
				alert("请填写密码");
				return ;
			}
			that.doLogin(userName, password, appId);
			that.setToLocal("showName",showName);
			that.setToLocal("userName",userName);
			that.setToLocal("password",password);
			that.setToLocal("appId",appId);
			
			that.setTipMsg("登录中...");
			that.disableBtn();
			//保存用户信息，方便下次再用
			$(".js-tab-page").addClass("disabled");//禁止切换选项卡
			
		});
		
		this.subscribeBtn.bind("click", function(){
			var userName = "";
			var appId = "";
			userName = that.userNameInput.val();
			userName = $.trim(userName);
			appId = that.appIdInput.val();
			appId = $.trim(appId);
			if(appId.length === 0) {
			    alert("请填写appId");
			    return ;
			}
			if(userName.length===0){
			    alert("请填写用户名");
			    return ;
			}
			that.setTipMsg("订阅中...");
			that.disableBtn();
			that.isSubsribe = true;
			UCSConnect.sendSubsribe(userName, appId);
		});
		
		this.unSubscribeBtn.bind("click", function(){
			that.setTipMsg("取消订阅中...");
			try{
				UCSConnect.unSubsribe();
			}catch(e){
				alert(e);
			}
			that.disableBtn();
		});
		
		//打语音电话
		this.sendAudioCallBtn.bind("click",function(){
			var sendNo = that.callTargetInput.val();
			sendNo = $.trim(sendNo);
			if(sendNo.length===0){
			    alert("请填被叫号码");
			    return ;
			}
			var reg = /^\d{0,16}$/;
			if(!reg.test(sendNo)){
				alert("被叫号码为不多于16位的数字，请重填");
				return;
			}
			if(/[\u4e00-\u9fa5]/g.test(sendNo)){
				alert("号码包含中文");
				return;
			}
			var displayNum = that.displayNumInput.val();
			displayNum = $.trim(displayNum);

			var callerNo = that.userNameInput.val();
			callerNo = $.trim(callerNo);

//			var serviceId = "";//坐席ID
			UCSConnect.SendOutCall(callerNo, sendNo,displayNum);
			that.callType = that.CALL_TYPES.CALL_OUT;//呼出
			that.setTipMsg("正在呼叫...");
			//that.startRingbackTone();
			that.enableBtn(["giveUpBtn"]);
			that.callStatus = "send_out";
		});
		
		//退出
		this.logoutBtn.bind("click",function(){
			that.setTipMsg("退出登录中...");
			try{
				UCSConnect.logout();
			}catch(e){
				alert(e);
			}
			that.disableBtn();
		});
		
		//挂断
		this.giveUpBtn.bind("click",function(){
			try{
				UCSConnect.CallGiveUp();
				that.stopRingTone();//关闭铃声
			    that.stopRingbackTone();
				that.setTipMsg("您挂断了电话");
				that.incomingArea.hide();
				that.disableBtn();
				 that.enableBtn(["logoutBtn","sendAudioCallBtn"]);
			    that.callStatus = "hangup";
			}catch(e){
				alert(e);
			}
		});
		//接听
		this.answerCallBtn.bind("click",function(){
			try{
				UCSConnect.AnswerCall();
				that.setTipMsg("电话已接听，正在通话中");
				that.stopRingTone();//关闭铃声
			    that.stopRingbackTone(); 
			    that.disableBtn();
			    that.enableBtn(["giveUpBtn","disableAudioBtn"]);
			    that.callStatus = "answer";
			    that.setDisabledAudioBtnValue("静音");
			}catch(e){
				alert(e);
			}
		});
		//拒接
		this.refuseBtn.bind("click",function(){
			try{
				UCSConnect.CallReject();
				that.setTipMsg("拒绝接听来电");
				that.stopRingTone();//关闭铃声
			    that.stopRingbackTone(); 
			    that.hideCommingStatus();
			    that.callStatus = "refuse";
			    that.enableBtn("sendAudioCallBtn");
			}catch(e){
				alert(e);
			}
		});
		
		//静音
		this.disableAudioBtn.bind("click",function(){
			try{
				var state = UCSConnect.GetMic();
				state = state === 0 ? 1 : 0;
				var btnStr = state === 0 ? "开启"  : "静音";
				that.setDisabledAudioBtnValue(btnStr);
				UCSConnect.SetMic(state);
			}catch(e){
				alert(e);
			}
		});
		
		this.checkInBtn.bind("click",function(){
			that.sendCrossDomainData();
		});
	},
	setDisabledAudioBtnValue:function(value){
		this.disableAudioBtn.val(value);
	},
	doLogin:function(userName, password, appId){
		UCSConnect.setAppId(appId);
		var ret = UCSConnect.login(userName,password);
		if(ret === false){
			alert("登录失败，请查看控制台信息");
			Demo.disableBtn();
			Demo.enableBtn(["loginBtn", "subscribeBtn"]);
			$(".js-tab-page").removeClass("disabled");//恢复切换选项卡
		}
	},
	getUserInforFromLocal:function(){
		var showName = this.getFromLocal("showName") || "";
		var userName = this.getFromLocal("userName") || "";
		var password = this.getFromLocal("password") || "";
		var sendNo = this.getFromLocal("sendNo") || "";
		var appId = this.getFromLocal("appId") || "";
		this.showNameInput.val(showName);
		this.userNameInput.val(userName);
		this.passwordInput.val(password);
		this.callTargetInput.val(sendNo);
		this.appIdInput.val(appId);
	},
	setTipMsg:function(msg){
		$("#tipMsg").text(msg);
	},
	createAudios:function(){
		this.ringtone = $('<audio id="ringtone" loop src="sounds/ringtone.wav" />');
		this.ringbacktone = $('<audio id="ringbacktone" loop src="sounds/ringbacktone.wav" />');
		this.dtmfTone = $('<audio id="dtmfTone" src="sounds/dtmf.wav" />');
		
		$("body").append(this.ringtone);
		$("body").append(this.ringbacktone);
		$("body").append(this.dtmfTone);
	},
	startRingTone:function() {
        try { 
        	if(this.ringtone){
        		this.ringtone[0].play(); 
        	}
        } catch (e) { }
    },
    stopRingTone:function() {
        try { 
        	if(this.ringtone){
        		this.ringtone[0].pause(); 
        	}
        }catch (e) { }
    },
    startRingbackTone:function() {
        try { 
        	if(this.ringbacktone){
        		this.ringbacktone[0].play(); 
        	}
        }
        catch (e) { }
    },
    stopRingbackTone:function() {
        try { 
        	if(this.ringbacktone){
        		this.ringbacktone[0].pause(); 
        	}
        }
        catch (e) { }
    },
    setToLocal:function(name,value){
		var ls = window.localStorage;
		ls.setItem(name,value);
	},
	getFromLocal:function(name){
		var ls = window.localStorage;
		var v = ls.getItem(name);
		return v;
	},
	hideCommingStatus:function(){//隐藏来电状态
		this.disableBtn();
		this.enableBtn(["selectCallTypeBtn","logoutBtn"]);
		this.incomingArea.hide();
		this.stopRingTone();//关闭铃声
		this.stopRingbackTone(); 
	},
	showReqMediaMask : function(){//请求媒体信息的遮罩层
		var reqMediaMask = $("#reqMediaMask");
		if(!reqMediaMask || reqMediaMask.length === 0){
			reqMediaMask = $("<div id='reqMediaMask'><div>");
			var body = $("body");
			body.append(reqMediaMask);
		}else{
			reqMediaMask.show();
		}
	},
	hideReqMediaMask : function(){
		var reqMediaMask = $("#reqMediaMask");
		if(!reqMediaMask){
			reqMediaMask.hide();
		}
	},
	initPageEvents : function(){},
	sendCrossDomainData:function(){
		var that = this;
		var xhr = new XMLHttpRequest();
	    xhr.onload = function(){
	    	that.checkInRet.text(xhr.responseText);
	    };
	    xhr.onerror = function(){
	    	that.setTipMsg("签入服务器连接异常");
	    };
	    xhr.open('GET', this.checkInServer, true);
	    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
	    xhr.send(null);
	},
	loadDemoTemplate: function(suc){
		$.ajax({
			url: "./demo_template.html",
			dataType:"html",
			async: false,
			success: function(ret){
				$("#content").html(ret);
			},
			error: function(){
				
			}
		})
	},
	updateCallId : function(callid){
		//获取callId
		var content = $("#callIdContent");
		if (callid) {
			console.log(callid);
			$("#callIdSpan").text(callid);
			content.show();
		} else {
			content.hide();
		}
	}
};


window.onbeforeunload = function(event){
	event = event || window.event;
	event.returnValue = "当前您可能有电话正在进行，确定要离开当前页面吗？";
};
function destorySource(){
	try{
		UCSConnect.logout();
		UCSConnect.CallGiveUp();
		Demo.setToLocal("unloadMsg","");
	}catch(e){
		Demo.setToLocal("unloadMsg",e.toString());
	}
};