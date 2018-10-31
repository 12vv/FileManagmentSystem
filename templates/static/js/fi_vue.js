$(function() {

    // 获取session
    var session= $("#hdnSession").data('value');
    console.log("user:" + session);

    var infos = new Vue({
        el: '#info',
        data: {
            info_items: [],
            // info_items: [{
            //     name: '【地方】江西：示范带动126亿元智能制造项目投资',
            //     owner: 'jack',
            //     time: '2017-12-11',
            //     lock: 'lock',
            // },   {
            //     name: '【地方】江西：示范带动126亿元智能制造项目投资',
            //     owner: 'jack',
            //     time: '2017-12-11',
            //     lock: 'lock',
            // }],
        },
        methods: {
            //获取当前目录下所有文件及文件夹
            getFile: function (dir_name) {
                this.info_items = [];
                var that = this;
                $.ajax({
                    url: 'getFile',
                    type: 'get',
                    data: {
                        dir: dir_name
                    },
                    //dataType: 'json',
                    success: function(data) {
                        // console.log(str);
                        // var data = $.parseJSON(str);
                        console.log(data);
                        if (data.result == "success") {
                            var f = data.message;
                            var obj_folder = $.parseJSON(f.folders);
                            var obj_file = $.parseJSON(f.files);
                            console.log(obj_folder);
                            for (var i = 0; i < obj_folder.length; i++) {
                                that.info_items.push(obj_folder[i].fields);
                            }
                            for (var i = 0; i < obj_file.length; i++) {
                                that.info_items.push(obj_file[i].fields);
                            }
                            console.log(that.info_items);
                        }
                    },
                    error: function() {
                        console.log("Opps4!");
                    }
                })
            }
        },

    })

    //加载完成页面执行
    infos.getFile("Dashboard");
})