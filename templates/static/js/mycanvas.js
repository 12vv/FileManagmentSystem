//利用js做一个canvas冒泡效果
	var WIDTH = document.documentElement.clientWidth, HEIGHT = document.documentElement.clientHeight, POINT = 50;
	
	var canvas = document.getElementById('mycanvas');
	var context = canvas.getContext('2d');
	canvas.width = WIDTH;
	canvas.height = HEIGHT;
	context.strokeStyle = 'rgba(0,0,0,0.1)';
	context.strokeWidth = 1;
	context.fillStyle = 'rgba(0,0,0,0.1)';

	//点：圆心xy坐标，半径，每帧移动xy的距离
	function Circle (x, y, r, moveX, moveY) {
		this.x = x,
		this.y = y,
		this.r = r,
		this.moveX = moveX,
		this.moveY = moveY;
	}
	//生成max和min之间的随机数
	function num (max, _min) {
		var min = _min || 0;//返回非undefined的数
		return Math.floor(Math.random()*(max-min+1)+min);//这是生成两个数之间随机数的方法
	}
	// 绘制原点
	function drawCricle (cxt, x, y, r, moveX, moveY) {
		var circle = new Circle(x, y, r, moveX, moveY)
		cxt.beginPath();
		cxt.arc(circle.x, circle.y, circle.r, 0, 2*Math.PI);
		cxt.closePath();
		cxt.fill();
		return circle;
	}
	//初始化生成原点
	function original() {
		circleArr = [];//全局变量，
		for (var i = 0; i < POINT; i++) {
			circleArr.push(drawCricle(context, num(WIDTH), num(HEIGHT), num(15, 0), num(-5,5)/10, num(-5,5)/10));//第四个参数意在控制圆圈的大小 ，偏移其实是固定的了
		}
		draw();
	}

	//每帧绘制
	function draw () {
		context.clearRect(0,0,canvas.width, canvas.height);//清除掉上一帧的画面
		for (var i = 0; i < POINT; i++) {
			drawCricle(context, circleArr[i].x, circleArr[i].y, circleArr[i].r);//传入的参数并不一定要和声明的时候相等
		}
	}
	//把全部操作封装
	function allset() {
		original();//绘制第一帧页面
		setInterval(function () {
			for (var i = 0; i < POINT; i++) {
				var cir = circleArr[i];
				cir.x += cir.moveX;//cir.x = cir.x + cir.moveX
				cir.y += cir.moveY;//
				if (cir.x > WIDTH) cir.x = 0;
				else if (cir.x < 0) cir.x = WIDTH;
				if (cir.y > HEIGHT) cir.y = 0;
				else if (cir.y < 0) cir.y = HEIGHT;
				//上出下进，左出右进
			}
			draw();//绘制下一帧
		}, 16);//重复进行以上的操作
	}
	//串口变化时，要实现自适应
	function canvas_resize() {
		WIDTH = document.documentElement.clientWidth;
		HEIGHT = document.documentElement.clientHeight;
		canvas.width = WIDTH;
		canvas.height = HEIGHT;
		context.strokeStyle = 'rgba(0,0,0,0.1)';
		context.strokeWidth = 1;
		context.fillStyle = 'rgba(0,0,0,0.1)';
		if(WIDTH < 500) {
			POINT = 20;
		}else {
			POINT = 50;
		}
	}
	//调用执行
	window.onload = function () {
		allset();
		window.onresize = function() {
			canvas_resize();
		}
	}