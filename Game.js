
BasicGame.Game = function (game) {

};

BasicGame.Game.prototype = {

	create: function () {
        this.totaltime = 0;
        this.totalclicks = 0;
        this.showmove = true;
        this.gameState='ready';
        this.numberofsteps = 20;
        this.moves = [];
        this.playermoves = [];

        this.initmatrix();

        this.music = this.add.audio('music',1,true);
        this.music.play('',0,1,true);

        this.titleimage = this.add.sprite(this.world.centerX,70,'spriteset');
        this.titleimage.frameName = 'title.png';
        this.titleimage.anchor.setTo(0.5,0.5);
        this.titleimage.scale.setTo(0.5,0.5);

        this.boundingbox = this.add.sprite(this.world.centerX,this.world.height-20,'spriteset');
        this.boundingbox.frameName = 'outerbox.png';
        this.boundingbox.anchor.setTo(0.5,1);
        this.boundingbox.scale.setTo(0.5,0.5);

        this.startButton = this.add.sprite(this.world.centerX-80,180,'spriteset');
        this.startButton.frameName = 'start.png';
        this.startButton.anchor.setTo(0.5,0.5);
        this.startButton.scale.setTo(0.5,0.5);
        this.startButton.inputEnabled = true;
        this.startButton.events.onInputDown.add(this.startGame, this);

        this.solveButton = this.add.sprite(this.world.centerX+80,180,'spriteset');
        this.solveButton.frameName = 'solve.png';
        this.solveButton.anchor.setTo(0.5,0.5);
        this.solveButton.scale.setTo(0.5,0.5);
        this.solveButton.inputEnabled = true;
        this.solveButton.events.onInputDown.add(this.solveGame, this);

        this.getUrlButton = this.add.sprite(this.world.centerX,230,'spriteset');
        this.getUrlButton.frameName = 'geturl.png';
        this.getUrlButton.anchor.setTo(0.5,0.5);
        this.getUrlButton.scale.setTo(0.5,0.5);
        this.getUrlButton.inputEnabled = true;
        this.getUrlButton.events.onInputDown.add(this.convertToUrl, this);

        this.timertext = this.add.text(this.world.centerX+20, 20, "Time", { font: "30px Arial", fill: "#ffffff", align: "center" });
        this.timertext.visible = false;
        this.clicktext = this.add.text(this.world.centerX+20, 80, "Clicks", { font: "30px Arial", fill: "#ffffff", align: "center" } );
        this.clicktext.visible = false;

        this.musicButton = this.add.sprite(this.world.width - 10,5,'spriteset');
        this.musicButton.frameName = 'music_on.png';
        this.musicButton.anchor.setTo(1,0);
        this.musicButton.scale.setTo(0.5,0.5);
        this.musicButton.inputEnabled = true;
        this.musicButton.events.onInputDown.add(this.toggleMusic, this);

        this.wintext = this.add.text(this.world.centerX+10, 15, "YOU\n WIN!", { font: "60px Arial", fill: "#ffffff", align: "center" });
        this.wintext.visible = false;

        this.urlstring = window.location.href;
        this.checkMap();



	},

    checkMap : function(){
        var loc = this.urlstring.indexOf("?");
        if(loc==-1){
            return;
        }
        var solution = this.urlstring.substr(loc+1);
        var temp;
        for(var i=0;i<solution.length;i++){
            temp = solution.charCodeAt(i) - 64;
            if(temp>15){
                this.playermoves.length = 0;
                return;
            }
            this.playermoves.push(temp);
            this.shiftTile(this.tiles[temp-1]);
        }
        this.startButton.frameName = 'reset.png';
        this.gameState = 'started';
        this.resetScores();
        this.clicktext.visible = true;
        this.timertext.visible = true;
        this.time.events.loop(Phaser.Timer.SECOND, this.updateTime, this);
        this.add.tween(this.titleimage).to({x : 100},500, Phaser.Easing.Sinusoidal.InOut, true);


    },

    solveGame : function(){
        // if(this.gameState=='started'){
                this.solvePuzzle();
                // this.startButton.frameName = 'start.png';
                this.playermoves.length = 0;
                this.moves.length = 0;
                this.gameState = 'solving';
            // }
    },

    resettiles : function(){
        for(var i=0;i<4;i++){
            for(var j=0;j<4;j++){
                var tilenumber = (i*4)+j;
                this.matrix[i][j] = tilenumber+1;
                if(tilenumber<15){
                    // if(this.showmove==true){
                    //     this.add.tween(this.tiles[tilenumber]).to({x : 83+j*65,y : 315+i*72},1000, Phaser.Easing.Sinusoidal.InOut, true);
                    // }
                    // else{
                        this.tiles[tilenumber].x = 83+j*65;
                        this.tiles[tilenumber].y = 315+i*72;
                    // }
                }
                else{
                    this.matrix[i][j] = 0;
                }
            }
        }
    },

    solvePuzzle : function(){
        if(this.playermoves.length>0||this.moves.length>0){
            this.timertext.visible = false;
            this.clicktext.visible = false;
            this.wintext.visible = false;
            this.resetTexts(1);
            this.switchAlpha(1);

            this.resetScores();

            var totalmoves = this.moves.concat(this.playermoves); 
            // totalmoves.reverse();
            var counter = totalmoves.length;
            this.time.events.repeat(200, totalmoves.length, function(){
               counter--;
               this.shiftTile(this.tiles[totalmoves[counter]-1]);
            } , this);
            this.add.tween(this.titleimage).to({x : this.world.centerX},500, Phaser.Easing.Sinusoidal.InOut, true);

        }
    },

    shuffletiles : function(totalsteps){

        this.moves.length = 0;
        var oldk = -1;
        while(this.moves.length<totalsteps){
            var k = this.rnd.integerInRange(1,15);
            while(this.shiftTile(this.tiles[k-1])=='dont'||k==oldk){
                this.shiftTile(this.tiles[k-1]);
                k = this.rnd.integerInRange(1,15);
            }
            this.moves.push(k); 
            oldk = k;
        }
    },
    checkWinandClicks : function(){
        this.totalclicks++;
        this.clicktext.setText(this.totalclicks+' clicks');
        var flag = true;
        for(var i=0;i<4;i++){
            for(var j=0;j<4;j++){
                if((i*4)+j+1!=16){
                    if(this.matrix[i][j]!=(i*4)+j+1){
                        flag = false;
                        return;
                    }      
                }
            }
        }
        if(flag==true){
            this.time.events.removeAll();
            this.wintext.visible = true;
            this.resetTexts(2);
            this.switchAlpha(0.5);
            this.gameState = 'Won';
        }
    },

    shiftTile : function(box){
        var no = box.no;
        var x,y = 0;
        var moveDir =  'dont';
        for(var i=0;i<4;i++){
            for(var j=0;j<4;j++){
                if(this.matrix[i][j]==no){
                    x = i;
                    y = j;
                }
            }
        }
        moveDir = this.chooseTile(x,y);
        switch(moveDir){
            case 'up'   :   this.matrix[x][y] = 0;
                            this.matrix[x-1][y] = no;
                            if(this.showmove==true){
                                this.add.tween(box).to({y:315+(x-1)*72},200, Phaser.Easing.Sinusoidal.InOut, true);
                            }
                            else
                                box.y -= 72;
                            break;
            case 'down' :   this.matrix[x][y] = 0;
                            this.matrix[x+1][y] = no;
                            if(this.showmove==true){
                                this.add.tween(box).to({y:315+(x+1)*72},200, Phaser.Easing.Sinusoidal.InOut, true);
                            }
                            else
                                box.y += 72;
                            break;
            case 'left' :   this.matrix[x][y] = 0;
                            this.matrix[x][y-1] = no;
                            if(this.showmove==true){
                                this.add.tween(box).to({x:83+(y-1)*65},200, Phaser.Easing.Sinusoidal.InOut, true);
                            }
                            else
                                box.x -= 65;
                            break;
            case 'right':   this.matrix[x][y] = 0;
                            this.matrix[x][y+1] = no;
                            if(this.showmove==true){
                                this.add.tween(box).to({x:83+(y+1)*65},200, Phaser.Easing.Sinusoidal.InOut, true);
                            }
                            else
                                box.x += 65;
                            break;
            default     :   break; 

        }
        if(moveDir!='dont'){
            if(this.gameState=='started'){
                this.checkWinandClicks();
            }
        }
        return moveDir;
    },

    initmatrix : function(){
        this.matrix = [];
        this.tiles = [];
        for(var i=0;i<4;i++){
            this.matrix[i] = [];
            for(var j=0;j<4;j++){
                var tilenumber = (i*4)+j;
                this.matrix[i][j] = tilenumber+1;
                if(tilenumber<15){
                    var k = this.add.sprite(83+j*65,315+i*72,'spriteset'); //x=83 and y=315 to get the tiles inside the box - trial and error
                    k.frameName = (tilenumber+1).toString() + '.png';
                    k.anchor.setTo(0.5,0.5);
                    k.scale.setTo(0.5,0.5);
                    k.no = tilenumber+1;
                    this.tiles[tilenumber] = k;
                    this.tiles[tilenumber].inputEnabled = true;
                    this.tiles[tilenumber].events.onInputDown.add(function(box){
                        var t = this.shiftTile(box);
                        if(t!='dont'){
                            this.playermoves.push(box.no);
                        }
                    }, this);
                }
                else{
                    this.matrix[i][j] = 0;
                }
            }
        }
    },

    chooseTile : function(x,y){
        if(x==3&&y==3){
            if(this.matrix[x-1][y]==0){
                return 'up';
            }
            else if(this.matrix[x][y-1]==0){
                return 'left';
            }
        }
        else if(x==0&&y==3){
            if(this.matrix[x+1][y]==0){
                return 'down';
            }
            else if(this.matrix[x][y-1]==0){
                return 'left';
            }
        }
        else if(x==0&&y==0){
            if(this.matrix[x+1][y]==0){
                return 'down';
            }
            else if(this.matrix[x][y+1]==0){
                return 'right';
            }
        }
        else if(x==3&&y==0){
            if(this.matrix[x-1][y]==0){
                return 'up';
            }
            else if(this.matrix[x][y+1]==0){
                return 'right';
            }
        }
        else if(x==3){
            if(this.matrix[x-1][y]==0){
                return 'up';
            }
            else if(this.matrix[x][y-1]==0){
                return 'left';
            }
            else if(this.matrix[x][y+1]==0){
                return 'right';
            }
        }
        else if(x==0){
            if(this.matrix[x+1][y]==0){
                return 'down';
            }
            else if(this.matrix[x][y-1]==0){
                return 'left';
            }
            else if(this.matrix[x][y+1]==0){
                return 'right';
            }
        }
        else if(y==3){
            if(this.matrix[x+1][y]==0){
                return 'down';
            }
            else if(this.matrix[x-1][y]==0){
                return 'up';
            }
            else if(this.matrix[x][y-1]==0){
                return 'left';
            }
        }
        else if(y==0){
            if(this.matrix[x+1][y]==0){
                return 'down';
            }
            else if(this.matrix[x-1][y]==0){
                return 'up';
            }
            else if(this.matrix[x][y+1]==0){
                return 'right';
            }
        }
        else{
            if(this.matrix[x+1][y]==0){
                return 'down';
            }
            else if(this.matrix[x-1][y]==0){
                return 'up';
            }
            else if(this.matrix[x][y+1]==0){
                return 'right';
            }
            else if(this.matrix[x][y-1]==0){
                return 'left';
            }
        }
        return 'dont';
    },

    switchAlpha : function(a){
            for(var i=0;i<15;i++){
                this.tiles[i].alpha = a;  
            }
    },

    resetScores : function(){
        this.totaltime = 0;
        this.totalclicks = 0;
        this.clicktext.setText('0 clicks');
        this.timertext.setText('0 seconds');
    },

    convertToUrl : function(){
        if(this.moves.length>0||this.playermoves.length>0){
            var temp = this.moves.concat(this.playermoves);
            var temp2 = window.location.href;
            temp2 = temp2.split("");
            temp2.push('?');
            for(var i=0;i<temp.length;i++){
                temp2.push(String.fromCharCode(64+temp[i]));
            }
            temp2 = temp2.join("");
            prompt("COPY the following Url share current puzzle :- ",temp2);
        }
    },
    updateTime : function(){
        this.totaltime++;
        this.timertext.setText(this.totaltime + ' s');
    },

    resetTexts : function(a){
        switch(a){
            case 1  :   this.clicktext.anchor.setTo(0,0);
                        this.timertext.anchor.setTo(0,0);
                        this.clicktext.x = this.world.centerX+20;
                        this.timertext.x = this.world.centerX+20;
                        this.clicktext.y = 80;
                        this.timertext.y = 20;
                        break;
            case 2  :   this.clicktext.anchor.setTo(0.5,0.5);
                        this.timertext.anchor.setTo(0.5,0.5);
                        this.clicktext.x = this.world.centerX;
                        this.timertext.x = this.world.centerX;
                        this.clicktext.y = this.world.centerY + 100;
                        this.timertext.y = this.world.centerY + 200;
                        break;
            default :   break;
        }
    },

    startGame : function(){
        if(this.startButton.frameName=='start.png'){

                this.resetScores();
                this.time.events.removeAll();
                this.resettiles();
                this.shuffletiles(this.numberofsteps);
                this.startButton.frameName = 'reset.png';
                this.playermoves.length = 0;
                this.gameState = 'started';

                
                this.timertext.visible = true;
                this.clicktext.visible = true;
                this.wintext.visible = false;
                this.resetTexts(1);
                this.switchAlpha(1);
                this.time.events.loop(Phaser.Timer.SECOND, this.updateTime, this);
                this.add.tween(this.titleimage).to({x : 100},500, Phaser.Easing.Sinusoidal.InOut, true);
            }
            else{

                this.resetScores();
                this.time.events.removeAll();

                this.time.events.add(210, this.resettiles, this);

                // this.solvePuzzle();
                this.startButton.frameName = 'start.png';
                this.playermoves.length = 0;
                this.moves.length = 0;

                this.gameState = 'ready';

                this.timertext.visible = false;
                this.clicktext.visible = false;
                this.wintext.visible = false;
                this.resetTexts(1);
                this.switchAlpha(1);

                this.add.tween(this.titleimage).to({x : this.world.centerX},500, Phaser.Easing.Sinusoidal.InOut, true);
            }
    },

    toggleMusic : function(){
        if(this.music.isPlaying){
            this.music.stop();
            this.musicButton.frameName = 'music_off.png';
        }
        else{
            this.music.play();
            this.musicButton.frameName = 'music_on.png';
        }
    }

};