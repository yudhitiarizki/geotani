$(document).ready(function($) {
    "use strict";

    //==================================================================================================================
    // VARIABLES
    // =================================================================================================================
    var mapId = "gtn-map-hero";
    var newMarkers = [];
    var clusterMarkers = [];
    var markerHtmlContent = [];
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
        var zoomPosition = mapElement.attr("data-gtn-map-zoom-position");
        var hereMapAppId = mapElement.attr("data-gtn-here-map-app-id");
        var hereMapAppCode = mapElement.attr("data-gtn-here-map-app-code");
        var hereMapStyle = mapElement.attr("data-gtn-here-map-style");
        var hereMapLightStyle = mapElement.attr("data-gtn-here-map-light-style");
        ( hereMapLightStyle === "1" ) ? hereMapLightStyle = ".grey" : hereMapLightStyle = "";
        var hereMapReducedStyle = mapElement.attr("data-gtn-here-map-reduced-style");
        ( hereMapReducedStyle === "1" ) ? hereMapReducedStyle = "reduced." : hereMapReducedStyle = "normal.";
        var foreignLanguage;
        ( mapElement.attr("data-gtn-here-map-language") ) ? foreignLanguage = mapElement.attr("data-gtn-here-map-language") : foreignLanguage = "";
        var locale = mapElement.attr("data-gtn-locale");
        var currency = mapElement.attr("data-gtn-currency");
        var unit = mapElement.attr("data-gtn-unit");
        var controls = parseInt(mapElement.attr("data-gtn-map-controls"), 10);
        var scrollWheel = parseInt(mapElement.attr("data-gtn-map-scroll-wheel"), 10);
        if (mapElement.attr("data-gtn-display-additional-info")) {
            var displayAdditionalInfoTemp = mapElement.attr("data-gtn-display-additional-info").split(";");
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

        // Initialize Platform
        var platform = new H.service.Platform({
            'app_id': hereMapAppId,
            'app_code': hereMapAppCode
        });

        // Obtain the default map types from the platform object:
        var defaultLayers = platform.createDefaultLayers();

        // Instantiate (and display) a map object:
        map = new H.Map(
            document.getElementById(mapId),
            defaultLayers.normal.map,
            {
                zoom: mapDefaultZoom,
                center: {lat: centerLatitude, lng: centerLongitude}
            });

        // Set map behavior to interactive
        var behavior = new H.mapevents.Behavior(new H.mapevents.MapEvents(map));

        if (controls !== 0 && zoomPosition ) {
            var ui = H.ui.UI.createDefault(map, defaultLayers);
            var zoom = ui.getControl('zoom');
            zoom.setAlignment(zoomPosition);
        }
        else if( controls !== 0 ){
            ui = H.ui.UI.createDefault(map, defaultLayers);
        }
        if (scrollWheel === 0) {
            behavior.disable(2);
        }

        // Set map style
        setBaseLayer(map, platform);

        //==================================================================================================================
        // LOAD DATA
        // =================================================================================================================

        loadData();

    }

    function setBaseLayer(map, platform){
        var mapTileService = platform.getMapTileService({
            type: 'base'
        });
        var parameters = {
            style: hereMapStyle,
            lg: foreignLanguage
        };
        var tileLayer = mapTileService.createTileLayer(
            'maptile',
            hereMapReducedStyle + 'day' + hereMapLightStyle,
            256,
            'png8',
            parameters
        );
        map.setBaseLayer(tileLayer);
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
                }
                else {
                    allMarkersData = results;
                    loadedMarkersData = allMarkersData;
                }

                createMarkers(); // call function to create markers
            },
            error: function (e) {
                console.log(e);
            }
        });
    }

    //==================================================================================================================
    // Create DIV with the markers data
    // =================================================================================================================
    function createMarkers() {

        for (var i = 0; i < loadedMarkersData.length; i++) {
            var markerContent = document.createElement('div');
            markerContent.innerHTML =
                '<div class="here-map-marker"><div class="gtn-marker-wrapper"><a href="#" class="gtn-marker" data-gtn-id="' + loadedMarkersData[i]["id"] + '">' +
                ( ( loadedMarkersData[i]["ribbon"] !== undefined ) ? '<div class="gtn-marker__feature">' + loadedMarkersData[i]["ribbon"] + '</div>' : "" ) +
                ( ( loadedMarkersData[i]["title"] !== undefined ) ? '<div class="gtn-marker__title">' + loadedMarkersData[i]["title"] + '</div>' : "" ) +
                ( ( loadedMarkersData[i]["price"] !== undefined && loadedMarkersData[i]["price"] > 0 ) ? '<div class="gtn-marker__info">' + formatPrice(loadedMarkersData[i]["price"]) + '</div>' : "" ) +
                ( ( loadedMarkersData[i]["marker_image"] !== undefined ) ? '<div class="gtn-marker__image gtn-black-gradient" style="background-image: url(' + loadedMarkersData[i]["marker_image"] + ')"></div>' : '<div class="gtn-marker__image gtn-black-gradient" style="background-image: url(assets/img/marker-default-img.png)"></div>' ) +
                '</a></div></div>';

            placeHereMarker({"i": i, "markerContent": markerContent, id: loadedMarkersData[i]["id"]});

        }

        // After the markers are created, do the rest

        markersDone();

    }

    //==================================================================================================================
    // When markers are placed, do the rest
    // =================================================================================================================
    function markersDone() {

        var CUSTOM_THEME = {
            getClusterPresentation: function (cluster) {
                var randomDataPoint = getRandomDataPoint(cluster), data = randomDataPoint.getData();
                var domIcon = new H.map.DomIcon("<div class='marker-cluster'><div><span>" + cluster.getWeight() + "</span></div></div>");
                var clusterMarker = new H.map.DomMarker(cluster.getPosition(), {
                    min: cluster.getMinZoom(),
                    max: cluster.getMaxZoom(),
                    icon: domIcon
                });
                clusterMarker.setData(data);
                clusterMarker.thisIsCluster = true;
                clusterMarker.maxZoom = cluster.getMaxZoom();
                clusterMarker.bounds = cluster.getBounds();
                return clusterMarker;
            },
            getNoisePresentation: function (noisePoint) {
                var data = noisePoint.getData();
                var domIcon = new H.map.DomIcon(noisePoint.getData().htmlContent.innerHTML);
                var noiseMarker = new H.map.DomMarker(noisePoint.getPosition(), {
                    min: noisePoint.getMinZoom(),
                    icon: domIcon
                });
                noiseMarker.setData(data);
                noiseMarker.addEventListener("pointerenter", onPointerEnter);
                noiseMarker.addEventListener("pointerleave", onPointerLeave);
                return noiseMarker;
            }
        };

        var dataPoints = newMarkers.map(function(item) {
            return new H.clustering.DataPoint(item.getPosition().lat, item.getPosition().lng, null, item);
        });
        var clusteredDataProvider = new H.clustering.Provider(dataPoints, { clusteringOptions: {eps: 64, minWeight: 1, strategy: H.clustering.Provider.Strategy.GRID}, theme: CUSTOM_THEME });
        clusteredDataProvider.addEventListener("tap", onMarkerClick);
        var layer = new H.map.layer.ObjectLayer(clusteredDataProvider);
        map.addLayer(layer);

        function getRandomDataPoint(cluster) {
            var dataPoints = [];
            cluster.forEachDataPoint(dataPoints.push.bind(dataPoints));
            return dataPoints[Math.random() * dataPoints.length | 0];
        }

        map.addEventListener('pointermove', function (e) {
            if (e.target instanceof H.map.DomMarker) {
                map.getViewPort().element.style.cursor = 'pointer';
            } else {
                map.getViewPort().element.style.cursor = 'auto';
            }
        }, false);


        function onPointerEnter(e) {
            $(".gtn-marker[data-gtn-id='" + e.target.getData().markerId + "']").addClass("gtn-hover").css("cursor", "pointer");
        }

        function onPointerLeave(e) {
            $(".gtn-marker[data-gtn-id='" + e.target.getData().markerId + "']").removeClass("gtn-hover");
        }

        function onMarkerClick(e) {
            if( e.target.thisIsCluster ){
                var maxZoom = e.target.maxZoom;
                var cameraData = map.getCameraDataForBounds( e.target.bounds );
                map.setZoom(Math.max(cameraData.zoom, maxZoom), true);
                map.setCenter(cameraData.position, true);
            }
            else {
                if( lastMarker ){
                    $(lastMarker).removeClass("gtn-hide-marker");
                }
                openInfobox({"id": e.target.getData().markerId, "parentMarker": newMarkers[e.target.getData().loopNumber], "i": e.target.getData().loopNumber});
            }
        }

        // Add event listener:
        map.addEventListener('mapviewchangeend', function() {
            createSideBarResult();
        });
        createSideBarResult();
    }

    //==================================================================================================================
    // Here Map Marker
    // =================================================================================================================

    function placeHereMarker(parameters) {

        var i = parameters["i"];
        var domIcon = new H.map.DomIcon(parameters["markerContent"]);
        var marker = new H.map.DomMarker({lat: loadedMarkersData[i]["latitude"], lng: loadedMarkersData[i]["longitude"]}, {
            icon: domIcon
        });

        clusterMarkers.push(new H.clustering.DataPoint(loadedMarkersData[i]["latitude"], loadedMarkersData[i]["longitude"], null, {icon: domIcon, id: i}));

        marker.loopNumber = i;
        marker.markerId = parameters["id"];
        marker.htmlContent = parameters["markerContent"];
        newMarkers.push(marker);
    }

    //==================================================================================================================
    // Open InfoBox on marker click
    // =================================================================================================================
    function openInfobox(parameters) {

        var i = parameters["i"];
        var parentMarker = parameters["parentMarker"];
        var id = parameters["id"];
        var infoboxHtml = document.createElement('div');

        // First create an HTML for infobox
        createInfoBoxHTML({"i": i, "infoboxHtml": infoboxHtml});

        //==============================================================================================================
        // Set InfoBox options
        //==============================================================================================================
        var infobox =  new H.ui.InfoBubble(parentMarker.getPosition(), {
            content: infoboxHtml.innerHTML
        });

        //==============================================================================================================
        // Before showing new InfoBox, close the last one
        //==============================================================================================================

        // Check if the last InfoBox exists and hide it
        if (lastInfobox) {
            $(lastInfobox.A).find(".infobox-wrapper").removeClass("gtn-show");
        }

        // Wait for the hiding animation and remove InfoBox from the map
        setTimeout(function () {
            if (lastInfobox !== undefined) {
                ui.removeBubble(lastInfobox);
            }
            // Set new "Last" opened InfoBox
            lastInfobox = infobox;
        }, 200);

        // Set the new "Last" opened marker
        lastMarker = $(".gtn-marker[data-gtn-id='" + id + "']").parent();

        // Hide the current marker, so only InfoBox is visible
        lastMarker.addClass("gtn-hide-marker");

        // Open infobox
        ui.addBubble(infobox);

        lastInfoboxHtml = infobox;

        setTimeout(function () {
            $(".gtn-infobox[data-gtn-id='" + id + "']").closest(".infobox-wrapper").addClass("gtn-show");

            $(".gtn-infobox[data-gtn-id='" + id + "'] .gtn-close").on("click", function () {
                $(".gtn-infobox[data-gtn-id='" + id + "']").closest(".infobox-wrapper").removeClass("gtn-show");
                $(".gtn-marker[data-gtn-id='" + id + "']").parent().removeClass("gtn-hide-marker");
                setTimeout(function () {
                    ui.removeBubble(infobox);
                }, 200);
            });
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
                '<div class="gtn-infobox" data-gtn-id="' + loadedMarkersData[i]["id"] + '">' +
                    '<img src="assets/img/infobox-close.svg" class="gtn-close">' +

                    ( ( loadedMarkersData[i]["ribbon"] !== undefined ) ? '<div class="gtn-ribbon">' + loadedMarkersData[i]["ribbon"] + '</div>' : "" ) +
                    ( ( loadedMarkersData[i]["ribbon_corner"] !== undefined ) ? '<div class="gtn-ribbon-corner"><span>' + loadedMarkersData[i]["ribbon_corner"] + '</span></div>' : "" ) +

                    '<a href="' + loadedMarkersData[i]["url"] + '" class="gtn-infobox__wrapper gtn-black-gradient">' +
                        ( ( loadedMarkersData[i]["badge"] !== undefined && loadedMarkersData[i]["badge"].length > 0 ) ? '<div class="badge badge-dark">' + loadedMarkersData[i]["badge"] + '</div>' : "" ) +
                        '<div class="gtn-infobox__content">' +
                            '<figure class="gtn-item__info">' +
                                ( ( loadedMarkersData[i]["price"] !== undefined && loadedMarkersData[i]["price"] > 0 ) ? '<div class="gtn-item__info-badge">' + formatPrice(loadedMarkersData[i]["price"]) + '</div>' : "" ) +
                                ( ( loadedMarkersData[i]["title"] !== undefined && loadedMarkersData[i]["title"].length > 0 ) ? '<h4>' + loadedMarkersData[i]["title"] + '</h4>' : "" ) +
                                ( ( loadedMarkersData[i]["address"] !== undefined && loadedMarkersData[i]["address"].length > 0 ) ? '<aside><i class="fa fa-map-marker mr-2"></i>' + loadedMarkersData[i]["address"] + '</aside>' : "" ) +
                                '</figure>' +
                                additionalInfoHTML({display: displayAdditionalInfo, i: i}) +
                            '</div>' +
                        '<div class="gtn-infobox_image" style="background-image: url(' + loadedMarkersData[i]["marker_image"] + ')"></div>' +
                    '</a>' +
                '</div>' +
            '</div>';
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
                    '<dl>' +
                        '<dt>' + displayParameter[1] + '</dt>' +
                        '<dd>' + loadedMarkersData[i][displayParameter[0]] + ((displayParameter[a] === "area") ? unit : "") + '</dd>' +
                    '</dl>';
            }
        }
        if (additionalInfoHtml) {
            return '<div class="gtn-description-lists">' + additionalInfoHtml + '</div>';
        }
        else {
            return "";
        }
    }

    //==================================================================================================================
    // Create SideBar HTML Results
    //==================================================================================================================
    function createSideBarResult() {

        var visibleMarkersOnMap = [];
        var resultsHtml = [];
        var markerLat, markerLng;

        for (var i = 0; i < loadedMarkersData.length; i++) {

            //markerLat = map.getObjects()[i].getPosition().lat;
            //markerLng = map.getObjects()[i].getPosition().lng;
            markerLat = newMarkers[i].getPosition().lat;
            markerLng = newMarkers[i].getPosition().lng;

            //console.log( map.geoToScreen(map.getObjects()[i].getPosition()) );

            //if( markerLat >= map.getViewBounds().ja && markerLat <= map.getViewBounds().ka && markerLng >= map.getViewBounds().ga && markerLng <= map.getViewBounds().ha ) {
            if( getMapBounds({ markerLat: markerLat, markerLng: markerLng }) ) {
                visibleMarkersOnMap.push(newMarkers[i]);
                newMarkers[i].setVisibility(true);
            }
            else {
                newMarkers[i].setVisibility(false);
            }
        }

        for (i = 0; i < visibleMarkersOnMap.length; i++) {
            var id = visibleMarkersOnMap[i].loopNumber;
            var additionalInfoHtml = "";

            if (loadedMarkersData[id]["additional_info"]) {
                for (var a = 0; a < loadedMarkersData[id]["additional_info"].length; a++) {
                    additionalInfoHtml +=
                        '<dl>' +
                            '<dt>' + loadedMarkersData[id]["additional_info"][a]["title"] + '</dt>' +
                            '<dd>' + loadedMarkersData[id]["additional_info"][a]["value"] + '</dd>' +
                        '</dl>';
                }
            }

            resultsHtml.push(
                '<div class="gtn-result-link" data-gtn-id="' + loadedMarkersData[id]["id"] + '" data-gtn-ln="' + newMarkers[id].loopNumber + '">' +
                    '<span class="gtn-center-marker"><img src="assets/img/result-center.svg"></span>' +
                    '<a href="' + loadedMarkersData[id]["url"] + '" class="card gtn-item gtn-card gtn-result">' +
                        ( ( loadedMarkersData[i]["ribbon"] !== undefined ) ? '<div class="gtn-ribbon">' + loadedMarkersData[i]["ribbon"] + '</div>' : "" ) +
                        ( ( loadedMarkersData[i]["ribbon_corner"] !== undefined ) ? '<div class="gtn-ribbon-corner"><span>' + loadedMarkersData[i]["ribbon_corner"] + '</span></div>' : "" ) +
                        '<div href="detail-01.html" class="card-img gtn-item__image" style="background-image: url(' + loadedMarkersData[id]["marker_image"] + ')"></div>' +
                        '<div class="card-body">' +
                            '<div class="gtn-item__info-badge">' + formatPrice(loadedMarkersData[id]["price"]) + '</div>' +
                            '<figure class="gtn-item__info">' +
                                '<h4>' + loadedMarkersData[id]["title"] + '</h4>' +
                                '<aside>' +
                                '<i class="fa fa-map-marker mr-2"></i>' + loadedMarkersData[id]["address"] + '</aside>' +
                            '</figure>' +
                            additionalInfoHTML({display: displayAdditionalInfo, i: i}) +
                        '</div>' +
                        '<div class="card-footer">' +
                            '<span class="gtn-btn-arrow">Detail</span>' +
                        '</div>' +
                    '</a>' +
                '</div>'
            );
        }


        $(".gtn-resulgtn-wrapper").html(resultsHtml);
        var $results = $("#gtn-results").find(".gtn-sly-frame");
        if ($results.hasClass("gtn-loaded")) {
            $results.sly("reload");
        }
        else {
            initializeSly();
        }

        var resultsBar = $(".scroll-wrapper.gtn-results__vertical-list, .scroll-wrapper.gtn-results__grid");
        if ($(window).width() < 575) {
            resultsBar.find(".gtn-results__vertical").css("pointer-events", "none");
            resultsBar.on("click", function () {
                $(this).addClass("gtn-expanded");
                $(this).find(".gtn-results__vertical").css("pointer-events", "auto");
                $("#gtn-map-hero").addClass("gtn-dim-map");
            });

            $("#gtn-map-hero").on("click", function(){
                if (resultsBar.hasClass("gtn-expanded")) {
                    resultsBar.removeClass("gtn-expanded");
                    $("#gtn-map-hero").removeClass("gtn-dim-map");
                    resultsBar.find(".gtn-results__vertical").css("pointer-events", "none");
                }
            });
        }
        else {
            resultsBar.removeClass("gtn-expanded");
            resultsBar.find(".gtn-results__vertical").css("pointer-events", "auto");
            $("#gtn-map-hero").removeClass("gtn-dim-map");
        }

    }

    window.addEventListener('resize', function () {
        map.getViewPort().resize();
    });

    // Highlight marker on result hover
    //==============================================================================================================

    var timer;
    $(document).on({
        mouseenter: function () {
            var id = $(this).parent().attr("data-gtn-id");
            timer = setTimeout(function(){
                $(".gtn-marker").parent().addClass("gtn-marker-hide");
                $(".gtn-marker[data-gtn-id='" + id + "']").parent().addClass("gtn-active-marker");
            }, 500);
        },
        mouseleave: function () {
            clearTimeout(timer);
            $(".gtn-marker").parent().removeClass("gtn-active-marker").removeClass("gtn-marker-hide");
        }
    }, ".gtn-result");

    function formatPrice(price) {
        return Number(price).toLocaleString(locale, {style: 'currency', currency: currency}).replace(/\D\d\d$/, '');
    }

    function getMapBounds(parameters){
        var markerLat = parameters["markerLat"];
        var markerLng = parameters["markerLng"];

        if( markerLat >= map.getViewBounds().ja && markerLat <= map.getViewBounds().ka && markerLng >= map.getViewBounds().ga && markerLng <= map.getViewBounds().ha ) {
            return true;
        }
    }

});

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// FUNCTIONS ///////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function simpleMap(latitude, longitude, markerImage, mapStyle, mapElement, markerDrag){
    if (!markerDrag){
        markerDrag = false;
    }
    var mapCenter = new google.maps.LatLng(latitude,longitude);
    var mapOptions = {
        zoom: 13,
        center: mapCenter,
        disableDefaultUI: true,
        scrollwheel: false,
        styles: mapStyle
    };
    var element = document.getElementById(mapElement);
    var map = new google.maps.Map(element, mapOptions);
    var marker = new google.maps.Marker({
        position: new google.maps.LatLng(latitude,longitude),
        map: map,
        icon: markerImage,
        draggable: markerDrag
    });
}