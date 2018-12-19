$(function() {

    //全局变量粘贴板
    tempo = {"id": -1, "type": "none", "name": "none", "size": "0"};

    //全局目录设定
    setting = {
			view: {
				// addHoverDom: addHoverDom,
				// removeHoverDom: removeHoverDom,
				selectedMulti: false,
			},
			edit: {
				enable: true,
				editNameSelectAll: true,
				// showRemoveBtn: showRemoveBtn,
				// showRenameBtn: showRenameBtn
			},
			data: {
				simpleData: {
					enable: true
				}
			},
			callback: {
				// beforeDrag: beforeDrag,
				// beforeEditName: beforeEditName,
				// beforeRemove: beforeRemove,
				// beforeRename: beforeRename,
				// onRemove: onRemove,
				// onRename: onRename
			},

		};

    // 获取session
    userId= $("#hdnSession").data('value1');
    var userName = $("#hdnSession").data('value2');
    userLevel = $("#hdnSession").data('value3');
    console.log("user:" + userId);

    var base_url = 'http://127.0.0.1:8000/';

    var user_url = 'media/' + userId + '/'

    //加载完成页面执行
    infos.getFile(userId);
    disk.getVolume();

    //联系人
    $("#contacts").on("click","li",function(event){
        var toName = $(this).find('.name').text().trim();
        console.log(toName);
        gb.modal.tip_small.show('分享给  '+toName, 'success');
    })

    //点击目录执行
    $('.row').on('click','li',function (e) {
        //trim()方法去掉空格
        var dir = $(this).text().trim();
        var dir_id = $(this).attr("id");
        console.log(dir_id);
        infos.getFile(dir_id);
    })
    //点击了文件或文件夹
    $('#info').on('click','tr',function (e) {
        $(".review img").remove();
        //判断是否点击选择框
        if (e.target.type == 'checkbox'){
            console.log("choose or not!");
        }else{
                var id = $(this).attr("id");
                var type = $(this).children('td').eq(4).text();
                var name = $(this).children('td').eq(1).text();
                var mode = $(this).children('td').eq(6).text();
                var authorId = $(this).children('td').eq(2).attr("id");
                if (type == "folder"){
                    console.log("点击了文件：" + id);
                    $('.row .dir').append("<li id="+id+"><a href=\"#\">"+ name +"</a></li>");
                    infos.getFile(id);
                }else if(type == "txt"){
                    $(".ed_re").text("编辑文件");
                    $(".editor").attr("id", id);
                    console.log("文件的id：" + id);
                    $("#edit").show();
                    $.get('media/' + authorId + '/' + name +'.txt',{},function(res){
                        $(".editor textarea").val(res);
                        $(".editor input").val(name);
                        if(mode == "R"){
                            $(".editor textarea").attr("disable", true);
                            $(".editor input").attr("disable", true);
                        }else{
                            $(".editor textarea").attr("disabled", false);
                            $(".editor input").attr("disabled", false);
                        }
                        $(".editor").show();
                        $('#myModal_edit').modal();
                    });
                }else{
                     $(".editor").hide();
                     $("#edit").hide();
                    var url = base_url + 'media/' + authorId + '/' + name + "." + type;
                    console.log(url);
                    $(".review").append("<img class=\"inimg\" src=\""+ url +"\">");
                    $(".ed_re").text(name + "." + type);
                    $('#myModal_edit').modal();
                }
        }
    })
    //全选和
    $(".seleteAll").click(function () {
        $('#info tr').each(function (e) {
            if($(this).find("input")[0].checked==false){
                $(this).find("input")[0].checked=true;
            }else{
                $(this).find("input")[0].checked=false;
            }
        })
    })

        //删除文件
    $(".delete").click(function (e) {
        // 需要删除的文件或文件夹
        var d_list1 = [];
        var d_list2 = [];
        $('#info tr').each(function (e) {
            if($(this).find("input")[0].checked==true){
                if($(this).find(".type").text()=="folder"){
                    d_list1.push($(this).attr("id"));
                }else{
                    d_list2.push($(this).attr("id"));
                }
            }
        })
        console.log(d_list1);
        //删除文件请求
        $.ajax({
            url: 'delete',
            type: 'post',
            data: {
                // 不加上 JSON.stringify 的话后端取到的值为空
                folderList:  JSON.stringify(d_list1),
                fileList: JSON.stringify(d_list2),
            },
            success: function(data){
                var dir = $('.dir').children("li:last-child").attr("id");
                infos.getFile(dir);
                disk.getVolume();
            },
        });
    })

        $('#new_file').click(function (e) {
        var file_name = $('#input_name').val();
        //遍历查看当前目录下是否有重名
        var flag = 0;
        var titles = $("#info").find(".title");
        var type = $("#info").find(".type");
        for (var i = 0; i < titles.length; i++){
            if (titles[i].innerText == file_name && type[i].innerText == "folder") {
                gb.modal.tip_small.show('已存在此文件夹', 'error');
                flag = 1;
                break;
            }
        }
        if (flag == 0){
            console.log("成功创建文件夹: " + file_name);
            var dir_name = $('.dir').children("li:last-child").text().trim();
            var dir = $('.dir').children("li:last-child").attr("id");
            console.log(dir);
            var mydate = new Date();
            var date = mydate.toLocaleDateString();
            //创建文件夹请求
            $.ajax({
                url: 'newFolder',
                type: 'post',
                data: {
                    name: file_name,
                    parent_dir: dir,
                    date: date,
                    owner: userId,
                    type: 'folder',
                },
                success: function(data){
                    console.log(data);
                    if (data.result == 'success'){
                        gb.modal.tip_small.show('上传成功', 'success');
                        //成功插入数据库后执行
                        $('#myModal_new').modal('hide');
                        // var name = $('.row').find("ul:last-child").text().trim();
                        console.log(dir);
                        infos.getFile(dir);
                        disk.getVolume();
                    }else{
                        console.log("无法上传！");
                        gb.modal.tip_small.show('无法上传', 'error');
                    }
                }
            });
        }
    })

        $("#upload").click(function (e) {
        console.log("正式上传！");
        var dir_name = $('.dir').children("li:last-child").text().trim(); //当前目录
        var dir = $('.dir').children("li:last-child").attr("id");
        console.log(dir);
        var data = new FormData();
        var file = document.getElementById("file").files[0];
        data.append('file', file);   // 获取文件放入FormData
        data.append('dir', dir);
        // 发送数据时没有任何区别
        console.log(data);
        $.ajax({
            url: 'upload',
            type: 'post',
            data: data,
            processData: false,   // 告诉jQuery不要处理数据
            contentType: false,   // 告诉jQuery不要设置类型
            success: function(data){
                console.log(data);
                if (data.result == 'success'){
                    var detail = data.detail;
                    console.log(detail);
                    $('#myModal').modal('hide');
                    gb.modal.tip_small.show('上传成功', 'success');
                    //直接在页面显示
                    var name = $('.dir').find("li:last-child").text().trim();
                    console.log(name);
                    infos.getFile(dir);
                    disk.getVolume();
                }else{
                    console.log("oh...");
                }
            }
        });
    })

    //编辑或新建文件
    $("#edit").click(function (e) {
        console.log($('.editor input').val());
        var title = $('.editor input').val();
        var content = $('.editor textarea').val();
        var id = $(".editor").attr("id");
        console.log($(".editor").attr("id"));
        //遍历查看当前目录下是否有重名
        var flag = 0;
        var titles = $("#info").find(".title");
        var type = $("#info").find(".type");
        for (var i = 0; i < titles.length; i++){
            if ($(".editor").attr("id") == 0 && titles[i].innerText == title && type[i].innerText == "txt") {
                gb.modal.tip_small.show('存在同名文件', 'error');
                flag = 1;
                break;
            }
        }
        if (flag == 0){
            console.log("创建文件: " + title);
            var dir_name = $('.dir').children("li:last-child").text().trim();
            var dir = $('.dir').children("li:last-child").attr("id");
            //创建文件夹请求
            $.ajax({
                url: 'newOrEdit',
                type: 'post',
                data: {
                    id: id,
                    name: title,
                    content: content,
                    dir: dir,
                    owner: userId,
                    type: 'txt',
                },
                success: function(data){
                    console.log(data);
                    if (data.result == 'success'){
                        gb.modal.tip_small.show(data.message, 'success');
                        //成功插入数据库后执行
                        $('#myModal_edit').modal("hide");
                        var name = $('.dir').children("li:last-child").text().trim();
                        console.log(name);
                        infos.getFile(dir);
                        disk.getVolume();
                    }else{
                        console.log("无法上传！");
                        gb.modal.tip_small.show('无法上传', 'error');
                    }
                }
            });
        }
    })


    //屏蔽浏览器右键菜单
    document.oncontextmenu = function(){
	    return false;
    }
        //右键点击
        $('#info').on('mousedown', 'tr', function (e) {
            var that = this;
            console.log(e.which);
            if(e.which == 3){
                $('.cus-menu').show();
                //获取右键点击坐标
		        var x = e.clientX;
		        var y = e.clientY;
		        $(".cus-menu").show().css({left:x,top:y});
            }

            $('.cus-menu').one('click', 'li', function (e) {
                console.log($(this).text());
                tempo["id"] = $(that).attr("id");
                tempo["type"] = $(that).children('td').eq(4).text();
                tempo["name"] = $(that).children('td').eq(1).text();
                tempo["size"] = $(that).children('td').eq(5).text();
                mode = $(that).children('td').eq(6).text();
                console.log(tempo);
                if($(this).text()=='重命名'){
                    if(mode != 'W'){
                        gb.modal.tip_small.show('SORRY, 你没有权限', 'error');
                    }else{
                        $('#myModal_rename').modal("show");
                        $('.renamee input').val(tempo["name"]);
                    }

                }
            })
        })


        //点击任意部位隐藏
        $(document).click(function(){
	        $(".cus-menu").hide();
        })

    //重命名提交
    $('#rename').click(function () {
            var newName = $('.renamee input').val();
            console.log("newName:"+newName+",oldName:"+tempo.name);
            //重命名请求
            $.ajax({
                url: 'rename',
                type: 'post',
                data: {
                    type: tempo.type,
                    id: tempo.id,
                    newName: newName,
                    name: tempo.name,
                },
                success: function(data){
                    console.log(data);
                    if (data.result == 'success'){
                        gb.modal.tip_small.show(data.message, 'success');
                        //成功插入数据库后执行
                        $('#myModal_rename').modal("hide");
                        var dir = $('.dir').children("li:last-child").attr("id");
                        infos.getFile(dir);
                        // disk.getVolume();  //重命名不改变文件大小
                    }else{
                        console.log("无法重命名！");
                        gb.modal.tip_small.show('无法重命名', 'error');
                    }
                }
            });
    })

        //粘贴
        $('.paste').click(function () {
            var dir = $('.dir').children("li:last-child").attr("id");
            //粘贴请求
            $.ajax({
                url: 'paste',
                type: 'post',
                data: {
                    type: tempo.type,
                    id: tempo.id,
                    dir: dir,
                    name: tempo.name,
                    size: tempo.size,
                },
                success: function(data){
                    console.log(data);
                    if (data.result == 'success'){
                        gb.modal.tip_small.show(data.message, 'success');
                        //成功插入数据库后执行
                        var dir = $('.dir').children("li:last-child").attr("id");
                        infos.getFile(dir);
                        disk.getVolume();
                    }else{
                        console.log("Something went wrong！");
                        gb.modal.tip_small.show('Something went wrong', 'error');
                    }
                }
            });
    })


    $('.allFiles').click(function (e) {
            cate.getType();
            cate.getFileByType("All");
    })

    $('#filters').on('click','li',function (e) {
        var type = $(this).text();
        cate.getFileByType(type);
    })

    //资源分类中点击
    $('#gallery').on('click','div',function (e) {
        $(".review img").remove();
        var id = $(this).attr("id");
        var type = $(this).attr("data-type");
        var name = $(this).attr("data-name");
        var mode = $(this).attr("data-mode");
        var authorId = $(this).attr("data-authorId");
        console.log(mode);
        if(type == "txt"){
            $(".ed_re").text("编辑文件");
            $(".editor").attr("id", id);
            console.log("文件的id：" + id);
            $("#edit").show();
            $.get('media/'+ authorId + '/' + name +'.txt',{},function(res){
                $(".editor textarea").val(res);
                $(".editor input").val(name);
                if(mode == "R"){
                    $(".editor textarea").attr("disable", true);
                    $(".editor input").attr("disable", true);
                }else{
                    $(".editor textarea").attr("disabled", false);
                    $(".editor input").attr("disabled", false);
                }
                $(".editor").show();
                $('#myModal_edit').modal();
            });
        }else{
            $(".editor").hide();
            $("#edit").hide();
            var url = base_url + 'media/' + authorId + '/' + name + "." + type;
            console.log(url);
            $(".review").append("<img class=\"inimg\" src=\""+ url +"\">");
            $(".ed_re").text(name + "." + type);
            $('#myModal_edit').modal();
        }
    })

    //回收站
    $('.recycle').click(function (e) {
        infos.getDeleted();
    })


    //目录
    getNode();

    //好友
    $('.contacts').click(function () {
        contacts.getFriend();
    })

    //通知
    $('.notification').click(function () {
        news.getnews();
    })

    //share
    $('.share').click(function () {
        console.log("dropdownmenu");
        $('.contacts').addClass('open');
        $('.dropdown-toggle').dropdown();
    })

    $('.contacts').on('click', 'li', function () {
        var shareTo = $(this).attr("id");
        console.log("shareTo:" + shareTo);
        // 需要分享的文件或文件夹
        var d_list1 = [];
        var d_list2 = [];
        $('#info tr').each(function (e) {
            if($(this).find("input")[0].checked==true){
                if($(this).find(".type").text()=="folder"){
                    d_list1.push($(this).attr("id"));
                }else{
                    d_list2.push($(this).attr("id"));
                }
            }
        })
        console.log(d_list1);
        //分享文件请求
        $.ajax({
            url: 'share',
            type: 'post',
            data: {
                shareTo: shareTo,
                // 不加上 JSON.stringify 的话后端取到的值为空
                folderList:  JSON.stringify(d_list1),
                fileList: JSON.stringify(d_list2),
            },
            success: function(data){
                gb.modal.tip_small.show('分享成功', 'success');
            },
        });
    })

})


    var infos = new Vue({
        el: '#info',
        data: {
            info_items: [],
        },
        methods: {
            //获取当前目录下所有文件及文件夹
            getFile: function (dir) {
                this.info_items = [];
                var that = this;
                $.ajax({
                    url: 'getFile',
                    type: 'get',
                    data: {
                        dir: dir
                    },
                    success: function(data) {
                        $('.datee').text('创建日期');
                        if (data.result == "success") {
                            var files = data.message.files;
                            var files_len = Object.keys(files).length;
                            var folders = data.message.folders;
                            var folders_len = Object.keys(folders).length;
                            for (var i = 0; i < folders_len; i++) {
                                that.info_items.push(folders[i]);
                            }
                            for (var i = 0; i < files_len; i++) {
                                that.info_items.push(files[i]);
                            }
                            console.log(that.info_items);
                        }else{
                            gb.modal.tip_small.show('此目录下没有文件', 'error');
                        }
                    },
                    error: function() {
                        console.log("Opps4!");
                    }
                })
            },
            //获取删除的文件和文件夹
            getDeleted: function (dir) {
                this.info_items = [];
                $('.datee').text('删除日期');
                var that = this;
                $.ajax({
                    url: 'getDeleted',
                    type: 'get',
                    data: {
                        // dir: dir
                    },
                    success: function(data) {
                        console.log(data);
                        if (data.result == "success") {
                            var files = data.message.files;
                            var files_len = Object.keys(files).length;
                            var folders = data.message.folders;
                            var folders_len = Object.keys(folders).length;
                            for (var i = 0; i < folders_len; i++) {
                                that.info_items.push(folders[i]);
                            }
                            for (var i = 0; i < files_len; i++) {
                                that.info_items.push(files[i]);
                            }
                            // console.log(that.info_items);
                        }else{
                            gb.modal.tip_small.show('没有文件', 'error');
                        }
                    },
                    error: function() {
                        console.log("Opps!");
                    }
                })
            },

        },
    })

