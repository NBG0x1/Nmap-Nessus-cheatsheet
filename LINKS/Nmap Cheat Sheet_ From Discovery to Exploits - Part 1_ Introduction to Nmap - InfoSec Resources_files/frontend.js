jQuery( window ).on( "preinit.icegram" , function() {
  if(typeof(icegram_data) !== 'undefined' && icegram_data.messages_to_show_after_trigger !== undefined){
    window.icegram_trigger_based_messages = icegram_data.messages_to_show_after_trigger;
    window.icegram_triggered_messages = [];
  }
  // Set up hide triggers on 'shown' event
  jQuery( window ).on( "track.icegram", function( e ,type, params ) {
    if(type !== undefined && type !== '' && type == 'shown' ){
      if(params.hasOwnProperty('message_id')){
        var message = icegram.get_message_by_id(params.message_id);
          if(message.data.triggers !== undefined && typeof(message.data.triggers.when_to_hide) !== 'undefined' && message.type === 'toast' && message.sticky === false){
            message.sticky = true;
          }
        //hide this message after x sec
        if(message.data.triggers !== undefined && message.data.triggers.when_to_hide == 'time_delay' && message.data.triggers.hide_time !== '' && !isNaN(message.data.triggers.hide_time)){
          setTimeout( function() { message.hide(); } , message.data.triggers.hide_time * 1000 );
        }

        //hide other messages that need to be hidden when any other message shows
        if(icegram_data.hide_me_after_any_message_shown !== undefined && icegram_data.hide_me_after_any_message_shown.length > 0){
          jQuery.each(icegram_data.hide_me_after_any_message_shown, function( i , v ) {
            var message_to_hide = icegram.get_message_by_id(v);
            if(v !== params.message_id && message_to_hide !== undefined){
              message_to_hide.hide();
            }
          });
        }

        //hide other messages that need to be hidden when this message type shows
        var message_type = message.data.type;
        if( icegram_data.hide_me_after !== undefined && icegram_data.hide_me_after[message_type] !== undefined && icegram_data.hide_me_after[message_type].length > 0){
          jQuery.each(icegram_data.hide_me_after[message_type],function( i , v ) {
            var message_to_hide = icegram.get_message_by_id(v);
            if(v !== params.message_id && message_to_hide !== undefined){
              message_to_hide.hide();
            }
          });
        }

      }
    }
  });

  function icegram_show_messages_by_trigger ( type ){
    if(typeof(icegram_trigger_based_messages) !== 'undefined' && icegram_trigger_based_messages[type] !== undefined && icegram_trigger_based_messages[type].length > 0){
        jQuery.each(icegram_trigger_based_messages[type] , function( i ,v) {
          // Trigger a message only once, and only if found...
          if( jQuery.inArray(v, icegram_triggered_messages) <= -1 && icegram.get_message_by_id(v) !== undefined){
           icegram.get_message_by_id(v).show();
            icegram_triggered_messages.push(v);
          }
        });
    }
  }


  //Exit intent - with debounce to handle reentries!
  function icegram_exit_intent_timer_clear( e ) {
    clearTimeout(jQuery.data(document, 'exitIntentTimer'));
  }
  function icegram_exit_intent_timer_set( e ) {
     if(typeof(icegram) !== 'undefined' && icegram.mode == 'remote' ){
        var clientW = document.body.clientWidth;
        var clientH = document.body.clientHeight;
     } else {
        var clientW = jQuery(window).width();
        var clientH = jQuery(window).height();
     }

      var vsp = hasVerticalScroll();
      var hsp = hasHorizontalScroll();
         
      if( ( e.pageX < 0 || e.pageY < 0 || e.clientX < 0 || e.clientY < 0 ) ||
          ( e.pageY == clientH && !hsp ) ||
          ( e.pageX == clientW && !vsp ) ){
         
          icegram_exit_intent_timer_clear( e );
          jQuery.data(document, 'exitIntentTimer', setTimeout(function() {
            icegram_show_messages_by_trigger('exit_intent');
          }, 250));

        }

  }

  //checks if scroll is present
  function hasVerticalScroll()
  {
    return (document.body.scrollHeight !== document.body.clientHeight);
  }

  function hasHorizontalScroll()
  {
    return (document.body.scrollWidth !== document.body.clientWidth);
  }   


  // Track mouse leaving the document
  jQuery(document).on('mouseleave', icegram_exit_intent_timer_set );
  jQuery(document).on('mouseenter', icegram_exit_intent_timer_clear );
 
 
  // Track user swithing to another window / app
  jQuery(window).on('blur', icegram_exit_intent_timer_set );
  jQuery(window).on('focusin', icegram_exit_intent_timer_clear );
 
 
  jQuery(window).on('keydown', function(e) {
      // Handling location bar
      if(!e.metaKey || e.keyCode !== 76) return;
      icegram_exit_intent_timer_set( e );
  });

  //Scroll handling - with little debounce for better performance...
  function icegram_scroll_handle( e ) {
    if(jQuery(window).scrollTop() + jQuery(window).height() >= (jQuery(document).height()*.97) ) {
      icegram_show_messages_by_trigger('scroll_to_bottom');
    } else if(jQuery(window).scrollTop() + jQuery(window).height() >= (jQuery(document).height() - jQuery(document).height()/2)){
      icegram_show_messages_by_trigger('scroll_to_middle');
    }
  }

  jQuery(window).on('scroll', function(e) {
    clearTimeout(jQuery.data(this, 'scrollTimer'));
    jQuery.data(this, 'scrollTimer', setTimeout( icegram_scroll_handle, 500) );
  });


  //Show message when user inactive for X seconds

  if( typeof(icegram_trigger_based_messages) !== 'undefined' &&
      icegram_trigger_based_messages.hasOwnProperty('user_inactivity') ){
      var icegram_idleTime=0;
      var message;
      var icegram_idleInterval = setInterval( function() {
            message = icegram.get_message_by_id( icegram_trigger_based_messages['user_inactivity'][0] );
            icegram_timerIncrement( message );
      }, 1000);

      function icegram_timerIncrement( message ) {
        var icegram_displayTime = message.data.triggers.user_inactive_for;
        icegram_idleTime = icegram_idleTime + 1;
        if ( icegram_idleTime > icegram_displayTime ) {              
            clearTimeout(icegram_idleInterval);
            message.show();
        }
    }

    jQuery(document).mousemove(function (e) {
      icegram_idleTime = 0;
    });
    jQuery(document).keypress(function (e) {
      icegram_idleTime = 0;
    });
    jQuery(document).scroll(function (e) {
      icegram_idleTime = 0;
    });

  }
});