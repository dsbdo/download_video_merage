
const http = require('http');
const fs = require('fs');//引入文件读取模块
const cheerio = require('cheerio');
const path = require('path');
const downLoadFile = require('./comm.js');
const info_url = 'http://www.cutv.com/v2/shantou/a/a/b/';
const k_video_type = 'shantou';
let g_video_info_arr =[];
const k_video_folder = path.resolve(__dirname,"./../public/videos/");
function downloadWebPage() {
    console.log('downLoadVideoAuto call after ');
    console.log('unlinkFile call');
    var req = http.get(info_url, (res) => {
        var html = '';
        res.on('data', (data) => {
            html += data;
        });
        res.on('end', () => {
            getVideoInfo(html);
        })
    })
    req.on('error', () => {
        console.log('get data ERROR')
    });
    req.end();
}
function getVideoInfo(html) {
        //在这里处理html文件,并更新index.html的内容
        updateIndexHtml(filterChapters(html));
        console.log('downLoadVideoAutoHelp call');
        var $ = cheerio.load(html);
        var video_info = [];
        var counter = -1;
        var video_id = 1;
        var li_length = $('.jplm_list').eq(0).find('li').length;
        var swf_urls = [];
        /**
         * {
         *      video_url:
         *      video_time:
         *      video_type:
         * }
         * 
         */
        for (let i = 0; i < li_length; i++) {
            swf_urls.push($('.jplm_list li').eq(i).find('a').eq(0).attr('href'));
        }
        getDownLoadUrl(swf_urls);
}

function getDownLoadUrl(urls) {
    var video_urls = [];
    console.log(urls.length);
    console.log('need download urls is: ');
    console.log(urls);
    urls.forEach(url => {

        let http_url_download = {
            head: '', date: '', area: '', id: ''
        }
        let date_re = new RegExp('[0-9]{4}-[0-9]{1,2}-[0-9]{1}', 'g');
        let date_re_second = new RegExp('[0-9]{4}-[0-9]{1,2}-[0-9]{2}', 'g');
        let date = '';
        if (url.match(date_re_second) == null) {
            //是单天的
            date = url.match(date_re)[0];
        }
        else {
            date = url.match(date_re_second)[0];
        }
        //修改成标准时间
        if (date[6] == '-') {
            date = date.substr(0, 5) + '0' + date.substr(5);
        }
        //  console.log(date);
        if (date.length < 10) {
            date = date.substr(0, 8) + '0' + date.substr(8);
        }
        let local_video_time = date; 
        let it = new RegExp('-', 'g');

        date = date.replace(it, '/');
        http_url_download.head = 'http://videofile1.cutv.com/originfileg/010061_t/';
        http_url_download.date = date + '/';
        //date 现在时标准时间
        let http_path = url.split('/');

        http_url_download.area = http_path[5].substr(0, 3) + '/';
        http_url_download.id = http_path[5].split('.')[0] + '_cug.mp4';

        let video_info = {
            video_url:http_url_download.head + http_url_download.date + http_url_download.area + http_url_download.id,
            video_time:local_video_time,
            video_type:k_video_type
        }
        g_video_info_arr.push(video_info);
    });
    console.log(g_video_info_arr);
    console.log('downloadFile() call')
    console.log(g_video_info_arr);
    downLoadFile(g_video_info_arr);
}

function updateIndexHtml(video_info) {
    let test_html_file_path = path.resolve(__dirname,"./../views/test.ejs");
    console.log( test_html_file_path);
    var data = fs.readFileSync(test_html_file_path, "utf-8");
    var $ = cheerio.load(data);
    //index.html 处理方式
    //第一，刚打开时显示最新一天的新闻链接
    //也就是video_info第一条记录
    //只播放当天的就好了
    let date = new Date();
    let date_str = date.getFullYear() + '-' + (date.getMonth().length == 2 ? date.getMonth() : ('0' + date.getMonth())) + '-' + date.getDate();
    $('#video_display_area').attr('src', video_info[0].href);
    //十个li进行修改
    var time_re = new RegExp('([0-9]{4}-[0-9]{2}-[0-9]{2})', 'g');
    var time_re_second = new RegExp('[0-9]{4}/[0-9]{1,2}/.*');
    console.log(video_info);
    //第一步更新汕头今日视线内容
    $('#video_list_area li').eq(0).find('a').eq(0).attr('href', video_info[0].href);
    $('#video_list_area li').eq(0).find('img').eq(0).attr('src', video_info[0].img);
    if (video_info[0].title.match(time_re) != null) {
        //可以成功匹配
        $('#video_list_area li').eq(0).find('.video-info').eq(0).find('.video-title').eq(0).find('a').eq(0).text(video_info[0].title.replace(time_re, ''));
    }
    else {
        $('#video_list_area li').eq(0).find('.video-info').eq(0).find('.video-title').eq(0).find('a').eq(0).text(video_info[0].title.replace(time_re_second, ''));
    }

    $('#video_list_area li').eq(0).find('.video-info').eq(0).find('.video-title').eq(0).find('a').eq(0).attr('href', video_info[0].href);
    $('#video_list_area li').eq(0).find('.video-info').eq(0).find('.video-time').eq(0).text(video_info[0].time);
    let w_data = new Buffer($.html());
    let index_html_file_path = path.resolve(__dirname, "./../views/index.ejs");
    console.log(index_html_file_path);
    fs.writeFileSync(test_html_file_path, w_data);
    fs.writeFileSync(index_html_file_path, w_data);
}

//获取网页的相关信息
function filterChapters(html) {
    var $ = cheerio.load(html);
    var video_info = [];
    var counter = -1;
    var video_id = 1;
    var li_length = $('.jplm_list').eq(0).find('li').length;
    var swf_urls = [];
    for (let i = 0; i < li_length; i++) {
        swf_urls.push($('.jplm_list li').eq(i).find('a').eq(0).attr('href'));
        let video_info_child = {
            title: $('.jplm_list li').eq(i).find('img').eq(0).attr('title'),
            href: '/videos/' + k_video_type +'/'+ $('.jplm_list li').eq(i).find('span').eq(0).text() +'-'+k_video_type+ '-all.mp4',
            time: $('.jplm_list li').eq(i).find('span').eq(0).text(),
            img: $('.jplm_list li').eq(i).find('img').eq(0).attr('src')
        };
        let flag = false;
        for (let j = 0; j < video_info.length; j++) {
            if (video_info_child.time == video_info[j].time) {
                flag = true;
            }
        }
        if (!flag) {
            video_info.push(video_info_child);
        }
    }

    //获取视频信息
    console.log(video_info);
    return video_info;
}


function program() {
    downloadWebPage();
    //updateIndexHtml();
}
module.exports = program;