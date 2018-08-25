//通用的便是下载函数，给定url直接下载合并即可，同时删除合并之后剩下的文件
const http = require('http');
const fs = require('fs');
const zlib = require('zlib');
const path = require('path');
const queryString = require('querystring');
const cheerio = require('cheerio');
const process = require('child_process');
const os = require('os');
//const cmd = require('node-cmd');
const k_video_folder = path.resolve(__dirname, "./../public/videos/");
console.log(k_video_folder);
//统一信息结构
/*{
    video_url: 
    video_time:
    video_type:"jieyang" | "shantou"
}*/
function downloadOneVideo(video_info) {
    console.log("download vidoe is: ", video_info);
    //计算当前是第几个下载的视频
    let file_date_re = new RegExp('[0-9]{4}-[0-9]{2}-[0-9]{2}-[0-9]{2,3}-' + video_info.video_type, 'g');
    let video_exit = fs.readdirSync(k_video_folder + '/' + video_info.video_type + '/');

    let counter = 0;
    console.log(k_video_folder + '/' + video_info.video_type + '/');
    console.log(video_exit);
    video_exit.forEach(el => {
        if (el.match(file_date_re) != null) {
            counter++;
        }
    });
    if (counter < 10) {
        counter = '0' + counter;
    }
    console.log(video_info.video_type, ' counter :', counter);
    let video_writer = fs.createWriteStream(k_video_folder + '/' + video_info.video_type + '/' + video_info.video_time + '-' + counter + '-' + video_info.video_type + '.mp4');
    let req = http.get(video_info.video_url, function (res) {
        res.pipe(video_writer);
    }).on('error', (error) => {
        console.log('error: ' + error.code);
    })
}

function videoMerage() {
    let os_type = os.type();
    //列出需要的合并的文件列表
    //这里读出文件夹
    let video_folder_exit = fs.readdirSync(k_video_folder);
    for (let i = 0; i < video_folder_exit.length; i++) {
        //读出一个地区的新闻文件夹
        let video_folder_channel = fs.readdirSync(k_video_folder + '/' + video_folder_exit[i] + '/');
        let date_re = new RegExp('[0-9]{4}-[0-9]{2}-[0-9]{2}');
        console.log(video_folder_exit[i]);
        //console.log(date_re);

        //可能同时有多天的视频,这是一个对象数组，
        //记录形式为{
        //    date: '', videos[]
        //}
        //有几种形式的新闻，这里通过参数video_types_arr 来说明， ['jieyang', 'shantou'];
        let merage_videos = [];
        let date = '';
        console.log(video_folder_channel);
        video_folder_channel.forEach(item => {
            //console.log(item);
            date = item.match(date_re);
            // console.log("date is: ", date);
            //console.log(item.charAt(item.length - 7) + item.charAt(item.length - 6));
            if (item.charAt(item.length - 5) != 'l' && item.charAt(item.length - 6) != 'l') {
                let is_new_date = true;
                //检查是否在已经有的日期里面了

                //不是需要合并的视频，跳过
                for (let i = 0; i < merage_videos.length; i++) {
                    if (date[0] == merage_videos[i].date) {
                        merage_videos[i].videos.push(item);
                        is_new_date = false;
                    }
                }
                if (is_new_date) {
                    //这是新的一天需要合成
                    let merage_video_child = {
                        date: '',
                        videos: []
                    }
                    merage_video_child.date = date[0];
                    merage_video_child.videos.push(item);
                    merage_videos.push(merage_video_child);
                }
            }
        });

        console.log(video_folder_exit[i], " merage!!!!");
        console.log(merage_videos);
        merage_videos.forEach(item => {
            let data = '';
            for (let i = 0; i < item.videos.length; i++) {
                data = data + '\n' + 'file' + ' \'' + item.videos[i] + '\'';
            }
            fs.writeFileSync(k_video_folder + '/' + video_folder_exit[i] + '/' + item.date + '.txt', data);
            if (os_type == 'Linux') {
                let txt_path = k_video_folder + '/' + video_folder_exit[i] + '/' + item.date + '.txt';
                console.log(txt_path);
                let output_file_path =  k_video_folder + '/' + video_folder_exit[i] + '/'+ item.date+'-'+video_folder_exit[i] + '-all.mp4';
                console.log(output_file_path);
                process.exec('ffmpeg -f concat -i '+ txt_path +  ' -c copy '+' '+output_file_path, function (error, stdout, stderr) {
                    if (error !== null) {
                        console.log('exec error: ' + error);
                        //命令失败
                    }
                    else {
                        //执行成功
                        console.log('merage success');
                    }
                });
            }
        });
        //Linux 系统
    }
}

function unlinkFile() {
    let videos_folder_exit = fs.readdirSync(k_video_folder);
    videos_folder_exit.forEach(item => {
        console.log("清除 ", item, "文件夹下多余的内容与信息！");
        let videos = fs.readdirSync(k_video_folder + '/' + item + '/');
        videos.forEach(ele => {
            if (ele.charAt(ele.length - 5) != 'l' && ele.charAt(ele.length - 6) != 'l') {
                // console.log(ele.charAt(11));
                fs.unlinkSync(k_video_folder+'/' + item + '/' + ele);
            }
        })
    });
}

function isNeedDownLoad(video_info) {
    console.log("determine is need download");
    let videos_folder_exit = fs.readdirSync(k_video_folder);
    console.log(videos_folder_exit);
    for (let k = 0; k < videos_folder_exit.length; k++) {
        if (videos_folder_exit[k] == video_info.video_type) {
            let videos = fs.readdirSync(k_video_folder + '/' + videos_folder_exit[k] + '/');
            console.log(videos);
            let date_video = video_info.video_time + '-' + video_info.video_type + '-all.mp4';
            console.log(date_video);
            for (let i = 0; i < videos.length; i++) {
                if (videos[i] == date_video) {
                    return false;
                }
            }
        }
    }
    return true;
}


function program(video_info_arr) {
    console.log(video_info_arr);
    let need_download_video = [];
    let promise_arr = [];
    for (let i = 0; i < video_info_arr.length; i++) {

        if (isNeedDownLoad(video_info_arr[i])) {
            need_download_video.push(video_info_arr[i]);
        }
    }


    console.log(need_download_video.length);
    //下载视频
    for (let i = 0; i < need_download_video.length + 2; i++) {
        //之所以加2 是因为一个周期用来合并视频，一个周期用来删除没用的视频
        //console.log(i, ' ', need_download_video.length);
        if (i == need_download_video.length + 1) {
           // unlink File;
            console.log("unlink file after 1000");
            setTimeout(unlinkFile, 1000 *60* 5 * (1+i));
        }
        else if (i == need_download_video.length) {
            //这个周期用以合并视频
            console.log("video merage");
            setTimeout(videoMerage, 1000 * 60* 5 * i);
        }
        else {
            console.log("video download")
            setTimeout(downloadOneVideo, 1000 * 60 * 5 * i, need_download_video[i]);
        }
    }


}
module.exports = program;