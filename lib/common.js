var HttpRequest = require("nebulas").HttpRequest;
var Neb = require("nebulas").Neb;
var Account = require("nebulas").Account;
var Transaction = require("nebulas").Transaction;
var Unit = require("nebulas").Unit;
var neb = new Neb();
neb.setRequest(new HttpRequest("https://mainnet.nebulas.io"));

var NebPay = require("nebpay");   
var nebPay = new NebPay();
var dappAddress = "n1xYHokD8W3wrGohzbuZW8qG6uW4tC5uPHG";

// онлоад
  window.onload = function(){         
    if(typeof(webExtensionWallet) === "undefined"){     
          $(".noExtension").show();   
          $(".content").hide();
      }else{          
      }
  };  
// онлоад

var hash_value = '';

var vm = new Vue({
  el: '.app',
  data: {      
    owner: 0,
    balance: 0,
    lvl: 1,
    cash: 0,    
    id_field: 0,
    exp: 0,
    current: 0,
    new_exp: 0,
    new_balance: 0,
    income: 0,
    farm_gold: 0,
    ranked: [],
    resp_arr: [],
  } 
})  

// ранкед компонент
    Vue.component('ranked', {
    props: ['lvl', 'owner'],
    template: `<div class="user_info">
                  <div class="lvl"><span class="value">{{lvl}}</span> lvl</div>       
                  <div class="owner">adress: <div class="value">{{owner}}</div></div>       
                </div>`,
    })
// ранкед компонент

// попапы
  $('.popup').magnificPopup({
    type:'inline',
    fixedContentPos: true, 
    mainClass: 'mfp-fade',      
    showCloseBtn: true,
    closeOnBgClick: false
  });   

  $('.transaction').magnificPopup({
    type:'inline',
    fixedContentPos: true, 
    mainClass: 'mfp-fade',      
    showCloseBtn: true,
    closeOnBgClick: false
  });   
// попапы

// document.ready
  $(document).ready(function(){
    $('.add').fadeOut();
    var to = dappAddress;
    var value = 0;
    var callFunction = 'getMyInfo';      
    var args = [];    
    var callArgs = JSON.stringify(args);    
    nebPay.simulateCall(to, value, callFunction, callArgs, { 
      listener: cMyInfo              
    });            
  })    

  function cMyInfo(resp) {
    console.log('resp ' + JSON.stringify(resp));
    // owner\":\"n1JNiQyqSq96kjfAafRao393YW84dFvCR9m\",\"balance\":3000,\"cash\":0,\"lvl\":1,\    ;
    var resp_arr = JSON.parse(resp.result);
    var garden = resp_arr.garden;
    vm.owner = resp_arr.owner;
    vm.lvl = resp_arr.lvl;
    vm.balance = resp_arr.balance.toFixed(0);
    vm.cash = resp_arr.cash;  
    vm.current = resp_arr.current;    
    vm.exp = resp_arr.expirenece;   
    mining(vm.lvl);
    var items = resp_arr.items;
    if (items.mining == 0) {

    } else {
      vm.income = items.mining*150;
      vm.farm_gold = items.coins.toFixed(3);     
    };
    var restriction = resp_arr.restriction;
    if (items.mining == 6) {
      $('.up_hashrate').html('all of the GPU purchased');
      $('.up_hashrate').attr('disabled', true);              
      $('.up_hashrate').addClass('disabled');
    };
    $(".row_element .element").each(function(index, value) {         
        var id = $(this).attr('data-id');                
        var this_element = $(this);        
        $.each(garden,function(index,value){                    
          if (id == index) {            
            if (garden[index].status == 'free') {                   
              this_element.addClass('free');  
            } else if (resp_arr.garden[index].status == 'ripe') {
              var name = fix_name(garden[index].name);              
              garden[index].name = name;
              this_element.find('span').html('<img src="img/' + name + '.png" alt="" class="' + name + '">');                            
              this_element.addClass('ripe');                                                      
            } else {
              var name = fix_name_growth(garden[index].name);              
              garden[index].name = name;
              this_element.find('span').html('<img src="img/' + name + '.png" alt="" class="' + name + '">');                            
            }
          } 
        });    
    });    

    $(".row_element .element").each(function(index, value) {         
        var this_element = $(this);  
        var id = $(this).attr('data-id');      
        if (id >= restriction) {
          this_element.addClass('blocked');
          this_element.removeClass('free');
        }
    });
    $('.free').click(function(){
      $('.plants').trigger('click');
    })

    $('.ripe').click(function(){
      var id_field = $(this).attr('data-id');    
      var to = dappAddress;
      var value = 0;
      var callFunction = 'reapAndDig';      
      var args = [];    
      args.push(id_field);    
      var callArgs = JSON.stringify(args);    
      nebPay.call(to, value, callFunction, callArgs, { 
        listener: cbDeegTransaction               
      });  
    })
  }
