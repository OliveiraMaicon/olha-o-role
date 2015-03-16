/*!
 * didioChart.js
 * http://antuane.com.br/
 * Version: 1.0.0
 *
 * Copyright 2015 Diógenes Silveira
 * Released under the MIT license
 * https://github.com/antuane/
 */


//'use strict';
var didioChart = function(data, config){

    //GLOBAL VARIABLES AND SET CONFIG PROP
    var data_objects = data;
    var canvas = document.getElementsByTagName('canvas')[0];
    var context = canvas.getContext("2d");

    //CONFIG VARS
    var cfg_fullscreen = false;
    var cfg_obj_width = 300;
    var cfg_obj_height = 170;
    var cfg_obj_margin = 100;
    var cfg_obj_padding = 10;
    var cfg_arrow_size = 8;
    var cfg_line_size = 1.2;
    var cfg_font = "Arial";
    var cfg_font_size = 12;

    context.lineCap = 'round';

    if(config.hasOwnProperty('filterObj')){
        SEARCH_OBJ = config.filterObj;
    }

    if(config.hasOwnProperty('arrowWidth')){
        cfg_arrow_size = config.arrowWidth;
    }

    if(config.hasOwnProperty('lineWidth')){
        cfg_line_size = config.lineWidth;
    }

    if(config.hasOwnProperty('fontFamily')){
        cfg_font = config.fontFamily;
    }

    if(config.hasOwnProperty('fontSize')){
        cfg_font_size = config.fontSize;
    }

    if(config.hasOwnProperty('width')){
        cfg_obj_width = config.width;
    }

    if(config.hasOwnProperty('height')){
        cfg_obj_height = config.height;
    }

    if(config.hasOwnProperty('margin')){
        cfg_obj_margin = config.margin;
    }

    if(config.hasOwnProperty('padding')){
        cfg_obj_padding = config.padding;
    }

    if(config.hasOwnProperty('fullScreen')){
        cfg_fullscreen = config.fullScreen;
    }

    if(cfg_fullscreen){
        //canvas.width = document.body.clientWidth;
        //canvas.height = document.body.clientHeight;
        canvas.width = window.screen.availWidth - 50;
        canvas.height = window.screen.availHeight - 50;

    }

    //OTHER VARS
    this.IS_SEARCH_PARENTS = true;
    this.IS_SEARCH_CHILDRENS = true;
    var ZOOM_SCALE = 0;
    var MOVE_X = 0;
    var MOVE_Y = 0;
    var SEARCH_OBJ = "";
    var IS_SEARCH = false;
    var LIST_OBJECTS = [];
    var LIST_COUNT_LINES_OBJECTS = [];
    var MAX_COLUMN = 0;
    var LOWER_LINE = 0;
    var UPPER_LINE = 0;
    var MAX_WIDTH = 0;
    var MAX_HEIGHT = 0;
    var COLOR_PALETE = ["#00FF00"]

    // UTILS FUNCTIONS

    //RANDOM FUNCTION
    var getRandomInt = function(min, max) {
      return Math.floor(Math.random() * (max - min)) + min;
    }

    //WRAP LINE IN DEMAND TEXT
    function wrapText(context, text, x, y, MAX_WIDTH, lineHeight) {
        var cars = text.split("\n");

        for (var ii = 0; ii < cars.length; ii++) {

            var line = "";
            var words = cars[ii].split(" ");

            for (var n = 0; n < words.length; n++) {
                var testLine = line + words[n] + " ";
                var metrics = context.measureText(testLine);
                var testWidth = metrics.width;

                if (testWidth > MAX_WIDTH) {
                    context.fillText(line, x, y);
                    line = words[n] + " ";
                    y += lineHeight;
                }
                else {
                    line = testLine;
                }
            }

            context.fillText(line, x, y);
            y += lineHeight;
        }
    }

    //CHANGE LEVEL BRIGHTNESS COLOR ( -0.9 to 0.9 )
    var colorLuminance = function(hex, lum) {
        hex = String(hex).replace(/[^0-9a-f]/gi, '');
        if (hex.length < 6) {
            hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
        }
        lum = lum || 0;
        var rgb = "#", c, i;
        for (i = 0; i < 3; i++) {
            c = parseInt(hex.substr(i*2,2), 16);
            c = Math.round(Math.min(Math.max(0, c + (c * lum)), 255)).toString(16);
            rgb += ("00"+c).substr(c.length);
        }
        return rgb;
    }

    //CLONE OBJECTS IN MEMORY
    var cloneObj = function(obj) {
        if(obj == null || typeof(obj) != 'object')
            return obj;

        var temp = obj.constructor();

        for(var key in obj) {
            if(obj.hasOwnProperty(key)) {
                temp[key] = cloneObj(obj[key]);
            }
        }
        return temp;
    }


    //GET OBJECTS IN LIST
    var getObjById = function(listObj, idObj){
        for(var i = 0; i < listObj.length; i++){
            if(listObj[i].id ==  idObj){
                return listObj[i];
            }
        }
        return null;
    }

    //RECURSIVE FUNCTION TO FIND OBJECTS HIERACHY Y
    var calcObjectY = function(object, hierarchy){
        if(object.virgin){
            object.virgin = false;
            object.hide = false;
            object.y = hierarchy;

            if(hierarchy != 0){
                object.orphan = false;
            }

            if(hierarchy < LOWER_LINE){
                LOWER_LINE = hierarchy;
            }

            if(hierarchy > UPPER_LINE){
                UPPER_LINE = hierarchy;
            }

            if(IS_SEARCH){
                if(this.IS_SEARCH_PARENTS && hierarchy <= 0) {
                    for (var i = 0; i < object.parents.length; i++) {
                        var tmpObj = getObjById(LIST_OBJECTS, object.parents[i]);
                        calcObjectY(tmpObj, hierarchy - 1);
                    }
                }

                if(this.IS_SEARCH_CHILDRENS && hierarchy >= 0) {
                    for(var i = 0; i < object.children.length; i++){
                        var tmpObj = getObjById(LIST_OBJECTS, object.children[i]);
                        calcObjectY(tmpObj, hierarchy + 1);
                    }
                }
            }
            else{
                for (var i = 0; i < object.parents.length; i++) {
                    var tmpObj = getObjById(LIST_OBJECTS, object.parents[i]);
                    if(tmpObj.virgin) {
                        calcObjectY(tmpObj, hierarchy - 1);
                    }
                    else if(tmpObj.y >= object.y){
                        tmpObj.y = object.y - 1;
                        if(tmpObj.y < LOWER_LINE){
                            LOWER_LINE = tmpObj.y;
                        }
                    }
                }
                for (var i = 0; i < object.children.length; i++) {
                    var tmpObj = getObjById(LIST_OBJECTS, object.children[i]);
                    if(tmpObj.virgin) {
                        calcObjectY(tmpObj, hierarchy + 1);
                    }
                    else if(tmpObj.y <= object.y){
                        tmpObj.y = object.y + 1;
                        if(tmpObj.y > UPPER_LINE){
                            UPPER_LINE = tmpObj.y;
                        }
                    }
                }
            }
        }
        else{

            for (var i = 0; i < object.children.length; i++) {
                var tmpObj = getObjById(LIST_OBJECTS, object.children[i]);
                if(tmpObj.y <= object.y){
                    tmpObj.y = object.y + 1;
                    if(tmpObj.y > UPPER_LINE){
                        UPPER_LINE = tmpObj.y;
                    }
                }
            }


            for (var i = 0; i < object.parents.length; i++) {
                var tmpObj = getObjById(LIST_OBJECTS, object.parents[i]);
                if(tmpObj.y >= object.y){
                    tmpObj.y = object.y - 1;
                    if(tmpObj.y < LOWER_LINE){
                        LOWER_LINE = tmpObj.y;
                    }
                }
            }


        }
    }

    //RECALCULATE OBJECTS POSITIONS
    this.update = function(){
        resetZoom();
        IS_SEARCH = false;

        if(SEARCH_OBJ != null && SEARCH_OBJ.length > 0){
            IS_SEARCH = true;
        }

        this.clearDraw();

        LIST_OBJECTS = [];
        LIST_COUNT_LINES_OBJECTS = [];
        MAX_COLUMN = 0;
        MAX_LINES = 0;
        LOWER_LINE = 0;
        UPPER_LINE = 0;
        MAX_WIDTH = 0;
        MAX_HEIGHT = 0;

        //CHANGE INITIAL PROP AND ADD IN LISTOBJECTS
        for(var i = 0; i < data_objects.nodes.length; i++){

            var objectDiagram = {
                id: data_objects.nodes[i].id,
                x:-99,
                y: -99,
                cx: 0,
                cy: 0,
                text: data_objects.nodes[i].text,
                color: "#FF0000",
                bgColor: data_objects.nodes[i].bgColor,
                colorLine: "#000000",
                parents: [],
                children: [],
                countDiffParent: 0,
                countDiffChildren: 0,
                virgin: true,
                orphan: true,
                hide: true
            }




            for(var j = 0; j < data_objects.edges.length; j++){

                if(data_objects.edges[j].source == objectDiagram.id){
                    objectDiagram.parents.push(data_objects.edges[j].parent);
                    objectDiagram.orphan = false;
                }

                if(data_objects.edges[j].parent == objectDiagram.id){
                    objectDiagram.children.push(data_objects.edges[j].source);
                    objectDiagram.orphan = false;
                }

            }

            LIST_OBJECTS.push(objectDiagram);
        }

        //CALL RECURSIVE FUNCTION calcObjectY TO CALCULATE Y POSITION
        if(IS_SEARCH){
            for(var i = 0; i < LIST_OBJECTS.length; i++){
                if(LIST_OBJECTS[i].text[0].toUpperCase().indexOf(SEARCH_OBJ.toUpperCase()) > -1) {
                    calcObjectY(LIST_OBJECTS[i], 0);
                    calcObjectY(LIST_OBJECTS[i], 0);
                }
            }
        }else {
            for (var i = 0; i < LIST_OBJECTS.length; i++) {
                calcObjectY(LIST_OBJECTS[i], 0);
                calcObjectY(LIST_OBJECTS[i], 0);
            }
        }

        LIST_COUNT_LINES_OBJECTS = [];

        //COUNT MAX COLUNM IN GRAPHIC
        for(var i = 0; i < LIST_OBJECTS.length; i++){
            var countObjTmp = getObjById(LIST_COUNT_LINES_OBJECTS, LIST_OBJECTS[i].y);
            if(countObjTmp != null){
                if(!LIST_OBJECTS[i].hide && !LIST_OBJECTS[i].orphan){
                    countObjTmp.count++;
                    LIST_OBJECTS[i].x = countObjTmp.count;
                    if(countObjTmp.count > MAX_COLUMN){
                        MAX_COLUMN = countObjTmp.count;
                    }
                    countObjTmp.diffTotal += LIST_OBJECTS[i].parents.count;
                }
            }else{
                if(!LIST_OBJECTS[i].orphan){
                    LIST_COUNT_LINES_OBJECTS.push({ id: LIST_OBJECTS[i].y, count:1, diffTotal:0, countDiffY: 0, countDiffX : 0 });
                    LIST_OBJECTS[i].x = 1;
                }
            }
        }




        if(MAX_COLUMN == 0){
            MAX_COLUMN = parseInt(canvas.width / (cfg_obj_width + (2 * cfg_obj_margin)));
        }

        // calculates to snap objects on the screen

        MAX_WIDTH = MAX_COLUMN * (cfg_obj_width + (2 * cfg_obj_margin));
        MAX_HEIGHT = (UPPER_LINE - LOWER_LINE) * (cfg_obj_height + (cfg_obj_margin * 2));

        calculateZoom(0);
    }

    // CLEAN SCREEN
    this.clearDraw = function(){
        var p1 = context.transformedPoint(0,0);
        var p2 = context.transformedPoint(canvas.width,canvas.height);
        context.clearRect(p1.x,p1.y,p2.x-p1.x,p2.y-p1.y);
    }

    //function to snap objects on the screen
    var calculateZoom = function(count){

        var tmpMaxWidth = MAX_WIDTH - ((MAX_WIDTH/10) * count);
        var tmpMaxHeight = MAX_HEIGHT - ((MAX_HEIGHT/10) * count);

        if((tmpMaxWidth < canvas.width && tmpMaxHeight < canvas.height) || count > 100){
            zoom(-count);
        }else{
            calculateZoom(count+1);
        }
    }



    //DRAW FUNCTIONS

    this.draw = function(){

        this.clearDraw();

        LIST_COUNT_LINES_OBJECTS = [];

        //COUNT MAX COLUNM IN GRAPHIC
        for(var i = 0; i < LIST_OBJECTS.length; i++){

            var countObjTmp = getObjById(LIST_COUNT_LINES_OBJECTS, LIST_OBJECTS[i].y);
            if(countObjTmp != null){
                if(!LIST_OBJECTS[i].hide && !LIST_OBJECTS[i].orphan){
                    countObjTmp.count++;
                    LIST_OBJECTS[i].x = countObjTmp.count;
                    if(countObjTmp.count > MAX_COLUMN){
                        MAX_COLUMN = countObjTmp.count;
                    }
                    countObjTmp.diffTotal += LIST_OBJECTS[i].parents.length;
                }
            }else{
                if(!LIST_OBJECTS[i].orphan){
                    LIST_COUNT_LINES_OBJECTS.push({ id: LIST_OBJECTS[i].y, count:1, diffTotal:1, countDiffY: 0, countDiffX : 0 });
                    LIST_OBJECTS[i].x = 1;
                }
            }
        }



        // DRAW OBJECTS

        var marginScreen = (parseInt(canvas.width) / 2 ) - (MAX_WIDTH / 2);

        for(var i = 0; i < LIST_OBJECTS.length; i++){
            if(!LIST_OBJECTS[i].hide){
                var maxColumnsInLine = getObjById(LIST_COUNT_LINES_OBJECTS, LIST_OBJECTS[i].y).count;
                var ratioX = ((MAX_WIDTH - (maxColumnsInLine * (cfg_obj_width + (2 * cfg_obj_margin)))) / 2);
                var ratioY = 0;
                var positionX = marginScreen + ratioX + ((LIST_OBJECTS[i].x-1) * (cfg_obj_width + (2 * cfg_obj_margin))) + cfg_obj_margin;
                var positionY = (Math.abs(LOWER_LINE) * (cfg_obj_height + (2 * cfg_obj_margin))) + LIST_OBJECTS[i].y * (cfg_obj_height + (2 * cfg_obj_margin)) - ratioY;
                LIST_OBJECTS[i].left = positionX;
                LIST_OBJECTS[i].top = positionY;
                LIST_OBJECTS[i].countDiffParent = 0;
                LIST_OBJECTS[i].countDiffChildren = 0;
            }
        }

        //DRAW LINES DIAGRAM

        for(var i = 0; i < LIST_OBJECTS.length; i++){
            if(!LIST_OBJECTS[i].orphan && !LIST_OBJECTS[i].hide){

                for(var j = 0; j < LIST_OBJECTS[i].parents.length; j++){
                    var tmpObj = getObjById(LIST_OBJECTS, LIST_OBJECTS[i].parents[j]);

                    if(!tmpObj.hide) {

                        var invertParent = false;
                        var neighbor = false;
                        var neighborRight = false;
                        var neighborLeft = false;
                        var isDistant = false;

                        if (LIST_OBJECTS[i].y == tmpObj.y) {
                            if (LIST_OBJECTS[i].x - tmpObj.x == -1) {
                                neighborRight = true;
                            } else if (LIST_OBJECTS[i].x - tmpObj.x == 1) {
                                neighborLeft = true;
                            } else {
                                neighbor = true;
                            }
                        } else if (LIST_OBJECTS[i].y < tmpObj.y) {
                            invertParent = true;
                        } else if ((LIST_OBJECTS[i].y - tmpObj.y) > 1) {
                            isDistant = true;
                        }

                        if (neighborRight || neighborLeft || neighbor || invertParent) {

                            var line = context;
                            line.beginPath();
                            line.strokeStyle = "#FF0000";
                            line.moveTo((LIST_OBJECTS[i].left + (cfg_obj_width / 2)), LIST_OBJECTS[i].top + (cfg_obj_height / 2));
                            line.lineTo((tmpObj.left + (cfg_obj_width / 2)), tmpObj.top + (cfg_obj_height / 2));
                            line.lineWidth = cfg_line_size;
                            line.stroke();

                        } else if (isDistant) {

                            var countObjTmp = getObjById(LIST_COUNT_LINES_OBJECTS, LIST_OBJECTS[i].y);

                            var diffY = ((countObjTmp.countDiffY * (cfg_line_size * cfg_arrow_size)) - ((countObjTmp.diffTotal * (cfg_line_size * cfg_arrow_size)) / 2 ));
                            countObjTmp.countDiffY++;

                            var diffXParent = ((LIST_OBJECTS[i].countDiffParent * (cfg_line_size * cfg_arrow_size)) - ((LIST_OBJECTS[i].parents.length * (cfg_line_size * cfg_arrow_size))/2));
                            LIST_OBJECTS[i].countDiffParent++;

                            var diffXChildren = ((tmpObj.countDiffChildren * (cfg_line_size * cfg_arrow_size)) - ((tmpObj.children.length * (cfg_line_size * cfg_arrow_size)) /2));
                            tmpObj.countDiffChildren++;

                            var line = context;
                            line.beginPath();

                            var startX = (LIST_OBJECTS[i].left + (cfg_obj_width / 2));
                            var startY = LIST_OBJECTS[i].top + (cfg_obj_height/2);
                            line.moveTo(startX, startY);

                            startX += diffXParent;
                            startY += 0;
                            line.lineTo(startX, startY);

                            startX += 0;
                            startY += -(cfg_obj_height/2);
                            line.lineTo(startX, startY);

                            var countDistance = LIST_OBJECTS[i].y - tmpObj.y;
                            var unravel = false;

                            for(var countLevel = 1; countLevel < countDistance; countLevel++){

                                //var deflectsObjectsChild = getObjById(LIST_COUNT_LINES_OBJECTS, LIST_OBJECTS[i].y - (countLevel + 1));

                                var deflectsObjects = getObjById(LIST_COUNT_LINES_OBJECTS, LIST_OBJECTS[i].y - countLevel);
                                diffY = ((deflectsObjects.countDiffY * (cfg_line_size * cfg_arrow_size)) - ((deflectsObjects.diffTotal * (cfg_line_size * cfg_arrow_size)) / 2 ));
                                deflectsObjects.countDiffY++;


                                if(((deflectsObjects.count) % 2 == countObjTmp.count % 2)){

                                    if(unravel){
                                        startX += 0;
                                        startY += -((cfg_obj_margin * 2) + cfg_obj_height);
                                        line.lineTo(startX, startY);
                                    }else{

                                        var sideGo = 1;

                                        if(LIST_OBJECTS[i].left < tmpObj.left){
                                            sideGo = -1;
                                        }

                                        startX += 0;
                                        startY += -(cfg_obj_margin - diffY);
                                        line.lineTo(startX, startY);

                                        startX += -(((cfg_obj_margin * 2) + cfg_obj_width) / 2) * sideGo  + diffXParent;
                                        startY += 0;
                                        line.lineTo(startX, startY);

                                        startX += 0;
                                        startY += -(cfg_obj_margin + cfg_obj_height + diffY);
                                        line.lineTo(startX, startY);

                                        unravel = !unravel;

                                    }

                                }else{

                                    if(unravel){
                                        if(LIST_OBJECTS[i].left < tmpObj.left){
                                            sideGo = -1;
                                        }

                                        startX += 0;
                                        startY += -(cfg_obj_margin - diffY);
                                        line.lineTo(startX, startY);

                                        startX += -(((cfg_obj_margin * 2) + cfg_obj_width) / 2) * sideGo  + diffXParent;
                                        startY += 0;
                                        line.lineTo(startX, startY);

                                        startX += 0;
                                        startY += -(cfg_obj_margin + cfg_obj_height + diffY);
                                        line.lineTo(startX, startY);

                                        unravel = !unravel;

                                    }else{
                                        startX += 0;
                                        startY += -((cfg_obj_margin * 2) + cfg_obj_height);
                                        line.lineTo(startX, startY);
                                    }
                                }

                            }

                            startX += 0;
                            startY += -(cfg_obj_margin - diffY);
                            line.lineTo(startX, startY);

                            startX += ((tmpObj.left + (cfg_obj_width / 2)) - startX) - diffXChildren;
                            startY += 0;
                            line.lineTo(startX, startY);

                            startX += 0;
                            startY += -((cfg_obj_margin) - cfg_arrow_size + diffY);
                            line.lineTo(startX, startY);

                            line.strokeStyle = LIST_OBJECTS[i].colorLine;
                            line.lineWidth = cfg_line_size;
                            line.stroke();

                        } else {
                            //var
                            var countObjTmp = getObjById(LIST_COUNT_LINES_OBJECTS, LIST_OBJECTS[i].y);

                            var diffY = ((countObjTmp.countDiffY * (cfg_line_size * cfg_arrow_size)) - ((countObjTmp.diffTotal * (cfg_line_size * cfg_arrow_size)) / 2 ));
                            countObjTmp.countDiffY++;

                            var diffXParent = ((LIST_OBJECTS[i].countDiffParent * (cfg_line_size * cfg_arrow_size)) - ((LIST_OBJECTS[i].parents.length * (cfg_line_size * cfg_arrow_size)) / 2 ));
                            LIST_OBJECTS[i].countDiffParent++;

                            var diffXChildren = ((tmpObj.countDiffChildren * (cfg_line_size * cfg_arrow_size)) - ((tmpObj.children.length * (cfg_line_size * cfg_arrow_size)) / 2 ));
                            tmpObj.countDiffChildren++;

                            var line = context;
                            line.beginPath();

                            var startX = (LIST_OBJECTS[i].left + (cfg_obj_width / 2));
                            var startY = LIST_OBJECTS[i].top + (cfg_obj_height/2);
                            line.moveTo(startX, startY);


                            startX += diffXParent;
                            startY += 0;
                            line.lineTo(startX, startY);


                            startX += 0;
                            startY += -(cfg_obj_margin + (cfg_obj_height/2) - diffY);
                            line.lineTo(startX, startY);

                            startX += ((tmpObj.left + (cfg_obj_width / 2)) - startX) - diffXChildren;
                            startY += 0;
                            line.lineTo(startX, startY);

                            startX += 0;
                            startY += -(cfg_obj_margin + diffY - cfg_arrow_size);
                            line.lineTo(startX, startY);

                            line.strokeStyle = LIST_OBJECTS[i].colorLine;
                            line.lineWidth = cfg_line_size;
                            line.stroke();


                        }

                        var arrow = context;
                        arrow.beginPath();

                        startX += 0;
                        startY += 0;
                        arrow.moveTo(startX, startY);

                        startX += -(cfg_arrow_size / 2);
                        startY += 0;
                        arrow.lineTo(startX, startY);

                        startX += (cfg_arrow_size / 2);
                        startY += -cfg_arrow_size;
                        arrow.lineTo(startX, startY);

                        startX += +(cfg_arrow_size / 2);
                        startY += cfg_arrow_size;
                        arrow.lineTo(startX, startY);

                        arrow.fillStyle = LIST_OBJECTS[i].colorLine;
                        arrow.fill();
                    }
                }
            }
        }

        //DRAW NOT ORPHANS DIAGRAMS

        for(var i = 0; i < LIST_OBJECTS.length; i++){
            if(!LIST_OBJECTS[i].orphan){

                var positionX = LIST_OBJECTS[i].left;
                var positionY = LIST_OBJECTS[i].top;
                var diagramDrawArea = context;

                diagramDrawArea.fillStyle=  LIST_OBJECTS[i].colorLine;
                diagramDrawArea.fillRect(positionX - (cfg_line_size * 2),positionY - (cfg_line_size * 2), cfg_obj_width + (cfg_line_size * 4), cfg_obj_height + (cfg_line_size * 4));


                diagramDrawArea.fillStyle= LIST_OBJECTS[i].bgColor;
                diagramDrawArea.fillRect(positionX,positionY, cfg_obj_width, cfg_obj_height);

                var nodeText = context;
                nodeText.fillStyle= LIST_OBJECTS[i].colorLine;
                nodeText.font= cfg_font_size + "px " + cfg_font;
                for(var j = 0; j < LIST_OBJECTS[i].text.length; j++){
                    wrapText(context, LIST_OBJECTS[i].text[j], positionX + cfg_obj_padding, positionY + cfg_obj_padding + ((cfg_font_size + (cfg_font_size * 0.2)) * (j + 1)), cfg_obj_width - (2 * cfg_obj_padding) , (cfg_font_size + (cfg_font_size * 0.2)));
                }
            }
        }

        var marginTop = cfg_obj_margin + ((1 + UPPER_LINE - LOWER_LINE) * (cfg_obj_height + (2 * cfg_obj_margin)));

        if(isNaN(marginTop)){
            marginTop = cfg_obj_margin;
        }

        //DRAW ORPHAN DEMANDS
        var countOrphanDemand = 0;
        if(!IS_SEARCH) {
            for (var i = 0; i < LIST_OBJECTS.length; i++) {
                if (LIST_OBJECTS[i].orphan) {
                    var ratioY = 0;
                    var positionX = marginScreen + cfg_obj_margin + parseInt(countOrphanDemand % (MAX_COLUMN)) * (cfg_obj_width + (2 * cfg_obj_margin));
                    var positionY = marginTop + parseInt(countOrphanDemand / (MAX_COLUMN)) * (cfg_obj_height + (2 * cfg_obj_margin)) - ratioY;
                    var diagramDrawArea = context;

                    diagramDrawArea.fillStyle = LIST_OBJECTS[i].colorLine;
                    diagramDrawArea.fillRect(positionX - cfg_line_size,positionY - cfg_line_size, cfg_obj_width + (cfg_line_size * 2), cfg_obj_height + (cfg_line_size * 2));

                    diagramDrawArea.fillStyle = LIST_OBJECTS[i].bgColor;
                    diagramDrawArea.fillRect(positionX, positionY, cfg_obj_width, cfg_obj_height);
                    //
                    var nodeText = context;
                    nodeText.fillStyle= LIST_OBJECTS[i].colorLine;
                    nodeText.font = cfg_font_size + "px " + cfg_font;
                    for (var j = 0; j < LIST_OBJECTS[i].text.length; j++) {
                        nodeText.fillText(LIST_OBJECTS[i].text[j], positionX + cfg_obj_padding, positionY + cfg_obj_padding + ((cfg_font_size + (cfg_font_size * 0.2)) * (j + 1)));
                    }
                    countOrphanDemand++;
                }
            }
        }

        MAX_LINES = ((countOrphanDemand / MAX_COLUMN) + 1) + (1 + UPPER_LINE - LOWER_LINE);

        //CALCULATE X Y NOT ORPHANS DIAGRAMS
    }

    //MOUSE EVENTS
    var lastX=canvas.width/2, lastY=canvas.height/2;
    var dragStart,dragged;

    canvas.addEventListener('mousedown',function(evt){
        document.body.style.mozUserSelect = document.body.style.webkitUserSelect = document.body.style.userSelect = 'none';
        canvas.style.cursor = "move";
        lastX = evt.offsetX || (evt.pageX - canvas.offsetLeft);
        lastY = evt.offsetY || (evt.pageY - canvas.offsetTop);
        dragStart = context.transformedPoint(lastX,lastY);
        dragged = false;
        evt.returnValue = false;
    },false);

    canvas.addEventListener('mousemove',function(evt){
        lastX = evt.offsetX || (evt.pageX - canvas.offsetLeft);
        lastY = evt.offsetY || (evt.pageY - canvas.offsetTop);

        dragged = true;
        if (dragStart){
            var pt = context.transformedPoint(lastX,lastY);
            context.translate(pt.x-dragStart.x,pt.y-dragStart.y);
            draw();
            MOVE_X += pt.x-dragStart.x;
            MOVE_Y += pt.y-dragStart.y;
        }
    },false);
    canvas.addEventListener('mouseup',function(evt){
        dragStart = null;
        canvas.style.cursor = "default";
        //if (!dragged) zoom(evt.shiftKey ? -1 : 1 );
    },false);

    var scaleFactor = 1.1;
    var zoom = function(clicks){

        this.clearDraw();
        ZOOM_SCALE += clicks;
        var pt = context.transformedPoint(canvas.width / 2,canvas.height / 2);
        context.translate(pt.x,pt.y);
        var factor = Math.pow(scaleFactor,clicks);
        context.scale(factor,factor);
        context.translate(-pt.x,-pt.y);
        this.draw();
    }

    this.changeZoom = function(clicks){
        this.clearDraw();
        ZOOM_SCALE += clicks;

        var pt = context.transformedPoint(canvas.width / 2,canvas.height / 2);
        context.translate(pt.x,pt.y);
        var factor = Math.pow(scaleFactor,clicks);
        context.scale(factor,factor);
        context.translate(-pt.x,-pt.y);
        this.draw();
    }

    this.resetZoom = function(){
        this.clearDraw();
        //this.update();
        this.changeZoom(-ZOOM_SCALE);
        context.translate(-MOVE_X,-MOVE_Y);
        delete ZOOM_SCALE;
        delete MOVE_X;
        delete MOVE_Y;
        ZOOM_SCALE = 0;
        MOVE_X = 0;
        MOVE_Y = 0;
        //calculateZoom(0);
    }

    this.search = function(text){
        SEARCH_OBJ = text;
    }

    var handleScroll = function(evt){
        var delta = evt.wheelDelta ? evt.wheelDelta/300 : evt.detail ? -evt.detail : 0;
        zoom(delta);
        return evt.preventDefault() && false;
    };

    this.saveCanvasArea = function(evt){
        //this.resetZoom();
        //this.update();
        var lastHeght = cloneObj(canvas.height);
        canvas.width = cfg_obj_margin + ((MAX_COLUMN) * (cfg_obj_width + (2 * cfg_obj_margin)));
        canvas.height = cfg_obj_margin + ((MAX_LINES) * (cfg_obj_height + (2 * cfg_obj_margin)));

        // calculates to snap objects on the screen

        MAX_WIDTH = MAX_COLUMN * (cfg_obj_width + (2 * cfg_obj_margin));
        MAX_HEIGHT = (UPPER_LINE - LOWER_LINE) * (cfg_obj_height + (cfg_obj_margin * 2));
        this.draw();
        var dataURL = canvas.toDataURL('image/png');
        var parent = canvas.parentNode.parentNode;
        var imageCreate = document.createElement("img");
        imageCreate.setAttribute("src", dataURL);
        imageCreate.setAttribute("style", "width:100%; height:auto");
        parent.innerHTML = ""
        parent.appendChild(imageCreate);
    };

    canvas.addEventListener('DOMMouseScroll',handleScroll,false);

    canvas.addEventListener('mousewheel',handleScroll,false);

    //canvas.addEventListener('contextmenu',saveCanvasArea,false);

    this.changeDataObjects = function(data){
        delete data_objects;
        delete LIST_OBJECTS;
        delete LIST_COUNT_LINES_OBJECTS;
        delete MAX_COLUMN;
        delete LOWER_LINE;
        delete UPPER_LINE;
        delete MAX_WIDTH;
        delete MAX_HEIGHT;

        LIST_OBJECTS = [];
        LIST_COUNT_LINES_OBJECTS = [];
        MAX_COLUMN = 0;
        LOWER_LINE = 0;
        UPPER_LINE = 0;
        MAX_WIDTH = 0;
        MAX_HEIGHT = 0;

        data_objects = data;

    }

    function trackTransforms(ctx){
        var svg = document.createElementNS("http://www.w3.org/2000/svg",'svg');
        var xform = svg.createSVGMatrix();
        ctx.getTransform = function(){ return xform; };

        var savedTransforms = [];
        var save = ctx.save;
        ctx.save = function(){
            savedTransforms.push(xform.translate(0,0));
            return save.call(ctx);
        };
        var restore = ctx.restore;
        ctx.restore = function(){
            xform = savedTransforms.pop();
            return restore.call(ctx);
        };

        var scale = ctx.scale;
        ctx.scale = function(sx,sy){
            xform = xform.scaleNonUniform(sx,sy);
            return scale.call(ctx,sx,sy);
        };
        var rotate = ctx.rotate;
        ctx.rotate = function(radians){
            xform = xform.rotate(radians*180/Math.PI);
            return rotate.call(ctx,radians);
        };
        var translate = ctx.translate;
        ctx.translate = function(dx,dy){
            xform = xform.translate(dx,dy);
            return translate.call(ctx,dx,dy);
        };
        var transform = ctx.transform;
        ctx.transform = function(a,b,c,d,e,f){
            var m2 = svg.createSVGMatrix();
            m2.a=a; m2.b=b; m2.c=c; m2.d=d; m2.e=e; m2.f=f;
            xform = xform.multiply(m2);
            return transform.call(ctx,a,b,c,d,e,f);
        };
        var setTransform = ctx.setTransform;
        ctx.setTransform = function(a,b,c,d,e,f){
            xform.a = a;
            xform.b = b;
            xform.c = c;
            xform.d = d;
            xform.e = e;
            xform.f = f;
            return setTransform.call(ctx,a,b,c,d,e,f);
        };
        var pt  = svg.createSVGPoint();
        ctx.transformedPoint = function(x,y){
            pt.x=x; pt.y=y;
            return pt.matrixTransform(xform.inverse());
        }
    };

    //INIT FUNCTION
    trackTransforms(context);
    this.update();
    this.draw();

    return this

}
