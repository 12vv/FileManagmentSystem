/*
	调用方法汇总，详细接口写在函数头的注释里
	使用方法：在jq和bootstrap之后引入global.js，在页面私有js中进行下列操作即可，尚未测试，不知道会有多少bug

	模块初始化 
	var gb = GlobalModule(); // 请勿多次调用GlobalModule()





# 模态框类

--------
	tip 普通提示框，可选按钮颜色
	gb.modal.tip.init(); // 初始化，整个js中初始化一次即可
	gb.modal.tip.show('哈哈哈', 'success'); // 显示
	gb.modal.tip.show('哈哈哈', 'warning');
	gb.modal.tip.show('哈哈哈', 'error');
--------

--------
	tip_small 无按钮弹幕，可选字体颜色，以及关闭弹幕后是否刷新页面
	gb.modal.tip_small.init();  // 初始化，整个js中初始化一次即可
	gb.modal.tip_small.show('哈哈哈', 'success', false); // false为不刷新，默认为false，可不填
	gb.modal.tip_small.show('哈哈哈', 'warning',); 
	gb.modal.tip_small.show('哈哈哈', 'error', true);
--------

--------
	confirm 确认按钮，可多次初始化生成相互独立的确认框，绑定不同事件。
	var confirmId1 = gb.modal.confirm.init(successCall[, cancelCall]);  // 初始化，返回标识，以供调用
	var confirmId2 = gb.modal.confirm.init(successCall[, cancelCall]);  // 初始化，返回标识，以供调用
	gb.modal.confirm.show(confirmId1,'哈哈哈1'); 
	gb.modal.confirm.show(confirmId2,'哈哈哈2'); 
--------

--------
	loading 无按钮loading弹幕
	gb.modal.loading.init();  // 初始化，整个js中初始化一次即可
	gb.modal.loading.show(message); // 显示，默认值为 '正在操作中…'
	gb.modal.loading.hide(); // 隐藏
--------









# 页面组件类

--------
	pagination 页码块，在页面需要生成到导航栏的位置插入
	'<nav class="paging" id="paging3"  data-current="${pageNumber}" data-all="${maxPageNumber}"></nav>' 
	'<nav class="paging" id="paging1" data-current="1" data-all="4"></nav>' 
	'<nav class="paging" id="paging2"  data-current="2" data-all="8"></nav>' 
	即可在不同位置生成相互独立的导航栏
	gb.pagination.init('#paging3');
	gb.pagination.init('#paging1');
	gb.pagination.init('#paging2', 1, 4); // 可手动传入页码，优先值最高
	gb.pagination.reload('#paging1', cur[, all)] // 重载页码 

	默认自动重载页码，如为同步方式，可传入第四个参数 gb.pagination.init('#paging2', 1, 4, false);

	监听页码修改事件，修改页码时会触发回调：
	gb.pagination.addChangeListener('#paging1', function(nextPage, e) {
		// nextPage 为下一页码，String 类型
		// e 为点击事件
	});

--------

# 常用函数类

--------
	parseJSON传入一个JSON字符串或对象，返回一个对象，做了出错处理，确保返回的一定会是一个object
	data = gb.parseJSON(data);
--------

--------
	
	对Date的扩展，将 Date 转化为指定格式的String
	月(M)、日(D)、小时(h)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符， 
	年(Y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字) 
	例子： 
	dateFormat(Date, "YYYY-MM-D") ==> 2006-07-02
	dateFormat(Date, "YYYY-MM-D hh:mm") ==> 2006-07-02 08:09
	dateFormat(Date, "YYYY-M-D h:m:s.S") ==> 2006-7-2 8:9:4.18 
	dateFormat(Date, "YYYY-MM-D hh:mm:ss.S") ==> 2006-07-02 08:09:04.423 

	gb.dateFormat(Date, "YYYY-M-D hh:mm:ss");
	
--------


*/
var gb;
(function() {
	function GlobalModule() {


		/*
			tip
			@description 普通提示框，可选按钮颜色

			@init 初始化 tip.init();
			@call 显示调用 tip.show(message, type);

			@param {String} message 为提示内容
			@param {String} type 有三个值 'success', 'warning', 'error'; 分别为绿、橙、红
			@default '操作失败', 'warning'
		*/
		var tip = {
			init: function() {
				var _html = '<div class="modal fade" id="gb-tip">' +
							        '<div class="modal-dialog">' +
							            '<div class="modal-content">' +
							                '<div class="modal-header">' +
							                    '<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>' +
							                    '<h4 class="modal-title">提示</h4>' +
							                '</div>' +
							                '<div class="modal-body">' +
							                    '<p id="gb-tip-content"></p>' +
							                '</div>' +
							                '<div class="modal-footer">' +
							                    '<button type="button" class="btn btn-warning" data-dismiss="modal" id="gb-tip-btn">确定</button>' +
							                '</div>' +
							            '</div>' +
							        '</div>' +
							    '</div>';
				$(_html).appendTo('body');	
			},
			show: function(message,type) {
				message = message || '操作失败';
				var _type = '';
				switch(type) {
					case 'success': 
						_type = 'btn-success';
						break;
					case 'warning': 
						_type = 'btn-warning';
						break;
					case 'error': 
						_type = 'btn-danger';
						break;
					default:
						_type = 'btn-warning';
				}
				$('#gb-tip-content').text(message);
				$('#gb-tip-btn').removeClass('btn-success btn-warning btn-danger').addClass(_type);
	   			$('#gb-tip').modal();
			},
		};


		/*
			tip_small
			@description 无按钮提示弹幕，可选字体颜色、在关闭弹幕后是否刷新页面

			@init 初始化 tip_samll.init();
			@call 显示调用 tip_samll.show(message, type[, isReload]);

			@param {String} message 为提示内容
			@param {String} type 有三个值 'success', 'warning', 'error'; 分别为绿、橙、红
			@param {Boolean} isReload true为刷新页面，false为不刷新
			@default '操作成功', 'success', false
		*/
		var tip_small = {
			init: function() {
				var self = this;
				var _html = '<div class="modal fade bs-example-modal-sm" id="gb-tip-sm" tabindex="-1" role="dialog" aria-labelledby="mySmallModalL" +abel">' +
						        '<div class="modal-dialog modal-sm">' +
						            '<div class="modal-content">' +
						                '<div class="modal-body text-success" id="gb-tip-sm-content">操作成功</div>' +
						            '</div>' +
						        '</div>' +
						    '</div>';

				$(_html).appendTo('body');
				$('#gb-tip-sm').on('hidden.bs.modal', function() {
			    	if(self.isRefresh) {
			   			location.reload();
			    	}
			   });
			},
			show: function(message, type, isReload) {
				message = message || '操作成功';
				var _type = '';
				switch(type) {
					case 'success': 
						_type = 'text-success';
						break;
					case 'warning': 
						_type = 'text-warning';
						break;
					case 'error': 
						_type = 'text-danger';
						break;
					default:
						_type = 'text-success';
				}
				this.isRefresh = isReload || false;
				$('#gb-tip-sm-content').text(message);
				$('#gb-tip-sm-content').removeClass('text-success text-warning text-danger').addClass(_type);
	   			$('#gb-tip-sm').modal();
			},
			isRefresh: false,
		}

		/*
			confirm
			@description 确认框，可多次初始化产生相互独立的确认框，绑定不同函数

			@init 初始化 confirm.init(successCall[, cancelCall])，返回调用的序号;
			@param {Function} successCall 点击确定后执行的回调函数
			@param {Function} cancelCall) 点击取消后执行的回调函数
			@return {Number} 不同模态框的唯一序号，用变量保存以进行show函数的调用
			
			@call 显示调用 confirm.show(index, message);
			@param {String} message 为提示内容
			@default 1, '是否确认执行该操作？'
		
		*/
		var Confirm = {
			init: function(call1, call2) {
				var that = this;
				var _html = '<div class="modal fade" id="gb-confirm-{{index}}">' +
						        '<div class="modal-dialog">' +
						            '<div class="modal-content">' +
						                '<div class="modal-header">' +
						                   ' <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>' +
						                    '<h4 class="modal-title">确认</h4>' +
						                '</div>' +
						                '<div class="modal-body">' +
						                    '<p id="gb-confirm-content-{{index}}">是否确认执行该操作？</p>' +
						                '</div>' +
						                '<div class="modal-footer">' +
						                    '<button type="button" class="btn btn-default" data-dismiss="modal" id="gb-confirm-btn1-{{index}}">取消</button>' +
						                    '<button type="button" class="btn btn-primary" data-dismiss="modal" id="gb-confirm-btn2-{{index}}">确定</button>' +
						                '</div>' +
						           '</div>' +
						        '</div>' +
						    '</div>';
				_html = _html.replace(/{{index}}/g, that.index);
				
				$(_html).appendTo('body');
				// 绑定确定函数
				if( typeof(call1) === 'function' ) {
					$('#gb-confirm-btn2-' + that.index).click(call1);
				}
				// 绑定取消函数
				if( typeof(call2) === 'function' ) {
					$('#gb-confirm-btn1-' + that.index).click(call2);
				}
				return that.index++;
			},
			show: function(index, message) {
				index = index || 1;
				$('#gb-confirm-content-' + index).text(message || '是否确认执行该操作？');
				$('#gb-confirm-' + index).modal();
			},
			index: 1
		};


		/*
			loading
			@description 无按钮loading弹幕

			@init 初始化 loading.init();
			@call 显示 loading.show(message);
			@call 隐藏 loading.hide();

			@param {String} message 为提示内容
			@default '正在操作中…'
		*/
		var loading = {
			init: function() {
				var _html = '<div class="modal fade bs-example-modal-sm" id="gb-loading" tabindex="-1" role="dialog" aria-labelledby="mySmallModalLabel">' +
						        '<div class="modal-dialog modal-sm">' +
						            '<div class="modal-content">' +
						                '<div class="modal-body text-warning"><span class="fa fa-spinner fa-spin fa-fw"></span> <span id="gb-loading-text"></span></div>' +
						            '</div>' +
						        '</div>' +
						    '</div>';

				$(_html).appendTo('body');
			},
			show: function(message) {
				message = message || '正在操作中';
		   		$('#gb-loading-text').text(message);
	   			$('#gb-loading').modal('show');
			},
			hide: function() {
				$('#gb-loading').modal('hide');
			},
		};





		/*
			pagination 在页面需要生成到导航栏的位置插入 '<nav class="paging"  data-current="${pageNumber}" data-all="${maxPageNumber}"></nav>' 即可
			可在不同位置生成相互独立的导航栏
			@init pagination.init(selector, currentPage, allPages)
			@param {String} 需要填充的元素，'#paging', '.paging'
			@param {Number} or {Number string} 当前页码
			@param {Number} or {Number string} 所有页码
			@param {Boolean} isAutoReload 是否自动重载页码，默认为 true
			@default 优先值 传入的值 > 标签上的值（请确保为数字，否则将出错） > '.paging', 1, 1, true
		*/
		var pagination = {
			init: function(selector, cur, all, isAutoReload) {
				var that = this;
				var page = {};
				page.cur = parseInt(cur || $(selector).attr('data-current') || 1, 10);
				page.all = parseInt(all || $(selector).attr('data-all') || 1, 10);
				isAutoReload = isAutoReload === false ? false : true;
				if(page.all == 0) {
					page.all = 1;
				}
				// var _html = '<p class="pageAcount">共 <a href="javascript:;" class="page-btn lastPage jump-page" title="跳到最后页">{{all}}</a> 页</p>' +
				var _html = '<ul class="pagination pagination-sm">' +
					            '<li id="prevPage-{{index}}">' +
					                '<a href="javascript:;" aria-label="Previous" class="page-btn">' +
					                    '<span aria-hidden="true">&laquo;</span>' +
					                '</a>' +
					            '</li>' +
					            '<li id="nextPage-{{index}}">' +
					                '<a href="#" aria-label="Next" class="page-btn">' +
					                    '<span aria-hidden="true">&raquo;</span>' +
					                '</a>' +
					            '</li>' +
					        '</ul>';
				_html = _html.replace(/{{current}}/g, page.cur)
							 .replace(/{{all}}/g, page.all)
							 .replace(/{{index}}/g, that.index);
				$(_html).appendTo($(selector));
				// 刷新页码
				updatePage(that.index++, page.cur, page.all);

				// 自动重载页码，自动调用`.reload()`方法，异步时使用
				if ( isAutoReload ) {

					var _clickTimeSpace = 300
						_clickable = true;

					$(selector).on('click', '.page-btn', function(e) {

						// 防止点击过于频繁，导致浏览器锁死
						if ( _clickable ) {
							// 重载
							that.reload(selector, $(this).attr('href'));

							_clickable = false;

							setTimeout(function() {
								_clickable = true;
							}, _clickTimeSpace);

						}

						e.preventDefault();
					});
				}
			},
			reload: function(selector, cur, all) {
				// 避免出错
				if(cur == '#') {
					return false;
				}
				$(selector).empty();
				this.init(selector, cur, all);
			},
			index: 1,
			addChangeListener: function(selector, callback) {
				$(selector).on('click', '.page-btn', function(e) {
					callback($(this).attr('href'), e);
					e.preventDefault();
				});
			}
		};

		// 页码更新
		function updatePage(index, cur, all) {
			var curPage = parseInt(cur) || 1,
				allPage = parseInt(all) || 1,
				page_tpl = '<li class="pageNum {{isActive}}"><a href="{{page}}" class="page-btn jump-page">{{page}}</a></li>',
				pageHtml = '',
				pageArray = calPage(curPage, allPage);
			
			// 修改上一页下一页指向
			if(curPage == 1) {
				$('#prevPage-' + index).addClass('disabled').children().attr('href', '#');
			} else {
				$('#prevPage-' + index).children().attr('href', curPage - 1);
			}
			if(curPage == allPage) {
				$('#nextPage-' + index).addClass('disabled').children().attr('href', '#');
			} else {
				$('#nextPage-' + index).children().attr('href', curPage + 1);
			}

			for(var i = 0, len = pageArray.length; i < len; i++) {
				var _page = page_tpl,
					_isActive = curPage == pageArray[i] ? 'active' : '';
				_page = _page.replace(/{{isActive}}/, _isActive)
							 .replace(/{{page}}/g, pageArray[i]);
				pageHtml += _page;			 
			}
			$('#nextPage-' + index).before($(pageHtml));
		}
		// 计算当前页码块，返回页码数组
		function calPage(curPage, allPage) {
			curPage = parseInt(curPage);
			allPage = parseInt(allPage);
			var pageArray = [],
				pageCount = 10;
			if(allPage < pageCount) {
				for(var i = 1; i <= allPage; i++) {
					pageArray.push(i);
				}	
				return pageArray;
			}
			// 如果当前页等于最后一页，则往前生成10页
			if(curPage == allPage) {
				for(var i = allPage - pageCount + 1; i <= allPage; i++) {
					pageArray.push(i);
				}
				return pageArray;
			}

			var pageSection = Math.floor(curPage / pageCount), //当前页码区间
				pageIndex = curPage % pageCount; // 当前页下标
			// 如果当前页为10，20，30等尾数页，则往后偏移8页，不足则前面页码补齐	
			if(pageIndex == 0) {
				var objLastPage = curPage + pageCount - 2,
					lastPage = objLastPage > allPage ? allPage : objLastPage;
				for(var i = lastPage; i >= curPage; i--) {
					// 将当前页后八页页码以及当前页页码倒序推入数组
					pageArray.push(i);
				}
				var prevPage = objLastPage - lastPage + 1; //若上一步生成页码不足9页则补全
				for(var i = 1; i <= prevPage; i++) {
					pageArray.push(curPage - i);
				}
				pageArray = pageArray.reverse(); //原数组为倒序
				return pageArray;
			}

			// 如果当前页尾数为9，前+8 ① 后+1
			if(pageIndex == 9) {
				for(var j = curPage - 8; j <= curPage + 1; j++) {
					pageArray.push(j);
				}
				return pageArray;
			}

			// 如果当前页尾数为8，前+7 ① 后+2
			if(pageIndex == 8) {
				if(allPage - curPage < 2) {
					for(var j = curPage - 8; j <= curPage + 1; j++) {
						pageArray.push(j);
					}
					return pageArray;
				}
				for(var j = curPage - 7; j <= curPage + 2; j++) {
					pageArray.push(j);
				}
				return pageArray;
			}
			// 其他情况下，从当前区间第一位的前一位开始生成10页
			var firstPage = pageSection * pageCount - 1;

			firstPage = firstPage > 0 ? firstPage : 1;
			var lastNum = firstPage + 9;
			for(var i = 0; i < 10; i++) {
				if(lastNum > allPage) {
					lastNum--;
				}
			}
			for(var i = 0; i < 10 ; i++, lastNum--) {
				pageArray.push(lastNum);
			}
			pageArray.reverse();
			return pageArray;
		}






		/*
			@description 传入一个JSON字符串或对象，返回一个对象
			@param {String} or {Object} 传入一个JSON字符串或对象
			@return {Object} 返回一个对象
		*/
		function parseJSON(data) {

			// 为空
			if( !data ) {
				return {};
			}

			if(typeof(data) == 'object') {
				return data;
			}

			var obj;
			try {
				obj = JSON.parse(data);
			} catch(e) {
				obj = {};
			}

			return obj;

		};



		/*
			对Date的扩展，将 Date 转化为指定格式的String
			月(M)、日(D)、小时(h)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符， 
			年(Y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字) 
			例子： 
			dateFormat(Date, "YYYY-MM-D") ==> 2006-07-02
			dateFormat(Date, "YYYY-MM-D hh:mm") ==> 2006-07-02 08:09
			dateFormat(Date, "YYYY-M-D h:m:s.S") ==> 2006-7-2 8:9:4.18 
			dateFormat(Date, "YYYY-MM-D hh:mm:ss.S") ==> 2006-07-02 08:09:04.423 
		*/
		function dateFormat(dateString, fmt) {

			// let _Date = new Date(dateString);
			var _Date = new Date(dateString);
		    var o = {
		        "M+": _Date.getMonth() + 1, //月份 
		        "D+": _Date.getDate(), //日 
		        "h+": _Date.getHours(), //小时 
		        "m+": _Date.getMinutes(), //分 
		        "s+": _Date.getSeconds(), //秒 
		        "q+": Math.floor((_Date.getMonth() + 3) / 3), //季度 
		        "S": _Date.getMilliseconds() //毫秒 
		    };
		    if (/(Y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (_Date.getFullYear() + "").substr(4 - RegExp.$1.length));
		    for (var k in o)
		    if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
		    
		    return fmt;
		}


		var table = {
			noRecord: function(text) {
				var tr_tpl = '<tr><td class="no-record" colSpan="20">{{text}}</td></tr>'
				text = text ? text : '暂无记录';
				return $( tr_tpl.replace(/{{text}}/, text) );
			},
			loading: function(text) {
				var tr_tpl = '<tr><td class="td-loading" colSpan="20">{{text}}</td></tr>'
				text = text ? text : '数据加载中...';
				return $( tr_tpl.replace(/{{text}}/, text) );
			},

		};

		return {
			modal: {
				tip: tip,
				tip_small: tip_small,
				confirm: Confirm,
				loading: loading,
			},
			pagination: pagination,
			parseJSON: parseJSON,
			dateFormat: dateFormat,
			table: table,
		}
	}

	gb = GlobalModule();

	//给滚动条的子元素 就是绿色部分加个类 方便修改样式 因为经理说 太小了 加大三倍！
	setTimeout(function () {
		$('.nicescroll-rails').children().addClass('bigWidth');
	},0);
})();



 