// document.ready  

// plant
  $('.field .element').click(function(){
    vm.id_field = $(this).attr('data-id');            
  });
  $('.buy').click(function() {
    var id_field = vm.id_field;
    var id_plant = $(this).attr('data-plant');
    var to = dappAddress;
    var value = 0;
    var callFunction = 'plant';      
    var args = [];    
    args.push(id_field);
    args.push(id_plant);
    var callArgs = JSON.stringify(args);    
    nebPay.call(to, value, callFunction, callArgs, { 
      listener: cbPlantTransaction               
    });  
  })

   function cbPlantTransaction(resp) {
    hash_value = resp.txhash;       
    if (resp.txhash == undefined) {
     } else {
      $('.transaction').trigger('click');
      $('.hash').html('txHash: <p>' + hash_value + '</p>');           
    } 

    var reload_trans = setInterval(function(){
      neb.api.getTransactionReceipt({hash: hash_value}).then(function(receipt) {        
        result_trans = receipt.status;        
      if (result_trans == 1) {
        $('#transaction .status_trans').html('<p style="color: green"> sucess </p>');                                  
        setTimeout(function(){ $('#transaction button').trigger('click') } , 500);                                            

        neb.api.getEventsByHash({hash: hash_value}).then(function(events) {
          console.log('events' + JSON.stringify(events));
          console.log('events typeof ' + typeof(events));
          var resp_arr = events.events[0].data;                    
          vm.new_exp = '+' + events.events[2].data;                              
          vm.new_balance = '-' + events.events[1].data;                              
          vm.resp_arr = resp_arr;
          resp_arr = JSON.parse(resp_arr);
          console.log('after parse ' + resp_arr);                    
          console.log('owner ' + resp_arr.owner);                    
          console.log('typeof resp_arr' + typeof(resp_arr));
          var garden = resp_arr.garden;
          vm.owner = resp_arr.owner;
          vm.lvl = resp_arr.lvl;
          vm.balance = resp_arr.balance.toFixed(0);
          vm.cash = resp_arr.cash;  
          vm.current = resp_arr.current;    
          vm.exp = resp_arr.expirenece;    
          mining(vm.lvl);
          if (items.mining == 6) {
            $('.up_hashrate').html('all of the GPU purchased');
            $('.up_hashrate').attr('disabled', true);              
            $('.up_hashrate').addClass('disabled');
          };
          var items = resp_arr.items;
          if (items.mining == 0) {

          } else {
            vm.income = items.mining*150;
            vm.farm_gold = items.coins.toFixed(3);     
          };          
          // current\":10,\"expirenece\":15          
          $(".row_element .element").each(function(index, value) {       
              console.log('each');
              var id = $(this).attr('data-id');                
              var this_element = $(this);
              this_element.find('span').html('');
              $.each(garden,function(index,value){          
                // console.log('i' + garden);
                if (id == index) {            
                  if (garden[index].status == 'free') {                   
                    this_element.addClass('free');  
                  } else if (resp_arr.garden[index].status == 'ripe') {
                    var name = fix_name(garden[index].name);              
                    garden[index].name = name;
                    this_element.find('span').html('<img src="img/' + name + '.png" alt="" class="' + name + '">');                            
                    this_element.addClass('ripe');                                        
                  } else {
                    var name = fix_name_growth(garden[index].name);              
                    garden[index].name = name;
                    this_element.find('span').html('<img src="img/' + name + '.png" alt="" class="' + name + '">');                            
                  }
                } 
              });                
          });    

            $('.free').click(function(){
              $('.plants').trigger('click');
            })          
          });         
          clearInterval(reload_trans);
          show_add();          
      } else if (result_trans == 2) {
        $('#transaction .status_trans').html('<p style="color: #ff6000"> pending </p>');
      } else {
        $('#transaction .status_trans').html('<p style="color: red"> fail </p>');                        
        setTimeout(function(){ $('#transaction button').trigger('click') } , 1500);          
        clearInterval(reload_trans);          
      }
    })}, 1000);  
  } 
