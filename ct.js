/* This file contains the commute-time app. It is expected that it
 * will be loaded either via browser plugin or a bookmarklet such as
 * the following:
 * 
 * javascript:_ctf='Austin, TX',(typeof _ctcct)[0]=='f'?_ctcct:function(){var d=document,s=d.createElement('script');s.type='text/javascript';s.src='http://p1b.us/ct/ct.js?'+(Math.random());d.body.appendChild(s)}();
 * 
 * Replace "Austin, TX" with whatever address you want to find the
 * commute time for.
 */

/* Commute time code: */

function _ctcct() {
  function q(selector, context) {
    if (typeof context == 'undefined') context = document;
    return context.querySelector(selector);
  }
  function txt(elem) { return elem.innerText || elem.textContent; }

  function infobox(msg) {
    alert(msg);
  }
  function iframe_doc(iframe) {
    return iframe.contentWindow ? iframe.contentWindow.document : iframe.contentDocument;
  }

  var addr_sel = '[itemtype="http://schema.org/PostalAddress"]',
      address = q(addr_sel);
  /* If none is in the main doc, check iframes if we can */
  if (!address) {
    var iframes = document.getElementsByTagName('iframe');
    for (var i=0; i< iframes.length; i++) {
      address = q(addr_sel, iframe_doc(iframes[i]));
      if (address) break;
    }
  }
  if (!address) {
    infobox('No address found on page!');
    return;
  }

  var origin = window._ctf || 'Austin, TX',
      dest = (txt(q('[itemprop="streetAddress"]', address)) + ', ' +
              txt(q('[itemprop="addressLocality"]', address)) + ', ' +
              txt(q('[itemprop="addressRegion"]', address)) + ' ' +
              txt(q('[itemprop="postalCode"]', address))),
      ds = new google.maps.DirectionsService(),
      options = {
        origin: origin,
        destination: dest,
        travelMode: google.maps.TravelMode.DRIVING
      };
  
  ds.route(options, function(result, status) {
    if (status == google.maps.DirectionsStatus.OK) {
      var leg = result.routes[0].legs[0];
      infobox('Driving from ' + origin + ' to ' + dest + ' will be '
              + leg.distance.text + ' and take ' + leg.duration.text);
    } else {
      infobox('Error requesting directions!');
    }
  });
}

(function() {
  function init() {
    if (typeof(google) != 'undefined' && typeof(google.maps) != 'undefined') {
      _ctcct();
    } else {
      var script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = ('http://maps.googleapis.com/maps/api/js?' +
                    'key=AIzaSyDnvkOflsOMPLw_EWdY0FA81llqVDN3qbY' +
                    '&sensor=false&callback=_ctcct');
      document.body.appendChild(script);
    }
  }
  if (document.readyState == 'interactive' || document.readyState == 'complete') init();
  else document.addEventListener('DOMContentLoaded', init);
}());