//分类
    var cate = new Vue({
        el: '#allDisplay',
        data: {
            item: 'item',
            cate_items: [],
            files_items: [],
        },
        methods: {
            getType: function () {
                this.cate_items = [];
                var that = this;
                $.ajax({
                    url: 'getType',
                    type: 'get',
                    data: {},
                    success: function (data) {
                        console.log(data);
                        if (data.result == "success") {
                            var len = Object.keys(data.message).length;
                            for (var i = 0; i < len; i++) {
                                console.log(data.message[i]);
                                that.cate_items.push(data.message[i]);
                            }
                        }else{
                            gb.modal.tip_small.show('没有分类', 'error');
                        }
                    },
                    error: function() {
                        console.log("?????");
                    }
                })
            },
            getFileByType: function (type) {
                this.files_items = [];
                var that = this;
                $.ajax({
                    url: 'getFileByType',
                    type: 'get',
                    data: {
                        type: type,
                    },
                    success: function (data) {
                        console.log(data);
                        if (data.result == "success") {
                            var len = Object.keys(data.message).length;
                            for (var i = 0; i < len; i++) {
                                // console.log(data.message[i]);
                                that.files_items.push(data.message[i]);
                            }
                        }else{
                            gb.modal.tip_small.show('没有文件', 'error');
                        }
                    },
                    error: function() {
                        console.log("?????");
                    }
                })
            },
        }
    })