// plant

// deeg
    function cbDeegTransaction(resp) {
    hash_value = resp.txhash;       
    if (resp.txhash == undefined) {
     } else {
      $('.transaction').trigger('click');
      $('.hash').html('txHash: <p>' + hash_value + '</p>');           
    } 

    var reload_trans = setInterval(function(){
      neb.api.getTransactionReceipt({hash: hash_value}).then(function(receipt) {        
        result_trans = receipt.status;        
      if (result_trans == 1) {
        $('#transaction .status_trans').html('<p style="color: green"> sucess </p>');                                  
        setTimeout(function(){ $('#transaction button').trigger('click') } , 1500);                                            

        neb.api.getEventsByHash({hash: hash_value}).then(function(events) {
          console.log('events' + JSON.stringify(events));
          console.log('events typeof ' + typeof(events));
          var resp_arr = events.events[0].data;                              
          vm.new_balance = '+' + events.events[1].data;                              
          vm.resp_arr = resp_arr;
          resp_arr = JSON.parse(resp_arr);
          console.log('after parse ' + resp_arr);                    
          console.log('owner ' + resp_arr.owner);                    
          console.log('typeof resp_arr' + typeof(resp_arr));
          var garden = resp_arr.garden;
          vm.owner = resp_arr.owner;
          vm.lvl = resp_arr.lvl;
          vm.balance = resp_arr.balance.toFixed(0);
          vm.cash = resp_arr.cash;  
          vm.current = resp_arr.current;    
          vm.exp = resp_arr.expirenece;    
          var items = resp_arr.items;
          if (items.mining == 0) {

          } else {
            vm.income = items.mining*150;
            vm.farm_gold = items.coins.toFixed(3);     
          };
          mining(vm.lvl);
          if (items.mining == 6) {
            $('.up_hashrate').html('all of the GPU purchased');
            $('.up_hashrate').attr('disabled', true);              
            $('.up_hashrate').addClass('disabled');
          };
          // current\":10,\"expirenece\":15          
          $(".row_element .element").each(function(index, value) {       
              console.log('each');
              var id = $(this).attr('data-id');                
              var this_element = $(this);
              this_element.find('span').html('');
              $.each(garden,function(index,value){          
                // console.log('i' + garden);
                if (id == index) {            
                  if (garden[index].status == 'free') {                   
                    this_element.addClass('free');  
                  } else if (resp_arr.garden[index].status == 'ripe') {
                    var name = fix_name(garden[index].name);              
                    garden[index].name = name;
                    this_element.find('span').html('<img src="img/' + name + '.png" alt="" class="' + name + '">');                            
                    this_element.addClass('ripe');        
                    this_element.removeClass('free');                                  
                  } else {
                    var name = fix_name_growth(garden[index].name);              
                    garden[index].name = name;
                    this_element.removeClass('free');                                   
                    this_element.find('span').html('<img src="img/' + name + '.png" alt="" class="' + name + '">');                            
                  }
                } 
              });                
          });    

            $('.free').click(function(){
              $('.plants').trigger('click');
            })          
          });         
          clearInterval(reload_trans);
          show_add();
      } else if (result_trans == 2) {
        $('#transaction .status_trans').html('<p style="color: #ff6000"> pending </p>');
      } else {
        $('#transaction .status_trans').html('<p style="color: red"> fail </p>');                        
        setTimeout(function(){ $('#transaction button').trigger('click') } , 1500);          
        clearInterval(reload_trans);          
        }
      })}, 1000);  
    } 
// deeg

// fix_name
  function fix_name(name) {       
    switch(name) {
      case '1':
        x = 'plant';        
        return x;
        break;

      case '2': 
        x = 'plant_1';
        return x;
        break;

      case '3':        
        x = 'plant_2';
        return x;
        break;

      case '4': 
        x = 'plant_3';        
        return x;
        break;

      case '5': 
        x = 'plant_4';        
        return x;
        break;

      default:
        return name;
        break;
    }
  }
  
  function fix_name_growth(name) {       
    switch(name) {
      case '1':
        x = 'rostok';        
        return x;
        break;

      case '2': 
        x = 'rostok_1';
        return x;
        break;

      case '3':        
        x = 'rostok_2';
        return x;
        break;

      case '4': 
        x = 'rostok_3';        
        return x;
        break;

      case '5': 
        x = 'rostok_4';        
        return x;
        break;

      default:
        return name;
        break;
    }
  }
