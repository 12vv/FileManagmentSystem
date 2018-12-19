$(function() {
    // 获取session
    userId= $("#hdnSession").data('value1');
    var userName = $("#hdnSession").data('value2');
    userLevel = $("#hdnSession").data('value3');
    console.log("user:" + userId);

    //控件初始化
    gb.modal.tip.init();
    gb.modal.tip_small.init();
    gb.pagination.init('#paging1', 1, 1);

    var base_url = 'http://127.0.0.1:8000/';

    var user_url = 'media/' + userId + '/'

    //加载完成页面执行
    infos.getAllUser();


        // Toggle Left Menu
   $('.mulu').click(function() {
       if($('.left-side').css('width') == '0px'){
            $('.left-side').css('width', 240);
            $('.main-content').css('margin-left', 240);
       }else{
           $('.left-side').css('width', 0);
           $('.main-content').css('margin-left', 0);
       }
   });


    //上传文件
    var confirmId1 = gb.modal.confirm.init(function() {
        console.log("upload!");

	});

    $(".file_mau").on("mouseover","li",function(event){
        $(this).addClass('active');
        $(this).siblings().removeClass('active');
    })
    $(".file_mau").on("mouseleave","li",function(event){
        $(this).removeClass('active');
    })

    $('.row').on('click','li',function (e) {
        $(this).nextAll().remove();
    })


    $('.logout').click(function (e) {
        console.log("logout");
		$.ajax({
            url: 'logout',
            type: 'GET',
            data: {},
            success: function (data) {
                window.location = "/login";
            },
            error: function (e) {
                console.log(e)
            },
        })
    })

    $('.upload').click(function (e) {
        console.log("upload!");
        $('#myModal').modal();
    })


    $(".edit").click(function (e) {
        $('.editor').attr("id", 0);
        console.log("edit!");
        $(".review img").remove();
        $("#edit").show();
        $(".editor textarea").attr("disabled", false);
        $(".editor input").attr("disabled", false);
        $(".editor textarea").val("What is on your mind...");
        $(".ed_re").text("新建文件");
        $(".editor input").val("Title");
        $(".editor").show();
        $('#myModal_edit').modal();
    })



    $('.new_file').click(function (e) {
        console.log("新建文件夹");
        $('#myModal_new').modal();
    })

    $('.allFiles').click(function (e) {
        console.log("allimg");
        $('.files').hide();
        $('.filesDisplay').show();
        $('.home').siblings().remove();
    })

    $('.dir').click(function (e) {
        $('.files').show();
        $('.filesDisplay').hide();
    })

   ////////////////////////////////////////////////////////////////////////////////
        //点击目录执行
    $('.row').on('click','li',function (e) {
        //trim()方法去掉空格
        var dir = $(this).text().trim();
        var dir_id = $(this).attr("id");
        console.log(dir_id);
        if(dir_id=='-1'){
            infos.getAllUser();
        }else{
            infos.adminGetFile(dir_id);
        }

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
                    infos.adminGetFile(id);
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


    //发布消息
    $(".message").click(function () {
        $('#myModal_message').modal();
    })

    $("#mess").click(function () {
        var content = $(".mess textarea").val();
        console.log(content);
		$.ajax({
            url: 'adminMessage',
            type: 'POST',
            data: {
                content: content,
            },
            success: function (data) {
                $('#myModal_message').modal("hide");
                gb.modal.tip_small.show('发布系统消息成功', 'success');
            },
            error: function (e) {
                console.log(e)
            },
        })
    })

})

    var infos = new Vue({
        el: '#info',
        data: {
            info_items: [],
        },
        methods: {
            //获取当前目录下所有文件及文件夹
            adminGetFile: function (dir) {
                this.info_items = [];
                var that = this;
                $.ajax({
                    url: 'adminGetFile',
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
            getAllUser: function () {
                this.info_items = [];
                var that = this;
                $.ajax({
                    url: 'getAllUser',
                    type: 'get',
                    data: {},
                    success: function(data) {
                        if (data.result == "success") {
                            var len = Object.keys(data.message).length;
                            for (var i = 0; i < len; i++) {
                                that.info_items.push({
                                    "name" : data.message[i].name,
                                    "id" : data.message[i].id,
                                    "type" : "folder",
                                });
                            }
                        }else{
                            gb.modal.tip_small.show('error', 'error');
                        }
                    },
                    error: function() {
                        console.log("Opps4!");
                    }
                })
        },
        },
    })