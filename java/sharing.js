/**
  Wrapper around addThis.

  This exists because:
  - There is logic to remember WHICH share bar on a page was clicked, not just what service was used to share (on page bar, vs header bar, etc). This
    can then be referenced in web tracking.
    - In order to leverage this, add the "data-ocloc" class on your share bar, and it will be populated in sharing.lastToolbarHover, can then
      be referenced in shareEventHandler, for web tracking
  - Omniture tracking events are wired up in an sharing event handler, so we get consistent tracking: shareEventHandler
  - Convenience method for generating share bars dynamically

 To use:

  1) Include addThis per normal, be sure to use the async method:
  <script>
    addthis_config = {
      data_track_clickback: true,
      data_ga_property: 'UA-1070615-1',
      pubid: '${addthis_account}'
    };
    addthis_share = {};
  </script>
  <script src="http://s7.addthis.com/js/300/addthis_widget.js#async=1" type="text/javascript"></script>


  2) Include sharing

 */
define(
  [ "jquery", "tracking"],
  function($, tracking) {
    var that;
    var sharing = that = {
      shareBarCounter: 0,
      lastToolbarHover: 'nothing',
      loadApi: function () {
        $(document).ready(function () {
          addthis.addEventListener('addthis.menu.share', that.shareEventHandler);
          addthis.init(); //Need to call cause we pass async=1 to addthis script include , controls when addthis executes

          //Remember the last toolbar that was hovered over, for omniture tracking
          $('.addthis_toolbox').each(function (index, object) {
            $(object).mouseover(function (e) {
              that.lastToolbarHover = $(object).attr('data-ocloc');
            });
          });
        });
      },

      /*
       sharingObject is an object with any one of these parameters: http://support.addthis.com/customer/portal/articles/381263-addthis-client-api#configuration-sharing
      */
      loadShareBar: function (selector, lang, ocloc, imageUrl, sharingObject, buttonOptions, style) {
        if (!lang) {
          lang = 'en';
        }

        //In case image url is not passed
        if (!imageUrl) {
          var o = $('meta[property="og:image"]');
          if (o) {
            imageUrl = o.attr('content');
          }
        }

        function escapeHTML(textToEscape) {
          return $('<div>').text(textToEscape).html()
        }

        if (buttonOptions && buttonOptions.pinDesc) {
          var pinDesc = 'pi:pinit:description="' + escapeHTML(buttonOptions.pinDesc) + '"';
        } else {
          var pinDesc = '';
        }

        if (buttonOptions && buttonOptions.twText) {
          var twText = 'tw:text="' + escapeHTML(buttonOptions.twText) + '"';
        } else {
          var twText = '';
        }

        var element = $(selector);
        if (element) {
          if (style == 'medium' || style == 'small') {
            element.addClass('addthis_toolbox addthis_default_style');
            if (style == 'medium') {
              element.addClass('addthis_32x32_style');
            }
            element.attr('data-ocloc', ocloc);
            element = element.html(
              '<a class="addthis_button_pinterest_share" pi:pinit:media="' + imageUrl + '" ' + pinDesc + ' pi:pinit:layout="none"></a>' +
                '<a class="addthis_button_facebook"></a>' +
                '<a class="addthis_button_twitter" tw:lang="' + lang + '" tw:count="none" ' + twText + '></a>' +
                '<a class="addthis_button_google_plusone_share"></a>' +
                '<a class="addthis_button_compact" id="dynamic_addthis_counter_' + (++that.shareBarCounter) + '"></a>');
            addthis.toolbox(element[0], addthis_share, sharingObject);
            element.mouseover(function (e) {
              that.lastToolbarHover = ocloc;
            });
          } else {
            //This will likely become out of sync with the share bar on other pages, just try to keep this in sync whenever you go to use it somewhere.
            element.addClass('addthis_toolbox addthis_default_style');
            element.attr('data-ocloc', ocloc);
            element = element.html('<div class="sharing_fblike"><a style="opacity:1" class="addthis_button_facebook_like" fb:like:layout="button_count"></a></div>' +
              '<a class="addthis_button_tweet" tw:lang="' + lang + '" tw:count="none" ' + twText + '></a>' +
              '<a class="addthis_button_pinterest_pinit" pi:pinit:media="' + imageUrl + '" ' + pinDesc + ' pi:pinit:layout="none"></a>' +
              '<a class="addthis_button_google_plusone" g:plusone:size="medium" g:plusone:annotation="none" ></a>' + '<a id="dynamic_addthis_counter_' + (++that.shareBarCounter) + '" class="addthis_counter addthis_pill_style"></a>');
            addthis.toolbox(element[0], addthis_share, sharingObject);
            var counter = $('#dynamic_addthis_counter_' + (that.shareBarCounter))[0];
            addthis.counter(counter, addthis_share, sharingObject);
            element.mouseover(function (e) {
              that.lastToolbarHover = ocloc;
            });
          }
        }
      },
      // Report event to Omniture
      shareEventHandler: function (evt) {
        if (evt.type == 'addthis.menu.share') {

          //Because if data.evt.element, it was not from share plus bar
          if (evt.data.element) {
            var eVar33 = sharing.lastToolbarHover;
          } else {
            var eVar33 = "plus share";
          }

          tracking.link(evt.data.service).events('event34')
            .eVars({'eVar32': evt.data.service, 'eVar32': eVar33})
            .targetElement(this)
            .track();
        }
      }
    };

    sharing.loadApi();
    return sharing;
  });