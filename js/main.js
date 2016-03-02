(function () {
    //Set Game states
    var MemoryGame = {};
    MemoryGame.currentNum = -1;
    MemoryGame.prevTile = null;
    MemoryGame.openedTiles = 0;
    MemoryGame.score = 0;
    MemoryGame.boolMutex = true; 

    //Cross browser add event
    MemoryGame.addEvent = function (elem, eventType, callback) {
        if(window.addEventListener) {
            elem.addEventListener(eventType, callback);
        } else {
            elem.attachEvent(eventType, callback);
        }
    };

    //Randomize array using Fisher-yates algorithm
    MemoryGame.randomizeArray = function (maxNum) {
        var numArray = [], temp;
        for(var i = 0; i < maxNum; i++) {
            numArray.push(i+1);
            numArray.push(i+1);
        }

        //Randomize the array
        for(var i = 2*maxNum - 1; i >= 0; i--) {
            var index = Math.floor(Math.random() * maxNum * 2);
            temp = numArray[i];
            numArray[i] = numArray[index];
            numArray[index] = temp;
        }

        return numArray;
    };

    //Render tiles on page, set state and values
    MemoryGame.initializeTiles = function () {
        var tileContainer = document.getElementById("tileContainer");
        var divElem, documentFragment = document.createDocumentFragment();
        var state = null, className = "";

        tileContainer.style.width = 120 * this.numberOfTile + 'px';
        for(var i = 0, len = this.numArray.length; i < len; i++) {
            divElem = document.createElement('div');
            state = this.tileState[i];
            className = "numTile";

            if(state === "hidden") {
                className += " is-hidden";
            } else if (state === "success") {
                className += " success"; 
            }

            divElem.setAttribute('class', className);
            divElem.setAttribute('data-value', this.numArray[i]);
            divElem.setAttribute('data-state', this.tileState[i]);
            divElem.setAttribute('id', i);

            divElem.innerHTML = this.numArray[i];
            this.addEvent(divElem, "click", this.checkState);
            documentFragment.appendChild(divElem);
        }
        //Append fragment to main dom element.
        tileContainer.appendChild(documentFragment);
    };

    //Check if any combo recognized
    MemoryGame.checkState = function (evt) {
        evt.preventDefault();
        var currentTarget = evt.target;
        var self = MemoryGame;
        self.openedTiles++;

        if(!self.boolMutex || currentTarget.getAttribute('data-state') !== "hidden" || self.openedTiles > 2) {
            self.openedTiles = 0;
            return;
        }

        var tileId = parseInt(currentTarget.getAttribute('id'), 10);
        currentTarget.setAttribute('data-state', 'visible');
        self.tileState[tileId] = 'visible';
        currentTarget.setAttribute('class', 'numTile');
        
        

        if(self.openedTiles === 2) {
            
            if(self.currentNum === parseInt(currentTarget.getAttribute('data-value'), 10)) {
                var prevTile = document.getElementById(self.prevTile);
                var prevTileId = parseInt(prevTile.getAttribute('id'), 10);
                self.openedTiles = 0;
                self.score++;
                self.tileState[tileId] = 'success';
                self.tileState[prevTileId] = 'success';
                currentTarget.setAttribute("class", currentTarget.getAttribute('class') + " success");
                prevTile.setAttribute("class", currentTarget.getAttribute('class') + " success");
                if(self.score === self.maxScore) {
                    localStorage.removeItem('gameInfo');
                    alert("You win. Refresh to start new Game!");
                    return;
                }
            } else {
                self.boolMutex = false;
                setTimeout(function () {
                    self.boolMutex = true;
                    var prevTile = document.getElementById(self.prevTile);
                    var prevTileId = parseInt(prevTile.getAttribute('id'), 10);
                    self.openedTiles = 0;

                    self.tileState[tileId] = 'hidden';
                    self.tileState[prevTileId] = 'hidden';

                    currentTarget.setAttribute('data-state', 'hidden');
                    currentTarget.setAttribute('class', 'numTile is-hidden');
                    prevTile.setAttribute('data-state', 'hidden');
                    prevTile.setAttribute('class', 'numTile is-hidden');
                }, 1000);
                
            }

        } else if(self.openedTiles === 1) {
            self.prevTile = currentTarget.getAttribute('id');
            self.tileState[tileId] = 'visible';
            self.currentNum = parseInt(document.getElementById(self.prevTile).getAttribute('data-value'), 10);
        }
        self.saveState();
    };

    MemoryGame.saveState = function () {
        localStorage.setItem('gameInfo', JSON.stringify(MemoryGame));
    };

    //Initialize game
    MemoryGame.initGame = function () {
        var num, tempObj;
        if(localStorage.getItem('gameInfo')) {
            tempObj = JSON.parse(localStorage.getItem('gameInfo'));
            for(key in tempObj) {
                if(tempObj.hasOwnProperty(key)) {
                    MemoryGame[key] = tempObj[key];
                }
            }

            if(!this.boolMutex) {
                for(var i = 0, len = this.tileState.length; i < len; i++) {
                    if(this.tileState[i] === 'visible') {
                        this.tileState[i] = 'hidden';
                    }
                }
                this.openedTiles = 0;
                this.boolMutex = true;
            }
        } else {
            num = prompt('Enter the number of Tiles');
            while(isNaN(num) || (num % 2 !== 0)) {
                alert("Please enter a valid even number");
                num = prompt('Enter the number of tiles');
            }
            this.numberOfTile = num;
            this.maxScore = Math.pow(this.numberOfTile, 2) / 2;
            
            this.numArray = this.randomizeArray(this.maxScore);
            this.tileState = [];
            for(var i = 0, len = this.numArray.length; i < len; i++) {
                this.tileState[i] = "hidden";
            }
        }
        this.saveState();
        this.initializeTiles();
    };

    window.onload = MemoryGame.initGame();
})();