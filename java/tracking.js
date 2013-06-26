/*
  Provides a wrapper around Omniture link tracking for convenience.

  Provides a decoration based API, as well as a direct call api. Handles reseting state as well
  as well as

  To set up omniture custom link tracking:

  Call "setup" on page load:

    require(['jquery', 'tracking'], function ($, tracking) {
      $(function() {
       tracking.setup();
      });
    }]);

  Option 1)
  Decorate your links:

    <a class="trackNavLink"
        data-o-prop12="prop12val"
        data-o-prop13="prop13val"
        data-o-evar1="value1"
        data-o-link="link2"
        data-o-events="event1,event2"
        data-o-product="item;12345;;;;eVar30=whatever"
        href="">Link</a>

  Option 2)
  Call 'trackLink' directly. Because decoration based tracking is not always possible.

    tracking.link('link-name').events('event1,event2')
       .products('12345')
       .eVars({'eVar1': 'value1', 'eVar2': 'value2'})
       .props({'prop1': 'value1', 'prop2': 'value2'})
       .targetElement(this)
       .track();

  Option 3)
  Use a custom handler. This gives more flexibility than either option by themselves.
  This also allows you to do something like, for every link matching a particular name,
  execute this tracking event.

    <a href class="trackNavLink" data-o-link="link" target="_blank">Link</a>

    tracking.addCustomHandlers([{
      linkName: 'link',
      handler: function (targetElement, s) {
        s.eVar20 = 'from another handler';
        s.linkTrackVars = tracking.addTrackVar(s.linkTrackVars, 'eVar20');
      }
    }]);

*/

