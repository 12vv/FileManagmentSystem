$(function() {

    // 获取session
    var session= $("#hdnSession").data('value');
    console.log("user:" + session);

    var info = new Vue({
        el: '#info',
        data: {
            // info_items: [],
            info_items: [{
                name: '【地方】江西：示范带动126亿元智能制造项目投资',
                owner: 'jack',
                time: '2017-12-11',
                lock: 'lock',
            },   {
                name: '【地方】江西：示范带动126亿元智能制造项目投资',
                owner: 'jack',
                time: '2017-12-11',
                lock: 'lock',
            }],
        },
        method: {

        },

    })

})