
;var SERVE = SERVE || {};
SERVE.bs = (function(){
    $.extend($.easing,{
        easeOutBack:function(x,t,b,c,d,s){
            if (s == undefined) s = 1.70158;
            return c*((t=t/d-1)*t*((s+1)*t + s) + 1) + b;
        },
        easeOutCubic: function (x, t, b, c, d) {
            return c * ((t = t / d - 1) * t * t + 1) + b;
        }
    });
	
	
    //页面加载初始化（全屏页面控制）
    var pageInit = function(){
		var windowH = $(window).height();
		$(".bs-menu").height(windowH-175);
		$(".bs-edit-wrap").height(windowH-175);
		$(".bs-subMenu").height(windowH-175);
		$(".bs-content").height(windowH-175);
		$(".editContent").height(windowH-175);
		$(".sideNav_toggle").height(windowH-175);
		if($(".displayArea").height()>=windowH-175){
			$(".mContent").height(windowH-175);
		}
		$(".bs-footer").css("zoom","1");
      
        $(window).resize(function(){
			var windowH = $(window).height();
			$(".bs-menu").height(windowH-175);
			$(".bs-edit-wrap").height(windowH-175);
			$(".bs-content").height(windowH-175);
			$(".editContent").height(windowH-175);
			$(".bs-subMenu").height(windowH-175);
			$(".sideNav_toggle").height(windowH-175);
			if($(".displayArea").height()>=windowH-175){
				$(".mContent").height(windowH-175);
			}
			$(".bs-footer").css("zoom","1");
        });
    };
    //图片裁剪
    var imgArea = function(cutImg,preImg,parent,pw,ph,mark,maxW,maxH){
        var _ias = null,
            _cutImg = cutImg,
            _preImg = preImg,
            _width,
            _height,
            _scale,
            _pw = pw,
            _ph = ph,
            _mark = mark,
            _cropParam = {};

        function preview(img, selection) {
            var scaleX = _pw / (selection.width || 1);
            var scaleY = _ph / (selection.height || 1);
            $('#'+_preImg).css({
                width: Math.round(scaleX * _width) + 'px',
                height: Math.round(scaleY * _height) + 'px',
                marginLeft: '-' + Math.round(scaleX * selection.x1) + 'px',
                marginTop: '-' + Math.round(scaleY * selection.y1) + 'px'
            });
        }

        function loadImg(){
            var _img = new Image();
            _img.onload = function(){
                _width = _img.width;
                _height = _img.height;
                if(_width >= _height){
                    _height = (320/_width)*_height;
                    _width = 320;
                    $('#'+_cutImg).css({'width':320});
                }else{
                    _width = (320/_height)*_width;
                    _height = 320;
                    $('#'+_cutImg).css({'height':320});
                }
                _scale = (_width >= _height) ? (_img.width/320) : (_img.height/320);
                var _base = ((_width <= _height) ? _width : _height) || 10;
                if(maxW != undefined && maxH != undefined){
                    var _mbase = _base > maxW ? maxW : _base;
                    if(_width >= _height){
                        _mbase = (_mbase/_scale) > _width ? _width : (_mbase/_scale);
                    }else{
                        _mbase = (_mbase/_scale) > _height ? _width : (_mbase/_scale);
                    }
                    _ias.setOptions({
                        aspectRatio: '1:1',
                        x1:0,
                        y1:0,
                        x2:_mbase,
                        y2:_mbase,
                        maxWidth:maxW/_scale,
                        maxHeight:maxH/_scale,
                        handles:'corners',
                        parent:'#'+parent,
                        instance:true,
                        onSelectChange: preview
                    });
                }else{
                    _ias.setOptions({
                        aspectRatio: '1:1',
                        x1:0,
                        y1:0,
                        x2:_base,
                        y2:_base,
                        handles:'corners',
                        parent:'#'+parent,
                        instance:true,
                        onSelectChange: preview
                    });
                }
                _ias.update();
                preview(undefined,{x1:0,y1:0,x2:_base,y2:_base,width:_base,height:_base});
            };
            _img.src = $('#'+_cutImg).attr('src');

        }

        _ias = $('#'+_cutImg).imgAreaSelect({
            aspectRatio: '1:1',
            x1:0,
            y1:0,
            x2:1,
            y2:1,
            handles:'corners',
            parent:'#'+parent,
            instance:true,
            onSelectChange: preview
        });

        loadImg();
        function canSel(){
            _ias.cancelSelection();
        }
        return {//返回图片裁剪数据
            getData:function(){
                var _selection = _ias.getSelection();
                _cropParam.mark = _mark;
                _cropParam.cropLeft = parseInt(_selection.x1*_scale);
                _cropParam.cropTop = parseInt(_selection.y1*_scale);
                _cropParam.cropWidth = parseInt(_selection.width*_scale);
                _cropParam.cropHeight = parseInt(_selection.height*_scale);
                return _cropParam;
            },
            canSel:canSel
        }
    };
    //图片标签编辑
    var tagEdit = function(tags){
        var _wrap = $('#imgTagWrap'),
            _edit = $('#imgTagEdit'),
            _ctags = tags;
        //新增标签
        function addTag(){
            var _addBtn = _edit.find('button').eq(0);
            _addBtn.off('click');
            _addBtn.on('click',function(){
                var _con = $.trim(_edit.find('.tag-con input').val());
                var _this = this;
                var _timer = null;
                if(_edit.find('.tag-list li').length >= 6){
                    $(this).parent().nextAll('.overall-error-tips').text('最多添加6个标签！').show();
                    _timer = setTimeout(function(){$(_this).parent().nextAll('.overall-error-tips').fadeOut();},5000);
                    return;
                }else if(_con == ''){
                    $(this).parent().nextAll('.overall-error-tips').text('请输入标签内容！').show();
                    _timer = setTimeout(function(){$(_this).parent().nextAll('.overall-error-tips').fadeOut();},5000);
                    return;
                }
                clearTimeout(_timer);
                $(_this).parent().nextAll('.overall-error-tips').hide();
                var _type = _edit.find('.tag-type input:checked').val();
                var _newTag = '<div class="img-tag-item img-tag-item' + _type + '"><span>' + _con + '</span></div>';
                var _tag = {type:_type,direct:0,name:_con,x:0,y:0.03125};
                _edit.find('.tag-list').append('<li>'+_newTag+'<a class="del" href="javascript:;">删除</a></li>');
                _wrap.find('.img-tag-main').append(_newTag);
                _edit.find('.tag-con input').val("");
                _ctags.push(_tag);
            });
        }
        //删除标签
        function delTag(){
            _edit.find('.tag-list .del').die('click');
            _edit.find('.tag-list .del').live('click',function(){
                var _index = $(this).parent('li').index();
                $(this).parent('li').remove();
                _wrap.find('.img-tag-main').find('.img-tag-item').eq(_index).remove();
                _ctags.splice(_index,1);
            });
        }
        //移动标签
        function moveTag(){
            var _flag = false,
                _x,
                _y,
                _sx,
                _sy,
                _this;
            _wrap.find('.img-tag-main .img-tag-item').die('mousedown');
            _wrap.find('.img-tag-main .img-tag-item').live('mousedown',function(e){
                _flag = true;
                _x = e.pageX;
                _y = e.pageY;
                _this = $(this);
                _sx = _this.position().left;
                _sy = _this.position().top;
                return false;
            });
            _wrap.find('.img-tag-main').die('mousemove');
            _wrap.find('.img-tag-main').live('mousemove',function(e){
                if(_flag){
                    var _l = _sx+(e.pageX-_x),
                        _t = _sy+(e.pageY-_y);

                    if(_this.hasClass('direct')){
                        if(_sy+(e.pageY-_y)<0){
                            _t = 0;
                        }else if(_sy+(e.pageY-_y)>300){
                            _t = 300;
                        }
                        if(_sx+(e.pageX-_x)>320-_this.outerWidth()){
                            _l = 320-_this.outerWidth();
                        }else if(_sx+(e.pageX-_x)<0){
                            _this.removeClass('direct');
                            _l = _sx+(e.pageX-_x)+_this.outerWidth();
                        }
                    }else{
                        if(_sy+(e.pageY-_y)<0){
                            _t = 0;
                        }else if(_sy+(e.pageY-_y)>300){
                            _t = 300;
                        }
                        if(_sx+(e.pageX-_x)>320-_this.outerWidth()){
                            _this.addClass('direct');
                            _l = _sx+(e.pageX-_x)-_this.outerWidth();
                        }else if(_sx+(e.pageX-_x)<0){
                            _l = 0;
                        }
                    }
                    _this.css({'left':_l,'top':_t});
                }
            });
            _wrap.find('.img-tag-main').die('mouseup');
            _wrap.find('.img-tag-main').live('mouseup',function(e){
                if(_flag){
                    _flag = false;
                }

                var _index = _this.index()-1;
                var _curTag = _ctags[_index];
                if(_this.hasClass('direct')){
                    _curTag.direct = 1;
                    _curTag.x = parseFloat((_this.position().left+_this.outerWidth())/320).toFixed(2);
                    _curTag.y = parseFloat((_this.position().top+10)/320).toFixed(2);
                }else{
                    _curTag.direct = 0;
                    _curTag.x = parseFloat(_this.position().left/320).toFixed(2);
                    _curTag.y = parseFloat((_this.position().top+10)/320).toFixed(2);
                }
            });
            $(document).live('mouseup',function(){
                if(_flag){
                    _flag = false;
                }
            });
        }
        addTag();
        delTag();
        moveTag();
        return {//返回标签数据
            getTag:function(){
                return _ctags;
            }
        };
    };
    //信息设置下拉框
    var userInforSel = function(id,checkFlag){
        var _id = id,
            _checkFlag = false;
        if(checkFlag != undefined){
            _checkFlag = checkFlag;
        }
        popBox();
        chooseSel();
        //弹出下拉框
        function popBox(){
            $(_id).find('.sel-inp').on('click',function(){
                if($(_id).hasClass('selected')){
                    $(_id).removeClass('selected');
                    $(_id).find('.sel-box-wrap').hide();
                }else{
                    $(_id).addClass('selected');
                    $(_id).find('.sel-box-wrap').show();
                }
                return false;
            });
            $(document).on('click',function(){
                $(_id).removeClass('selected');
                $(_id).find('.sel-box-wrap').hide();
            });
            $(_id).on('mouseleave',function(){
                $(_id).removeClass('selected');
                $(_id).find('.sel-box-wrap').hide();
            });
        }
        //选择下拉框
        function chooseSel(){
            if(_checkFlag){
                $(_id).find('.sel-box li').live('click',function(e){
                    if($(this).find('input').is(':checked')){
                        $(this).addClass('on');
                    }else{
                        $(this).removeClass('on');
                    }
                    e.stopPropagation();
                });
                $(_id).find('.check-all').live('click',function(){
                    if($(_id).find('.sel-box li').length > $(_id).find('.sel-box li input:checked').length){
                        $(_id).find('.sel-box li').addClass('on');
                        $(_id).find('.sel-box li').find('input').attr('checked',true);
                    }else{
                        $(_id).find('.sel-box li').removeClass('on');
                        $(_id).find('.sel-box li').find('input').attr('checked',false);
                    }
                    return false;
                });
                $(_id).find('.save').live('click',function(){
                    if($(_id).find('.sel-box .on').length != 0){
                        var _v = '';
                        var _ids = '';
                        for(var i=0;i<$(_id).find('.sel-box .on').length;i++){
                            _v += $(_id).find('.sel-box .on').eq(i).find('label').html();
                            _ids += $(_id).find('.sel-box .on').eq(i).val();
                            if(i != $(_id).find('.sel-box .on').length-1){
                                _v += '/';
                            }
                            _ids += '|';
                        }
                        $('#cate3').val(_ids);
                        $(_id).find('.sel-inp span').html(_v);
                        $('.user-pro .pro-choose').find('.'+$(_id).attr('data-rel')).html('（'+_v+'）');
                        $('.user-pro .pro-choose').find('.'+$(_id).attr('data-rel')).nextAll('span').html('');
                        $(_id).removeClass('selected');
                        $(_id).find('.sel-box-wrap').hide();
                    }else{
                        return false;
                    }
                });
            }else{
                $(_id).find('.sel-box li').live('click',function(){
                    var _v = $(this).html();
                    $(this).addClass('on').siblings().removeClass('on');
                    $(_id).find('.sel-inp span').html(_v);
                    $('.user-pro .pro-choose').find('.'+$(_id).attr('data-rel')).html('（'+_v+'）');
                    $('.user-pro .pro-choose').find('.'+$(_id).attr('data-rel')).nextAll('span').html('');
                    $(_id).removeClass('selected');
                    $(_id).find('.sel-box-wrap').hide();
                });
            }
        }
    };

    return {
        pageInit:pageInit,
        imgArea:imgArea,
        tagEdit:tagEdit,
        userInforSel:userInforSel
    }
})(jQuery);



