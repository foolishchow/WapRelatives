

//修复IE不支持indexOf方法
if(!Array.indexOf){
	Array.prototype.indexOf = function(obj){
		for(var i=0; i<this.length; i++){
			if(this[i]==obj){
				return i;
			};
		};
		return -1;
	};
};


//可视化基础功能对象
var Visual = {

	//公共
	move : false,
	dragObj : {},
	isIE : /MSIE/.test(navigator.userAgent)?true:false,


	//创建挂件遮罩工具层、属性等
	createBar : function(){
		var barHtml = '<div class="ve_bar"><div class="ve_barbd"></div><div class="ve_baracts"><a href="javascript:void(0);" class="ve_bar_down">向上</a><a href="javascript:void(0);" class="ve_bar_up">向下</a><a href="javascript:void(0);" class="ve_bar_del">删除</a></div></div>',
			barHtmlSys = '<div class="ve_bar"><div class="ve_barbd"></div><div class="ve_baracts"></div></div>';

		$(".J_CMod").each(function(){
			var _this = $(this);

			//遮罩工具条
			if(_this.find(".ve_bar").length <= 0){
				_this.append(barHtml);
			};
		});

		$(".J_Mod").each(function(){
			var _this = $(this);

			//遮罩工具条
			if(_this.find(".ve_bar").length <= 0){
				_this.append(barHtmlSys);
			};
		});
	},


	//设置挂件遮罩对象的大小
	barSet : function(obj){
		var modObj = obj.children().eq(0),
			h = modObj.height(),
			oh = modObj.outerHeight(),
			w = modObj.width(),
			ow = modObj.outerWidth(),
			mb = modObj.css("margin-bottom"),
			ml = modObj.css("margin-left");
		obj.css({'height':oh,"margin-bottom":mb});
		modObj.css({'height':h});

		obj.find('.ve_bar').css({'width':ow-4 , 'height':oh-4 , "margin-left":parseInt(ml) , "margin-top":-(parseInt(mb)+oh) });
		obj.find('.ve_barbd').width(ow).height(oh);
	},
	barIni : function(){
		$(".J_MM").each(function(){
			Visual.barSet($(this));
		});
	},


	//得到对象的位置与大小等状态
	getState : function(posObj)
	{
		var a = new Array();
		var t = posObj.offset().top;
		var l = posObj.offset().left;
		var w = posObj.outerWidth();
		var h = posObj.outerHeight();
		var wIn = posObj.width();
		var hIn = posObj.height();
		a[0]=t;a[1]=l;a[2]=w;a[3]=h;a[4]=wIn;a[5]=hIn;
		return a;
	},

	//比较拖拽的对象与各静止挂件的坐标，以确定被拖拽挂件插入的位置
	innerPos : function(o,e)
	{
		var a=Visual.getState(o)
		if( e.pageX>a[1] && e.pageX<(a[1]+a[2]) && e.pageY>a[0] && e.pageY<(a[0]+a[3]) ){
			if(e.pageY<(a[0]+a[3]/2)){
				return 1;
			}else{
				return 2;
			};
		}else{
			return 0;
		};
	},



	//创建占位元素
	createHolder : function(e){

		var widgetBox = $(".simulator .J_CMod");
		for(var i=0;i<widgetBox.length;i++){
			if(widgetBox.eq(i).get(0)==Visual.dragObj.widget.get(0)){ //判断当前元素是否和创建占位符的元素一致
				continue;
			};
			var b=Visual.innerPos(widgetBox.eq(i),e);  //生成元素在静止目标上的位置以确定是插入之前还是之后
			if(b==0){
				continue; ///如果拖拽对象不在目标对象之中则继续
			};


			Visual.dragObj.holder.width(widgetBox.eq(i).children().eq(0).outerWidth());//判断插入的位置
			Visual.dragObj.oldholder.remove();
			if(b==1){
				widgetBox.eq(i).before(Visual.dragObj.holder);
			}else{
				widgetBox.eq(i).after(Visual.dragObj.holder);
			};
			Visual.dragObj.hasMove = true;

			return;
		};

	},
	//拖拽函数
	dragdropSet : function(){
		var _mIndex;

		//鼠标点击时
		$(".J_Region").delegate(".ve_barbd","mousedown",function(e){
			//只允许鼠标左键拖拽.IE左键为1 FireFox/Webkit为0
			if(Visual.isIE && e.button == 1 || !Visual.isIE &&e.button == 0){
			}else{
				return false;
			};

			//设置bragObj对象
			var widgetObj = $(this).parents(".J_MM");
			Visual.dragObj.widget = widgetObj;
			Visual.dragObj.oldState = Visual.getState(Visual.dragObj.widget);///记录模块的原始位置
			Visual.dragObj.tempPos = new Array((e.pageX - Visual.dragObj.oldState[1]),(e.pageY - Visual.dragObj.oldState[0]));
			Visual.dragObj.hasMove = false;

			//临时拖拽层的样式
			$("#J_TempDrag").css({'width':Visual.dragObj.oldState[2] , 'height':Visual.dragObj.oldState[3] , 'left':e.pageX-Visual.dragObj.tempPos[0] , 'top':e.pageY-Visual.dragObj.tempPos[1]});

			//改变移动状态
			Visual.move = true;
			//占位元素
			var placeholder = '<div></div>';
			Visual.dragObj.holder = $(placeholder);
			Visual.dragObj.holder.css({'width':320 , 'height':5 , 'background':'#c5dcf9' , 'margin-bottom':Visual.dragObj.widget.children().eq(0).css("margin-bottom") });
			//拖动挂件原位置的占位元素
			Visual.dragObj.oldholder = Visual.dragObj.holder;
			Visual.dragObj.oldholder.hide();

			if(Visual.dragObj.widget.hasClass("J_CMod")){
				_mIndex = Visual.dragObj.widget.index();
				Visual.dragObj.oldholder = Visual.dragObj.holder;
				Visual.dragObj.widget.before(Visual.dragObj.oldholder);
				$("#J_TempDrag").append(widgetObj.clone());
			}else{
				Visual.dragObj.oldholder = Visual.dragObj.holder;
				Visual.dragObj.oldholder.hide();
				$("#J_TempDrag").append(widgetObj.clone());
			}

			//回调函数
			VisualDo.mousedownCallback();

			//IE鼠标捕获
			if(Visual.isIE){
				Visual.dragObj.bar.get(0).setCapture();
			};

		});

		//鼠标移动时
		$(document).mousemove(function(e){
			if(Visual.move){

				//清除选择
				window.getSelection ? window.getSelection().removeAllRanges() : document.selection.empty();

				//IE随鼠标滚屏
				if(Visual.isIE){
					var rootEle = document.documentElement,
						docL = rootEle.scrollLeft,
						docT = rootEle.scrollTop,
						docW = rootEle.clientWidth,
						docH = rootEle.clientHeight,
						mosX = e.clientX+docL,
						mosY = e.clientY+docT;
					if (mosX > docL + docW){
						rootEle.scrollLeft = mosX - docW;
					}else if(mosX < docL){
						rootEle.scrollLeft = mosX;
					};
					if(mosY > docT + docH){
						rootEle.scrollTop = mosY - docH;
					}else if(mosY < docT){
						rootEle.scrollTop = mosY;
					};
				};

				//拖拽层的实时坐标
				var x=e.pageX-Visual.dragObj.tempPos[0];
				var y=e.pageY-Visual.dragObj.tempPos[1];
				$("#J_TempDrag").css({top:y , left:x , 'visibility':'visible'});
				Visual.dragObj.oldholder.show();

				var c = Visual.innerPos($(".simulator .J_Region"),e);
				if(Visual.dragObj.widget.hasClass("J_Mod")){
					if(c==1 || c==2){
						//创建占位元素
						Visual.createHolder(e);
					}else{
						Visual.dragObj.oldholder.remove();
					}
				}else{
					Visual.createHolder(e);
				}
			};
		})

			//鼠标释放时
			.mouseup(function(e){
				if(Visual.dragObj.widget!=null && Visual.dragObj.holder!=null){
					Visual.move=false;

					var rel_num = Visual.dragObj.widget.attr("rel");
					var _index;
					var widgetObj = Visual.dragObj.widget;

					$(".simulator .J_CMod").removeClass("J_CMod_selected");
					if(Visual.dragObj.widget.hasClass("J_Mod")){
						//视频只加入一次
			    	    if($("#modWrap").find(".J_CMod[rel=5]").length > 0 && rel_num == 5){
							$(".pop-tips .save-tips").html("只能添加一个视频组件！");
							SERVE.com.popupbox('.pop-tips');
						}else{
							for(i=0; i<$(".J_createMod .J_CMod").length;i++){
								if(rel_num == $(".J_createMod .J_CMod").eq(i).attr("rel")){

									$(".J_createMod .J_CMod").eq(i).addClass("J_CMod_selected");
									$(".JS_fixedMod").removeClass("JS_fixedMod-selected");
									var J_Modclone = $(".J_createMod .J_CMod").eq(i).clone();
									Visual.dragObj.holder.before(J_Modclone);
									$(".J_createMod .J_CMod").removeClass("J_CMod_selected");
									_index = $("#modWrap .J_MM").index(J_Modclone);
									var c = Visual.innerPos($(".simulator .J_Region"),e);
									if(c){
										var _nMod = {};
										//显示组件编辑模块
										$(".bs-edit-wrap").css("visibility","visible");
										$(".bs-edit-wrap").height($(window).height()-175);
										$(".editContent").height($(window).height()-175);
										$(".bs-content").removeClass("bs-content-cols");
										$('.bs-edit-wrap .bs-edit').eq(rel_num - 1).show().siblings().hide();
										switch (parseInt(rel_num)){
											case 2:
												_nMod = {
													"type":2,
													"text":"标题"
												};
												break;
											case 1:
												_nMod = {
													"type":1,
													"text":"默认文本"
												};
												break;
											case 3:
												_nMod = {
													"type":3,
													"imageUrl":"",
													"productCode":"",
													"venderCode":"",
													"tags":[]
												};
												break;
											case 5:
												_nMod = {
													"type":5,
													"imageUrl":"",
													"videoUrl":"",
													"tags":[]
												};
												break;
										}
										_moudleList.splice(_index,0,_nMod);
										_isChange = true;
										_curIndex = _index;
										switch (_moudleList[_curIndex].type){
											case 2:
												$("#editTitleInp").val(_moudleList[_curIndex].text);
												break;
											case 1:
												$("#editTextInp").val(_moudleList[_curIndex].text).trigger("keyup");
												break;
											case 3:
												if(_moudleList[_curIndex].imageUrl == ""){
													$("#chooseImage").show();
													$("#reChooseImage").hide();
													$("#addTags").hide();
													$("#imgProductCode").val(_moudleList[_curIndex].productCode);
													$("#imgVenderCode").val(_moudleList[_curIndex].venderCode);
													$("#imgPrice").val(_moudleList[_curIndex].price);
												}else{
													$("#chooseImage").hide();
													$("#reChooseImage").show();
													_isSOP == "1" ? $("#addTags").hide() : $("#addTags").show();
													$("#reChooseImage").find("img").attr("src",_moudleList[_curIndex].imageUrl);
													$("#imgProductCode").val(_moudleList[_curIndex].productCode);
													$("#imgVenderCode").val(_moudleList[_curIndex].venderCode);
													$("#imgPrice").val(_moudleList[_curIndex].price);
												}
												break;
											case 5:
												if(_moudleList[_curIndex].imageUrl == ""){
													$("#chooseImageVideo").show();
													$("#reChooseImageVideo").hide();
													//$("#addTagsVideo").hide();
													$("#videoLink").val(_moudleList[_curIndex].videoUrl);
												}else{
													$("#chooseImageVideo").hide();
													$("#reChooseImageVideo").show();
													//$("#addTagsVideo").show();
													$("#reChooseImageVideo").find("img").attr("src",_moudleList[_curIndex].imageUrl);
													$("#videoLink").val(_moudleList[_curIndex].videoUrl);
												}
												break;
										}
									}
								}
							}								
						}
					}else{
						Visual.dragObj.holder.before(Visual.dragObj.widget);
						Visual.dragObj.widget.show();
						var _mMod = _moudleList.splice(_mIndex,1);
						_index = Visual.dragObj.widget.index();
						_moudleList.splice(_index,0,_mMod[0]);
						_isChange = true;
						//显示组件编辑模块
						$(".bs-edit-wrap").css("visibility","visible");
						$(".bs-edit-wrap").height($(window).height()-175);
						$(".editContent").height($(window).height()-175);
						$(".bs-content").removeClass("bs-content-cols");

						Visual.dragObj.widget.addClass("J_CMod_selected").siblings().removeClass("J_CMod_selected");
						$(".JS_fixedMod").removeClass("JS_fixedMod-selected");
						$('.bs-edit-wrap .bs-edit').eq(rel_num-1).show().siblings().hide();

						_curIndex = _index;

						switch (_moudleList[_curIndex].type){
							case 2:
								$("#editTitleInp").val(_moudleList[_curIndex].text);
								break;
							case 1:
								$("#editTextInp").val(_moudleList[_curIndex].text).trigger("keyup");
								break;
							case 3:
								if(_moudleList[_curIndex].imageUrl == ""){
									$("#chooseImage").show();
									$("#reChooseImage").hide();
									$("#addTags").hide();
									$("#imgProductCode").val(_moudleList[_curIndex].productCode);
									$("#imgVenderCode").val(_moudleList[_curIndex].venderCode);
									$("#imgPrice").val(_moudleList[_curIndex].price);
								}else{
									$("#chooseImage").hide();
									$("#reChooseImage").show();
									_isSOP == "1" ? $("#addTags").hide() : $("#addTags").show();
									$("#reChooseImage").find("img").attr("src",_moudleList[_curIndex].imageUrl);
									$("#imgProductCode").val(_moudleList[_curIndex].productCode);
									$("#imgVenderCode").val(_moudleList[_curIndex].venderCode);
									$("#imgPrice").val(_moudleList[_curIndex].price);
								}
								break;
							case 5:
								if(_moudleList[_curIndex].imageUrl == ""){
									$("#chooseImageVideo").show();
									$("#reChooseImageVideo").hide();
									//$("#addTagsVideo").hide();
									$("#videoLink").val(_moudleList[_curIndex].videoUrl);
								}else{
									$("#chooseImageVideo").hide();
									$("#reChooseImageVideo").show();
									//$("#addTagsVideo").show();
									$("#reChooseImageVideo").find("img").attr("src",_moudleList[_curIndex].imageUrl);
									$("#videoLink").val(_moudleList[_curIndex].videoUrl);
								}
								break;
						}
					}



					$("#J_TempDrag").css({'width':'0' , 'height':Visual.dragObj.oldState[3]-4 , 'left':Visual.dragObj.widget.offset().left , 'top':Visual.dragObj.widget.offset().top , 'visibility':'hidden'});
					$("#J_TempDrag").html("");
					Visual.dragObj.oldholder.remove();
					Visual.dragObj.holder.remove();
					Visual.barSet(Visual.dragObj.widget);
					if($(".J_Region").find(".J_CMod").length>1){
						$('.J_CMod_none').remove();
					}
					//启动滑动组件
					if($(".JS_big-pic-change").length!=0){
						window.scrollView();
					}

					//IE移除鼠标捕获
					if(Visual.isIE){
						Visual.dragObj.bar.get(0).releaseCapture();
						Visual.dragObj.widget.trigger("mouseout");
					};

					//回调函数
					if(Visual.dragObj.hasMove){
						VisualDo.dropCallback();
					};

				}

				$(".simulator .J_CMod").first().find(".ve_bar_up").addClass("ve_bar_up_first").parents('.J_CMod').siblings('.J_CMod').find('.ve_bar_up').removeClass('ve_bar_up_first');
				$(".simulator .J_CMod").last().find(".ve_bar_down").addClass("ve_bar_down_last").parents('.J_CMod').siblings('.J_CMod').find('.ve_bar_down').removeClass('ve_bar_down_last');

				//清空Visual.dragObj对象
				Visual.dragObj={};

			});

	},

	//初始化
	initSet : function(){

		Visual.createBar();
		Visual.barIni();

		//临时拖拽层
		var tempDragHtml = '<div id="J_TempDrag"></div>';
		$("body").append(tempDragHtml);

		//遮罩层显示或隐藏
		$(".J_Region").delegate(".J_MM","mouseover",function(){
			if(!$(this).hasClass("J_CMod_selected")){
				if(!Visual.move){
					$(this).find(".ve_bar").css({'display':'block'});
				};
			}
		}).delegate(".J_MM","mouseout",function(){
			$(this).find(".ve_bar").css({'display':'none'});
		});
	}

};


