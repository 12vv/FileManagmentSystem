base_url = 'http://127.0.0.1:8000';
//设置变量做标记保证注册全部通过
var flag_ID = 0,flag_Email = 0,flag_Pass = 0,flag_Con = 0;
//执行函数
$(document).ready(function() {
	login();//登录
	register_confirm();//注册表单验证
	register_clear();
	gb.modal.tip_small.init();
});
//登录
function login() {
	$('.b-login').click(function() {
		var userid = $('#login-user').val(),
		password = $('#login-password').val();
		if(userid == "" && password == "") {
			$('.l-u-tip').text("请输入账户").fadeIn();
			$('.l-p-tip').text("请输入密码").fadeIn();
		} else if (password == "") {
			$('.l-p-tip').text("请输入密码").fadeIn();
		} else if (userid =="") {
			$('.l-u-tip').text("请输入账户").fadeIn();
		}
		$.ajax({
			url: 'login',
			type: 'POST',
			data: {
				username: userid,
				password: password
			},
			success: function(data) {
				if (data.result == 'success') {
					if (data.level != '0'){
						window.location = base_url + "/main";
					}else{
						window.location = base_url + "/admin";
					}
				} else if (data == "error"){
					$('.l-u-tip').text("用户名不存在或密码错误").fadeIn();
					// gb.modal.tip_small.show('用户名不存在或密码错误', 'error');
				}
			},
			error: function() {
				console.log('error');
			}
		});
	});
	//清除提示
	$('#login-user,.l-u-tip').click(function() {
		$('.l-u-tip').fadeOut();
		$('#login-user').focus();
	});
	$('#login-password,.l-p-tip').click(function() {
		$('.l-p-tip').fadeOut();
		$('#login-password').focus();
	});
}
//注册表单验证
function register_confirm() {
	ID_confirm();
	Email_confirm();
	Password_confirm();
	Again_confirm();
	Confirm();
}
//ID验证
function ID_confirm() {
	var p_userid_F = /^[a-zA-Z]+/,//首字母
	P_userid_S = /^[a-zA-Z0-9_]+$/;//有没有特殊字符
	$('#register-userid').focusin(function() {
		$('#register-userid').focusout(function() {
			var registerUserid = $('#register-userid').val();
			if(registerUserid == "") {
				$('.r-u-tip').text("用户ID不能为空");
				$('.r-u-tip').fadeIn();
			} else if(p_userid_F.test(registerUserid) == false) {
				$('.r-u-tip').text("必须以字母开头");
				$('.r-u-tip').fadeIn();
			} else if(P_userid_S.test(registerUserid) == false) {
				$('.r-u-tip').text("只能输入英文，数字，_");
				$('.r-u-tip').fadeIn();
			} else if(registerUserid.length < 2 ) {
				$('.r-u-tip').text("长度必须大于2");
				$('.r-u-tip').fadeIn();
			} else {
				$.ajax({
					url: 'testUsername',
					type: 'POST',
					data: {
						username: registerUserid
					},
					success: function(data) {
						if (data == "success") {
							flag_ID = 1;
						}else if ( data == "error") {
							$('.r-u-tip').text("用户名重复").fadeIn();
						}
					},
					error: function() {
						console.log("error");
					}
				});			
			}
 		});
	});
}
//邮箱验证
function Email_confirm() {
	var P_email = /^[a-z0-9]+([._\\-]*[a-z0-9])*@([a-z0-9]+[-a-z0-9]*[a-z0-9]+.){1,63}[a-z0-9]+$/;
	$('#register-email').focusin(function() {
		$('#register-email').focusout(function() {
			var registerEmail = $('#register-email').val();
			if(registerEmail == "") {
				$('.r-e-tip').text("输入不能为空");
				$('.r-e-tip').fadeIn();
			} else if(P_email.test(registerEmail) == false) {
				$('.r-e-tip').text("邮箱格式错误");
				$('.r-e-tip').fadeIn();
			} else {
				$.ajax({
					url: 'testEmail',
					type: 'POST',
					data: {
						email: registerEmail
					},
					success: function(data) {
						if (data == "success") {
							flag_Email = 1;
						}else if ( data == "error") {
							$('.r-e-tip').text("邮箱已存在").fadeIn();
						}
					},
					error: function() {
						console.log("error");
					}
				});
			}
		});
	});
}
//输入密码操作
function Password_confirm() {
	var P_password = /\s+/;
	$('#register-password,.r-p-tip').focusin(function() {
		$('#register-password').focusout(function() {
			var registerPassword = $('#register-password').val();
			if (P_password.test(registerPassword) == true) {
			$('.r-p-tip').text("不能输入空格").fadeIn();
			} else if(registerPassword.length == 0) {
				$('.r-p-tip').text("请输入密码").fadeIn();
			} else if(registerPassword.length < 6 ) {
				$('.r-p-tip').text("密码不能小于6位").fadeIn();
			} else if(registerPassword.length > 16) {
				$('.r-p-tip').text("密码不能超过16位").fadeIn();
			} else {
				flag_Pass = 1;
			}
		});
	});
}
//重新输入密码
function Again_confirm() {
	$('#register-confirm,.r-c-tip').focusin(function() {
		$('#register-confirm').focusout(function() {
			var registerPassword = $('#register-password').val(),
			registerConfirm = $('#register-confirm').val();
			if(registerConfirm == "") {
				$('.r-c-tip').text("请确认密码").fadeIn();
			} else if(registerConfirm !== registerPassword) {
				$('.r-c-tip').text("两次输入密码不一样").fadeIn();
			} else {
				flag_Con = 1;
			}
		});
	});
}
function Confirm() {
	$('.b-register').click(function() {
		if(flag_ID && flag_Email && flag_Con && flag_Pass) {
		$('.b-register').click(function() {
			console.log("hhh");
			var userid = $('#register-userid').val(),
			email = $('#register-email').val(),
			password = $('#register-password').val();
			// confirmPassword = $('#register-confirm').val();
			$.ajax({
				url: 'register',
				type: 'POST',
				data: {
					username: userid,
					email: email,
					password: password,
					// confirmPassword: confirmPassword,
				},
				success: function(data) {
					if (data == "success") {
						// $("#myModalLabel").text("注册成功");
						// $('#myModal').modal();
						 gb.modal.tip_small.show('注册成功', 'success');
					} else if (data == "error") {
						// $("#myModalLabel").text("无法注册");
						// $('#myModal').modal();
						gb.modal.tip_small.show('无法注册', 'success');
					}
				},
				error: function(e) {
					console.log("error");
					gb.modal.tip_small.show(e, 'success');
				}
			});
		});
		}
		var userid = $('#register-userid').val(),
			email = $('#register-email').val(),
			password = $('#register-password').val(),
			passConfirm = $('#register-confirm').val();
			if (userid == "") {
				$('.r-u-tip').text("请输入用户名").fadeIn();
			}
			if (email == "") {
				$('.r-e-tip').text("请输入邮箱").fadeIn();
			}
			if (password == "") {
				$('.r-p-tip').text("请输入密码").fadeIn();
			}
			if (passConfirm == "") {
				$('.r-c-tip').text("请确认密码").fadeIn();
			}
	});
}
function register_clear() {
	$('#register-userid,.r-u-tip').click(function() {
		$('.r-u-tip').fadeOut();
		$('#register-userid').focus();
	});
	$('#register-email,.r-e-tip').click(function() {
		$('.r-e-tip').fadeOut();
		$('#register-email').focus();
	});
	$('#register-password,.r-p-tip').click(function() {
		$('.r-p-tip').fadeOut();
		$('#register-password').focus();
	});
	$('#register-confirm,.r-c-tip').click(function() {
		$('.r-c-tip').fadeOut();
		$('#register-confirm').focus();
	});
	$('#register-wel,.r-w-tip').click(function() {
		$('.r-w-tip').fadeOut();
		$('#register-wel').focus();
	});
}