//磁盘
    var disk = new Vue({
        el: '#disk',
        data: {
            // cate_items: [],
            volume: 100000,
            used: 0,
            left: 100000,
            percent: 0,
        },
        methods: {
            getVolume: function () {
                var that = this;
                $.ajax({
                    url: 'getVolume',
                    type: 'get',
                    data: {},
                    success: function (data) {
                        console.log(data);
                        if (data.result == "success") {
                            var len = Object.keys(data.message).length;
                            console.log(len);
                            for (var i = 0; i < len; i++) {
                                if(data.message[i].id == userId){
                                    that.volume = data.message[i].volume;
                                    that.left = data.message[i].left;
                                    that.used = data.message[i].used;
                                    that.percent = Math.round(data.message[i].percent*100)+"%";
                                    console.log(that.percent)
                                }

                            }
                        }else{
                            gb.modal.tip_small.show('无法获取磁盘使用情况', 'error');
                        }
                    },
                    error: function() {
                        console.log("?????");
                    }
                })
            },
        }
    })


//好友
    var contacts = new Vue({
        el: '#contacts',
        data: {
            contact_items: [],
            count: 0,
        },
        methods: {
            getFriend: function () {
                var that = this;
                that.contact_items = [];
                $.ajax({
                    url: 'getFriend',
                    type: 'get',
                    data: {},
                    success: function (data) {
                        that.count = data.count;
                        console.log(data);
                        if (data.result == "success") {
                            var len = Object.keys(data.message).length;
                            for (var i = 0; i < len; i++) {
                                that.contact_items.push(data.message[i]);
                            }
                        }else{
                            gb.modal.tip_small.show('暂无好友', 'error');
                        }
                    },
                    error: function() {
                        console.log("?????");
                    }
                })
            },
        }
    })


