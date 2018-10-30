$(document).ready(function() {
    // 获取session
    var session= $("#hdnSession").data('value');
    console.log("user:" + session);

    //控件初始化
    gb.modal.tip.init();
    gb.modal.tip_small.init();
    gb.pagination.init('#paging1', 1, 4);
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

    $("#upload").click(function (e) {
        console.log("正式上传！");
        var dir = $('.dir').children("li:last-child").text(); //当前目录
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
                    // var mydate = new Date();
                    // var date = mydate.toLocaleDateString();
                    $('#myModal').modal('hide');
                    gb.modal.tip_small.show('上传成功', 'success');
                    //直接在页面显示
                    $('#info').prepend("<tr><td class=\"center \"><span class=\"pull-left chk\"><input type=\"checkbox\"/></span></td><td><i class=\"fa\"></i>"+detail.name+"</td>\n" +
                        "<td>"+session+"</td>\n" +
                        "<td>"+detail.time+"</td>\n" +
                        "<td>"+detail.type+"</td>\n" +
                        "<td>"+detail.size+"</td>\n" +
                        "<td>A</td></tr>");
                    if(detail.type == 'jpg'){
                        $("#info").children("tr:first-child").find("i").addClass("fa-file-o");
                    }else{
                        console.log("不是图片啊");
                    }
                }else{
                    console.log("oh...");
                }
            }
        });
    })

    $(".edit").click(function (e) {
        console.log("edit!");
        $('#myModal_edit').modal();
    })

    $("#edit").click(function (e) {
        console.log($('.ed_text').val());
    })

    $('.new_file').click(function (e) {
        console.log("新建文件夹");
        $('#myModal_new').modal();
    })

    $('#new_file').click(function (e) {
        var file_name = $('#input_name').val();
        console.log("成功创建文件夹" + file_name);
        var dir = $('.dir').children("li:last-child").text();
        console.log(dir);
        var mydate = new Date();
        var date = mydate.toLocaleDateString();
        //创建文件夹请求
        // $.ajax({
        //     url: 'newFolder',
        //     type: 'post',
        //     data: {
        //         name: file_name,
        //         parent_dir: dir,
        //         date: date,
        //         owner: session,
        //         type: 'folder',
        //     },
        //     success: function(e){
        //         console.log(e);
        //         // $('#myModal').modal('hide');
        //         // gb.modal.tip_small.show('上传成功', 'success');
        //         //直接在页面显示
        //         // $('#info').prepend("")
        //     }
        // });

        //成功插入数据库后执行
        $('#myModal_new').modal('hide');
        $('#info').prepend("<tr><td class=\"center \"><span class=\"pull-left chk\"><input type=\"checkbox\"/></span></td><td><i class=\"fa fa-folder-o\"></i>"+file_name+"</td>\n" +
            "<td>"+session+"</td>\n" +
            "<td>"+date+"</td>\n" +
            "<td>"+'folder'+"</td>\n" +
            "<td>A</td>\n" +
            "<td>A</td></tr>");
    })
});