$(function() {
    //初始化加载
    SERVE.bs.pageInit();

    //输入字数提示
    var inputTxtCtrl = function (ctrlName, ctrlLen) {
        $(ctrlName).keyup(function () {
            var _this_ctrlName = $(this);
            var _static = $(this).parents(".dd").prev(".dt").find(".static");
            var iptLen = $(this).val().length;
            if (iptLen > ctrlLen) {
                var cutVal = $(this).val().substring(0, ctrlLen);
                $(this).val(cutVal);
                iptLen = ctrlLen;
            }
            if (_static.length > 0) {
                _static.find('em').text(iptLen);
            }

        });
    };

    inputTxtCtrl('.textarea', 2000);



    //左侧导航滑过添加选中样式
    $(".sideNav li").hover(function () {
        $(this).toggleClass('hover');
    });

    //左侧导航点击样式
    $(".sideNav li:first").addClass("selected");
    $(".sideNav li").click(function () {
        $(this).addClass('selected').siblings('li').removeClass('selected');
    });


    $(".sideNav_toggle").find('.sideMod_wrap:first').addClass('sideMod_wrap_show');
    $(".sideNav_toggle").find('.target:first').addClass('target_selected');
    $(".sideNav_toggle .target").hover(function () {
        $(this).toggleClass('target_hover');
    });


    $(".sideNav_toggle .target").click(function () {
        if($(this).hasClass('target_selected')){
            $(this).removeClass('target_selected');
            $(this).next('.sideMod_wrap').removeClass('sideMod_wrap_show');
        }else{
            $(this).addClass('target_selected');
            $(this).next('.sideMod_wrap').addClass('sideMod_wrap_show');
        }
    });
    //编辑框添加滑过边框效果
    $(".sideEdit li .link .ipt ,.sideEdit li .dd .ipt,.tag-con .ipt").focus(function(){
        $(this).addClass("ipt-selected");
    });

    $(".sideEdit li .link .ipt ,.sideEdit li .dd .ipt,.tag-con .ipt").blur(function(){
        $(this).removeClass("ipt-selected");
    });

    $(".sideEdit li .add_pic").hover(function(){
        $(this).toggleClass("add_pic_hover");
    });

    $('.qs-menu dt').click(function(){
        if($(this).parent('dl').hasClass('cur')){
            $(this).parent('dl').removeClass('cur');
        }else{
            $(this).parent('dl').addClass('cur');
        }
    });

    SERVE.com.tab({selector:$('.J_reviewTab'),event:'click',selected:'.cur'});
});