// fix_name

// show_add
  function show_add() {
    setTimeout(function() {
      $('.add').fadeIn(100);
      setTimeout(function() {
        $('.add').fadeOut();
      },3000);    
    },2000);        
  }
// show_add

// ranked
  $('.ranked').click(function () {
    var to = dappAddress;
    var value = 0;
    var callFunction = 'getRanked';      
    var args = [];    
    var callArgs = JSON.stringify(args);    
    nebPay.simulateCall(to, value, callFunction, callArgs, { 
      listener: cbRanked              
    });  
  });

  function cbRanked(resp) {
    console.log('ranked ' + JSON.stringify(resp));
    var ranked_arr = JSON.parse(resp.result);
    $.each(ranked_arr,function(index,value){
      vm.ranked.push(ranked_arr[index]);
    })
  }
// ranked

// mining farm
  function mining(lvl) {    
    if (lvl > 6) {
      $('.mining').removeClass('.blocked_mining');      
    } else {      
      $('.mining').addClass('blocked_mining');
    }
  }

  $('.up_hashrate').click(function(){
    if (vm.balance >= 1488) {
      var to = dappAddress;
      var value = 0;
      var callFunction = 'buyMining';      
      var args = [];    
      var callArgs = JSON.stringify(args);    
      nebPay.call(to, value, callFunction, callArgs, { 
        listener: cbBuyTrans              
      }); 
    } else {
      $('.error_msg').trigger('click');
    };
  })  


  $('.withdraw').click(function(){    
    var to = dappAddress;
    var value = 0;
    var callFunction = 'getFarmCoin';      
    var args = [];    
    var callArgs = JSON.stringify(args);    
    nebPay.call(to, value, callFunction, callArgs, { 
      listener: cbWithdrawTrans              
    });     
  })    

  function cbBuyTrans(resp) { 
      hash_value = resp.txhash;       
      if (resp.txhash == undefined) {
       } else {
        $('.transaction').trigger('click');
        $('.hash').html('txHash: <p>' + hash_value + '</p>');           
      } 

      var reload_trans = setInterval(function(){
        neb.api.getTransactionReceipt({hash: hash_value}).then(function(receipt) {        
          result_trans = receipt.status;        
        if (result_trans == 1) {
          $('#transaction .status_trans').html('<p style="color: green"> sucess </p>');                                  
          setTimeout(function(){ $('#transaction button').trigger('click') } , 1500);                                            

          neb.api.getEventsByHash({hash: hash_value}).then(function(events) {          
            var resp_arr = events.events[0].data;                                        
            vm.resp_arr = resp_arr;
            resp_arr = JSON.parse(resp_arr);          
            var garden = resp_arr.garden;
            vm.owner = resp_arr.owner;
            vm.lvl = resp_arr.lvl;
            vm.balance = resp_arr.balance.toFixed(0);
            vm.cash = resp_arr.cash;  
            vm.current = resp_arr.current;    
            vm.exp = resp_arr.expirenece;    
            var items = resp_arr.items;
            if (items.mining == 0) {

            } else {
              vm.income = items.mining*150;
              vm.farm_gold = items.coins.toFixed(3);     
            };
            mining(vm.lvl);
            if (items.mining == 6) {
              $('.up_hashrate').html('all of the GPU purchased');
              $('.up_hashrate').attr('disabled', true);              
              $('.up_hashrate').addClass('disabled');
            };
            // current\":10,\"expirenece\":15          
            $(".row_element .element").each(function(index, value) {                     
                var id = $(this).attr('data-id');                
                var this_element = $(this);
                this_element.find('span').html('');
                $.each(garden,function(index,value){          
                  // console.log('i' + garden);
                  if (id == index) {            
                    if (garden[index].status == 'free') {                   
                      this_element.addClass('free');  
                    } else if (resp_arr.garden[index].status == 'ripe') {
                      var name = fix_name(garden[index].name);              
                      garden[index].name = name;
                      this_element.find('span').html('<img src="img/' + name + '.png" alt="" class="' + name + '">');                            
                      this_element.addClass('ripe');        
                      this_element.removeClass('free');                                  
                    } else {
                      var name = fix_name_growth(garden[index].name);              
                      garden[index].name = name;
                      this_element.removeClass('free');                                   
                      this_element.find('span').html('<img src="img/' + name + '.png" alt="" class="' + name + '">');                            
                    }
                  } 
                });                
            });    

              $('.free').click(function(){
                $('.plants').trigger('click');
              })          
            });         
            clearInterval(reload_trans);          
        } else if (result_trans == 2) {
          $('#transaction .status_trans').html('<p style="color: #ff6000"> pending </p>');
        } else {
          $('#transaction .status_trans').html('<p style="color: red"> fail </p>');                        
          setTimeout(function(){ $('#transaction button').trigger('click') } , 1500);          
          clearInterval(reload_trans);          
          }
        })}, 1000);  
    }

  function cbWithdrawTrans(resp) { 
      hash_value = resp.txhash;       
      if (resp.txhash == undefined) {
       } else {
        $('.transaction').trigger('click');
        $('.hash').html('txHash: <p>' + hash_value + '</p>');           
      } 

      var reload_trans = setInterval(function(){
        neb.api.getTransactionReceipt({hash: hash_value}).then(function(receipt) {        
          result_trans = receipt.status;        
        if (result_trans == 1) {
          $('#transaction .status_trans').html('<p style="color: green"> sucess </p>');                                  
          setTimeout(function(){ $('#transaction button').trigger('click') } , 1500);                                            

          neb.api.getEventsByHash({hash: hash_value}).then(function(events) {          
            var resp_arr = events.events[0].data;                                        
            vm.resp_arr = resp_arr;
            resp_arr = JSON.parse(resp_arr);                      
            var garden = resp_arr.garden;
            vm.new_balance = events.events[1].data;   
            console.log('resp_arr ' + JSON.stringify(events.events[1].data));
            vm.new_balance = parseFloat(vm.new_balance);
            vm.new_balance = vm.new_balance.toFixed(3); 
            vm.new_balance = '+' + vm.new_balance;
            vm.owner = resp_arr.owner;
            vm.lvl = resp_arr.lvl;
            vm.balance = resp_arr.balance.toFixed(0);
            vm.cash = resp_arr.cash;  
            vm.current = resp_arr.current;    
            vm.exp = resp_arr.expirenece;   
            var items = resp_arr.items;
            if (items.mining == 0) {

            } else {
              vm.income = items.mining*150;
              vm.farm_gold = items.coins.toFixed(3);     
            };
            if (items.mining == 6) {
              $('.up_hashrate').html('all of the GPU purchased');
              $('.up_hashrate').attr('disabled', true);              
              $('.up_hashrate').addClass('disabled');
            };
            mining(vm.lvl);
            // current\":10,\"expirenece\":15          
            $(".row_element .element").each(function(index, value) {                     
                var id = $(this).attr('data-id');                
                var this_element = $(this);              
                this_element.find('span').html('');
                $.each(garden,function(index,value){          
                  // console.log('i' + garden);
                  if (id == index) {            
                    if (garden[index].status == 'free') {                   
                      this_element.addClass('free');  
                    } else if (resp_arr.garden[index].status == 'ripe') {
                      var name = fix_name(garden[index].name);              
                      garden[index].name = name;
                      this_element.find('span').html('<img src="img/' + name + '.png" alt="" class="' + name + '">');                            
                      this_element.addClass('ripe');        
                      this_element.removeClass('free');                                  
                    } else {
                      var name = fix_name_growth(garden[index].name);              
                      garden[index].name = name;
                      this_element.removeClass('free');                                   
                      this_element.find('span').html('<img src="img/' + name + '.png" alt="" class="' + name + '">');                            
                    }
                  } 
                });                
            });    

              $('.free').click(function(){
                $('.plants').trigger('click');
              })          
            });         
            clearInterval(reload_trans);  
            show_add();        
        } else if (result_trans == 2) {
          $('#transaction .status_trans').html('<p style="color: #ff6000"> pending </p>');
        } else {
          $('#transaction .status_trans').html('<p style="color: red"> fail </p>');                        
          setTimeout(function(){ $('#transaction button').trigger('click') } , 1500);          
          clearInterval(reload_trans);          
          }
        })}, 1000);  
    }
// mining farm

// error popup
  $('#error_msg .ok').click(function(){
    $('#error_msg .mfp-close').trigger('click');
  })
// error popup
