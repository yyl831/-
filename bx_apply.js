//bx_apply.js
//获取应用实例
var app = getApp();
Page({
  remind: '加载中',
  data: {
    serviceTypeList: {},      //获取到的服务类型列表数据
    serviceAreaList: [],      //获取到的服务区域列表数据

    serviceTypeValue: false,  //服务类型picker-value
    serviceTypeRange: [],     //服务类型picker-range，渲染用
    serviceTypeAllRange:[],   //储存用

    serviceObjectValue: false,//服务项目picker-value
    serviceObjectRange: ['请先选择服务类型'],   //服务项目picker-range
    serviceObjectAllRange:null,

    serviceTimeAllRange:[],
    serviceTimeValue:false,
    serviceDateRange:[],
    serviceDateValue:false,

    serviceAreaValueParent: false,  //服务区域picker-value
    serviceAreaValueSon: false,  //服务区域picker-value
    pickerValue:false,
    serviceAllParentArea: [],//储存用
    serviceAllSonArea: null,//储存用
    serviceAreaParent:[],//渲染用
    serviceAreaSon:[],//渲染用
    serviceArea:[,],


    formData: {             //表单数据
        Id: '',         //统一认证码
        Name: '',       //姓名
        Title: '',      //标题
        CategoryId: '', //服务类型
        SpecificId: '', //服务项目id
        Phone:  '',     //报修用户电话
        AddressId:  '', //报修区域id
        Address: '',    //报修地点
        Content: ''     //报修内容
    },
    showError: false
  },
  onLoad: function(){
    if(!app._user.we.ykth || !app._user.we.info.name){
      this.setData({
        remind: '未绑定'
      });
      //return true;
    }
    //this.setData({
      //'formData.Id': app._user.we.ykth,
      //'formData.Name': app._user.we.info.name
    //});
    // 发送请求
    this.getServiceType();
    this.getServiceArea();
    this.getServiceDate();
    this.getServiceTime();
  },

  getServiceTime() {
    var _this = this;
    wx.vrequest({
      url: app._server + '/repair/api/v3/repair/publish/bookTime/today/10423/',
      success: function (res) {
        if (res.data && res.data.status === 'success') {
          var list = res.data.data, serviceTimeAllRange = [[],[]]
              serviceTimeAllRange[0] = list.start;
              serviceTimeAllRange[1] = list.end;
          _this.setData({
            serviceTimeAllRange: serviceTimeAllRange,
          });
          if (_this.data.serviceTimeAllRange.length) {
            _this.setData({
              remind: ''
            });
          }
        } else {
          _this.setData({
            remind: res.data.message || '未知错误'
          });
        }
      },
      fail: function (res) {
        app.showErrorModal(res.errMsg);
        _this.setData({
          remind: '网络错误'
        });
      }
    });
  },

  getServiceDate(){
    var _this = this;
    wx.vrequest({
      url: app._server + '/repair/api/v3/repair/publish/bookDate/10423',
      success: function (res) {
        if (res.data && res.data.status === 'success') {
          var list = res.data.data, serviceDateRange = []
          for (var key in list) {
            if (list.hasOwnProperty(key)) {
              serviceDateRange.push(list[key]);
            }
          }
          _this.setData({
            serviceDateRange: serviceDateRange,
          });
          if (_this.data.serviceDateRange.length) {
            _this.setData({
              remind: ''
            });
          }
        } else {
          _this.setData({
            remind: res.data.message || '未知错误'
          });
        }
      },
      fail: function (res) {
        app.showErrorModal(res.errMsg);
        _this.setData({
          remind: '网络错误'
        });
      }
    });
  },

  getServiceType: function () {
    var _this = this;
    wx.vrequest({
      url: app._server + '/repair/api/v3/repair/publish/repairItem?areaId=02&schoolCode=10423&parentId=root',
      data:{
        areaId:'02',
        schoolCode:'10423',
        parentId:'root'
      },
      success: function(res) {
        if(res.data && res.data.status === 'success'){
          var list = res.data.data,serviceTypeRange = [],serviceTypeAllRange = [[],[]];
          for(var key in list){ 
            if(list.hasOwnProperty(key)){ 
              serviceTypeRange.push(list[key].text);
              serviceTypeAllRange[0].push(list[key].id);
              serviceTypeAllRange[1].push(list[key].text);
            }
          }
          _this.setData({
            serviceTypeList: list,
            serviceTypeRange: serviceTypeRange,
            serviceTypeAllRange:serviceTypeAllRange
          });
          if(_this.data.serviceTypeRange.length){  
            _this.setData({
              remind: ''
            });
          }
        }else{
          _this.setData({
            remind: res.data.message || '未知错误'
          });
        }
      },
      fail: function(res) {
        app.showErrorModal(res.errMsg);
        _this.setData({
          remind: '网络错误'
        });
      }
    });
  },
  getServiceArea: function () {
    var _this = this;
    wx.vrequest({
      url: app._server + '/repair/api/v3/repair/publish/repairArea/10423/root',
      success: function(res) {
        if(res.data && res.data.status === 'success'){
          var list = res.data.data;
          var serviceAreaRange1 = list.map(function(e,i){
             return e.areaName;
          });
          
          var serviceAreaRange2 = list.map(function (e, i) {
            return e.areaId;
          });
          var serviceAreaAllname = [[],[]];
          for(var i in serviceAreaRange1){
            serviceAreaAllname[0][i] = serviceAreaRange2[i];
            serviceAreaAllname[1][i] = serviceAreaRange1[i];
          }

          _this.setData({
            serviceAreaList: list,
            serviceAllParentArea:serviceAreaAllname,
            serviceAreaParent:serviceAreaRange1,
          });
          if(_this.data.serviceAllParentArea.length){  
            _this.setData({
              remind: ''
            });
          }
        }else{
          _this.setData({
            remind: res.data.message || '未知错误'
          });
        }
      },
      fail: function(res) {
        app.showErrorModal(res.errMsg);
        _this.setData({
          remind: '网络错误'
        });
      }
    });

    

  },

  listenerServiceDate: function(e){
    var _this = this
    _this.setData({
      serviceDateValue:e.detail.value,
      serviceTimeValue:[0,0]
    })
  },

  listenerServiceTime: function (e) {
    var _this = this
    if(_this.data.serviceTimeAllRange[0][e.detail.value[0]]>_this.data.serviceTimeAllRange[1][e.detail.value[1]]&&e.detail.value[0]!=0){
      wx.showModal({
        title: '错误选择！',
        content: '开始时间大于结束时间！请重新选择。',
        success:function(res){
          _this.setData({
            serviceTimeValue:false
          })
        }
      })
    }
    else{
      _this.setData({
        serviceTimeValue: e.detail.value
      })
    }
    
  },

  listenerServiceType: function(e) {
    // var index = e.detail.value;
    // var theServiceTypeList = this.data.serviceTypeList[this.data.serviceTypeRange[index]];
    // var serviceObjectRange = theServiceTypeList.map(function(e, i){
    //   return e.Name;
    // });

    var _this = this
    var parentId = _this.data.serviceTypeAllRange[0][e.detail.value];
    if (_this.data.serviceObjectAllRange == null)
      _this.data.serviceObjectAllRange = [];
    if (_this.data.serviceObjectAllRange[e.detail.value] == null || _this.data.serviceObjectAllRange[e.detail.value].length == 0) {
      wx.vrequest({
        url: app._server + '/repair/api/v3/repair/publish/repairItem?areaId=02&schoolCode=10423&parentId='+parentId,
        data:{
          areaId: '02',
          schoolCode: '10423',
          parentId: parentId
        },
        success: function (res) {
          var son = res.data.data
          var sonType = []
          for (var i in son)
            sonType[i] = son[i].text
          _this.data.serviceObjectAllRange[e.detail.value] = sonType;
          _this.setData({
            serviceTypeValue: e.detail.value,
            serviceObjectRange: sonType
          })
        }
      })
    }
    else {
      _this.setData({
        serviceTypeValue: e.detail.value,
        serviceObjectRange: _this.data.serviceObjectAllRange[e.detail.value]
      })
    }


    this.setData({
      serviceTypeValue: e.detail.value,
      serviceObjectValue: false,
    });
  },
  listenerServiceObject: function(e) {
    if(!this.data.serviceTypeValue){
      app.showErrorModal('请先选择服务类型', '提醒');
      return false;
    }
    var index = e.detail.value;
    //var theServiceTypeList = this.data.serviceTypeList[this.data.serviceTypeRange[this.data.serviceTypeValue]];
    this.setData({
      serviceObjectValue: index,
      //'formData.CategoryId': theServiceTypeList[index].CategId,
      //'formData.SpecificId': theServiceTypeList[index].Id
    });
  },

  
  listenerAreaColumnchange :function(e){
    var _this = this;
    
  },

  listenerServiceArea1: function(e) {
    this.setData({
      serviceAreaValueSon: e.detail.value,
      //'formData.AddressId': this.data.serviceAreaList[e.detail.value].Id
    });
  },
  listenerServiceArea: function (e) {
    var _this = this
    var parentId = _this.data.serviceAllParentArea[0][e.detail.value];
    if (_this.data.serviceAllSonArea==null)
      _this.data.serviceAllSonArea = [];
    if (_this.data.serviceAllSonArea[e.detail.value] == null || _this.data.serviceAllSonArea[e.detail.value].length==0) {
      wx.vrequest({
        url: app._server + '/repair/api/v3/repair/publish/repairArea/10423/' + parentId,
        success: function (res) {
          var son = res.data.data
          var sonArea = []
          for (var i in son)
            sonArea[i] = son[i].areaName
          _this.data.serviceAllSonArea[e.detail.value] = sonArea;
          _this.setData({
            serviceAreaValueParent:e.detail.value,
            serviceAreaSon: sonArea
          })
        }
      })
    }
    else {
      _this.setData({
        serviceAreaValueParent:e.detail.value,
        serviceAreaSon: _this.data.serviceAllSonArea[e.detail.value]
      })
    }


    this.setData({
      serviceAreaValueParent: e.detail.value,
      serviceAreaValueSon:false
      //'formData.AddressId': this.data.serviceAreaList[e.detail.value].Id
    });
  },
  listenerAddress: function(e) {
    this.setData({
      'formData.Address': e.detail.value
    });
  },
  listenerTel: function(e) {
    this.setData({
      'formData.Phone': e.detail.value
    });
    if(e.detail.value.length >= 11){
      wx.hideKeyboard();
    }
  },
  listenerTitle: function(e) {
    this.setData({
      'formData.Title': e.detail.value
    });
  },
  listenerTextarea: function(e) {
    this.setData({
      'formData.Content': e.detail.value
    });
  },
  submitApply: function(e) {
    var _this = this,
        formData = _this.data.formData;
    _this.setData({
        showError: true
    }); 
    // 验证表单
    if(!formData.CategoryId || !formData.SpecificId || !formData.AddressId || !formData.Phone || !formData.Address || formData.Phone.length !== 11 || !formData.Title || !formData.Content){
      return false;
    }
    wx.showModal({
      title: '提示',
      content: '是否确认提交申请？',
      success: function(res) {
        if (res.confirm) {
          formData.openid = app._user.openid;
          wx.vrequest({
            url: app._server + '/api/bx/bx.php',
            method: 'POST',
            data: app.key(formData),
            success: function(res) {
              if(res.data && res.data.status === 200){
                wx.showToast({
                  title: '提交成功',
                  icon: 'success',
                  duration: 2000
                });
                wx.navigateBack();
              }else{
                var errorMessage = (res.data.data && res.data.data.reason) || res.data.message;
                app.showErrorModal(errorMessage);
              }
            },
            fail: function(res) {
              app.showErrorModal(res.errMsg);
            }
          });
        }
      }
    });

  }
  
});