define(
  [ "jquery" ],
  function($) {
    var resetTrackExternalLinks; //TODO - these may not be read anywhere
    var resetTrackDownloadLinks; //TODO - these may not be read anywhere
    var customHandlers = [];

    var tracking = {
      setup : function(customHandlersParam) {
        var that = this;
        this.addCustomHandlers(customHandlersParam);

        //We always use mousedown so we can have our event execute before omniture default handling
        //We use "document" so to listen for events so we don't create a ton of different listeners and so that
        //if new elements are added to the dom, our listener will still work.
        $(document).mousedown(function(e) {
          var $trackableLink = $(e.target).closest('.trackNavLink');
          if ($trackableLink && $trackableLink.length > 0) {
            that.trackLinkFromDecoration($trackableLink[0]);
          }
        });

        return that;
      },

      /*
       For accessing the clicked element in an omniture plugin

       Aggressively tries to remember what the element of the last link clicked was. since
       s.eo is only set for download and exit links, and those are often times disabled when using custom links, we store
       it in our own variable. The reason we inject it into the onmousedown attribute is because we MUST set it before sitecatalyst's
       code executes.

       padding a "patternMatch" makes the algorithm less aggressive, targeting only links you know you'll want

       so if you did this:
       require("tracking", function(tracking){
        awi.tracking = tracking;
        tracking.setup().rememberLastLinkClicked("awi.tracking", /\.pdf/);
       });

       you could do do:

       s_awiAddPlugin(function (s) {
        awi.tracking.lastLinkClicked; //instead of s.eo
       });

       */
      lastLinkClicked: null,
      rememberLastLinkClicked: function (globalTrackingReference /*String*/, patternMatch /*regex*/) {
        var that = this;
        $('a').each(function () {
          var $anchor = $(this);
          var href = $anchor.attr('href');
          var isPdfLink = (href && href.toLowerCase().match(patternMatch));
          if (isPdfLink) {
            var newEvent = globalTrackingReference + '.lastLinkClicked=(event.target || event.srcElement);';
            if ($anchor.attr('onmousedown')) {
              newEvent = newEvent + $anchor.attr('onmousedown')
            }
            $anchor.attr('onmousedown', newEvent);
          }
        });
      },

      addCustomHandlers: function(customHandlersParam) {
        if (customHandlersParam) {
          customHandlers = customHandlers.concat(customHandlersParam);
        }
      },

      //Just concatenates a value onto an existing string, comma delimited.
      addTrackVar: function(addto, add) {
        if (addto.trim().length > 0 && addto.trim() != 'None') {
          if (addto.indexOf(add) < 0) {
            addto = addto + ',' + add;
          }
        } else {
          addto = add;
        }
        return addto;
      },

      trackLinkFromDecoration: function(targetElement) {
        var linkName = null;
        var events = null;
        var products = null;
        var eVars = null;
        var props = null;

        $.each(targetElement.attributes, function(index, value) {
          if (value.nodeName == 'data-o-link') {
            linkName = value.nodeValue;
          }
          if (value.nodeName == 'data-o-product') {
            products = value.nodeValue;
          }
          if (value.nodeName == 'data-o-events') {
            events = value.nodeValue;
          }
          if (value.nodeName.indexOf('data-o-evar') == 0) {
            if (!eVars) eVars = [];
            eVars.push({
              'name':'eVar' + value.nodeName.substr("data-o-evar".length, value.nodeName.length),
              'value':value.nodeValue
            });
          }
          if (value.nodeName.indexOf("data-o-prop") == 0) {
            if (!props) props = [];
            props.push({
              'name':'prop' + value.nodeName.substr("data-o-prop".length, value.nodeName.length),
              'value':value.nodeValue
            });
          }
        });

        this.trackLink(linkName, events, products, eVars, props, targetElement);
      },

      /*
       Builder pattern to wrap trackLink method
       tracking.link('link-name').events('event1,event2')
       .products('12345')
       .eVars({'eVar1': 'value1', 'eVar2': 'value2'})
       .props({'prop1': 'value1', 'prop2': 'value2'})
       .targetElement(this)
       .track();

       Simplifies calls like (and also make params make more sense):
       tracking.link().events('event1').track();
       );*/

      link: function(linkName) {
        var that = this;
        return {
          events : function(eventString) {
            this.eventsParam = eventString;
            return this;
          },
          products : function(productString) {
            this.productsParam = productString;
            return this;
          },
          eVars: function(eVarsObj) {
            var that = this;
            //Because of legacy call, have to convert this...
            $.each(eVarsObj, function(key, element) {
              if (!that.eVarsParam) that.eVarsParam = [];
              that.eVarsParam.push({name: key, value: element});
            });

            return this;
          },
          props: function(propsObj) {
            var that = this;
            //Because of legacy call, have to convert this...
            $.each(propsObj, function(key, element) {
              if (!that.propsParam) that.propsParam = [];
              that.propsParam.push({name: key, value: element});
            });

            return this;
          },
          targetElement: function(targetElementObj) {
            this.targetElementParam = targetElementObj;
            return this;
          },
          track: function() {
            that.trackLink(linkName, this.eventsParam, this.productsParam, this.eVarsParam, this.propsParam, this.targetElementParam);
          }
        }
      },

      /*Legacy direct link functionality, only keeping for backwards compatbility, use 'link' method instead*/
      trackLink: function(linkName, events, products, eVars, props, targetElement) {
        var that = this;
        that.disableDefaultTracking();

        var resetLinkTrackVar = s.linkTrackVars;
        var resetLinkTrackEvents = s.linkTrackEvents;
        var resetEvents = s.events;
        var resetProducts = s.products;

        var o_linkTrackVars = [];
        var o_linkTrackEvents = [];

        o_linkName = linkName;
        o_pageName = s.pageName;
        o_products = s.products;
        o_channel = s.channel;
        s = s_gi(s_account);

        if (products) {
          o_products = s.products = products;
          o_linkTrackVars.push('products');
        }

        //data-o-events="event1,event2"
        if (events) {
          o_linkTrackVars.push('events');
          $.each(events.split(","), function(index, value) {
            o_linkTrackEvents.push($.trim(value));
          });
        }

        //data-o-evar1=value1 data-o-evar2=value2
        if (eVars) {
          $.each(eVars, function(index, eVar) {
            s[eVar.name] = eVar.value;
            o_linkTrackVars.push(eVar.name);
          });
        }

        //data-o-prop1=value1 data-o-prop2=value2
        if (props) {
          $.each(props, function(index, prop) {
            s[prop.name] = prop.value;
            o_linkTrackVars.push(prop.name);
          });
        }

        s.pageName = s.eVar47 = o_pageName;
        s.linkTrackVars = (o_linkTrackVars.length > 0) ? o_linkTrackVars.join(",") : "None"; //Don't set to '' b/c that includes ALL vars
        s.linkTrackEvents = (o_linkTrackEvents.length > 0) ? o_linkTrackEvents.join(",") : "None"; //Don't set to '' b/c that includes ALL vars
        if (o_linkTrackEvents.length > 0) s.events =  o_linkTrackEvents.join(",");

        // Custom handlers for specific links. Executed AFTER all of the link decoration logic.
        if (customHandlers && customHandlers.length > 0) {
          $.each(customHandlers, function(index, value) {
            if (o_linkName == value.linkName) {
              value.handler(targetElement, s);
            }
          });
        }


        s.tl(targetElement, 'o', o_linkName);

        // Reset vars to their original state so that subsequent
        // events don't carry on the attributes set by this custom
        // click event
        s.linkTrackVars = resetLinkTrackVar;
        s.linkTrackEvents = resetLinkTrackEvents;
        s.events = resetEvents;
        s.products = resetProducts;
      },

      /*Because omniture does it's own click event handling and fires off click events for exist links and download links. We normally don't want that
       * on a custom link because two links will be fired. So we fire this to disable the link tracking. There's no great way to reenable the default tracking
       * after the fact, so we just wait 350 milliseconds and re-enable.
       */
      disableDefaultTracking:function () {
        var resetTrackExternalLinks = s.trackExternalLinks;
        var resetTrackDownloadLinks = s.trackDownloadLinks;
        s.trackExternalLinks = s.trackDownloadLinks = false;
        window.setTimeout(function () {
          s.trackExternalLinks = resetTrackExternalLinks;
          s.trackDownloadLinks = resetTrackDownloadLinks;
        }, 250);
      }
    };

    return tracking;
  });