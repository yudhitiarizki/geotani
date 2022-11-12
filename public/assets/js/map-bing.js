var mapId = "gtn-map-hero";

function GetMap() {
  "use strict";

  //==================================================================================================================
  // VARIABLES
  // =================================================================================================================
  var newMarkers = [];
  var loadedMarkersData = [];
  var allMarkersData;
  var lastInfobox;
  var lastInfoboxHtml;
  var lastMarker;
  var map;

  if ($("#" + mapId).length) {
    //==============================================================================================================
    // MAP SETTINGS
    // =============================================================================================================

    var mapElement = $(document.getElementById(mapId));
    var mapDefaultZoom = parseInt(mapElement.attr("data-gtn-map-zoom"), 10);
    var centerLatitude = mapElement.attr("data-gtn-map-center-latitude");
    var centerLongitude = mapElement.attr("data-gtn-map-center-longitude");
    var bingMapApiKey = mapElement.attr("data-gtn-bing-map-api-key");
    var bingMapTypeId = mapElement.attr("data-gtn-bing-map-type-id");
    var locale = mapElement.attr("data-gtn-locale");
    var currency = mapElement.attr("data-gtn-currency");
    var unit = mapElement.attr("data-gtn-unit");
    var controls = parseInt(mapElement.attr("data-gtn-map-controls"), 10);
    controls === 0 ? (controls = false) : (controls = true);
    var scrollWheel = parseInt(mapElement.attr("data-gtn-map-scroll-wheel"), 10);
    scrollWheel === 0 ? (scrollWheel = true) : (scrollWheel = false);
    var layer;

    if (mapElement.attr("data-gtn-display-additional-info")) {
      var displayAdditionalInfoTemp = mapElement
        .attr("data-gtn-display-additional-info")
        .split(";");
      var displayAdditionalInfo = [];
      for (var i = 0; i < displayAdditionalInfoTemp.length; i++) {
        displayAdditionalInfo.push(displayAdditionalInfoTemp[i].split("_"));
      }
    }

    // Default map zoom
    if (!mapDefaultZoom) {
      mapDefaultZoom = 14;
    }

    //==================================================================================================================
    // MAP ELEMENT
    // =================================================================================================================

    map = new Microsoft.Maps.Map("#" + mapId, {
      credentials: bingMapApiKey,
      center: new Microsoft.Maps.Location(centerLatitude, centerLongitude),
      mapTypeId: eval(bingMapTypeId),
      zoom: mapDefaultZoom,
      disableScrollWheelZoom: scrollWheel,
      showZoomButtons: controls,
    });

    //==================================================================================================================
    // LOAD DATA
    // =================================================================================================================

    loadData();
  }
  function loadData(parameters) {
    $.ajax({
      url: "assets/db/items.json",
      dataType: "json",
      method: "GET",
      cache: false,
      success: function (results) {
        if (typeof parameters !== "undefined" && parameters["formData"]) {
          loadFormData(parameters);
        } else {
          allMarkersData = results;
          loadedMarkersData = allMarkersData;
        }

        createMarkers(); // call function to create markers
      },
      error: function (e) {
        console.log(e);
      },
    });
  }

  //==================================================================================================================
  // Create DIV with the markers data
  // =================================================================================================================
  function createMarkers() {
    //Register the custom module.
    Microsoft.Maps.registerModule(
      "HtmlPushpinLayerModule",
      "assets/js/HtmlPushpinLayerModule.js"
    );

    //Load the module.
    Microsoft.Maps.loadModule("HtmlPushpinLayerModule", function () {
      for (var i = 0; i < loadedMarkersData.length; i++) {
        var markerContent = document.createElement("div");
        markerContent.innerHTML =
          '<div class="gtn-marker-wrapper"><a href="#" class="gtn-marker" data-gtn-id="' +
          loadedMarkersData[i]["id"] +
          '">' +
          (loadedMarkersData[i]["ribbon"] !== undefined
            ? '<div class="gtn-marker__feature">' +
              loadedMarkersData[i]["ribbon"] +
              "</div>"
            : "") +
          (loadedMarkersData[i]["title"] !== undefined
            ? '<div class="gtn-marker__title">' +
              loadedMarkersData[i]["title"] +
              "</div>"
            : "") +
          (loadedMarkersData[i]["price"] !== undefined &&
          loadedMarkersData[i]["price"] > 0
            ? '<div class="gtn-marker__info">' +
              formatPrice(loadedMarkersData[i]["price"]) +
              "</div>"
            : "") +
          (loadedMarkersData[i]["marker_image"] !== undefined
            ? '<div class="gtn-marker__image gtn-black-gradient" style="background-image: url(' +
              loadedMarkersData[i]["marker_image"] +
              ')"></div>'
            : '<div class="gtn-marker__image gtn-black-gradient" style="background-image: url(assets/img/marker-default-img.png)"></div>') +
          "</a></div>";

        placeBingMarker({ i: i, markerContent: markerContent });
      }

      layer = new HtmlPushpinLayer(newMarkers);
      map.layers.insert(layer);

      //Microsoft.Maps.loadModule("Microsoft.Maps.Clustering", function () {
      //var clusterLayer = new Microsoft.Maps.ClusterLayer(newMarkers);
      //map.layers.insert(clusterLayer);
      //});

      // After the markers are created, do the rest

      markersDone();
    });
  }

  //==================================================================================================================
  // When markers are placed, do the rest
  // =================================================================================================================
  function markersDone() {
    Microsoft.Maps.Events.addHandler(map, "viewchangeend", createSideBarResult);
    createSideBarResult();
  }

  //==================================================================================================================
  // Google Rich Marker plugin
  // =================================================================================================================

  function placeBingMarker(parameters) {
    var i = parameters["i"];
    var location = new Microsoft.Maps.Location(
      loadedMarkersData[i]["latitude"],
      loadedMarkersData[i]["longitude"]
    );
    var marker = new HtmlPushpin(
      location,
      parameters["markerContent"].innerHTML,
      { anchor: new Microsoft.Maps.Point(50, 12) }
    );

    marker.loopNumber = i;
    newMarkers.push(marker);

    // Open Popup on click

    $(marker._element.firstChild).on("click", function () {
      if (lastMarker && lastMarker._element) {
        $(lastMarker._element.firstChild).removeClass("gtn-hide-marker");
      }
      openInfobox({
        id: $(this).find(".gtn-marker").attr("data-gtn-id"),
        parentMarker: marker,
        i: i,
        url: "assets/db/items.json",
      });
    });
  }

  //==================================================================================================================
  // Open InfoBox on marker click
  // =================================================================================================================
  function openInfobox(parameters) {
    var i = parameters["i"];
    var parentMarker = parameters["parentMarker"];
    var id = parameters["id"];
    var infoboxHtml = document.createElement("div");

    // First create an HTML for infobox
    createInfoBoxHTML({ i: i, infoboxHtml: infoboxHtml });

    //==============================================================================================================
    // Set InfoBox options
    //==============================================================================================================

    var infobox = new Microsoft.Maps.Infobox(
      new Microsoft.Maps.Location(
        loadedMarkersData[i]["latitude"],
        loadedMarkersData[i]["longitude"]
      ),
      {
        htmlContent: infoboxHtml.innerHTML,
        offset: new Microsoft.Maps.Point(-47, -30),
      }
    );

    //==============================================================================================================
    // Before showing new InfoBox, close the last one
    //==============================================================================================================

    // Check if the last InfoBox exists and hide it
    if (lastInfoboxHtml) {
      $(lastInfoboxHtml).closest(".infobox-wrapper").removeClass("gtn-show");
    }

    // Wait for the hiding animation and remove InfoBox from the map
    setTimeout(function () {
      if (lastInfobox !== undefined) {
        lastInfobox.setMap(null);
      }
      // Set new "Last" opened InfoBox
      lastInfobox = infobox;
    }, 200);

    // Set the new "Last" opened marker
    lastMarker = parentMarker;

    // Hide the current marker, so only InfoBox is visible
    $(parentMarker._element.firstChild).addClass("gtn-hide-marker");

    // Open infobox
    infobox.setMap(map);

    lastInfoboxHtml = $(".gtn-infobox[data-gtn-id='" + id + "']").closest(
      ".infobox-wrapper"
    );

    setTimeout(function () {
      $(".gtn-infobox[data-gtn-id='" + id + "']")
        .closest(".infobox-wrapper")
        .addClass("gtn-show");

      $(".gtn-infobox[data-gtn-id='" + id + "'] .gtn-close").on(
        "click",
        function () {
          $(".gtn-infobox[data-gtn-id='" + id + "']")
            .closest(".infobox-wrapper")
            .removeClass("gtn-show");
          $(parentMarker._element.firstChild).removeClass("gtn-hide-marker");
          setTimeout(function () {
            infobox.setMap(null);
          }, 200);
        }
      );
    }, 50);
  }

  //==================================================================================================================
  // Create Infobox HTML element
  //==================================================================================================================

  function createInfoBoxHTML(parameters) {
    var i = parameters["i"];
    var infoboxHtml = parameters["infoboxHtml"];

    infoboxHtml.innerHTML =
      '<div class="infobox-wrapper">' +
      '<div class="gtn-infobox" data-gtn-id="' +
      loadedMarkersData[i]["id"] +
      '">' +
      '<img src="assets/img/infobox-close.svg" class="gtn-close">' +
      (loadedMarkersData[i]["ribbon"] !== undefined
        ? '<div class="gtn-ribbon">' + loadedMarkersData[i]["ribbon"] + "</div>"
        : "") +
      (loadedMarkersData[i]["ribbon_corner"] !== undefined
        ? '<div class="gtn-ribbon-corner"><span>' +
          loadedMarkersData[i]["ribbon_corner"] +
          "</span></div>"
        : "") +
      '<a href="' +
      loadedMarkersData[i]["url"] +
      '" class="gtn-infobox__wrapper gtn-black-gradient">' +
      (loadedMarkersData[i]["badge"] !== undefined &&
      loadedMarkersData[i]["badge"].length > 0
        ? '<div class="badge badge-dark">' +
          loadedMarkersData[i]["badge"] +
          "</div>"
        : "") +
      '<div class="gtn-infobox__content">' +
      '<figure class="gtn-item__info">' +
      (loadedMarkersData[i]["price"] !== undefined &&
      loadedMarkersData[i]["price"] > 0
        ? '<div class="gtn-item__info-badge">' +
          formatPrice(loadedMarkersData[i]["price"]) +
          "</div>"
        : "") +
      (loadedMarkersData[i]["title"] !== undefined &&
      loadedMarkersData[i]["title"].length > 0
        ? "<h4>" + loadedMarkersData[i]["title"] + "</h4>"
        : "") +
      (loadedMarkersData[i]["address"] !== undefined &&
      loadedMarkersData[i]["address"].length > 0
        ? '<aside><i class="fa fa-map-marker mr-2"></i>' +
          loadedMarkersData[i]["address"] +
          "</aside>"
        : "") +
      "</figure>" +
      additionalInfoHTML({ display: displayAdditionalInfo, i: i }) +
      "</div>" +
      '<div class="gtn-infobox_image" style="background-image: url(' +
      loadedMarkersData[i]["marker_image"] +
      ')"></div>' +
      "</a>" +
      "</div>" +
      "</div>";
  }

  //==================================================================================================================
  // Create Additional Info HTML element
  //==================================================================================================================

  function additionalInfoHTML(parameters) {
    var i = parameters["i"];
    var displayParameter;

    var additionalInfoHtml = "";
    for (var a = 0; a < parameters["display"].length; a++) {
      displayParameter = parameters["display"][a];
      if (loadedMarkersData[i][displayParameter[0]] !== undefined) {
        additionalInfoHtml +=
          "<dl>" +
          "<dt>" +
          displayParameter[1] +
          "</dt>" +
          "<dd>" +
          loadedMarkersData[i][displayParameter[0]] +
          (displayParameter[a] === "area" ? unit : "") +
          "</dd>" +
          "</dl>";
      }
    }
    if (additionalInfoHtml) {
      return (
        '<div class="gtn-description-lists">' + additionalInfoHtml + "</div>"
      );
    } else {
      return "";
    }
  }

  //==================================================================================================================
  // Create SideBar HTML Results
  //==================================================================================================================
  function createSideBarResult() {
    var visibleMarkersOnMap = [];
    var resultsHtml = [];

    for (var i = 0; i < loadedMarkersData.length; i++) {
      //visibleMarkersOnMap.push( newMarkers[i] );
      //console.log(newMarkers[i].getLocation());

      if (map.getBounds().contains(newMarkers[i].getLocation())) {
        visibleMarkersOnMap.push(newMarkers[i]);
        newMarkers[i].setOptions({ visible: true });
      } else {
        newMarkers[i].setOptions({ visible: false });
      }
    }

    for (i = 0; i < visibleMarkersOnMap.length; i++) {
      var id = visibleMarkersOnMap[i].loopNumber;
      var additionalInfoHtml = "";

      if (loadedMarkersData[id]["additional_info"]) {
        for (
          var a = 0;
          a < loadedMarkersData[id]["additional_info"].length;
          a++
        ) {
          additionalInfoHtml +=
            "<dl>" +
            "<dt>" +
            loadedMarkersData[id]["additional_info"][a]["title"] +
            "</dt>" +
            "<dd>" +
            loadedMarkersData[id]["additional_info"][a]["value"] +
            "</dd>" +
            "</dl>";
        }
      }

      resultsHtml.push(
        '<div class="gtn-result-link" data-gtn-id="' +
          loadedMarkersData[id]["id"] +
          '" data-gtn-ln="' +
          newMarkers[id].loopNumber +
          '">' +
          '<span class="gtn-center-marker"><img src="assets/img/result-center.svg"></span>' +
          '<a href="' +
          loadedMarkersData[id]["url"] +
          '" class="card gtn-item gtn-card gtn-result">' +
          (loadedMarkersData[i]["ribbon"] !== undefined
            ? '<div class="gtn-ribbon">' +
              loadedMarkersData[i]["ribbon"] +
              "</div>"
            : "") +
          (loadedMarkersData[i]["ribbon_corner"] !== undefined
            ? '<div class="gtn-ribbon-corner"><span>' +
              loadedMarkersData[i]["ribbon_corner"] +
              "</span></div>"
            : "") +
          '<div href="detail-01.html" class="card-img gtn-item__image" style="background-image: url(' +
          loadedMarkersData[id]["marker_image"] +
          ')"></div>' +
          '<div class="card-body">' +
          '<figure class="gtn-item__info">' +
          "<h4>" +
          loadedMarkersData[id]["title"] +
          "</h4>" +
          "<aside>" +
          '<i class="fa fa-map-marker mr-2"></i>' +
          loadedMarkersData[id]["address"] +
          "</aside>" +
          "</figure>" +
          additionalInfoHTML({ display: displayAdditionalInfo, i: i }) +
          "</div>" +
          '<div class="card-footer">' +
          '<span class="gtn-btn-arrow">Detail</span>' +
          "</div>" +
          "</a>" +
          "</div>"
      );
    }

    $(".gtn-resulgtn-wrapper").html(resultsHtml);

    if ($("#gtn-results .gtn-sly-frame").hasClass("gtn-loaded")) {
      $("#gtn-results .gtn-sly-frame").sly("reload");
    } else {
      initializeSly();
    }

    var resultsBar = $(
      ".scroll-wrapper.gtn-results__vertical-list, .scroll-wrapper.gtn-results__grid"
    );
    if ($(window).width() < 575) {
      resultsBar.find(".gtn-results__vertical").css("pointer-events", "none");
      resultsBar.on("click", function () {
        $(this).addClass("gtn-expanded");
        $(this).find(".gtn-results__vertical").css("pointer-events", "auto");
        $("#gtn-map-hero").addClass("gtn-dim-map");
      });

      $("#gtn-map-hero").on("click", function () {
        if (resultsBar.hasClass("gtn-expanded")) {
          resultsBar.removeClass("gtn-expanded");
          $("#gtn-map-hero").removeClass("gtn-dim-map");
          resultsBar
            .find(".gtn-results__vertical")
            .css("pointer-events", "none");
        }
      });
    } else {
      resultsBar.removeClass("gtn-expanded");
      resultsBar.find(".gtn-results__vertical").css("pointer-events", "auto");
      $("#gtn-map-hero").removeClass("gtn-dim-map");
    }
  }

  // Highlight marker on result hover
  //==============================================================================================================

  var timer;
  $(document).on(
    {
      mouseenter: function () {
        var id = $(this).parent().attr("data-gtn-id");
        timer = setTimeout(function () {
          $(".gtn-marker").parent().addClass("gtn-marker-hide");
          $(".gtn-marker[data-gtn-id='" + id + "']")
            .parent()
            .addClass("gtn-active-marker");
        }, 500);
      },
      mouseleave: function () {
        clearTimeout(timer);
        $(".gtn-marker")
          .parent()
          .removeClass("gtn-active-marker")
          .removeClass("gtn-marker-hide");
      },
    },
    ".gtn-result"
  );

  function formatPrice(price) {
    return Number(price)
      .toLocaleString(locale, { style: "currency", currency: currency })
      .replace(/\D\d\d$/, "");
  }
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// FUNCTIONS ///////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function simpleMap(
  latitude,
  longitude,
  markerImage,
  mapStyle,
  mapElement,
  markerDrag
) {
  if (!markerDrag) {
    markerDrag = false;
  }
  var mapCenter = new google.maps.LatLng(latitude, longitude);
  var mapOptions = {
    zoom: 13,
    center: mapCenter,
    disableDefaultUI: true,
    scrollwheel: false,
    styles: mapStyle,
  };
  var element = document.getElementById(mapElement);
  var map = new google.maps.Map(element, mapOptions);
  var marker = new google.maps.Marker({
    position: new google.maps.LatLng(latitude, longitude),
    map: map,
    icon: markerImage,
    draggable: markerDrag,
  });
}