//通知
    var news = new Vue({
        el: '#notification',
        data: {
            news_items: [],
            count: 0,
        },
        methods: {
            getnews: function () {
                var that = this;
                that.news_items = [];
                $.ajax({
                    url: 'getnews',
                    type: 'get',
                    data: {},
                    success: function (data) {
                        that.count = data.count;
                        console.log(data);
                        if (data.result == "success") {
                            var len = Object.keys(data.message).length;
                            for (var i = 0; i < len; i++) {
                                that.news_items.push(data.message[i]);
                            }
                        }else{
                            gb.modal.tip_small.show('暂无消息', 'error');
                        }
                    },
                    error: function() {
                        console.log("?????");
                    }
                })
            },
        }
    })


function getNode() {
    list = []
    $.ajax({
        url: 'getNode',
        type: 'get',
        data: {},
        success: function(data) {
            if (data.status == "OK") {
                var files = data.message.files;
                var files_len = Object.keys(files).length;
                var folders = data.message.folders;
                var folders_len = Object.keys(folders).length;
                for (var i = 0; i < folders_len; i++) {
                    item = {
                        id: folders[i]["id"],
                        pId: folders[i]["dir"],
                        name: folders[i]["name"],
                    }
                    list.push(item);
                }
                for (var i = 0; i < files_len; i++) {
                    item = {
                        id: files[i]["id"],
                        pId: files[i]["dir"],
                        name: files[i]["name"],
                    }
                    list.push(item);
                }
                console.log(list);

                var zNodes = list;
                //目录初始化
                zTreeObj = $.fn.zTree.init($("#treeDemo"), setting, zNodes);
                zTreeObj.expandAll(true);
            }else{
                gb.modal.tip_small.show('没有文件', 'error');
            }
        },
        error: function() {
            console.log("Opps4!");
        }
    })
}