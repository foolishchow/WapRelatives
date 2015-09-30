/*!
 * 可视化编辑 - 操作处理
 * 依赖关系：jQuery , visual.js
*/

var VisualDo = {
	
	//点击挂件时的回调函数
	mousedownCallback : function(){
		//alert(Visual.getRegionName(Visual.dragObj.widget,true))
	},
	
	//拖拽完成后回调函数
	dropCallback : function(){
		//alert(Visual.getRegionName(Visual.dragObj.widget,true))
	},

	
	
	//删除挂件
	delWidget : function(){
		$(".J_Region").delegate(".ve_bar_del","click",function(){
			var _index = $(this).parents(".J_CMod").index();
			$(this).parents(".J_CMod").remove();
			$(".bs-edit-wrap").css("visibility","hidden");
			$(".bs-content").addClass("bs-content-cols");
			var delLength = $(".simulator").find(".J_CMod").length;
			if(delLength<=0){
				$(".simulator .J_Region").append('<div class="J_CMod J_CMod_none"></div>');
			}
			$(".simulator .J_CMod").first().find(".ve_bar_up").addClass("ve_bar_up_first").parents('.J_CMod').siblings('.J_CMod').find('.ve_bar_up').removeClass('ve_bar_up_first');

			$(".simulator .J_CMod").last().find(".ve_bar_down").addClass("ve_bar_down_last").parents('.J_CMod').siblings('.J_CMod').find('.ve_bar_down').removeClass('ve_bar_down_last');

			_moudleList.splice(_index,1);
			_isChange = true;
			return false;
		});
	},
	
	//向上移动挂件
	moveUpWidget : function(){
		
		$(".simulator").delegate(".ve_bar_up","click",function(){
			var goMove = $(this).parents(".J_CMod");
			var _oindex = goMove.index();
			var goMove_prev = $(this).parents(".J_CMod").prev();
			if($(this).hasClass("ve_bar_up_first")){
				return false;
			}else{
				goMove_prev.before(goMove);
			}
			$(".simulator .J_CMod").last().find(".ve_bar_down").addClass("ve_bar_down_last").parents('.J_CMod').siblings('.J_CMod').find('.ve_bar_down').removeClass('ve_bar_down_last');

			$(".simulator .J_CMod").first().find(".ve_bar_up").addClass("ve_bar_up_first").parents('.J_CMod').siblings('.J_CMod').find('.ve_bar_up').removeClass('ve_bar_up_first');

			var _nindex = goMove.index();
			var _mMod = _moudleList.splice(_oindex,1);
			_moudleList.splice(_nindex,0,_mMod[0]);
			_curIndex = _nindex;
			_isChange = true;
		});
	},
	
	
	//向下移动挂件
	moveDownWidget : function(){
		$(".simulator").delegate(".ve_bar_down","click",function(){
			var goMove = $(this).parents(".J_CMod");
			var _oindex = goMove.index();
			var goMove_next = $(this).parents(".J_CMod").next();
			
			if($(this).hasClass("ve_bar_down_last")){
				return false;
			}else{
				goMove_next.after(goMove);
			}
			$(".simulator .J_CMod").last().find(".ve_bar_down").addClass("ve_bar_down_last").parents('.J_CMod').siblings('.J_CMod').find('.ve_bar_down').removeClass('ve_bar_down_last');
			
			$(".simulator .J_CMod").first().find(".ve_bar_up").addClass("ve_bar_up_first").parents('.J_CMod').siblings('.J_CMod').find('.ve_bar_up').removeClass('ve_bar_up_first');

			var _nindex = goMove.index();
			var _mMod = _moudleList.splice(_oindex,1);
			_moudleList.splice(_nindex,0,_mMod[0]);
			_curIndex = _nindex;
			_isChange = true;
		});
	}

};