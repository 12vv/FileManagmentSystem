$(document).ready(function() {
    // 获取session
    var userId= $("#hdnSession").data('value1');
    var userName = $("#hdnSession").data('value2');
    console.log("user:" + userId);

    //控件初始化
    gb.modal.tip.init();
    gb.modal.tip_small.init();
    gb.pagination.init('#paging1', 1, 1);

    // TreeView.init()

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


    //渐变显示??
    // var $container = $('#gallery');
    //     $container.isotope({
    //         itemSelector: '.item',
    //         animationOptions: {
    //             duration: 750,
    //             easing: 'linear',
    //             queue: false
    //         }
    //     });

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


});

