(function () {
  "use strict";

  var checkoutUrl = "https://page.theapps.jp/charge/join/U8hv3G40M25k52f9";
  var allowedParameters = [
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_content",
    "utm_term",
    "fbclid",
    "gclid",
    "msclkid",
    "yclid"
  ];

  function createCheckoutUrl() {
    var incoming = new URLSearchParams(window.location.search);
    var outgoing = new URL(checkoutUrl);

    allowedParameters.forEach(function (key) {
      var value = incoming.get(key);
      if (value) outgoing.searchParams.set(key, value);
    });

    return outgoing.toString();
  }

  var resolvedCheckoutUrl = createCheckoutUrl();
  var checkoutLinks = document.querySelectorAll(".js-checkout");

  checkoutLinks.forEach(function (link) {
    link.setAttribute("href", resolvedCheckoutUrl);
    link.addEventListener("click", function () {
      if (Array.isArray(window.dataLayer)) {
        window.dataLayer.push({
          event: "checkout_click",
          location: link.getAttribute("data-location") || "unknown"
        });
      }
    });
  });

  var reportedDepths = {};
  var depthPoints = [25, 50, 75, 90];

  function reportScrollDepth() {
    var documentHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (documentHeight <= 0) return;

    var depth = Math.round((window.scrollY / documentHeight) * 100);

    depthPoints.forEach(function (point) {
      if (depth >= point && !reportedDepths[point]) {
        reportedDepths[point] = true;
        if (Array.isArray(window.dataLayer)) {
          window.dataLayer.push({
            event: "scroll_depth",
            percent: point
          });
        }
      }
    });
  }

  window.addEventListener("scroll", reportScrollDepth, { passive: true });

  document.querySelectorAll(".faq-list details").forEach(function (item, index) {
    item.addEventListener("toggle", function () {
      if (item.open && Array.isArray(window.dataLayer)) {
        window.dataLayer.push({
          event: "faq_open",
          question_number: index + 1
        });
      }
    });
  });
})();
