$(document).ready(function() {
    // 获取session
    var session= $("#hdnSession").data('value');
    console.log("user:" + session);

    $(".file_mau").on("click","li",function(event){
        $(this).addClass('active');
        $(this).siblings().removeClass('active');
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
});