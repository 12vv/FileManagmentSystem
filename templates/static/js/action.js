$(document).ready(function() {
	click_tab();
	$('.login').click();
	re_style();
});
//点击登录注册
function click_tab() {
	$('.login').click(function() {
		$('.login').addClass('login-add');
		$('.register').removeClass('register-add');
		$('.navs-slider-line').removeClass('line-move');
		$('.input-register').css('display', 'none');
		$('.input-login').fadeIn();
	});
	$('.register').click(function() {
		$('.login').removeClass('login-add');
		$('.register').addClass('register-add');
		$('.navs-slider-line').addClass('line-move');
		$('.input-login').css('display', 'none');
		$('.input-register').fadeIn();
	});
}
//当视口宽度小于414px的适应
function re_style() {
	$(window).resize(function() {
		if($('.index-main').width() <= 414) {
			$('.index-main').removeClass('index-one').addClass('index-two');
			$('.main-body').addClass('main-body-another');
		}else {
			$('.index-main').removeClass('index-two').addClass('index-one');
			$('.main-body').removeClass('main-body-another');
		}
	});
}
//登录页面回车事件
function loginEnter(et) { 
  if(et.keyCode){  
    if (et.keyCode == 13)  
      $('.b-login').click();
  }else{  
    if (et.which == 13)  
      $('.b-login').click();
	}
}
//注册页面回车事件
function registerEnter(et) { 
  if(et.keyCode){  
    if (et.keyCode == 13)  
      $('.b-register').click();
  }else{  
    if (et.which == 13)  
      $('.b-register').click();
	}
}