//执行
$(function(){
	Visual.initSet();
	Visual.dragdropSet();
	VisualDo.delWidget();
	VisualDo.moveUpWidget();
	VisualDo.moveDownWidget();


	$(".simulator .J_CMod").first().find(".ve_bar_up").addClass("ve_bar_up_first");
	$(".simulator .J_CMod").last().find(".ve_bar_down").addClass("ve_bar_down_last");



	//没有挂件时默认添加一个空模块，以便可以插入模块
	if($(".J_Region").find(".J_CMod").length<1){
		$(".simulator .J_Region").append('<div class="J_CMod J_CMod_none"></div>');
	}
	//标题设置
	$("#editTitleSave").on('click',function(){
		var _val = $.trim($("#editTitleInp").val());
		var _this = this;
		var _timer1 = null;
		var _timer2 = null;
		if(_val == ''){
			clearTimeout(_timer2);
			$(this).parent().nextAll('.overall-tips').hide();
			$(this).parent().nextAll('.overall-error-tips').show();
			_timer1 = setTimeout(function(){$(_this).parent().nextAll('.overall-error-tips').fadeOut();},5000);
		}else{
			clearTimeout(_timer1);
			$(this).parent().nextAll('.overall-tips').hide();
			_moudleList[_curIndex].text = _val;
			_isChange = true;
			$("#modWrap").find(".J_CMod").eq(_curIndex).find("h3 em").text(_val);
			$(this).parent().nextAll('.overall-suc-tips').show();
			_timer2 = setTimeout(function(){$(_this).parent().nextAll('.overall-suc-tips').fadeOut();},5000);
		}
	});
	//文本设置
	$("#editTextSave").on('click',function(){
		var _val = $.trim($("#editTextInp").val());
		var _this = this;
		var _timer1 = null;
		var _timer2 = null;
		if(_val == ''){
			clearTimeout(_timer2);
			$(this).parent().nextAll('.overall-tips').hide();
			$(this).parent().nextAll('.overall-error-tips').show();
			_timer1 = setTimeout(function(){$(_this).parent().nextAll('.overall-error-tips').fadeOut();},5000);
		}else{
			clearTimeout(_timer1);
			$(this).parent().nextAll('.overall-tips').hide();
			_moudleList[_curIndex].text = _val;
			_isChange = true;
			$("#modWrap").find(".J_CMod").eq(_curIndex).find(".announcement-con span").text(_val);
			$(this).parent().nextAll('.overall-suc-tips').show();
			_timer2 = setTimeout(function(){$(_this).parent().nextAll('.overall-suc-tips').fadeOut();},5000);
		}
	});
	//图片设置
	var _imgArea;
	var _timer;
	$("#chooseImage .add_pic").on('click',function(){
		$("#oldImg").attr("src","").removeAttr("style");
		$("#newImg").attr("src","").removeAttr("style");
		$("#uploadImg").prev().html("选择图片");
		$(".pop-edit-pic").attr("data-type","pic");
		SERVE.com.popupbox('.pop-edit-pic');
	});
	$("#chooseImageVideo .add_pic").on('click',function(){
		$("#oldImg").attr("src","").removeAttr("style");
		$("#newImg").attr("src","").removeAttr("style");
		$("#uploadImg").prev().html("选择图片");
		$(".pop-edit-pic").attr("data-type","vedio");
		SERVE.com.popupbox('.pop-edit-pic');
	});
	$("#reChooseImage .add_pic,#reChooseImageVideo .add_pic").on('click',function(){
		$("#oldImg").attr("src",_moudleList[_curIndex].imageUrl).removeAttr("style");
		$("#newImg").attr("src",_moudleList[_curIndex].imageUrl).removeAttr("style");
		$("#uploadImg").prev().html("重新选择");
		SERVE.com.popupbox('.pop-edit-pic',function(){
			_imgArea = SERVE.bs.imgArea('oldImg','newImg','cutPicWrap',320,320,_moudleList[_curIndex].imageMark);
			$(".pop-edit-pic .close").on('click',function(){
				_imgArea.canSel();
			});
		});
	});
	//上传图片
	$("#uploadImg").fileupload({
		url:_imgUploadUrl,
		dataType:"json",
		done:function(e,result){
			var _result = result.result;
			if (_result.ret != '0') {
				var _msg = _result.msg;
				if (_result.idsIntercepted) {
					_msg = "登录过期，请重新登录";
				} else if (!_msg) {
					_msg = "服务异常，请稍后再试";
				}
				$(".pop-tips .save-tips").html("上传出错： " + _msg);
				SERVE.com.popupbox('.pop-tips');
				return;
			}
			var _data = _result.data;
			if (_data) {
				$("#oldImg").attr("src",_data.url).removeAttr("style");
				$("#newImg").attr("src",_data.url).removeAttr("style");
				$("#uploadImg").prev().html("重新选择");

				_timer = setTimeout(function(){
					_imgArea = SERVE.bs.imgArea('oldImg','newImg','cutPicWrap',320,320,_data.mark);
					$(".pop-edit-pic .close").on('click',function(){
						_imgArea.canSel();
					});
				},200);
			}
		}
	});
	//图片裁剪
	$("#editImgSure").on('click',function(){
        var _area = _imgArea.getData();
		$.ajax({
			type:"post",
			dataType:"json",
			url:_imgCutUrl+"?srcPath="+_area.mark+"&startX="+_area.cropLeft+"&startY="+_area.cropTop+"&width="+_area.cropWidth+"&height="+_area.cropHeight,
			success:function(result){
				if (result.ret != '0') {
					var _msg = result.msg;
					if (result.idsIntercepted) {
						_msg = "登录过期，请重新登录";
					} else if (!_msg) {
						_msg = "服务异常，请稍后再试";
					}
					$(".pop-tips .save-tips").html("上传出错： " + _msg);
					SERVE.com.popupbox('.pop-tips');
					return;
				}
				var _result = result.data;
				if(_result){

					_moudleList[_curIndex].imageMark = _result.mark;
					_moudleList[_curIndex].imageUrl = _result.url;
					_moudleList[_curIndex].smallImageUrl = _result.url;
					_isChange = true;
					SERVE.com.closebox('.pop-edit-pic');
					if($(".pop-edit-pic").attr("data-type") == "pic"){
						$("#chooseImage").hide();
						$("#reChooseImage").show();
						_isSOP == "1" ? $("#addTags").hide() : $("#addTags").show();
						$("#reChooseImage").find("img").attr("src",_moudleList[_curIndex].imageUrl);
					}else{
						$("#chooseImageVideo").hide();
						$("#reChooseImageVideo").show();
						//$("#addTagsVideo").show();
						$("#reChooseImageVideo").find("img").attr("src",_moudleList[_curIndex].imageUrl);
					}
					$("#modWrap").find(".J_CMod").eq(_curIndex).find("img").attr("src",_moudleList[_curIndex].imageUrl);
				}
				_imgArea.canSel();
			},
			error:function(error){
                console.log(error)
            }
		});
	});
	//图片标签编辑
	var _tagList;
	$("#addTags").on('click',function(){
		SERVE.com.popupbox('.pop-edit-tag',function(){
			var _tags = _moudleList[_curIndex].tags;
			var _tagsAct = _tags.slice(0);
			_tagList = SERVE.bs.tagEdit(_tagsAct);
			$('#imgTagWrap img').attr('src',_moudleList[_curIndex].imageUrl);
			if(_tags.length > 0){
				for(var i=0;i<_tags.length;i++){
					var _tag;
					if(_tags[i].direct == 0){
						_tag = '<div class="img-tag-item img-tag-item' + _tags[i].type + '" style="top:'+(_tags[i].y*320-10)+'px;left:'+(_tags[i].x*320)+'px;"><span>' + _tags[i].name + '</span></div>';
					}else{
						_tag = '<div class="img-tag-item img-tag-item' + _tags[i].type + ' direct" style="top:'+(_tags[i].y*320-10)+'px;left:'+(_tags[i].x*320)+'px;"><span>' + _tags[i].name + '</span></div>';
					}
					var _tagLi = '<li>'+_tag+'<a class="del" href="javascript:;">删除</a></li>';
					$('#imgTagWrap').find('.img-tag-main').append(_tag);
					$('#imgTagEdit').find('.tag-list').append(_tagLi);
				}
				$('#imgTagWrap').find('.img-tag-main .direct').each(function(){
					$(this).css('left',$(this).position().left-$(this).outerWidth());
				});
			}

		});
	});
	$(".pop-edit-tag .close").on('click',function(){
		$('#imgTagWrap').find('.img-tag-main .img-tag-item').remove();
		$('#imgTagEdit').find('.tag-list li').remove();
	});
	$("#tagEditSubmit").on('click',function(){
		_moudleList[_curIndex].tags = _tagList.getTag();
		_isChange = true;
		SERVE.com.closebox('.pop-edit-tag');
		$('#imgTagWrap').find('.img-tag-main .img-tag-item').remove();
		$('#imgTagEdit').find('.tag-list li').remove();
	});
	//获取价格
	$("#imgProductCode,#imgVenderCode").on("keyup", function(){
		  var _pcode = $.trim($("#imgProductCode").val());
          var _vcode = $.trim($("#imgVenderCode").val());
          var _price = $("#imgPrice");
          var _reg1 = /^\d{9}$/;
          var _reg2 = /^\d{10}$/;
          if(_pcode.length > 0 && _vcode.length > 0){
              if(_reg1.test(_pcode) && _reg2.test(_vcode)){
              	var price = getPrice(_pcode,_vcode,function(data){
                   if (data == null || !data.price.length) {
                        $("#editPicSave").parent().nextAll('.overall-error-tips').text('输入的商品编码或供应商编码错误,请重输！').show();
                        setTimeout(function(){$("#editPicSave").parent().nextAll('.overall-error-tips').fadeOut();},5000);
                    }else{
                        $.each(data.price, function(i, item) {
                            var itemPrice; // 销售价
                            if(item.promotionPrice){
                                itemPrice = item.promotionPrice.toFixed(2);
                            }
                            _moudleList[_curIndex].price = itemPrice;
                            _price.val(itemPrice);
                            });
                       $("#get-pro-pic").click(function(){
                       });
                    }
              	});
              }
          }else{
          	_price.val("");

          }
	});
    $("#get-pro-pic").on("click",function(){
        var _pcode = $.trim($("#imgProductCode").val());
        _moudleList[_curIndex].productCode = _pcode;
        var _reg1 = /^\d{9}$/;
        var url = _getImgUrl+'?id='+_moudleList[_curIndex].productCode;
        var _this = $(this);
        if(_pcode.length > 0 && _reg1.test(_pcode)){
            $.ajax({
                url: url,
                dataType:"json",
                success:function(data){
                    var datas = data.data;
                    var imgUrl = datas.url;
                    if(datas){
                        _moudleList[_curIndex].imageMark = datas.mark;
                        _moudleList[_curIndex].imageUrl = datas.url;
                        _moudleList[_curIndex].smallImageUrl = datas.url;
                        _isChange = true;
                        $("#chooseImage").hide();
                        $("#reChooseImage").show();
                        $("#reChooseImage").find("img").attr("src",_moudleList[_curIndex].imageUrl);
                        $("#modWrap").find(".J_CMod").eq(_curIndex).find("img").attr("src",_moudleList[_curIndex].imageUrl);
                    }
                },
                error:function(error){
                }
            });
        }
        else{
            $(this).parents(".single-activity").find('.overall-error-tips').text('商品编码必须是9位数字！').show();
            setTimeout(function(){$(_this).parents(".single-activity").find('.overall-error-tips').fadeOut();},5000);
        }
    });

    $("#editPicSave").on('click',function(){
		var _pcode = $.trim($("#imgProductCode").val());
		var _vcode = $.trim($("#imgVenderCode").val());
		var _price = $.trim($("#imgPrice").val());
		var _reg1 = /^\d{9}$/;
		var _reg2 = /^\d{10}$/;
		var _this = this;
		if(_moudleList[_curIndex].imageUrl == ''){
			$(this).parent().nextAll('.overall-error-tips').text('请上传图片再保存！').show();
			setTimeout(function(){$(_this).parent().nextAll('.overall-error-tips').fadeOut();},5000);
			return false;
		}else if(_pcode.length > 0 || _vcode.length > 0){
			if(!_reg1.test(_pcode)){
				$(this).parent().nextAll('.overall-error-tips').text('商品编码必须是9位数字！').show();
				setTimeout(function(){$(_this).parent().nextAll('.overall-error-tips').fadeOut();},5000);
			}else if(!_reg2.test(_vcode)){
				$(this).parent().nextAll('.overall-error-tips').text('供应商编码必须是10位数字！').show();
				setTimeout(function(){$(_this).parent().nextAll('.overall-error-tips').fadeOut();},5000);
			}else if(_price == "" && _price == $("#imgPrice")[0].defaultValue){
                $(this).parent().nextAll('.overall-error-tips').text('价格获取失败！').show();
                setTimeout(function(){$(_this).parent().nextAll('.overall-error-tips').fadeOut();},5000);
            }else{
				_moudleList[_curIndex].productCode = $.trim($("#imgProductCode").val());
				_moudleList[_curIndex].venderCode = $.trim($("#imgVenderCode").val());
				_isChange = true;
				$(this).parent().nextAll('.overall-suc-tips').show();
				setTimeout(function(){$(_this).parent().nextAll('.overall-suc-tips').fadeOut();},5000);
			}
		}else if(_pcode.length == 0 && _vcode.length == 0){
			_moudleList[_curIndex].productCode = '';
			_moudleList[_curIndex].venderCode = '';
			_moudleList[_curIndex].price = '';
			_isChange = true;
			$(this).parent().nextAll('.overall-suc-tips').show();
			setTimeout(function(){$(_this).parent().nextAll('.overall-suc-tips').fadeOut();},5000);
		}else{
			$(this).parent().nextAll('.overall-suc-tips').show();
			setTimeout(function(){$(_this).parent().nextAll('.overall-suc-tips').fadeOut();},5000);
		}
	});
	$("#editVideoSave").on('click',function(){
        var link = $.trim($("#videoLink").val());
        var _this = this;
        var _reg = /^(http|https):\/\/.+$/;
        if(_moudleList[_curIndex].imageUrl == ''){
            $(this).parent().nextAll('.overall-error-tips').text('请上传图片再保存！').show();
            setTimeout(function(){$(_this).parent().nextAll('.overall-error-tips').fadeOut();},5000);
            return false;
        }else if(link.length == 0 || !_reg.test(link)){
        	_moudleList[_curIndex].videoUrl = "";
            $(this).parent().nextAll('.overall-error-tips').text('请填写正确的视频链接再保存！').show();
            setTimeout(function(){$(_this).parent().nextAll('.overall-error-tips').fadeOut();},5000);
            return false;
        }else{
        	 _moudleList[_curIndex].videoUrl = $.trim($("#videoLink").val());
            $(this).parent().nextAll('.overall-suc-tips').show();
            setTimeout(function(){$(_this).parent().nextAll('.overall-suc-tips').fadeOut();},5000);
        }
	});
	//内容主题
	$("#contentTitle").on('change',function(){
		var _contentTit = $.trim($("#contentTitle").val());
		_content.title = _contentTit;
		_isChange = true;
	});
	//内容预览
	$("#contentPre").on('click',function(){
		SERVE.com.popupbox('.pop-preview',function(){
			if(_moudleList && _moudleList.length > 0){
				for(var i=0;i<_moudleList.length;i++){
					var _nMod = '';
					switch (_moudleList[i].type){
						case 2:

							_nMod = '<div class="J_CMod J_MM" rel="2">'+
							'<div class="generateWrap">'+
							'<div class="the-shop-middle-con"><h3 class="shop-component-tit floor-title"><span><em>'+encodeEntities(_moudleList[i].text)+'</em></span></h3></div>'+
							'</div>'+
							'</div>';
							break;
						case 1:
							_nMod = '<div class="J_CMod J_MM" rel="1">'+
							'<div class="generateWrap">'+
							'<div class="the-shop-middle-con"><div class="announcement-con"><span>'+encodeEntities(_moudleList[i].text)+'</span></div></div>'+
							'</div>'+
							'</div>';
							break;
						case 3:
							_nMod = '<div class="J_CMod J_MM" rel="3">'+
							'<div class="generateWrap">'+
							'<div class="singer-banner">';
							for(var j=0;j<_moudleList[i].tags.length;j++){
								if(_moudleList[i].tags[j].direct == 0){
									_nMod += '<div class="img-tag-item img-tag-item' + _moudleList[i].tags[j].type + '" style="top:'+(_moudleList[i].tags[j].y*320-10)+'px;left:'+(_moudleList[i].tags[j].x*320)+'px;"><span>' + _moudleList[i].tags[j].name + '</span></div>';
								}else{
									_nMod += '<div class="img-tag-item img-tag-item' + _moudleList[i].tags[j].type + ' direct" style="top:'+(_moudleList[i].tags[j].y*320-10)+'px;left:'+(_moudleList[i].tags[j].x*320)+'px;"><span>' + _moudleList[i].tags[j].name + '</span></div>';
								}
							}
							_nMod +=				'<a href="#"><img src="'+_moudleList[i].imageUrl+'" alt=""/></a>' +
							'</div>'+
							'</div>'+
							'</div>';
							break;
						case 5:
							_nMod = '<div class="J_CMod J_MM" rel="5">'+
										'<div class="generateWrap">'+
											'<div class="singer-banner">';
							for(var j=0;j<_moudleList[i].tags.length;j++){
		                        if(_moudleList[i].tags[j].direct == 0){
		                            _nMod += '<div class="img-tag-item img-tag-item' + _moudleList[i].tags[j].type + '" style="top:'+(_moudleList[i].tags[j].y*320-10)+'px;left:'+(_moudleList[i].tags[j].x*320)+'px;"><span>' + _moudleList[i].tags[j].name + '</span></div>';
		                        }else{
		                            _nMod += '<div class="img-tag-item img-tag-item' + _moudleList[i].tags[j].type + ' direct" style="top:'+(_moudleList[i].tags[j].y*320-10)+'px;left:'+(_moudleList[i].tags[j].x*320)+'px;"><span>' + _moudleList[i].tags[j].name + '</span></div>';
		                        }
							}
							_nMod +=				'<a href="#"><img src="'+_moudleList[i].imageUrl+'" alt=""/></a>' +
											'</div>'+
										'</div>'+
									'</div>';
									break;
					}
					$('#preRegion').append(_nMod);

				}
				$('#preRegion').find('.direct').each(function(){
					$(this).css('left',$(this).position().left-$(this).outerWidth());
				});
			}
			$(".pop-preview .close").on('click',function(){
				$('#preRegion').empty();
			});
		});
	});

	function doSave(isPublish) {
		var _contentTit = $.trim($("#contentTitle").val());
		var _hasPic = false;
		var _emptyPic = false;
		var _emptyVideoPic = false;
        var _emptyVideoUrl = false;
		var _picCount = 0;
		//话题ID为空，清空NAME数据
		if(_content.topicId == "") _content.topicName = "";
		//判断图片或视频组件是否为空
		for(var i=0;i<_moudleList.length;i++){
			if(_moudleList[i].type == 3||_moudleList[i].type == 5){
				_picCount++;
				if(_moudleList[i].imageUrl != ""){
					_hasPic = true;
				}
				if (!_moudleList[i].imageUrl) {
					if(_moudleList[i].type == 3){//图片组件图片是否为空
						_emptyPic = true;
					}
					if(_moudleList[i].type == 5){//视频组件图片是否为空
						_emptyVideoPic = true;
					}
				}
				if(_moudleList[i].type == 5 && _moudleList[i].videoUrl == ""){//视频链接是否为空
                    _emptyVideoUrl = true;
				}
			}
		}
		if(_contentTit == ""){
			$(".pop-tips .save-tips").html("内容主题不能为空！");
			SERVE.com.popupbox('.pop-tips');
		}else if(!_hasPic) {
			$(".pop-tips .save-tips").html("至少上传一张图片！");
			SERVE.com.popupbox('.pop-tips');
		}else if(_emptyPic) {
			$(".pop-tips .save-tips").html("存在未添加图片的图片组件！");
			SERVE.com.popupbox('.pop-tips');
		}else if(_emptyVideoPic) {
			$(".pop-tips .save-tips").html("存在未添加图片的视频组件！");
			SERVE.com.popupbox('.pop-tips');
		}else if(_emptyVideoUrl) {
			$(".pop-tips .save-tips").html("视频链接不能为空！");
			SERVE.com.popupbox('.pop-tips');
		}else if(_picCount > 10) {
			$(".pop-tips .save-tips").html("最多只能上传10张图片！");
			SERVE.com.popupbox('.pop-tips');
		}else{
			var postContent = buildSaveObject();
			$.ajax({
				type:"post",
				url:_contentSureUrl,
				data:{"isPublish":isPublish,"data":JSON.stringify(postContent)},
				dataType:"json",
				success:function(data){
					_isChange = false;
					if (data.ret == '0') {
						if (isPublish) {
							window.location.href = './list.do';
						} else {
							_content.id = data.data.id;
							$(".pop-tips .save-tips").html("保存内容成功！");
							SERVE.com.popupbox('.pop-tips');
						}
					} else {
						var msg = data.ret;
						if (msg == 'content.compons.text') {
							$(".pop-tips .save-tips").html("标题或文本不能为空！");
						} else if (msg == 'content.title.miss') {
							$(".pop-tips .save-tips").html("内容主题不能为空！");
						} else if (msg == 'content.user.miss') {
							$(".pop-tips .save-tips").html("登录用户未授权！");
						} else if (msg == 'content.compons.image') {
							$(".pop-tips .save-tips").html("存在未添加图片的图片组件！");
						} else if (msg == 'content.compons.video.image') {
							$(".pop-tips .save-tips").html("存在未添加图片的视频组件！");
						} else if (msg == 'content.compons.video.url') {
							$(".pop-tips .save-tips").html("视频链接不能为空！");
						} else if (msg == 'content.compons.count') {
							$(".pop-tips .save-tips").html("至少上传一张图片！");
						} else if (msg == 'content.user.disabled') {
							$(".pop-tips .save-tips").html("用户已禁用！");
						} else if (data.ret) {
							$(".pop-tips .save-tips").html("操作失败，请稍后再试！（RET:" + data.ret + "）");
						} else if (data.idsIntercepted) {
							$(".pop-tips .save-tips").html("登录过期，请重新登录");
						} else {
							$(".pop-tips .save-tips").html("操作失败，请稍后再试！");
						}
						SERVE.com.popupbox('.pop-tips');
					}
				},
				error:function(){
					$(".pop-tips .save-tips").html("操作失败，请稍后再试！（AJAX请求异常）");
					SERVE.com.popupbox('.pop-tips');
				}
			});
		}
	}

	//保存内容
	$("#contentSave").on('click',function(){
		doSave(false);
	});
	//发布内容
	$("#contentRelease").on('click',function(){
		doSave(true);
	});

	function buildSaveObject() {
		var ret = $.extend(true, {}, _content);;
		ret.compons = $.map(_moudleList, function(n){return $.extend(true, {}, n);});
		if (_country) {
			ret.country = _country;
		}
		if (_province) {
			ret.prov = _province;
		}
		if (_city) {
			ret.city = _city;
		}
		if (_region) {
			ret.region = _region;
		}
		if (_location && _location.length > 4) {
			ret.location = _location;
		}
		delete ret.commentCnt;
		delete ret.comments;
		delete ret.createTime;
		delete ret.hot_score;
		delete ret.likeCnt;
		delete ret.liked;
		delete ret.likes;
		delete ret.reportCnt;
		delete ret.smallImageUrl;
		delete ret.src;
		delete ret.status;
		delete ret.thumbImageUrl;
		delete ret.userId;
		for (var i=0; i<ret.compons.length; i++) {
			var compon = ret.compons[i];
			if (compon.type == 3||compon.type == 5) {
				if (compon.imageMark) compon.imageUrl = compon.imageMark;
			}
			delete compon.imageMark;
			delete compon.smallImageUrl;
			delete compon.contentId;
			delete compon.id;
			if (compon.tags && compon.tags.length > 0) {
				for (var j=0; j<compon.tags.length; j++) {
					var tag = compon.tags[j];
					delete tag.contentId;
					delete tag.id;
					delete tag.pos;
				}
			}
		}
		return ret;
	}
	
	//获取价格
	var getPrice = function(_pcode,_vcode, success){
	    var cityId = 9173;
        var partnumber = _pcode;
        var vendorid = _vcode;
        var params = "_" + cityId + "_" + partnumber + "|||";
		if(vendorid == "0000000000" || vendorid == "0"){
			params = "_" + cityId + "_" + partnumber + "||2|";
		}else{
			//指定供应商
			params = params + vendorid;
		}
		params = params + "_2_priceServiceCallBack_.html";
		$.ajax({
           // url: '${scdc.getmakertprice}' + params, 
            url: 'http://b2csit.cnsuning.com/emall/priceService' + params,
            dataType: 'jsonp',
            jsonp: false,
            jsonpCallback: 'priceServiceCallBack',
            timeout: 3000,
            cache: true,
          
            success: function(data) {
            	success(data);
            	 
          
            },  
            error : function(XMLHttpRequest, textStatus, errorThrown) {
            }
        });
	}
	
	//话题搜索
    var TopPic = {
    	init: function(){
    		this.topicPageSize = 1;
	 		this.topicTotalPage = 10;
    		this.search();
    		this.selectedOption();
    	},
    	//搜索话题操作
    	search: function(){
    		var self = this;
		    $("#topicWrap").find("input").on("keyup", function(){
		          var val = $.trim($(this).val());
		          if(val == "" && val.length == 0) {//话题为空
		          	   $("#topicList").html("");
		          	   $("#topicWrap").removeAttr("style");
		          	   _content.topicId = "";
		          	   _content.topicName = "";
		          	   return;
		          };
		          var url = _topicUrl + val + "_" + self.topicPageSize + "_" + self.topicTotalPage + ".do";
		          self.getTopicData(url, function(data){
		                  if(data.data.length > 0){
			                  	var str = ' <ul class="topic-list">';
			                  	for(var i = 0, len = data.data.length; i < len; i++){
			                          str += ' <li data-id= '+ data.data[i].id +'>'+ data.data[i].name +'</li> ';
			                  	}
			                  	str += '</ul>';
			                  	$("#topicList").html(str);
			                  	$("#topicWrap").height($("#topicList").find("ul").height()+20);
		                  }
		          });
		    });
    	},
    	//选中数据
    	selectedOption: function(){
            $("#topicList").delegate("li", "click", function(){
            	 var topicId = $(this).attr("data-id");
            	 var topicName = $(this).html();
            	 $("#topicWrap").find("input").val(topicName);
            	 $("#topicList").html("");
            	 $("#topicWrap").removeAttr("style");
            	 _content.topicId = topicId;
            	 _content.topicName = topicName;
            });
    	},
		 //获取话题数据
		 getTopicData: function(url, success){
				$.ajax({
					type:"get",
					url:url,
					dataType:"json",
					success: function(data){
	                   success(data);
					},
					error: function(){
						
					}
				});
			}
    }.init();

	//关联内容 
	var Relation = {
	    init: function(){
	    	this.checkedSelect = [];//选中项的值 不超过3个
	    	this.relationPageSize = 1;//页码
	    	this.relationTotalPage = 10;//总条数
	    	this.addRelation();//添加关联内容
	    	this.clickPage();//当前点击数字翻页
	    	this.prePage();//上一页
	    	this.nextPage();//下一页
	    	this.checkedSelected();//选中操作
	    	this.confirmRelation();//确定关联
	    	this.delRelation();//删除关联
	    },
	    //添加关联内容
	    addRelation: function(){
	    	var self = this;
           	$("#addRelation").on("click", function(){
                self.relationPageSize = 1;//重置
           		SERVE.com.popupbox('.pop-relation-wrap', function(){
                      self.getRelationData(true);
           		});

           	});
	    },
	    //选中存值 
	    checkedSelected: function(){
           var self = this;
             $("#relationList").delegate("input", "change", function(){
             	var id = $(this).attr("id").split("_")[1];
             	var title = $(this).siblings("label").attr("data-title");
             	var smallImageUrl = $(this).siblings("label").attr("data-img");
             	 if(this.checked){
             	 	if(self.checkedSelect.length >= 3){
             	 		$(".pop-tips .save-tips").html("关联失败，最多只能关联3条内容！");
         	 			SERVE.com.popupbox('.pop-tips');
         	 			this.checked = false;
             	 	}else{
             	 		var list = {
	             	 		id: id,
	             	 		title: title,
	             	 		smallImageUrl: smallImageUrl
	             	 	};
	             	 	self.checkedSelect.push(list);
             	 	}
             	 	
             	 }else{
             	 	//向下删除数组
             	 	for(var len = self.checkedSelect.length, i = len - 1; i >= 0; i--){
             	 		 if(self.checkedSelect[i].id == id){
             	 		 	self.checkedSelect.splice(i, 1);
             	 		 }
             	 	}
             	 }
             });
	    },
	    //设置checked选中状态
	    setChecked: function(){
	    	var self = this;
	    	 $("#relationList").find("input").each(function(){
	    	 	var id = $(this).attr("id").split("_")[1];
	    	 	   for(var i = 0, len = self.checkedSelect.length; i < len; i++){
             	 		 if(self.checkedSelect[i].id == id){
             	 		 	 this.checked = true;
             	 		 }
             	 	}
	    	 });

	    },
	    //确定关联
	    confirmRelation: function(){
	    	var self = this;
	    	$("#confirmRelation").on("click", function(){
	    		var str = "";
	    		var ids = "";
		    	_content.relContents = [];
	    		for(var i = 0, len = self.checkedSelect.length; i < len; i++){
	    			str += '<li data-id="'+self.checkedSelect[i].id +'">';
                    str += '<p class="rel-title">'+ self.checkedSelect[i].title +'</p>';
					var imgUrl = self.checkedSelect[i].smallImageUrl;
					 var compons = [];
					if(imgUrl.indexOf("|") < 0){
                        compons.push(imgUrl);
					}else{
                      compons = imgUrl.split("|");
					}
                    for(var j = 0, len2 = compons.length; j < len2; j++ ){
                    	str += '<img src="'+ compons[j] +'" width="80" height="80">';
                    }
                    str += '<span class="btn-wrap del-wrap"><span class="btn btn-yellow del-relation">删除</span></span>';
                    str += '</li>';
	    			_content.relContents.push({id: self.checkedSelect[i].id});
             	 }
             	 $(".relation-content-list").html("").append(str);
             	 SERVE.com.closebox('.pop-relation-wrap');
	    	});
	    	
	    },
	    //初始化选中项
	    initChecked: function(id){
	    	var self = this;
	    	self.checkedSelect = [];
	    	 var list = $(".relation-content-list");
			 var li = list.find("li");
	    	list.find("li").each(function(){
				    var id = $(this).attr("data-id");
					 var title = $(this).find(".rel-title").html();
					 var smallImageUrl = [];
					 $(this).find("img").each(function(){
						  smallImageUrl.push($(this).attr("src"));
					 });
					
              	    self.checkedSelect.push({
              	    	id: id,
              	    	title:title,
              	    	smallImageUrl: smallImageUrl.join("|")});//存储选中值 
			
			});
             
					
	    },
		//获取关联数据
		getRelationData: function(first){
			var self = this;
				$.ajax({
					type:"get",
					url: _relationUrl + _contentId + "_" + self.relationPageSize + "_" + self.relationTotalPage + ".do",
					dataType:"json",
					success: function(data){
	                         var list = data.data.datas;
                      	     var pageCount = data.data.pageCount;
                      	     // var pageCount = 7;
                      	     // self.relationPageSize = 1;
                      	     //内容列表
                             if(list.length > 0){
                             	  var str = '<ul class="pop-relation-list">';
                             	  for(var i = 0, len = list.length; i < len; i++){
                             	  	 var compons = list[i].compons, imgStr = [];
                             	  	 
                             	  	 for(var j = 0, len2 = compons.length; j < len2; j++){
                                             imgStr.push(compons[j].smallImageUrl);

                             		 }
                             		 str += '<li><input type="checkbox" id="checkbox_'+ list[i].id +'"><label for="checkbox_'+ list[i].id +'" data-title='+ list[i].title+' data-img='+ imgStr.join('|')+'>'+ list[i].title +'</label></li>';
                             	  }
                             	  str += '</ul>';
                             	  $("#relationList").html("").append(str);
                             }
                             first && self.initChecked();//初始化设置
                             self.setChecked();
                             //分页
                             var pageStr = self.pageOption(pageCount);
                         	 $(".pop-page").html("").append(pageStr);


					},
					error: function(){
						
					}
				});
		},
		//分页
		pageOption: function(pageCount){
			 var self = this;
             var pageStr = "";
             //上一页  
             if(self.relationPageSize == 1){
                   pageStr += '<span id="prePage" class="pre-page disabled"><i class="sign left">&lt;</i>上一页</span>';
             }else{
             	   pageStr += '<a id="prePage"  href="javascript:void(0);"><i class="sign left">&lt;</i>上一页</a>';
             }

             //中间页 4种情况 一种小于5没有...   一种前4条+...   一种...+后4条 一种...+中间3条+...
            if(pageCount <= 5){
               	for(var i = 1, len = pageCount; i <= len; i++){
               		if(self.relationPageSize == i){
                         pageStr += '<a href="javascript:void(0);" class="num cur">'+ i +'</a>';
               	 	}else{
               		   pageStr += '<a href="javascript:void(0);" class="num">'+ i +'</a>';
               	 	}
               	}

            }else if(self.relationPageSize <= 3){
             	for(var i = 1, len = pageCount < 5 ? pageCount+1 : 5 ; i < len; i++){
             		if(self.relationPageSize == i){
                       pageStr += '<a href="javascript:void(0);" class="num cur">'+ i +'</a>';
             	 	}else{
             		   pageStr += '<a href="javascript:void(0);" class="num">'+ i +'</a>';
             	 	}
             	}
             	if(pageCount >= 5){
             		if(pageCount > 5){
             			 pageStr += '<span class="page-more">...</span>';
             		}
                    pageStr += '<a href="javascript:void(0);" class="num">'+ pageCount +'</a>';
             	}
             }else if(self.relationPageSize >= pageCount-3){
             	 pageStr += '<a href="javascript:void(0);" class="num">1</a>';
             	 pageStr += '<span class="page-more">...</span>';
             	 for(var i = pageCount-3, len = pageCount; i <= len; i++){
             	 	if(self.relationPageSize == i){
                       pageStr += '<a href="javascript:void(0);" class="num cur">'+ i +'</a>';
             	 	}else{
             		   pageStr += '<a href="javascript:void(0);" class="num">'+ i +'</a>';
             	 	}
             	}
                 
             }else{
             	  pageStr += '<a href="javascript:void(0);" class="num">1</a>';
                  pageStr += '<span class="page-more">...</span>';
                  pageStr += '<a href="javascript:void(0);" class="num">'+ parseInt(self.relationPageSize-1, 10) +'</a>';
                  pageStr += '<a href="javascript:void(0);" class="num cur">'+ self.relationPageSize +'</a>';
                  pageStr += '<a href="javascript:void(0);" class="num">'+ parseInt(self.relationPageSize+1, 10) +'</a>';
                  pageStr += '<span class="page-more">...</span>';
                  pageStr += '<a href="javascript:void(0);" class="num">'+ pageCount +'</a>';
             	
             }
             //下一页 
             if(self.relationPageSize == pageCount){
                   pageStr += '<span id="nextPage" class="next-page disabled" >下一页<i class="sign right">&gt;</i></span>';
             }else{
             	   pageStr += '<a id="nextPage"  href="javascript:void(0);">下一页<i class="sign right">&gt;</i></a>';
             }

             return pageStr;

		},
		//点击分页
		clickPage: function(){
			var self = this;
             $(".pop-page").delegate(".num", "click", function(){
             	  var val = $(this).html();
             	  self.eqPage(val);
             });
		},
		//上一页数据
		prePage: function(){
			var self = this;
             $(".pop-page").delegate("a#prePage", "click", function(){
             	  var val = $(this).html();
             	   self.eqPage(parseInt(self.relationPageSize-1, 10));
             });

           
		},
		//下一页数据
		nextPage: function(){
			var self = this;
             $(".pop-page").delegate("a#nextPage", "click", function(){
             	  var val = $(this).html();
             	   self.eqPage(parseInt(self.relationPageSize+1, 10));
             });
		},
		//分页数据
		eqPage: function(pageSize){
             this.relationPageSize = pageSize;
         	 this.getRelationData();
		},
		//删除关联内容 
		delRelation: function(){

			//删除关联内容 
			$(".relation-content-list").delegate("li", "mouseover", function(){
				var self = $(this);
				self.addClass("cur");
			}).delegate("li", "mouseout", function(){
				var self = $(this);
				self.removeClass("cur");
			});

			//点击删除
			$(".relation-content-list").delegate(".del-relation","click", function(){
				 var _parent = $(this).parents("li");
				var _relationId = _parent.attr("data-id");
				// $.ajax({
				// 	type:"get",
				// 	url: _delRelationUrl + _contentId + "_" + _relationId +".do",
				// 	dataType:"json",
				// 	success:function(data){
				// 		if(data.ret == '0'){
								//删除关联数组
			             	 	for(var len = _content.relContents.length, i = len - 1; i >= 0; i--){
			             	 		 if(_content.relContents[i].id == _relationId){
			             	 		 	_content.relContents.splice(i, 1);
			             	 		 }
			             	 	}
								// $(".pop-tips .save-tips").html("删除成功");
								// SERVE.com.popupbox('.pop-tips');
								_parent.remove();

				// 		}else{
    //                             $(".pop-tips .save-tips").html("删除失败");
				// 				SERVE.com.popupbox('.pop-tips');
				// 		}
                       
				// 	},
				// 	error: function(){
				// 		       $(".pop-tips .save-tips").html("删除失败");
				// 				SERVE.com.popupbox('.pop-tips');

				// 	}
				// });
			});
		}

	}.init();
	
});


/**
 * Escapes all potentially dangerous characters, so that the
 * resulting string can be safely inserted into attribute or
 * element text.
 * @param value
 * @returns {string} escaped text
 */
var SURROGATE_PAIR_REGEXP = /[\uD800-\uDBFF][\uDC00-\uDFFF]/g;
var NON_ALPHANUMERIC_REGEXP = /([^\#-~| |!])/g;
function encodeEntities(value) {
	return value.
		replace(/&/g, '&amp;').
		replace(SURROGATE_PAIR_REGEXP, function(value) {
			var hi = value.charCodeAt(0);
			var low = value.charCodeAt(1);
			return '&#' + (((hi - 0xD800) * 0x400) + (low - 0xDC00) + 0x10000) + ';';
		}).
		replace(NON_ALPHANUMERIC_REGEXP, function(value) {
			return '&#' + value.charCodeAt(0) + ';';
		}).
		replace(/</g, '&lt;').
		replace(/>/g, '&gt;').
		replace(/\n/g, '<br/>');
}