//sdf.js
//获取应用实例
var app = getApp();
Page({
  data: {
    remind: '加载中',
    userName: '',
    roomInfo:false,
    renderData: {}
  },

  onLoad: function(){
    var _this = this;
    if(!app._user.we.info.name || !app._user.we.info.id){
      _this.setData({
        remind: '未绑定帐号'
      });
      return false;
    }
    if(!app._user.we.room || !app._user.we.build){
      wx.request({
        url: 'http://211.64.142.212/api/rest/student/stu-roominfo?stuno='+app._user.we.info.id,
        success:function(res){
          app._user.we.build= res.data.house.lymc,
          app._user.we.room=res.data.house.fjmc,
          app._user.we.buildArea= res.data.house.areaName,
          app._user.we.roomId = res.data.house.roomid
          _this.getroominfo()
          _this.setData({
            roomInfo:res.data.house,
          })

        }
      })
    }
    _this.setData({
      userName: app._user.we.info.name,
      userYkth: app._user.we.ykth
    });
    //判断并读取缓存
    if(app.cache.sdf){ 
      if (app._user.we.buildArea == '鱼山校区' || app._user.we.buildArea == '崂山北海苑'){
        _this.sdfRender(app.cache.sdf); 
      }
      else {
        _this.sdfRender2(app.cache.sdf);
      }
  }
    wx.showNavigationBarLoading();
    wx.request({
        url: 'http://211.64.142.212/api/rest/student/stu-roominfo?stuno='+app._user.we.info.id,
        success:function(res){
          app._user.we.build= res.data.house.lymc,
          app._user.we.room=res.data.house.fjmc,
          app._user.we.buildArea= res.data.house.areaName,
          app._user.we.roomId = res.data.house.roomid
          _this.getroominfo()
          _this.setData({
            roomInfo:res.data.house,
          })

        }
      })
    _this.getroominfo();
  },

  sdfRender2(info){
    var _this = this
    _this.setData({
      'renderData.room_name': info.xiaoqu+info.room,
      'renderData.record_time': '当前',
      'renderData.elec_cost': (parseFloat(info.restAmp)-parseFloat(info.chargeAmp)).toString(),//
      'renderData.elec_start': parseFloat(info.monthTotalAmp).toFixed(3).toString(),
      'renderData.elec_end': '<无法查询>',
      'renderData.elec_free': '<无法查询>',
      'renderData.elec_spend': parseFloat(info.restAmp).toFixed(3).toString(),
      remind: ''
    })
  },
  sdfRender(info) {
    var _this = this
    var data = _this.stringTurnXmlturnJson(info, 'string')

    _this.setData({
      //'renderData': info,
      'renderData.room_name': app._user.we.build+app._user.we.room,
      'renderData.record_time': '当前',
      'renderData.elec_cost': data.josn1,
      'renderData.elec_start': data.josn3,
      'renderData.elec_end': data.josn4,
      'renderData.elec_free': data.josn5,
      'renderData.elec_spend': (parseFloat(data.josn1) + parseFloat(data.josn2)).toString(),
      remind: ''
    });
  },
  stringTurnXmlturnJson(XML, value) {
    var Parser = require('./dom-parser.js')
    var XMLParser = new Parser.DOMParser();
    var doc = XMLParser.parseFromString(XML);
    var xmlStr = doc.getElementsByTagName(value)[0].firstChild.nodeValue;
    var xmlStr1 = doc.getElementsByTagName(value)[1].firstChild.nodeValue;
    var xmlStr2 = doc.getElementsByTagName(value)[2].firstChild.nodeValue;
    var xmlStr3 = doc.getElementsByTagName(value)[3].firstChild.nodeValue;
    var xmlStr4 = doc.getElementsByTagName(value)[4].firstChild.nodeValue;
    var xmlStr5 = doc.getElementsByTagName(value)[5].firstChild.nodeValue;
    var data = {
      josn: xmlStr,
      josn1: xmlStr1,
      josn2: xmlStr2,
      josn3: xmlStr3,
      josn4: xmlStr4,
      josn5: xmlStr5
    }
    return data;
  },

  getroominfo(){
    var _this=this
    if (app._user.we.buildArea == '崂山北海苑' || app._user.we.buildArea == '鱼山校区') {
      var dataCopy = '<?xml version="1.0" encoding="utf-8"?><soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body><TraceDlZTArray xmlns="http://LwDkGDService.asmx/"><inMm>60C85273A0D8834B798C5FA766D76B866B609AA755C3584F797F798C7FF8785D</inMm><inXq>'
      dataCopy += app._user.we.buildArea
      dataCopy += '</inXq><inFj>'
      //if (app._user.we.buildArea == '崂山北海苑' ){
        dataCopy += parseInt(app._user.we.build.slice(2,4)).toString()
        //单元房要加单元号
        // if (app._user.we.build.slice(2,3)>'09'){
        //   dataCopy += 
        // }
        dataCopy += '0' + app._user.we.room.charAt(0)
        dataCopy += '0' + app._user.we.room.slice(1)
      

      //dataCopy += app._user.we.roomId
      dataCopy += '</inFj></TraceDlZTArray></soap:Body></soap:Envelope>'


      // 发送请求
      wx.request({
        url: 'http://211.64.142.209:8011/LwDkGDService.asmx',
        method: 'POST',
        header: {
          'Content-Type': 'text/xml;charset=utf-8',
          'SOAPAction': 'http://LwDkGDService.asmx/' + 'TraceDlZTArray'
        },
        data: dataCopy,
        // app.key({
        //   openid: app._user.openid,
        //   buildingNo: app._user.we.build,
        //   floor: app._user.we.room.slice(0,1),
        //   room: parseInt(app._user.we.room.slice(1))
        // }),
        success: function (res) {
          if (res.data && res.statusCode === 200) {
            var info = res.data;
            if (info) {
              //保存电费缓存
              app.saveCache('sdf', info);
              _this.sdfRender(info);
            } else { _this.setData({ remind: '暂无数据' }); }

          } else {
            app.removeCache('sdf');
            _this.setData({
              remind: res.data.message || '未知错误'
            });
          }
        },
        fail: function (res) {
          if (_this.data.remind == '加载中') {
            _this.setData({
              remind: '网络错误'
            });
          }
          console.warn('网络错误');
        },
        complete: function () {
          wx.hideNavigationBarLoading();
        }
      });
    } else {
      var xiaoquid = '0';
      if (app._user.we.buildArea == '崂山南海苑') {
        xiaoquid = '2'
      } else if (app._user.we.buildArea == '崂山东海苑') {
        xiaoquid = '3'
      }
      wx.request({
        url: 'http://hqsz.ouc.edu.cn/hydf/kdroom/getRoomAmp?roomid=' + app._user.we.roomId + '&xiaoquid=' + xiaoquid,
        success: function (res) {
          if (res.data && res.data.message == '查询成功') {
            var info = res.data.data;
            if (info) {
              //保存电费缓存
              app.saveCache('sdf', info);
              _this.sdfRender2(info);
            } else { _this.setData({ remind: '暂无数据' }); }

          } else {
            app.removeCache('sdf');
            _this.setData({
              remind: res.data.message || '未知错误'
            });
          }
        },
        fail: function (res) {
          if (_this.data.remind == '加载中') {
            _this.setData({
              remind: '网络错误'
            });
          }
          console.warn('网络错误');
        },
        complete: function () {
          wx.hideNavigationBarLoading();
        }
      });
    }
  }

  

  
    


});
