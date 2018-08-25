(function () {
    //自动执行函数
    //添加事件监听器，阻止a默认点击事件
    var img_click_parent = document.getElementsByClassName('video-short-img');
    var img_click = [];
    //DOM树中node是节点，节点有很多类型，以NodeType进行区分，例如1 为element， 2 为attr
    //element继承Node类，并且对node进行扩展，children属性是一个数组，而且均为element对象
    //childnode也是数组，属于node的属性，其类型均为node类
    //所以要找子级元素，均需要用children[i]
    //主要要区分的是element与node的区别即可，后面的属性均是firstChild或者是firstElementChild，很好区分
    var video_src = document.getElementById('video_display_area');
    for (let i = 0; i < img_click_parent.length; i++) {
        img_click[i] = img_click_parent[i].children[0];
        img_click[i].addEventListener("click", function (event) {
            event.preventDefault(); // 阻止默认事件
            event.stopPropagation(); // 阻止冒泡
           // console.log(img_click[i].attributes['href'].nodeValue)
            //将#video_display_area的src进行修改
            console.log(img_click[i]['href']);
            video_src.setAttribute('src', img_click[i]['href']);
            //冒泡就是这一个点击事件一层一层网上传，直到有一个处理了点击事件，return true，才会停止
        }, false);
    }
    console.log(img_click);
    //点击标题也需要修改
    var video_title_parent = document.getElementsByClassName('video-title'); 
    var video_title_click = [];
    for(let i = 0; i < video_title_parent.length; i++) {
        video_title_click[i] = video_title_parent[i].children[0];
        video_title_click[i].addEventListener('click',function(event){
            event.preventDefault(); // 阻止默认事件
            event.stopPropagation(); // 阻止冒泡
           // console.log(img_click[i].attributes['href'].nodeValue)
            //将#video_display_area的src进行修改
            video_src.setAttribute('src', video_title_click[i].attributes['href'].nodeValue);
            //冒泡就是这一个点击事件一层一层网上传，直到有一个处理了点击事件，return true，才会停止
        },false);
    }
    console.log(video_title_click);
    //事件绑定，事件监听， 事件委托
    //阻止a标签的默认事件
    //非IE 可以使用preventDefault();
    // event.preventDefault(); // 阻止默认事件
    //event.stopPropagation(); // 阻止冒泡
   // console.log(img_click);
//    function dispatch(el, type){
//     try{
//         console.log('create event');
//         var evt = document.createEvent('MouseEvent');
//         evt.initEvent(type,true,true);
//         el.dispatchEvent(evt);
//     }catch(e){alert(e)};
// }


   var observer = new MutationObserver(function (mutations, observer) {
    mutations.forEach(function(mutation) {
     // console.log(mutation);
     //触发视频播放
     console.log('enter');
    // video_src.click();
    // dispatch(video_src,'onclick');
     //simulateClick();
    // video_src.dispatchEvent('onclick');
     //dispatch(video_src,'onended');
    // $('#video_list_area').click();
    });
  });
var  options = {
  'childList': true,
  'attributes':true
} ;
observer.observe(video_src, options);

// function simulateClick() {
//     var event = new MouseEvent('click', {
//       'view': window,
//       'bubbles': true,
//       'cancelable': true
//     });
    
//     var cancelled = !video_src.dispatchEvent(event);
//     if (cancelled) {
//       // A handler called preventDefault.
//       alert("cancelled");
//     } else {
//       // None of the handlers called preventDefault.
//       alert("not cancelled");
//     }
//   }

// //视频播放结束有onended事件触发
function videoEnded() 
{
    alert("end");
    var src = video_src.getAttribute('src');
    for(let i = 0 ; i < video_title_click.length; i++)
    {
        if(src == video_title_click[i].attributes['href'].nodeValue)
        {
            //下一条
            if(i != video_title_click.length-1)
            {
                video_src.setAttribute('src', video_title_click[0].attributes['href'].nodeValue);
            }
            else
            {
                video_src.setAttribute('src', video_title_click[0].attributes['href'].nodeValue);
            }
            break;
        }
    }
}

var md=document.getElementById("video_display_area");
md.addEventListener("ended",function(){
    // alert("播放结束");
    //切换到下一个视频
    let src = md.getAttribute('src');
    let date_re = new RegExp('[0-9]{4}-[0-9]{2}-[0-9]{2}','g');
    let date = src.match(date_re)[0];
    let li_list = document.getElementById('video_list_area').children;
    console.log(li_list);
    for(let i = 0; i < li_list.length; i++)
    {
        let href = li_list[i].children[0].children[0].getAttribute('href');
        console.log(href);
        let href_date = href.match(date_re)[0];
        if(href_date == date)
        {
            //
            li_list[i].children[1].children[2].innerHTML = '已经看过了，Watched！！！';
            li_list[i].children[1].children[2].style.color = 'red';
            //这一个就是当前播放视频
            if(i == li_list.length-1)
            {
                //最后一个视频
              md.setAttribute('src', li_list[0].children[0].children[0].getAttribute('href'));
              console.log('reset to 0');
            }
            else
            {
                md.setAttribute('src', li_list[i+1].children[0].children[0].getAttribute('href'));
                console.log("reset next");
            }
            break; 
        }
    }
   // console.log(li_list);


});
})();