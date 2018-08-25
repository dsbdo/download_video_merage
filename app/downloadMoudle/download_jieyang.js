const fs = require('fs');
const http = require('http');
const cheerio = require('cheerio');
const path = require('path');
const downLoadFile = require('./comm.js');
const info_url = 'http://www.jyrtv.tv/xw/index.shtml';
const k_video_type = "jieyang";
let g_video_info_arr = [];
const k_video_folder = path.resolve(__dirname,"./../public/videos/");
const k_video_request_folder = "/public/videos/jieyang/";
//下载info_url 信息并进行解析，在这里一并将index.ejs 进行更新
function downloadWebPage() {
    let req_2 = http.get(info_url, (res) => {
        let html_2 = '';
        res.on('data', (data) => {
            html_2 += data;
        });
        res.on('end', () => {
            //这里还需要再处理一下，再爬取另外一个页面
            //在这里获取当天的八个视频
            // console.log(html_2);
            let $ = cheerio.load(html_2);
            let jieyang_video_urls = [];

            let video_ul = $('.newvideo').eq(1).find('li');
            for (let i = 0; i < video_ul.length; i++) {

                let url_info = {
                    video_url: info_url.substr(0, 20) + video_ul.eq(i).find('a').eq(0).attr('href').substr(3),
                    image_url: info_url.substr(0, 20) + video_ul.eq(i).find('a').eq(0).find('img').attr('src').substr(3),
                    title: video_ul.eq(i).find('a').eq(0).find('img').attr('title'),
                    time: ''
                }
                // console.log(url_info);
                jieyang_video_urls.push(url_info);
            }
            console.log("揭阳民生热线 download web: ");
            console.log(jieyang_video_urls);
            getVideoInfo(jieyang_video_urls);
        });
    });
    req_2.end();
}

//因为直接派取那张网页还没有办法拿到视频地址，所以得再爬一次
//要形成的结构数组如下：
/*
{
    video_url:
    video_time:
    video_type:
}
 */
function getVideoInfo(video_image_info_arr) {
    console.log(" 揭阳民生热线新闻视频加载");
    // {
    //     video_url:
    //     imege_url:
    //     title:
    //     time:
    // }
    //let video_info_array = video_image_info_arr;
    let promise_array = [];
    for (let i = 0; i < video_image_info_arr.length; i++) {
        let promise = new Promise(function (resolve, reject) {
            setTimeout(function () {
                // console.log("settimeout", i);
                let req = http.get(video_image_info_arr[i].video_url, (res) => {
                    let html = '';
                    res.on('data', (data) => {
                        html += data;
                    });
                    res.on('end', () => {
                        //console.log(html);
                        let $ = cheerio.load(html);
                        let text = $('.detail_content').eq(0).find('script').eq(0).html();
                        let re = new RegExp('\"video:\/\/vid:.*\"');
                        let temp_url = re.exec(text);
                        let date_string = temp_url[0].split(',')[2].substring(1, temp_url[0].split(',')[2].length - 1).replace(/-/g, '/');
                        let local_video_url = 'http://jygbdst.video.sobeycache.com/jygbdst/vod/' + date_string + '/' + temp_url[0].split(',')[0].substring(13, temp_url[0].split(',')[0].length - 1) + '/' + temp_url[0].split(',')[0].substring(13, temp_url[0].split(',')[0].length - 1) + '_h264_1000k_mp4.mp4';
                        let video_info = {
                            video_url: local_video_url,
                            video_time: temp_url[0].split(',')[2].substring(1, temp_url[0].split(',')[2].length - 1),
                            video_type: k_video_type
                        }
                        video_image_info_arr[i].time = video_info.video_time;
                        console.log
                        g_video_info_arr.push(video_info);
                        resolve();
                    })

                });
            }, 1000 * i);
        });
        promise_array.push(promise);
    }

    Promise.all(promise_array).then(function () {
        console.log("all ok");
        console.log(video_image_info_arr);
        //更新
        updateIndexHtml(video_image_info_arr);
        //download_able_video_urls 涵盖了所有视频url
        //console.log(video_info_array);
        //调用下载程序
        downLoadFile(g_video_info_arr);
    })
}

function updateIndexHtml(jieyang_video_info) {
    //console.log("update index html");
    //console.log(jieyang_video_info);
    let test_html_file_path = path.resolve(__dirname, "./../views/test.ejs");
    var data = fs.readFileSync(test_html_file_path, "utf-8");
   // console.log(data);
    var $ = cheerio.load(data);
    //index.html 处理方式
    //第一，刚打开时显示最新一天的新闻链接
    //也就是video_info第一条记录
    //只播放当天的就好了
    let date = new Date();
    let date_str = date.getFullYear() + '-' + (date.getMonth().length == 2 ? date.getMonth() : ('0' + (date.getMonth()+1))) + '-' + date.getDate();
    var time_re = new RegExp('([0-9]{4}-[0-9]{2}-[0-9]{2})', 'g');
    var time_re_second = new RegExp('[0-9]{4}/[0-9]{1,2}/.*');
    //console.log(jieyang_video_info);

    //console.log('民生热线 index html')
    $('#video_list_area li').eq(1).find('a').eq(0).attr('href', k_video_request_folder + jieyang_video_info[0].time + '-jieyang-all.mp4');
    $('#video_list_area li').eq(1).find('img').eq(0).attr('src', jieyang_video_info[0].image_url);

    //可以成功匹配
    $('#video_list_area li').eq(1).find('.video-info').eq(0).find('.video-title').eq(0).find('a').eq(0).text(jieyang_video_info[0].title);


    $('#video_list_area li').eq(1).find('.video-info').eq(0).find('.video-title').eq(0).find('a').eq(0).attr('href', k_video_request_folder + jieyang_video_info[0].time + '-jieyang-all.mp4');
    $('#video_list_area li').eq(1).find('.video-info').eq(0).find('.video-time').eq(0).text(jieyang_video_info[0].time);
    //console.log("更新之后的html页面");
   // console.log($.html());
    var w_data = new Buffer($.html());
    let index_html_file_path = path.resolve(__dirname, "./../views/index.ejs");
   // console.log(index_html_file_path);
   fs.writeFileSync(test_html_file_path , w_data);
    fs.writeFileSync(index_html_file_path , w_data);
}
function program() {
    //downloadWebPage --> getVideoInfo --> downLoadFile();
    downloadWebPage();
}
module.exports = program;