(function () {
    'use strict';
		
		// #1 call the init function after the pages loads
		// this is called an "event handler"
		window.onload = init;
        let sand = [];
        let wall = [];
        let water = [];
        let ctx;
        let canvas;
        let xVal = 320;
        let yVal = 339;
        let mouseDown = false;
        let size = 5;
        let width = 1024, height = 768;
        let material = "sand";
        let rainbow = ["red","orange","yellow","green","blue","indigo","purple","red"];
        const keyHeight = 50;
            
        function storeCoordinate(xVal, yVal, array) {
            array.push({x: xVal, y: yVal});
        }
	
		function init(){

			console.log("init called");

            canvas = document.querySelector("canvas");   

            ctx = canvas.getContext("2d");          

            ctx.fillRect(0,0,width,height);
                   
            // horizontal alignment 
            ctx.textAlign = "center"; 
 
            // vertical alignment 
            ctx.textBaseline = "middle"; 

            loop();

		}
        
        function loop(){
            requestAnimationFrame(loop);
            
            //check the DOM
            getOptions("material");
            getOptions("size");
            
            if(mouseDown && material == "sand"){
                if(bxhlib.isItemInArray(sand, xVal, yVal) == -1){
                    storeCoordinate(xVal,yVal,sand);
                }
            }
            else if(mouseDown && material == "wall"){
                if(bxhlib.isItemInArray(wall, xVal, yVal) == -1){
                    storeCoordinate(xVal,yVal,wall);
                }
                //else{
                    //console.log("you've already drawn at" + xVal + ", " + yVal);
                //}
            }
            else if(mouseDown && material == "water"){
                if(bxhlib.isItemInArray(water, xVal, yVal) == -1){
                    storeCoordinate(xVal,yVal,water);
                }
            }
            else if(mouseDown && material == "eraser"){
                bxhlib.drawRect(ctx,xVal,yVal,size*3,size*3,"black");
                bxhlib.erasePoint(sand,xVal,yVal,size);
                bxhlib.erasePoint(wall,xVal,yVal,size);
            }
            
            moveGrains(sand, "sand");
            moveGrains(water, "water");
            
            //Refresh drawing every frame
            bxhlib.drawRect(ctx,0,0,width,height-keyHeight,"black");
            
            //limit sand
            sand = sand.slice(sand.length-500,sand.length);
            
            //limit water
            water = water.slice(water.length-500,water.length);
            
            for(let i = 0; i < water.length; i++){
                if(bxhlib.isItemInArray(sand, water[i].x, water[i].y) != -1){
                    storeCoordinate(water[i].x, water[i].y - size, water);
                }
            }
            
            
            //draw walls from array
            for(let k = 0; k < wall.length; k++){
                bxhlib.drawRect(ctx,wall[k].x,wall[k].y,size,size,"gray");
            }
            
            //draw water from array
            for(let m = 0; m < water.length; m++){
                bxhlib.drawRect(ctx,water[m].x,water[m].y,size,size,"blue");
            }
            
            //draw sand from array
            for(let j = 0; j < sand.length; j++){
                bxhlib.drawRect(ctx,sand[j].x,sand[j].y,size,size,"tan");
            }
            
            //draw piano keys -- light up if playing
            for(let i = 0; i <= width; i+=width/8){
                let empty = true;
                for(let j = 0; j < (width/8)-1; j++){
                    let data = ctx.getImageData(i+j, (height-51), 1, 1).data;
                    if(!(data[0] == 0 && data[1] == 0 && data[2] == 0)){
                        empty = false;
                    } 
                }
                if(empty){
                    bxhlib.drawRect(ctx,i,height-keyHeight,(width/8)-1,keyHeight,"white");  
                }
                else{
                    bxhlib.drawRect(ctx,i,height-keyHeight,(width/8)-1,keyHeight,rainbow[i/(width/8)]);
                    let note = document.querySelectorAll(".piano");
                    note[i/(width/8)].play();
                }
            }
            
            //start drawing
            window.addEventListener("mousedown", event => {
                mouseDown = true;
                let rect = canvas.getBoundingClientRect();
                //-size because it seemed to be in the middle of the mouse instead of on the point
                xVal = bxhlib.round(event.clientX - rect.left - size, size); 
                yVal = bxhlib.round(event.clientY - rect.top - size, size);
            });
            
            //stop drawing
            window.addEventListener("mouseup", event => {
                mouseDown = false;
            });
            
            //draw when mouse is down and moves
            window.addEventListener("mousemove", event => {
                if(mouseDown){
                    let rect = canvas.getBoundingClientRect();
                    //-size because it seemed to be in the middle of the mouse instead of on the point
                    xVal = bxhlib.round(event.clientX - rect.left - size, size); 
                    yVal = bxhlib.round(event.clientY - rect.top - size, size); 
                }
            });
            
            //clear sand and wall when clear is clicked
            document.querySelector("#clear").addEventListener("click", function(){
                sand = [];
                wall = [];
                water = [];
            });

        }
    
        //reads options from the DOM
        function getOptions(name){
            let cBoxes = document.querySelectorAll("." + name);
            for(let i = 0; i < cBoxes.length; i++){
                if(cBoxes[i].checked){
                    if(name == "material"){
                        material = cBoxes[i].value;
                    }  
                    else if(name == "size"){
                        let newSize = parseInt(cBoxes[i].value);
                        if(size != newSize){
                            //clear sand and wall when size is changed -- things get weird otherwise
                            sand = [];
                            wall = [];
                            water = [];
                        }
                        size = newSize;
                    }   
                }
            }
        }
    
        //move sand and water
        function moveGrains(array, arrayTitle){
            for(let i = 0; i < array.length; i++){
                //this checks if the area below the array is black (empty)
                let dataD = ctx.getImageData(array[i].x, array[i].y + size, 1, 1).data;
                let dataL = ctx.getImageData(array[i].x - size, array[i].y + size, 1, 1).data;
                let dataR = ctx.getImageData(array[i].x + size, array[i].y + size, 1, 1).data;
                let dataSL = ctx.getImageData(array[i].x - size, array[i].y, 1, 1).data;
                let dataSR = ctx.getImageData(array[i].x + size, array[i].y, 1, 1).data;
                
                let side = Math.floor(Math.random() * 2) + 1;
                //if the area is empty, move down. If the array hits the piano, remove.
                if(array[i].y < height-((keyHeight)+size) && array[i].y > 0){
                    if(dataD[0] == 0 && dataD[1] == 0 && (dataD[2] == 0 || (dataD[2] == 255 && arrayTitle == "sand"))){
                        storeCoordinate(array[i].x, array[i].y + size, array);
                        array.splice(i,1);
                    } 
                    else if(dataL[0] == 0 && dataL[1] == 0 && (dataL[2] == 0 || (dataL[2] == 255 && arrayTitle == "sand"))){
                        storeCoordinate(array[i].x - size, array[i].y + size, array);
                        array.splice(i,1);
                    } 
                    else if(dataR[0] == 0 && dataR[1] == 0 && (dataR[2] == 0 || (dataR[2] == 255 && arrayTitle == "sand"))){
                        storeCoordinate(array[i].x + size, array[i].y + size, array);
                        array.splice(i,1);
                    }
                    else if(dataSL[0] == 0 && dataSL[1] == 0 && dataSL[2] == 0 && side == 1 && arrayTitle == "water"){
                        storeCoordinate(array[i].x - size, array[i].y, array);
                        array.splice(i,1);
                    } 
                    else if(dataSR[0] == 0 && dataSR[1] == 0 && dataSR[2] == 0 && side == 2 && arrayTitle == "water"){
                        storeCoordinate(array[i].x + size, array[i].y, array);
                        array.splice(i,1);
                    }
                    else{
                        storeCoordinate(array[i].x, array[i].y, array);
                        array.splice(i,1);
                    }
                }
                else{
                    array.splice(i,1);
                }
            }
        }
            
        
})();