(function () {  
    "use strict";
    function round(x,toRound) { 
        return Math.ceil(x / toRound) * toRound; 
    } 
        
    function drawRect(ctx,x,y,w,h,color){
        ctx.save();
        ctx.fillStyle = color;
        ctx.fillRect(x,y,w,h);
        ctx.restore();
    }
    
    function isItemInArray(array, item1, item2) {
        for (let i = 0; i < array.length; i++) {
        // This if statement depends on the format of your array
            if (array[i].x == item1 && array[i].y == item2) {
                return i;   // Found it
            }
        }
        return -1;   // Not found   
    }
    
    //erase any point in a 3x3 array from the pointer
    function erasePoint(array, xVal, yVal,size){
        for(let i = -1; i <= 1; i++){
            for(let j = -1; j <= 1; j++){
                let index = isItemInArray(array, xVal + (size*i), yVal + (size*j));
                if (index > -1){
                    array.splice(index,1);
                }
            }
        }
    }

    window["bxhlib"] = {
        round,
        drawRect,
        isItemInArray,
        erasePoint
    };
})();